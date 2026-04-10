import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/classes/[id] - Get a single class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true, role: true },
        },
        members: {
          include: {
            user: {
              select: { 
                id: true, 
                displayName: true, 
                email: true, 
                avatarUrl: true,
                currentStreak: true,
                totalPoints: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        invitations: {
          where: { isUsed: false, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { members: true, classTasks: true },
        },
      },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Check access permissions
    const isOwner = classData.ownerId === user.id;
    const isMember = classData.members.some(m => m.userId === user.id);
    const isSuperAdmin = user.role === 'super_admin';

    if (!isOwner && !isMember && !isSuperAdmin) {
      return apiError('Access denied', 403);
    }

    // Get workload data for members
    const memberIds = classData.members.map(m => m.userId);
    const workloadData = await db.workloadData.findMany({
      where: { userId: { in: memberIds } },
      orderBy: { recordedDate: 'desc' },
      distinct: ['userId'],
    });

    const membersWithRisk = classData.members.map(m => {
      const workload = workloadData.find(w => w.userId === m.userId);
      return {
        id: m.user.id,
        name: m.user.displayName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        joinedAt: m.joinedAt,
        currentStreak: m.user.currentStreak,
        totalPoints: m.user.totalPoints,
        aliScore: workload?.aliScore || 0,
        riskLevel: workload?.riskLevel || 'Low',
      };
    });

    const atRiskCount = membersWithRisk.filter(m => m.riskLevel === 'High').length;
    const avgALI = membersWithRisk.length > 0
      ? Math.round(membersWithRisk.reduce((sum, m) => sum + m.aliScore, 0) / membersWithRisk.length)
      : 0;

    return apiResponse({
      id: classData.id,
      name: classData.name,
      subjectCode: classData.subjectCode,
      section: classData.section,
      description: classData.description,
      schedule: classData.schedule,
      room: classData.room,
      semester: classData.semester,
      isActive: classData.isActive,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt,
      owner: classData.owner,
      studentCount: classData._count.members,
      taskCount: classData._count.classTasks,
      avgALI,
      atRiskCount,
      members: membersWithRisk,
      invitations: classData.invitations.map(inv => ({
        id: inv.id,
        code: inv.code,
        email: inv.email,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/classes/[id] - Update a class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Only owner or super admin can update
    if (classData.ownerId !== user.id && user.role !== 'super_admin') {
      return apiError('Access denied', 403);
    }

    const body = await request.json();
    const { name, subjectCode, section, description, schedule, room, semester, isActive } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (subjectCode !== undefined) updateData.subjectCode = subjectCode.trim().toUpperCase();
    if (section !== undefined) updateData.section = section.trim().toUpperCase();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (schedule !== undefined) updateData.schedule = schedule?.trim() || null;
    if (room !== undefined) updateData.room = room?.trim() || null;
    if (semester !== undefined) updateData.semester = semester;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedClass = await db.class.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, displayName: true, email: true },
        },
      },
    });

    return apiResponse({
      id: updatedClass.id,
      name: updatedClass.name,
      subjectCode: updatedClass.subjectCode,
      section: updatedClass.section,
      description: updatedClass.description,
      schedule: updatedClass.schedule,
      room: updatedClass.room,
      semester: updatedClass.semester,
      isActive: updatedClass.isActive,
      createdAt: updatedClass.createdAt,
      owner: updatedClass.owner,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/classes/[id] - Delete a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      select: { ownerId: true, name: true },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Only owner or super admin can delete
    if (classData.ownerId !== user.id && user.role !== 'super_admin') {
      return apiError('Access denied', 403);
    }

    await db.class.delete({
      where: { id },
    });

    return apiResponse({ message: `Class "${classData.name}" deleted successfully` });
  } catch (error) {
    return handleApiError(error);
  }
}
