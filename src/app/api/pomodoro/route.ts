import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { subDays } from 'date-fns';

// GET - Fetch pomodoro sessions (last 30 days by default)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type'); // focus, short_break, long_break, or all

    const startDate = subDays(new Date(), days);

    const whereClause: any = {
      userId: session.user.id,
      startedAt: { gte: startDate },
    };

    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const sessions = await db.pomodoroSession.findMany({
      where: whereClause,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate statistics
    const stats = {
      totalSessions: sessions.length,
      focusSessions: sessions.filter(s => s.type === 'focus').length,
      shortBreaks: sessions.filter(s => s.type === 'short_break').length,
      longBreaks: sessions.filter(s => s.type === 'long_break').length,
      totalFocusMinutes: sessions
        .filter(s => s.type === 'focus')
        .reduce((acc, s) => acc + Math.floor(s.durationSeconds / 60), 0),
      completedSessions: sessions.filter(s => s.completed).length,
      averageSessionLength: sessions.length > 0
        ? Math.floor(sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / sessions.length / 60)
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pomodoro sessions' },
      { status: 500 }
    );
  }
}

// POST - Create a new pomodoro session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, durationSeconds, type, completed, startedAt, endedAt } = body;

    const pomodoroSession = await db.pomodoroSession.create({
      data: {
        userId: session.user.id,
        taskId: taskId || null,
        durationSeconds: durationSeconds || 1500, // Default 25 min
        type: type || 'focus',
        completed: completed ?? true,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: pomodoroSession,
    });
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json(
      { error: 'Failed to create pomodoro session' },
      { status: 500 }
    );
  }
}
