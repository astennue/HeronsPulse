import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ProjectStatus } from '@prisma/client';

// GET /api/projects - Get all projects for the current user
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
    const status = searchParams.get('status') as ProjectStatus | null;
    const search = searchParams.get('search');

    // Build where clause based on role
    let whereClause: any = {};
    
    if (user.role === 'super_admin') {
      // Super admin sees all projects
      if (status) whereClause.status = status;
    } else {
      // Regular users see projects they're members of
      whereClause.members = {
        some: { userId: user.id },
      };
      if (status) whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { courseCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await db.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, displayName: true, role: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await db.task.findMany({
          where: { projectId: project.id },
          select: { status: true },
        });

        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const progress = tasks.length > 0 
          ? Math.round((completedTasks / tasks.length) * 100) 
          : 0;

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          icon: project.icon,
          color: project.color,
          courseCode: project.courseCode,
          status: project.status,
          progress,
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          owner: project.owner,
          ownerRole: project.owner.role,
          members: project.members.map(m => ({
            id: m.user.id,
            name: m.user.displayName,
            avatarUrl: m.user.avatarUrl,
          })),
          tasksTotal: tasks.length,
          tasksCompleted: completedTasks,
        };
      })
    );

    return apiResponse(projectsWithProgress);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects - Create a new project
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

    // Super admins can't create projects
    if (user.role === 'super_admin') {
      return apiError('Super admins cannot create projects', 403);
    }

    const body = await request.json();
    const { name, description, courseCode, status, startDate, endDate, color, icon, members } = body;

    if (!name || name.trim().length === 0) {
      return apiError('Project name is required', 400);
    }

    // Create project with default board
    const project = await db.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        courseCode: courseCode?.trim() || null,
        status: status || 'active',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        color: color || '#1A56DB',
        icon: icon || '📁',
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: 'owner' },
        },
        boards: {
          create: {
            name: 'Main Board',
            description: 'Default board for this project',
            createdById: user.id,
            isDefault: true,
          },
        },
      },
      include: {
        members: true,
        boards: true,
      },
    });

    // Add additional members if provided
    if (members && Array.isArray(members) && members.length > 0) {
      await db.projectMember.createMany({
        data: members
          .filter((id: string) => id !== user.id)
          .map((userId: string) => ({
            projectId: project.id,
            userId,
            role: 'member',
          })),
        skipDuplicates: true,
      });
    }

    return apiResponse({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      color: project.color,
      icon: project.icon,
      createdAt: project.createdAt,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
