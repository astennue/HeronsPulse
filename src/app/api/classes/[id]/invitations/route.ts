import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Generate a unique invitation code
function generateInvitationCode(): string {
  // Generate 8-character uppercase alphanumeric code
  return randomBytes(4).toString('hex').toUpperCase();
}

// GET /api/classes/[id]/invitations - Get invitations for a class
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Only owner or super admin can view invitations
    if (classData.ownerId !== user.id && user.role !== 'super_admin') {
      return apiError('Access denied', 403);
    }

    const invitations = await db.classInvitation.findMany({
      where: { classId: id },
      include: {
        createdBy: {
          select: { id: true, displayName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiResponse(invitations.map(inv => ({
      id: inv.id,
      code: inv.code,
      email: inv.email,
      expiresAt: inv.expiresAt,
      isUsed: inv.isUsed,
      usedAt: inv.usedAt,
      createdAt: inv.createdAt,
      createdBy: inv.createdBy,
    })));
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/classes/[id]/invitations - Create a new invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, displayName: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    const { id } = await params;

    const classData = await db.class.findUnique({
      where: { id },
      select: { ownerId: true, name: true, subjectCode: true, section: true },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Only owner can create invitations
    if (classData.ownerId !== user.id && user.role !== 'super_admin') {
      return apiError('Access denied', 403);
    }

    const body = await request.json();
    const { email } = body;

    // Generate unique code
    let code = generateInvitationCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.classInvitation.findUnique({
        where: { code },
      });
      if (!existing) break;
      code = generateInvitationCode();
      attempts++;
    }

    // Set expiration to 1 week from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await db.classInvitation.create({
      data: {
        classId: id,
        code,
        email: email || null,
        createdById: user.id,
        expiresAt,
      },
      include: {
        class: {
          select: { name: true, subjectCode: true, section: true },
        },
      },
    });

    // If email is provided, we could send an email here
    // For now, we'll just return the invitation with the code
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/classes/join?code=${code}`;

    return apiResponse({
      id: invitation.id,
      code: invitation.code,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      invitationLink,
      class: invitation.class,
      createdAt: invitation.createdAt,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/classes/[id]/invitations - Delete/revoke an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return apiError('Invitation ID is required', 400);
    }

    const classData = await db.class.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!classData) {
      return apiError('Class not found', 404);
    }

    // Only owner can revoke invitations
    if (classData.ownerId !== user.id && user.role !== 'super_admin') {
      return apiError('Access denied', 403);
    }

    await db.classInvitation.delete({
      where: { id: invitationId },
    });

    return apiResponse({ message: 'Invitation revoked successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
