// HeronPulse Academic OS - Award Badge API
// Super Admin and Faculty can award badges to students

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// POST - Award badge to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !['super_admin', 'faculty'].includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Unauthorized. Only Super Admin or Faculty can award badges.' },
        { status: 403 }
      );
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId, badgeId, reason } = body;

    if (!targetUserId || !badgeId) {
      return NextResponse.json(
        { error: 'User ID and Badge ID are required' },
        { status: 400 }
      );
    }

    // Check if user exists and is a student
    const user = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Can only award badges to students' },
        { status: 400 }
      );
    }

    // Check if badge exists
    const badge = await db.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    // Check if user already has this badge
    const existingBadge = await db.userBadge.findUnique({
      where: {
        userId_badgeId: { userId: targetUserId, badgeId },
      },
    });

    if (existingBadge) {
      return NextResponse.json(
        { error: 'User already has this badge' },
        { status: 400 }
      );
    }

    // Award the badge
    const userBadge = await db.userBadge.create({
      data: {
        userId: targetUserId,
        badgeId,
        awardedById: userId,
        reason,
      },
    });

    // Update user's total points
    await db.user.update({
      where: { id: targetUserId },
      data: {
        totalPoints: { increment: badge.points },
      },
    });

    // Create notification for the user
    await db.notification.create({
      data: {
        userId: targetUserId,
        type: 'badge_awarded',
        title: 'New Badge Earned!',
        body: `You have been awarded the "${badge.name}" badge! ${badge.icon}`,
        link: '/leaderboard',
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: userId,
        entityType: 'badge',
        entityId: badgeId,
        action: 'awarded',
        metadata: JSON.stringify({ 
          awardedTo: targetUserId, 
          badgeName: badge.name,
          reason 
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      userBadge,
      message: `Badge "${badge.name}" awarded to ${user.displayName}` 
    });
  } catch (error) {
    console.error('Award badge error:', error);
    return NextResponse.json(
      { error: 'Failed to award badge' },
      { status: 500 }
    );
  }
}
