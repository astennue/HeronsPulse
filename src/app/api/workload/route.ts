import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';
import {
  predictWorkload,
  calculateFactors,
  checkMLServiceHealth,
  type ALIFactors,
} from '@/lib/ml-service';

// GET /api/workload - Get current workload for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ML service health
    const health = await checkMLServiceHealth();
    if (!health.healthy) {
      return NextResponse.json(
        { error: 'ML service unavailable', mlServiceHealthy: false },
        { status: 503 }
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get task statistics
    const tasks = await db.task.findMany({
      where: {
        assignees: {
          some: { userId },
        },
      },
      include: {
        assignees: true,
      },
    });

    // Calculate activity data
    const activeTasks = tasks.filter(
      (t) => t.status !== 'done' && t.status !== 'backlog'
    ).length;

    const tasksDueIn7Days = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) <= sevenDaysFromNow && t.status !== 'done'
    ).length;

    // Calculate graded tasks weight (tasks with high priority or specific tags)
    const gradedTasks = tasks.filter(
      (t) =>
        t.priority === 'urgent' ||
        t.tags.toLowerCase().includes('exam') ||
        t.tags.toLowerCase().includes('quiz') ||
        t.tags.toLowerCase().includes('project')
    );
    const gradedTasksWeight = gradedTasks.length * 2;

    // Calculate overlapping deadlines (tasks due within 3-day windows)
    const deadlines = tasks
      .filter((t) => t.dueDate && t.status !== 'done')
      .map((t) => new Date(t.dueDate!))
      .sort((a, b) => a.getTime() - b.getTime());

    let overlappingDeadlines = 0;
    for (let i = 0; i < deadlines.length - 1; i++) {
      const diff = Math.abs(
        (deadlines[i + 1].getTime() - deadlines[i].getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diff <= 3) overlappingDeadlines++;
    }

    // Get student profile for additional factors
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId },
    });

    const orgMemberships = studentProfile?.organizations
      ? JSON.parse(studentProfile.organizations).length
      : 0;
    const orgPositions = studentProfile?.orgPositions
      ? JSON.parse(studentProfile.orgPositions).length
      : 0;
    const workHoursPerWeek = studentProfile?.workHoursPerWeek || 0;

    // Check if user has active thesis/research project
    const hasThesis = await db.project.findFirst({
      where: {
        members: { some: { userId } },
        OR: [
          { name: { contains: 'thesis', mode: 'insensitive' } },
          { name: { contains: 'capstone', mode: 'insensitive' } },
          { name: { contains: 'research', mode: 'insensitive' } },
        ],
        status: 'active',
      },
    });

    const activityData = {
      active_tasks: activeTasks,
      tasks_due_in_7_days: tasksDueIn7Days,
      graded_tasks_weight: gradedTasksWeight,
      overlapping_deadlines: overlappingDeadlines,
      thesis_active: !!hasThesis,
      org_memberships: orgMemberships,
      org_positions: orgPositions,
      work_hours_per_week: workHoursPerWeek,
    };

    // Calculate normalized factors
    const factors = await calculateFactors(activityData);

    if (!factors) {
      return NextResponse.json(
        { error: 'Failed to calculate factors' },
        { status: 500 }
      );
    }

    // Get historical ALI data
    const historicalData = await db.workloadData.findMany({
      where: { userId },
      orderBy: { recordedDate: 'desc' },
      take: 7,
    });

    const historicalAli = historicalData.map((d) => d.aliScore).reverse();

    // Get prediction from ML service
    const prediction = await predictWorkload({
      user_id: userId,
      factors: factors as ALIFactors,
      historical_ali: historicalAli.length > 0 ? historicalAli : undefined,
    });

    if (!prediction) {
      return NextResponse.json(
        { error: 'Failed to get prediction' },
        { status: 500 }
      );
    }

    // Store current workload data
    await db.workloadData.create({
      data: {
        userId,
        taskDensity: factors.task_density,
        assessmentIntensity: factors.assessment_intensity,
        deadlineClustering: factors.deadline_clustering,
        researchLoad: factors.research_load,
        extracurricularLoad: factors.extracurricular_load,
        partTimeWork: factors.part_time_work,
        aliScore: prediction.current_ali,
        riskLevel: prediction.current_risk_level as 'Low' | 'Moderate' | 'High' | 'Critical',
      },
    });

    // Store forecast results
    await db.forecastResult.create({
      data: {
        userId,
        forecastDate: now,
        horizonDays: 30,
        predictions: JSON.stringify(prediction.forecast_30day),
        peakDate: prediction.peak_date ? new Date(prediction.peak_date) : null,
        peakScore: prediction.peak_score,
        currentAli: prediction.current_ali,
      },
    });

    return NextResponse.json({
      ...prediction,
      activityData,
      factors,
      mlServiceHealthy: true,
    });
  } catch (error) {
    console.error('Error getting workload:', error);
    return NextResponse.json(
      { error: 'Failed to get workload' },
      { status: 500 }
    );
  }
}
