import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST /api/users/avatar - Upload avatar (base64 or URL)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    const body = await request.json();
    const { avatarData, avatarType } = body;

    if (!avatarData) {
      return apiError('Avatar data is required', 400);
    }

    // Validate avatar type
    if (avatarType === 'base64') {
      // Validate base64 image format
      if (!avatarData.startsWith('data:image/')) {
        return apiError('Invalid image format. Must be a base64 data URL', 400);
      }
      
      // Check size (base64 is ~33% larger than original)
      const maxBase64Size = 4 * 1024 * 1024; // ~3MB original = ~4MB base64
      if (avatarData.length > maxBase64Size) {
        return apiError('Image too large. Maximum size is 3MB', 400);
      }
    } else if (avatarType === 'url') {
      // Validate URL format
      try {
        const url = new URL(avatarData);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        return apiError('Invalid avatar URL', 400);
      }
    } else {
      return apiError('Invalid avatar type. Must be "base64" or "url"', 400);
    }

    // Update user avatar
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: avatarData },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    return apiResponse({
      success: true,
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/users/avatar - Remove avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiError('Unauthorized', 401);
    }

    // Remove avatar
    await db.user.update({
      where: { id: session.user.id },
      data: { avatarUrl: null },
    });

    return apiResponse({ success: true, message: 'Avatar removed' });
  } catch (error) {
    return handleApiError(error);
  }
}
