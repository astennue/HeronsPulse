import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/tasks/[id]/dependencies - Get task dependencies
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

    // Get dependencies (tasks this task depends on)
    const dependencies = await db.taskDependency.findMany({
      where: { taskId },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    // Get dependents (tasks that depend on this task)
    const dependents = await db.taskDependency.findMany({
      where: { dependsOnTaskId: taskId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    return NextResponse.json({
      dependencies: dependencies.map((d) => ({
        id: d.id,
        type: d.type,
        lagDays: d.lagDays,
        task: d.dependsOnTask,
      })),
      dependents: dependents.map((d) => ({
        id: d.id,
        type: d.type,
        lagDays: d.lagDays,
        task: d.task,
      })),
    });
  } catch (error) {
    console.error('Error fetching dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dependencies' },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/dependencies - Add a dependency
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
    const { dependsOnTaskId, type = 'finish_to_start', lagDays = 0 } = body;

    if (!dependsOnTaskId) {
      return NextResponse.json(
        { error: 'dependsOnTaskId is required' },
        { status: 400 }
      );
    }

    // Prevent self-dependency
    if (taskId === dependsOnTaskId) {
      return NextResponse.json(
        { error: 'A task cannot depend on itself' },
        { status: 400 }
      );
    }

    // Check if dependency already exists
    const existing = await db.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: { taskId, dependsOnTaskId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Dependency already exists' },
        { status: 400 }
      );
    }

    // Check for circular dependency
    const checkCircular = async (currentId: string, targetId: string): Promise<boolean> => {
      const deps = await db.taskDependency.findMany({
        where: { taskId: currentId },
        select: { dependsOnTaskId: true },
      });

      for (const dep of deps) {
        if (dep.dependsOnTaskId === targetId) return true;
        if (await checkCircular(dep.dependsOnTaskId, targetId)) return true;
      }
      return false;
    };

    if (await checkCircular(dependsOnTaskId, taskId)) {
      return NextResponse.json(
        { error: 'Circular dependency detected' },
        { status: 400 }
      );
    }

    const dependency = await db.taskDependency.create({
      data: {
        taskId,
        dependsOnTaskId,
        type,
        lagDays,
      },
      include: {
        dependsOnTask: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: 'task',
        entityId: taskId,
        action: 'dependency_added',
        metadata: JSON.stringify({
          dependsOnTaskId,
          dependsOnTaskTitle: dependency.dependsOnTask.title,
        }),
      },
    });

    return NextResponse.json({ dependency }, { status: 201 });
  } catch (error) {
    console.error('Error creating dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create dependency' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/dependencies - Remove a dependency
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
    const dependencyId = searchParams.get('dependencyId');

    if (!dependencyId) {
      return NextResponse.json(
        { error: 'dependencyId is required' },
        { status: 400 }
      );
    }

    await db.taskDependency.delete({
      where: { id: dependencyId },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: 'task',
        entityId: taskId,
        action: 'dependency_removed',
        metadata: JSON.stringify({ dependencyId }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete dependency' },
      { status: 500 }
    );
  }
}
