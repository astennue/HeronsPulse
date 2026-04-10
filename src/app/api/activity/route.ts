import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/activity - Get activity feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userRole = (session.user as any).role;
    const currentUserId = session.user.id;

    // Build where clause based on role and filters
    let where: any = {};

    // Role-based filtering
    if (userRole === 'student') {
      // Students see their own activity + activity on tasks they're assigned to
      where.OR = [
        { userId: currentUserId },
        {
          entityType: 'task',
          entityId: {
            in: await db.taskAssignee
              .findMany({
                where: { userId: currentUserId },
                select: { taskId: true },
              })
              .then((tas) => tas.map((ta) => ta.taskId)),
          },
        },
      ];
    } else if (userRole === 'faculty') {
      // Faculty sees activity from their classes
      const ownedClasses = await db.class.findMany({
        where: { ownerId: currentUserId },
        select: { id: true },
      });
      const classIds = ownedClasses.map((c) => c.id);

      const classMembers = await db.classMember.findMany({
        where: { classId: { in: classIds } },
        select: { userId: true },
      });
      const memberUserIds = [...new Set([currentUserId, ...classMembers.map((m) => m.userId)])];

      where.OR = [
        { userId: currentUserId },
        { userId: { in: memberUserIds } },
      ];
    }
    // SuperAdmin sees everything

    // Apply filters
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;

    const activities = await db.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const total = await db.activityLog.count({ where });

    // Parse metadata JSON strings
    const parsedActivities = activities.map((activity) => ({
      ...activity,
      metadata: JSON.parse(activity.metadata || '{}'),
    }));

    return NextResponse.json({
      activities: parsedActivities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}
