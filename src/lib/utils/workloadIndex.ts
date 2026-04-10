// HeronPulse Academic OS - Workload Index Calculator
// Academic Load Index (ALI) - A 0-100 score computed from 4 weighted inputs

import type { Task, ALIInputs, RiskLevel } from '@/lib/types';

/**
 * Calculate Academic Load Index (ALI)
 * 
 * ALI is a 0-100 score computed from 4 weighted inputs:
 * - task_density (35%): tasks due in next 7 days
 * - assessment_intensity (30%): weight of upcoming assessments
 * - deadline_clustering (20%): how many deadlines are bunched together
 * - research_load (15%): research-type tasks in queue
 */
export function computeALI(inputs: ALIInputs): number {
  const weights = {
    taskDensity: 0.35,
    assessmentIntensity: 0.30,
    deadlineClustering: 0.20,
    researchLoad: 0.15,
  };

  const raw =
    inputs.taskDensity * weights.taskDensity * 10 +
    inputs.assessmentIntensity * weights.assessmentIntensity * 10 +
    inputs.deadlineClustering * weights.deadlineClustering * 10 +
    inputs.researchLoad * weights.researchLoad * 10;

  return Math.min(100, Math.round(raw));
}

/**
 * Get risk category based on ALI score
 */
export function getRiskCategory(ali: number): RiskLevel {
  if (ali <= 40) return 'Low';
  if (ali <= 70) return 'Moderate';
  if (ali <= 85) return 'High';
  return 'Critical';
}

/**
 * Get risk color based on ALI score
 */
export function getRiskColor(ali: number): string {
  if (ali <= 40) return 'text-green-500';
  if (ali <= 70) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Get risk background color based on ALI score
 */
export function getRiskBgColor(ali: number): string {
  if (ali <= 40) return 'bg-green-500/10';
  if (ali <= 70) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

/**
 * Calculate ALI from tasks
 */
export function calculateALIFromTasks(tasks: Task[]): ALIInputs & { aliScore: number; riskLevel: RiskLevel } {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Task density: count of tasks due in next 7 days (0-10 scale)
  const tasksDueIn7Days = tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) <= in7Days && new Date(t.dueDate) >= now && t.status !== 'done'
  ).length;
  const taskDensity = Math.min(10, tasksDueIn7Days);

  // Assessment intensity: weighted by priority (0-10 scale)
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.dueDate && new Date(t.dueDate) <= in7Days).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.dueDate && new Date(t.dueDate) <= in7Days).length;
  const assessmentIntensity = Math.min(10, (urgentTasks * 2 + highPriorityTasks));

  // Deadline clustering: tasks due in same day (0-10 scale)
  const deadlinesByDay: Record<string, number> = {};
  tasks.forEach(t => {
    if (t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= in7Days && t.status !== 'done') {
      const dayKey = new Date(t.dueDate).toDateString();
      deadlinesByDay[dayKey] = (deadlinesByDay[dayKey] || 0) + 1;
    }
  });
  const maxDeadlinesPerDay = Math.max(0, ...Object.values(deadlinesByDay));
  const deadlineClustering = Math.min(10, maxDeadlinesPerDay);

  // Research load: tasks with 'research' tag (0-10 scale)
  const researchTasks = tasks.filter(t => 
    t.tags.includes('research') && 
    t.dueDate && 
    new Date(t.dueDate) <= in7Days && 
    t.status !== 'done'
  ).length;
  const researchLoad = Math.min(10, researchTasks);

  const inputs: ALIInputs = {
    taskDensity,
    assessmentIntensity,
    deadlineClustering,
    researchLoad,
  };

  const aliScore = computeALI(inputs);
  const riskLevel = getRiskCategory(aliScore);

  return {
    ...inputs,
    aliScore,
    riskLevel,
  };
}

/**
 * Get workload recommendation based on ALI
 */
export function getWorkloadRecommendation(ali: number): string {
  if (ali <= 30) {
    return "Your workload is light. Consider taking on additional tasks or starting early on upcoming projects.";
  } else if (ali <= 50) {
    return "Your workload is manageable. Keep up the good pace and maintain your current schedule.";
  } else if (ali <= 70) {
    return "Your workload is moderate. Consider prioritizing tasks and avoiding new commitments.";
  } else if (ali <= 85) {
    return "Your workload is high. Focus on essential tasks and consider delegating or rescheduling non-critical items.";
  } else {
    return "Your workload is critical. Immediate action required - reschedule non-essential tasks and seek support if needed.";
  }
}

/**
 * Forecast workload for next N days
 */
export function forecastWorkload(
  tasks: Task[], 
  horizonDays: number = 7
): Array<{ date: Date; predictedScore: number; riskLevel: RiskLevel }> {
  const forecast: Array<{ date: Date; predictedScore: number; riskLevel: RiskLevel }> = [];
  const now = new Date();

  for (let i = 0; i < horizonDays; i++) {
    const targetDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const in7DaysFromTarget = new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Tasks due in 7-day window from target date
    const tasksInWindow = tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate >= targetDate && dueDate <= in7DaysFromTarget;
    });

    const inputs: ALIInputs = {
      taskDensity: Math.min(10, tasksInWindow.length),
      assessmentIntensity: Math.min(10, tasksInWindow.filter(t => t.priority === 'urgent' || t.priority === 'high').length * 2),
      deadlineClustering: Math.min(10, tasksInWindow.length > 3 ? 5 : tasksInWindow.length),
      researchLoad: Math.min(10, tasksInWindow.filter(t => t.tags.includes('research')).length),
    };

    const predictedScore = computeALI(inputs);
    const riskLevel = getRiskCategory(predictedScore);

    forecast.push({ date: targetDate, predictedScore, riskLevel });
  }

  return forecast;
}
