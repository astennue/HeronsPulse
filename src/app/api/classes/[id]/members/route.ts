import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

// GET /api/classes/[id]/members - Get class members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Verify the class exists
    const classData = await db.class.findUnique({
      where: { id: classId },
      select: { ownerId: true },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Only owner, super_admin, or members can view members
    const isMember = await db.classMember.findFirst({
      where: { classId, userId },
    });

    if (userRole !== 'super_admin' && classData.ownerId !== userId && !isMember) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const members = await db.classMember.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
            studentNumber: true,
            yearLevel: true,
            section: true,
            role: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// DELETE /api/classes/[id]/members - Remove a member from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: classId } = await params;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Verify the class exists
    const classData = await db.class.findUnique({
      where: { id: classId },
      select: { ownerId: true, name: true },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Only owner (faculty) or super_admin can remove members
    if (userRole !== 'super_admin' && classData.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only class owner can remove members' },
        { status: 403 }
      );
    }

    // Cannot remove the owner
    if (memberId === classData.ownerId) {
      return NextResponse.json(
        { error: 'Cannot remove the class owner' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await db.classMember.findFirst({
      where: { classId, userId: memberId },
      include: {
        user: {
          select: { displayName: true },
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Member not found in this class' },
        { status: 404 }
      );
    }

    // Remove member
    await db.classMember.delete({
      where: { id: member.id },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId,
        entityType: 'class',
        entityId: classId,
        action: 'member_removed',
        metadata: JSON.stringify({
          className: classData.name,
          removedUserId: memberId,
          removedUserName: member.user.displayName,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
