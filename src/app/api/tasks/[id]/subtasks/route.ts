import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/tasks/[id]/subtasks - Get subtasks for a task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;

    const subtasks = await db.subtask.findMany({
      where: { taskId },
      orderBy: { position: 'asc' },
    });

    return NextResponse.json({ subtasks });
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/subtasks - Create a subtask
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { title, description, dueDate } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get max position
    const maxPosition = await db.subtask.aggregate({
      where: { taskId },
      _max: { position: true },
    });

    const subtask = await db.subtask.create({
      data: {
        taskId,
        userId: session.user.id,
        title: title.trim(),
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        position: (maxPosition._max.position || 0) + 1,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: 'subtask',
        entityId: subtask.id,
        action: 'created',
        metadata: JSON.stringify({ taskId, title }),
      },
    });

    return NextResponse.json({ subtask }, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to create subtask' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id]/subtasks - Update a subtask (toggle completion, reorder)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { subtaskId, isCompleted, position, title } = body;

    if (!subtaskId) {
      return NextResponse.json(
        { error: 'subtaskId is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (typeof isCompleted === 'boolean') updateData.isCompleted = isCompleted;
    if (typeof position === 'number') updateData.position = position;
    if (title) updateData.title = title;

    const subtask = await db.subtask.update({
      where: { id: subtaskId, taskId },
      data: updateData,
    });

    // Log activity if completion status changed
    if (typeof isCompleted === 'boolean') {
      await db.activityLog.create({
        data: {
          userId: session.user.id,
          entityType: 'subtask',
          entityId: subtask.id,
          action: isCompleted ? 'completed' : 'uncompleted',
          metadata: JSON.stringify({ taskId, title: subtask.title }),
        },
      });
    }

    return NextResponse.json({ subtask });
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json(
      { error: 'Failed to update subtask' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/subtasks - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const { searchParams } = new URL(request.url);
    const subtaskId = searchParams.get('subtaskId');

    if (!subtaskId) {
      return NextResponse.json(
        { error: 'subtaskId is required' },
        { status: 400 }
      );
    }

    const subtask = await db.subtask.findUnique({
      where: { id: subtaskId },
      select: { title: true },
    });

    await db.subtask.delete({
      where: { id: subtaskId, taskId },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: 'subtask',
        entityId: subtaskId,
        action: 'deleted',
        metadata: JSON.stringify({ taskId, title: subtask?.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json(
      { error: 'Failed to delete subtask' },
      { status: 500 }
    );
  }
}
