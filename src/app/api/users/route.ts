import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcrypt';

// GET /api/users - Get all users (SuperAdmin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'super_admin') {
      return apiError('Access denied. SuperAdmin only.', 403);
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (role && ['student', 'faculty', 'super_admin'].includes(role)) {
      where.role = role;
    }
    
    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { displayName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        courseCodes: true,
        currentStreak: true,
        tasksCompleted: true,
        totalPoints: true,
        lastLoginAt: true,
        createdAt: true,
        isOnline: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get additional counts for faculty
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'faculty') {
          const classCount = await db.class.count({
            where: { ownerId: user.id },
          });
          
          const studentCount = await db.classMember.count({
            where: {
              class: { ownerId: user.id },
            },
          });
          
          return { ...user, classCount, studentCount };
        }
        return user;
      })
    );

    return apiResponse(enrichedUsers);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create new user (SuperAdmin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!currentUser || currentUser.role !== 'super_admin') {
      return apiError('Access denied. SuperAdmin only.', 403);
    }

    const body = await request.json();
    const { 
      name, 
      email, 
      role, 
      password, 
      courseCodes, 
      maxClasses,
      sendInvitation 
    } = body;

    // Validation
    if (!name || !email || !role || !password) {
      return apiError('Name, email, role, and password are required', 400);
    }

    if (!['student', 'faculty', 'super_admin'].includes(role)) {
      return apiError('Invalid role. Must be student, faculty, or super_admin', 400);
    }

    if (password.length < 6) {
      return apiError('Password must be at least 6 characters', 400);
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiError('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate default avatar
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true&format=svg`;

    // Create user
    const newUser = await db.user.create({
      data: {
        displayName: name,
        email,
        role,
        password: hashedPassword,
        avatarUrl: defaultAvatar,
        courseCodes: courseCodes ? JSON.stringify(courseCodes) : '',
        status: 'active',
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
        courseCodes: true,
        createdAt: true,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: null,
        entityType: 'user',
        entityId: newUser.id,
        action: 'created',
        metadata: JSON.stringify({
          createdByName: session.user.email,
          newUserRole: role,
        }),
      },
    });

    // Mock email invitation (in production, send actual email)
    if (sendInvitation) {
      console.log(`[Mock Email] Sending invitation to ${email} with role ${role}`);
      // In production: await sendEmail({ to: email, template: 'invitation', data: { name, role } });
    }

    return apiResponse({
      ...newUser,
      courseCodes: newUser.courseCodes ? JSON.parse(newUser.courseCodes) : [],
      message: sendInvitation 
        ? `User created and invitation sent to ${email}`
        : 'User created successfully',
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
