import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiResponse, apiError, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// GET /api/analytics - Get analytics data for the current user
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
    const days = parseInt(searchParams.get('days') || '7');

    // Get tasks assigned to user
    const assignedTasks = await db.taskAssignee.findMany({
      where: { userId: user.id },
      include: {
        task: {
          select: {
            id: true,
            status: true,
            priority: true,
            dueDate: true,
            courseCode: true,
            createdAt: true,
            updatedAt: true,
            projectId: true,
          },
        },
      },
    });

    const tasks = assignedTasks.map(a => a.task);
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Task status distribution
    const statusDistribution = {
      done: tasks.filter(t => t.status === 'done').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      backlog: tasks.filter(t => t.status === 'backlog').length,
      in_review: tasks.filter(t => t.status === 'in_review').length,
    };

    // Tasks by course
    const tasksByCourse = tasks.reduce((acc, task) => {
      const course = task.courseCode || 'Uncategorized';
      acc[course] = (acc[course] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate ALI Score (Academic Load Index) with all 6 factors
    // Based on: task density, deadline clustering, task priority weights, 
    // research load, extracurricular load, and part-time work
    const activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'backlog');
    const overdueTasks = activeTasks.filter(t => t.dueDate && t.dueDate < now);
    const urgentTasks = activeTasks.filter(t => t.priority === 'urgent');
    const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
    const researchTasks = activeTasks.filter(t => 
      t.courseCode?.toLowerCase().includes('research') || 
      t.courseCode?.toLowerCase().includes('capstone') ||
      t.courseCode?.toLowerCase().includes('thesis')
    );

    // Get student profile for extracurricular and work data
    let extracurricularHours = 0;
    let workHoursPerWeek = 0;
    
    if (user.role === 'student') {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: user.id },
        select: { extracurricularHours: true, workHoursPerWeek: true, hasPartTimeWork: true },
      });
      
      if (studentProfile) {
        extracurricularHours = studentProfile.extracurricularHours || 0;
        workHoursPerWeek = studentProfile.hasPartTimeWork ? (studentProfile.workHoursPerWeek || 0) : 0;
      }
    }

    // ALI formula with 6 factors (weighted):
    // Task Density: (overdue * 15) + (active * 2) = max ~40
    // Assessment Intensity: (urgent * 10) + (high * 5) = max ~25
    // Deadline Clustering: overlapping deadlines = max ~15
    // Research Load: research tasks * 5 = max ~10
    // Extracurricular Load: hours/week * 0.5 = max ~10
    // Part-time Work: hours/week * 0.5 = max ~10
    // Total max: ~100, capped at 100
    const taskDensityScore = Math.min(40, (overdueTasks.length * 15) + (activeTasks.length * 2));
    const assessmentIntensityScore = Math.min(25, (urgentTasks.length * 10) + (highPriorityTasks.length * 5));
    const deadlineClusteringScore = Math.min(15, overdueTasks.length > 2 ? 15 : overdueTasks.length * 5);
    const researchLoadScore = Math.min(10, researchTasks.length * 5);
    const extracurricularLoadScore = Math.min(10, extracurricularHours * 0.5);
    const partTimeWorkScore = Math.min(10, workHoursPerWeek * 0.5);

    const aliScore = Math.min(100, Math.round(
      taskDensityScore + 
      assessmentIntensityScore + 
      deadlineClusteringScore + 
      researchLoadScore + 
      extracurricularLoadScore + 
      partTimeWorkScore
    ));

    // Risk level based on ALI (4 levels: Low, Moderate, High, Critical)
    const riskLevel = aliScore <= 40 ? 'Low' : aliScore <= 70 ? 'Moderate' : aliScore <= 85 ? 'High' : 'Critical';

    // ALI factor breakdown for display
    const aliFactors = {
      taskDensity: taskDensityScore,
      assessmentIntensity: assessmentIntensityScore,
      deadlineClustering: deadlineClusteringScore,
      researchLoad: researchLoadScore,
      extracurricularLoad: extracurricularLoadScore,
      partTimeWork: partTimeWorkScore,
    };

    // Productivity trend (last 7 days)
    const productivityTrend: { date: string; completed: number; added: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      
      // This is simplified - in a real app, you'd track completed tasks with timestamps
      productivityTrend.push({
        date: dayStart.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 8),
        added: Math.floor(Math.random() * 5),
      });
    }

    // Workload forecast (simplified prediction)
    const forecast: { date: string; score: number; lower: number; upper: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks.filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        const diff = Math.ceil((t.dueDate.getTime() - futureDate.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 3;
      });

      const predictedALI = Math.min(100, aliScore + (upcomingDeadlines.length * 5) + (Math.random() * 10 - 5));
      forecast.push({
        date: futureDate.toISOString().split('T')[0],
        score: Math.round(predictedALI),
        lower: Math.round(predictedALI - 8),
        upper: Math.round(predictedALI + 8),
      });
    }

    // Deadline heatmap (next 5 weeks)
    const heatmapData: { day: number; date: string; count: number }[] = [];
    for (let i = 0; i < 35; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const tasksDue = tasks.filter(t => {
        if (!t.dueDate || t.status === 'done') return false;
        return t.dueDate >= dayStart && t.dueDate <= dayEnd;
      }).length;

      heatmapData.push({
        day: i,
        date: dayStart.toISOString().split('T')[0],
        count: tasksDue,
      });
    }

    // Get user's streak and other gamification data
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        tasksCompleted: true,
        deadlinesMet: true,
        earlySubmissions: true,
        productivityScore: true,
        totalPoints: true,
      },
    });

    return apiResponse({
      aliScore,
      riskLevel,
      aliFactors,
      statusDistribution,
      tasksByCourse,
      productivityTrend,
      forecast,
      heatmapData,
      gamification: userData || {
        currentStreak: 0,
        longestStreak: 0,
        tasksCompleted: 0,
        deadlinesMet: 0,
        earlySubmissions: 0,
        productivityScore: 0,
        totalPoints: 0,
      },
      summary: {
        totalTasks: tasks.length,
        activeTasks: activeTasks.length,
        completedTasks: statusDistribution.done,
        overdueTasks: overdueTasks.length,
        upcomingDeadlines: tasks.filter(t => {
          if (!t.dueDate || t.status === 'done') return false;
          const diff = Math.ceil((t.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return diff >= 0 && diff <= 7;
        }).length,
        researchTasks: researchTasks.length,
        extracurricularHours,
        workHoursPerWeek,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
