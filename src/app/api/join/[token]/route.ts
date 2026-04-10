import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/join/[token] - Get invitation details (preview before joining)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the invitation
    const invitation = await db.classInvitation.findUnique({
      where: { token },
      include: {
        class: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link', valid: false },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired', valid: false },
        { status: 400 }
      );
    }

    // Check if max uses reached
    if (invitation.maxUses !== null && invitation.currentUses >= invitation.maxUses) {
      return NextResponse.json(
        { error: 'This invitation link has reached its maximum uses', valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation.id,
        class: {
          id: invitation.class.id,
          name: invitation.class.name,
          subjectCode: invitation.class.subjectCode,
          description: invitation.class.description,
          schedule: invitation.class.schedule,
          room: invitation.class.room,
          semester: invitation.class.semester,
          yearLevel: invitation.class.yearLevel,
          section: invitation.class.section,
          owner: invitation.class.owner,
        },
        expiresAt: invitation.expiresAt,
        maxUses: invitation.maxUses,
        currentUses: invitation.currentUses,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    );
  }
}

// POST /api/join/[token] - Join a class via invitation link
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please log in to join this class' },
        { status: 401 }
      );
    }

    const { token } = await params;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Only students can join classes
    if (userRole !== 'student') {
      return NextResponse.json(
        { error: 'Only students can join classes' },
        { status: 403 }
      );
    }

    // Find the invitation
    const invitation = await db.classInvitation.findUnique({
      where: { token },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subjectCode: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation link' },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This invitation link has expired' },
        { status: 400 }
      );
    }

    // Check if max uses reached
    if (invitation.maxUses !== null && invitation.currentUses >= invitation.maxUses) {
      return NextResponse.json(
        { error: 'This invitation link has reached its maximum uses' },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMember = await db.classMember.findFirst({
      where: {
        classId: invitation.classId,
        userId,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this class' },
        { status: 400 }
      );
    }

    // Add user to class
    await db.classMember.create({
      data: {
        classId: invitation.classId,
        userId,
        role: 'student',
      },
    });

    // Update invitation usage count
    await db.classInvitation.update({
      where: { id: invitation.id },
      data: {
        currentUses: { increment: 1 },
        status: invitation.maxUses !== null && invitation.currentUses + 1 >= invitation.maxUses
          ? 'expired'
          : 'active',
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        entityType: 'class',
        entityId: invitation.classId,
        action: 'joined',
        metadata: JSON.stringify({
          className: invitation.class.name,
          subjectCode: invitation.class.subjectCode,
          invitationToken: token,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${invitation.class.name}`,
      class: invitation.class,
    });
  } catch (error) {
    console.error('Error joining class:', error);
    return NextResponse.json(
      { error: 'Failed to join class' },
      { status: 500 }
    );
  }
}
