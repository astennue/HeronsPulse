import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TaskStatus, TaskPriority } from '@prisma/client';

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const taskId = params.id;
    const body = await request.json();
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      courseCode,
      startDate,
    } = body;

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

    // Check access - user must be assignee or project member (super admin has full access)
    const isProjectMember = await db.projectMember.findFirst({
      where: { projectId: task.project.id, userId: user.id },
    });
    const hasAccess = task.assignees.length > 0 || isProjectMember || user.role === 'super_admin';

    if (!hasAccess) {
      return apiError('You do not have access to update this task', 403);
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined && Object.values(TaskStatus).includes(status)) {
      updateData.status = status;
    }
    if (priority !== undefined && Object.values(TaskPriority).includes(priority)) {
      updateData.priority = priority;
    }
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (courseCode !== undefined) updateData.courseCode = courseCode?.trim() || null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;

    // Update the task
    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, displayName: true },
            },
          },
        },
        subtasks: {
          select: { id: true, title: true, isCompleted: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
        project: {
          select: { 
            id: true, 
            name: true, 
            color: true,
            owner: {
              select: { id: true, displayName: true, role: true },
            },
          },
        },
      },
    });

    // If task is marked as done, update user stats
    if (status === 'done' && task.status !== 'done') {
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
      title: updatedTask.title,
      description: updatedTask.description,
      status: updatedTask.status,
      priority: updatedTask.priority,
      dueDate: updatedTask.dueDate,
      courseCode: updatedTask.courseCode,
      startDate: updatedTask.startDate,
      updatedAt: updatedTask.updatedAt,
      ownerName: updatedTask.project.owner.displayName,
      ownerRole: updatedTask.project.owner.role,
      assignees: updatedTask.assignees.map(a => a.user.displayName),
      subtasks: {
        completed: updatedTask.subtasks.filter(s => s.isCompleted).length,
        total: updatedTask.subtasks.length,
      },
      comments: updatedTask._count.comments,
      attachments: updatedTask._count.attachments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const taskId = params.id;

    // Find the task
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, ownerId: true },
        },
      },
    });

    if (!task) {
      return apiError('Task not found', 404);
    }

    // Check access - user must be project owner/member or super admin
    const isProjectMember = await db.projectMember.findFirst({
      where: { projectId: task.project.id, userId: user.id },
    });
    const isProjectOwner = task.project.ownerId === user.id;
    const hasAccess = isProjectOwner || isProjectMember || user.role === 'super_admin';

    if (!hasAccess) {
      return apiError('You do not have access to delete this task', 403);
    }

    // Delete the task (cascade will handle subtasks, comments, etc.)
    await db.task.delete({
      where: { id: taskId },
    });

    return apiResponse({ success: true, id: taskId });
  } catch (error) {
    return handleApiError(error);
  }
}
