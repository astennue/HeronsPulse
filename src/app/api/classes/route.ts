import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/classes - Get classes based on user role
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const section = searchParams.get('section');
    const subjectCode = searchParams.get('subjectCode');
    const ownerId = searchParams.get('ownerId');

    let whereClause: any = {};

    if (user.role === 'super_admin') {
      // Super admin sees all classes with filtering
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subjectCode: { contains: search, mode: 'insensitive' } },
          { section: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (section) {
        whereClause.section = { contains: section, mode: 'insensitive' };
      }
      if (subjectCode) {
        whereClause.subjectCode = { contains: subjectCode, mode: 'insensitive' };
      }
      if (ownerId) {
        whereClause.ownerId = ownerId;
      }
    } else if (user.role === 'faculty') {
      // Faculty sees only their own classes
      whereClause.ownerId = user.id;
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subjectCode: { contains: search, mode: 'insensitive' } },
          { section: { contains: search, mode: 'insensitive' } },
        ];
      }
    } else {
      // Students see classes they're members of
      whereClause.members = {
        some: { userId: user.id },
      };
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { subjectCode: { contains: search, mode: 'insensitive' } },
          { section: { contains: search, mode: 'insensitive' } },
        ];
      }
    }

    const classes = await db.class.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, email: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { members: true, classTasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get workload data for each member to calculate risk levels
    const classesWithRiskData = await Promise.all(
      classes.map(async (cls) => {
        const memberIds = cls.members.map(m => m.userId);
        
        // Get latest workload data for each member
        const workloadData = await db.workloadData.findMany({
          where: {
            userId: { in: memberIds },
          },
          orderBy: { recordedDate: 'desc' },
          distinct: ['userId'],
        });

        const atRiskCount = workloadData.filter(w => w.riskLevel === 'High').length;
        const avgALI = workloadData.length > 0
          ? Math.round(workloadData.reduce((sum, w) => sum + w.aliScore, 0) / workloadData.length)
          : 0;

        return {
          id: cls.id,
          name: cls.name,
          subjectCode: cls.subjectCode,
          section: cls.section,
          description: cls.description,
          schedule: cls.schedule,
          room: cls.room,
          semester: cls.semester,
          isActive: cls.isActive,
          createdAt: cls.createdAt,
          updatedAt: cls.updatedAt,
          owner: cls.owner,
          studentCount: cls._count.members,
          taskCount: cls._count.classTasks,
          avgALI,
          atRiskCount,
          members: cls.members.map(m => ({
            id: m.user.id,
            name: m.user.displayName,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
            joinedAt: m.joinedAt,
          })),
        };
      })
    );

    return apiResponse(classesWithRiskData);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Only faculty and super_admin can create classes
    if (user.role !== 'faculty' && user.role !== 'super_admin') {
      return apiError('Only faculty and administrators can create classes', 403);
    }

    const body = await request.json();
    const { name, subjectCode, section, description, schedule, room, semester, ownerId } = body;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return apiError('Class name is required', 400);
    }
    if (!subjectCode || subjectCode.trim().length === 0) {
      return apiError('Subject code is required', 400);
    }
    if (!section || section.trim().length === 0) {
      return apiError('Section is required', 400);
    }

    // Determine the owner of the class
    let classOwnerId = user.id;
    
    // Super admin can create classes for other faculty members
    if (user.role === 'super_admin' && ownerId) {
      const targetFaculty = await db.user.findUnique({
        where: { id: ownerId },
        select: { id: true, role: true },
      });
      
      if (!targetFaculty || targetFaculty.role !== 'faculty') {
        return apiError('Target owner must be a faculty member', 400);
      }
      
      classOwnerId = ownerId;
    }

    // Check class limit for faculty (max 5 classes) - skip for super_admin creating for others
    if (user.role === 'faculty' || (user.role === 'super_admin' && !ownerId)) {
      const existingClassCount = await db.class.count({
        where: { ownerId: classOwnerId },
      });

      if (existingClassCount >= 5) {
        return apiError('Maximum of 5 classes allowed per faculty', 400);
      }
    }

    // Create the class
    const newClass = await db.class.create({
      data: {
        name: name.trim(),
        subjectCode: subjectCode.trim().toUpperCase(),
        section: section.trim().toUpperCase(),
        description: description?.trim() || null,
        schedule: schedule?.trim() || null,
        room: room?.trim() || null,
        semester: semester || '2025-2026 Second Semester',
        ownerId: classOwnerId,
      },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true },
        },
      },
    });

    return apiResponse({
      id: newClass.id,
      name: newClass.name,
      subjectCode: newClass.subjectCode,
      section: newClass.section,
      description: newClass.description,
      schedule: newClass.schedule,
      room: newClass.room,
      semester: newClass.semester,
      isActive: newClass.isActive,
      createdAt: newClass.createdAt,
      owner: newClass.owner,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
