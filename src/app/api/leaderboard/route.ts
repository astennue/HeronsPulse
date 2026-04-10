// HeronPulse Academic OS - Leaderboard API
// Returns ONLY students for rankings (faculty and admin are viewers only)

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    // Get ONLY students - faculty and admin are not included in rankings
    const students = await db.user.findMany({
      where: {
        role: 'student', // ONLY students appear in leaderboard
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        currentStreak: true,
        longestStreak: true,
        tasksCompleted: true,
        deadlinesMet: true,
        productivityScore: true,
        totalPoints: true,
        awardedBadges: {
          include: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                rarity: true,
              },
            },
          },
          orderBy: { awardedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: [
        { productivityScore: 'desc' },
        { tasksCompleted: 'desc' },
      ],
    });

    // Get all badges for reference
    const allBadges = await db.badge.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        icon: true,
        description: true,
        rarity: true,
      },
    });

    // Format leaderboard data
    const leaderboard = students.map((student, index) => ({
      rank: index + 1,
      id: student.id,
      name: student.displayName,
      avatarUrl: student.avatarUrl,
      tasksCompleted: student.tasksCompleted,
      deadlinesMet: student.deadlinesMet,
      streak: student.currentStreak,
      longestStreak: student.longestStreak,
      score: Math.round(student.productivityScore) || student.totalPoints || 0,
      badges: student.awardedBadges.map(ab => ({
        id: ab.badge.id,
        name: ab.badge.name,
        icon: ab.badge.icon,
        rarity: ab.badge.rarity,
      })),
    }));

    // Calculate stats
    const stats = {
      totalStudents: students.length,
      totalTasks: students.reduce((sum, s) => sum + s.tasksCompleted, 0),
      averageScore: students.length > 0 
        ? Math.round(students.reduce((sum, s) => sum + (s.productivityScore || 0), 0) / students.length)
        : 0,
      topPerformer: leaderboard[0] || null,
    };

    return NextResponse.json({
      leaderboard,
      badges: allBadges,
      stats,
      period,
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
