import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// POST /api/classes/join - Join a class using an invitation code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return apiError('Unauthorized', 401);
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, displayName: true, email: true },
    });

    if (!user) {
      return apiError('User not found', 404);
    }

    // Only students can join classes
    if (user.role !== 'student') {
      return apiError('Only students can join classes', 403);
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return apiError('Invitation code is required', 400);
    }

    // Normalize the code
    const normalizedCode = code.trim().toUpperCase();

    // Find the invitation
    const invitation = await db.classInvitation.findUnique({
      where: { code: normalizedCode },
      include: {
        class: {
          include: {
            owner: {
              select: { id: true, displayName: true, email: true },
            },
          },
        },
      },
    });

    if (!invitation) {
      return apiError('Invalid invitation code', 404);
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return apiError('This invitation has expired', 400);
    }

    // Check if invitation has already been used (for email-specific invites)
    if (invitation.isUsed) {
      return apiError('This invitation has already been used', 400);
    }

    // Check if the invitation is for a specific email
    if (invitation.email && invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return apiError('This invitation is not for your email address', 403);
    }

    // Check if user is already a member
    const existingMembership = await db.classMember.findUnique({
      where: {
        classId_userId: {
          classId: invitation.classId,
          userId: user.id,
        },
      },
    });

    if (existingMembership) {
      return apiError('You are already a member of this class', 400);
    }

    // Add user to the class
    await db.classMember.create({
      data: {
        classId: invitation.classId,
        userId: user.id,
      },
    });

    // Mark invitation as used if it was email-specific
    if (invitation.email) {
      await db.classInvitation.update({
        where: { id: invitation.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    }

    // Return the class details
    return apiResponse({
      message: `Successfully joined ${invitation.class.name}`,
      class: {
        id: invitation.class.id,
        name: invitation.class.name,
        subjectCode: invitation.class.subjectCode,
        section: invitation.class.section,
        description: invitation.class.description,
        schedule: invitation.class.schedule,
        room: invitation.class.room,
        semester: invitation.class.semester,
        owner: invitation.class.owner,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/classes/join - Get invitation details by code
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
    const code = searchParams.get('code');

    if (!code) {
      return apiError('Invitation code is required', 400);
    }

    const normalizedCode = code.trim().toUpperCase();

    // Find the invitation
    const invitation = await db.classInvitation.findUnique({
      where: { code: normalizedCode },
      include: {
        class: {
          include: {
            owner: {
              select: { id: true, displayName: true, email: true },
            },
            _count: {
              select: { members: true },
            },
          },
        },
      },
    });

    if (!invitation) {
      return apiError('Invalid invitation code', 404);
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return apiError('This invitation has expired', 400);
    }

    // Check if the invitation is for a specific email
    let isEligible = true;
    if (invitation.email) {
      isEligible = invitation.email.toLowerCase() === user.email?.toLowerCase();
    }

    // Check if user is already a member
    const existingMembership = await db.classMember.findUnique({
      where: {
        classId_userId: {
          classId: invitation.classId,
          userId: user.id,
        },
      },
    });

    return apiResponse({
      isValid: true,
      isEligible,
      isAlreadyMember: !!existingMembership,
      expiresAt: invitation.expiresAt,
      class: {
        id: invitation.class.id,
        name: invitation.class.name,
        subjectCode: invitation.class.subjectCode,
        section: invitation.class.section,
        description: invitation.class.description,
        schedule: invitation.class.schedule,
        room: invitation.class.room,
        semester: invitation.class.semester,
        owner: invitation.class.owner,
        memberCount: invitation.class._count.members,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
