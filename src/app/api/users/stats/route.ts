import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/users/stats - Get current user's stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        currentStreak: true,
        longestStreak: true,
        tasksCompleted: true,
        deadlinesMet: true,
        earlySubmissions: true,
        productivityScore: true,
        totalPoints: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Get assigned tasks with their status
    const assignedTasks = await db.taskAssignee.findMany({
      where: { userId: user.id },
      include: {
        task: {
          select: {
            id: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    const now = new Date();
    const overdueTasks = assignedTasks.filter(
      t => t.task.dueDate && t.task.dueDate < now && t.task.status !== 'done'
    ).length;

    const inProgressTasks = assignedTasks.filter(
      t => t.task.status === 'in_progress'
    ).length;

    const completedTasks = assignedTasks.filter(
      t => t.task.status === 'done'
    ).length;

    // Get projects count
    const projectsCount = await db.projectMember.count({
      where: { userId: user.id },
    });

    // Get owned projects count
    const ownedProjectsCount = await db.project.count({
      where: { ownerId: user.id },
    });

    // Get badges
    const badges = await db.userBadge.findMany({
      where: { userId: user.id },
      include: {
        badge: true,
      },
    });

    return apiResponse({
      ...user,
      taskStats: {
        total: assignedTasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
      },
      projectsCount,
      ownedProjectsCount,
      badges: badges.map(b => ({
        id: b.badge.id,
        name: b.badge.name,
        icon: b.badge.icon,
        rarity: b.badge.rarity,
        awardedAt: b.awardedAt,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
