import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/users/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        loginCount: true,
        lastLoginAt: true,
        currentStreak: true,
        longestStreak: true,
        tasksCompleted: true,
        productivityScore: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/users/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { displayName, bio, avatarUrl } = body;

    // Validate input
    if (displayName !== undefined && (!displayName || displayName.trim().length === 0)) {
      return apiError('Display name cannot be empty', 400);
    }

    // Build update data
    const updateData: { displayName?: string; bio?: string; avatarUrl?: string | null } = {};
    
    if (displayName !== undefined) {
      updateData.displayName = displayName.trim();
    }
    if (bio !== undefined) {
      updateData.bio = bio?.trim() || null;
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl || null;
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        displayName: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        loginCount: true,
        lastLoginAt: true,
        currentStreak: true,
        longestStreak: true,
        tasksCompleted: true,
        productivityScore: true,
        totalPoints: true,
        createdAt: true,
      },
    });

    return apiResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
