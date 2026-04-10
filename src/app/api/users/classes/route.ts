import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/users/classes - Get the current user's enrolled classes
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

    // Get all classes the user is a member of (for students)
    // or owns (for faculty)
    let classes;

    if (user.role === 'faculty') {
      // Faculty sees their owned classes
      classes = await db.class.findMany({
        where: { ownerId: user.id },
        include: {
          owner: {
            select: { id: true, displayName: true, email: true },
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
    } else if (user.role === 'student') {
      // Students see classes they're members of
      classes = await db.class.findMany({
        where: {
          members: {
            some: { userId: user.id },
          },
        },
        include: {
          owner: {
            select: { id: true, displayName: true, email: true },
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
    } else {
      // Super admin sees all classes
      classes = await db.class.findMany({
        include: {
          owner: {
            select: { id: true, displayName: true, email: true },
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
    }

    // Get workload data for risk calculation
    const allMemberIds = classes.flatMap(c => c.members.map(m => m.userId));
    const workloadData = await db.workloadData.findMany({
      where: { userId: { in: allMemberIds } },
      orderBy: { recordedDate: 'desc' },
      distinct: ['userId'],
    });

    // Format response
    const formattedClasses = classes.map(cls => {
      const memberIds = cls.members.map(m => m.userId);
      const memberWorkloads = workloadData.filter(w => memberIds.includes(w.userId));
      
      const atRiskCount = memberWorkloads.filter(w => w.riskLevel === 'High').length;
      const avgALI = memberWorkloads.length > 0
        ? Math.round(memberWorkloads.reduce((sum, w) => sum + w.aliScore, 0) / memberWorkloads.length)
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
    });

    return apiResponse(formattedClasses);
  } catch (error) {
    return handleApiError(error);
  }
}
