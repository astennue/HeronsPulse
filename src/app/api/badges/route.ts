// HeronPulse Academic OS - Badges API
// Super Admin can create, update, delete badges

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - List all badges
export async function GET() {
  try {
    const badges = await db.badge.findMany({
      where: { isActive: true },
      orderBy: [{ rarity: 'desc' }, { points: 'desc' }],
      include: {
        _count: {
          select: { userBadges: true },
        },
      },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

// POST - Create new badge (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only Super Admin can create badges.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, rarity, points, criteriaType, criteriaValue } = body;

    if (!name || !description || !icon) {
      return NextResponse.json(
        { error: 'Name, description, and icon are required' },
        { status: 400 }
      );
    }

    const badge = await db.badge.create({
      data: {
        name,
        description,
        icon,
        rarity: rarity || 'common',
        points: points || 0,
        criteria: JSON.stringify({ type: criteriaType || 'manual', value: criteriaValue || 0 }),
        createdById: session.user.id,
      },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        entityType: 'badge',
        entityId: badge.id,
        action: 'created',
        metadata: JSON.stringify({ badgeName: badge.name }),
      },
    });

    return NextResponse.json({ badge }, { status: 201 });
  } catch (error) {
    console.error('Create badge error:', error);
    return NextResponse.json(
      { error: 'Failed to create badge' },
      { status: 500 }
    );
  }
}
