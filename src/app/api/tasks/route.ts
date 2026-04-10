import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TaskStatus, TaskPriority } from '@prisma/client';

// GET /api/tasks - Get all tasks for the current user
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
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as TaskPriority | null;
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');
    const roleFilter = searchParams.get('role') as 'student' | 'faculty' | null;

    // Build where clause based on role
    let whereClause: any = {};
    
    if (user.role === 'super_admin') {
      // Super admin sees all tasks
      if (roleFilter) {
        whereClause.project = { owner: { role: roleFilter } };
      }
    } else {
      // Regular users see tasks assigned to them or in their projects
      whereClause.OR = [
        { assignees: { some: { userId: user.id } } },
        { project: { members: { some: { userId: user.id } } } },
      ];
    }

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (projectId) whereClause.projectId = projectId;

    if (search) {
      whereClause.OR = user.role === 'super_admin' 
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { courseCode: { contains: search, mode: 'insensitive' } },
          ]
        : [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { courseCode: { contains: search, mode: 'insensitive' } },
          ];
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
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
        assignees: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
        subtasks: {
          select: { id: true, title: true, isCompleted: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      courseCode: task.courseCode,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project,
      ownerName: task.project.owner.displayName,
      ownerRole: task.project.owner.role,
      assignees: task.assignees.map(a => a.user.displayName),
      subtasks: {
        completed: task.subtasks.filter(s => s.isCompleted).length,
        total: task.subtasks.length,
      },
      comments: task._count.comments,
      attachments: task._count.attachments,
    }));

    return apiResponse(formattedTasks);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tasks - Create a new task
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

    // Super admins can't create tasks
    if (user.role === 'super_admin') {
      return apiError('Super admins cannot create tasks', 403);
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      projectId, 
      boardId,
      status, 
      priority, 
      dueDate, 
      courseCode,
      estimatedHours,
      assignees,
      subtasks,
    } = body;

    if (!title || title.trim().length === 0) {
      return apiError('Task title is required', 400);
    }

    if (!projectId) {
      return apiError('Project ID is required', 400);
    }

    // Verify user has access to the project
    const projectMember = await db.projectMember.findFirst({
      where: { projectId, userId: user.id },
    });

    if (!projectMember) {
      return apiError('You do not have access to this project', 403);
    }

    // Get or create default board
    let board;
    if (boardId) {
      board = await db.board.findUnique({ where: { id: boardId } });
    }
    if (!board) {
      board = await db.board.findFirst({ 
        where: { projectId, isDefault: true } 
      });
    }
    if (!board) {
      board = await db.board.create({
        data: {
          name: 'Main Board',
          projectId,
          createdById: user.id,
          isDefault: true,
        },
      });
    }

    // Create task
    const task = await db.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        boardId: board.id,
        projectId,
        createdById: user.id,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        courseCode: courseCode?.trim() || null,
        estimatedHours: estimatedHours || 0,
        assignees: assignees && assignees.length > 0 
          ? {
              create: assignees.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
        subtasks: subtasks && subtasks.length > 0
          ? {
              create: subtasks.map((st: { title: string }, index: number) => ({
                title: st.title,
                userId: user.id,
                position: index,
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, displayName: true },
            },
          },
        },
        subtasks: true,
      },
    });

    return apiResponse({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      assignees: task.assignees.map(a => a.user.displayName),
      subtasks: task.subtasks,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
