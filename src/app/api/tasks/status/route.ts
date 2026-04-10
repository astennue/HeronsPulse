import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TaskStatus } from '@prisma/client';

// PATCH /api/tasks/status - Update task status (for drag-drop)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { taskId, status, position } = body;

    if (!taskId) {
      return apiError('Task ID is required', 400);
    }

    if (!status || !Object.values(TaskStatus).includes(status)) {
      return apiError('Valid status is required', 400);
    }

    // Find the task
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, ownerId: true },
        },
        assignees: {
          where: { userId: user.id },
        },
      },
    });

    if (!task) {
      return apiError('Task not found', 404);
    }

    // Check access - user must be assignee or project owner/member (super admin has full access)
    const isAssignee = task.assignees.length > 0;
    const isProjectMember = await db.projectMember.findFirst({
      where: { projectId: task.project.id, userId: user.id },
    });
    const hasAccess = isAssignee || isProjectMember || user.role === 'super_admin';

    if (!hasAccess) {
      return apiError('You do not have access to this task', 403);
    }

    // Update task status
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: {
        status,
        position: position ?? task.position,
        updatedAt: new Date(),
      },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, displayName: true },
            },
          },
        },
      },
    });

    // If task is marked as done, update user stats
    if (status === 'done' && task.status !== 'done') {
      // Update each assignee's completed task count
      for (const assignee of task.assignees) {
        await db.user.update({
          where: { id: assignee.userId },
          data: {
            tasksCompleted: { increment: 1 },
            totalPoints: { increment: 10 },
          },
        });
      }
    }

    return apiResponse({
      id: updatedTask.id,
      status: updatedTask.status,
      position: updatedTask.position,
      updatedAt: updatedTask.updatedAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
