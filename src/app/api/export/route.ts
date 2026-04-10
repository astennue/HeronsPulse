import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data for export - in production, this would query the database
const getMockData = (type: string, userId: string) => {
  const now = new Date();
  
  switch (type) {
    case 'tasks':
      return [
        { id: '1', title: 'Complete Project Proposal', status: 'done', priority: 'high', dueDate: new Date(now.getTime() - 86400000).toISOString(), course: 'CS401', completedAt: new Date(now.getTime() - 86400000).toISOString() },
        { id: '2', title: 'Literature Review', status: 'in_progress', priority: 'high', dueDate: new Date(now.getTime() + 3 * 86400000).toISOString(), course: 'CS401', completedAt: null },
        { id: '3', title: 'System Architecture Design', status: 'todo', priority: 'urgent', dueDate: new Date(now.getTime() + 7 * 86400000).toISOString(), course: 'CS401', completedAt: null },
        { id: '4', title: 'Database Schema', status: 'todo', priority: 'medium', dueDate: new Date(now.getTime() + 10 * 86400000).toISOString(), course: 'CS401', completedAt: null },
        { id: '5', title: 'UI Mockups', status: 'backlog', priority: 'low', dueDate: new Date(now.getTime() + 14 * 86400000).toISOString(), course: 'CS401', completedAt: null },
      ];
    case 'projects':
      return [
        { id: '1', name: 'CS Capstone 2026', description: 'Final year capstone project', status: 'active', progress: 35, startDate: '2025-01-15', endDate: '2025-05-30', tasksCompleted: 12, tasksTotal: 35 },
        { id: '2', name: 'Research Paper', description: 'Academic research on AI', status: 'active', progress: 60, startDate: '2025-01-10', endDate: '2025-03-15', tasksCompleted: 8, tasksTotal: 15 },
        { id: '3', name: 'Web Dev Portfolio', description: 'Personal portfolio website', status: 'completed', progress: 100, startDate: '2024-11-01', endDate: '2024-12-20', tasksCompleted: 20, tasksTotal: 20 },
      ];
    case 'analytics':
      return {
        summary: {
          aliScore: 62,
          tasksCompleted: 32,
          tasksPending: 15,
          overdueTasks: 2,
          productivityScore: 78,
          currentStreak: 5,
          longestStreak: 12,
          totalPoints: 450,
          badgesEarned: 3,
        },
        weeklyData: [
          { week: 'Week 1', completed: 4, added: 3, productivityScore: 65 },
          { week: 'Week 2', completed: 6, added: 5, productivityScore: 72 },
          { week: 'Week 3', completed: 3, added: 4, productivityScore: 60 },
          { week: 'Week 4', completed: 8, added: 2, productivityScore: 85 },
        ],
        courseWorkload: [
          { course: 'CS401', tasks: 8, avgPriority: 'high', completionRate: 75 },
          { course: 'IT301', tasks: 5, avgPriority: 'medium', completionRate: 80 },
          { course: 'CS302', tasks: 3, avgPriority: 'low', completionRate: 100 },
        ],
      };
    case 'pomodoro':
      return [
        { id: '1', date: new Date(now.getTime() - 86400000).toISOString(), focusMinutes: 25, type: 'focus', taskTitle: 'Literature Review', completed: true },
        { id: '2', date: new Date(now.getTime() - 86400000).toISOString(), focusMinutes: 5, type: 'short_break', taskTitle: null, completed: true },
        { id: '3', date: new Date(now.getTime() - 86400000).toISOString(), focusMinutes: 25, type: 'focus', taskTitle: 'Literature Review', completed: true },
        { id: '4', date: new Date(now.getTime() - 2 * 86400000).toISOString(), focusMinutes: 50, type: 'focus', taskTitle: 'Project Proposal', completed: true },
        { id: '5', date: new Date(now.getTime() - 2 * 86400000).toISOString(), focusMinutes: 15, type: 'long_break', taskTitle: null, completed: true },
      ];
    default:
      return [];
  }
};

// Convert data to CSV format
const toCSV = (data: any[], type: string): string => {
  if (!data.length) return 'No data available';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
};

// Convert data to JSON format
const toJSON = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

// Generate a simple text report (PDF alternative for web)
const toTextReport = (data: any, type: string): string => {
  const now = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let report = `
================================================================================
                        HERONPULSE ACADEMIC OS
                        ${type.toUpperCase()} REPORT
================================================================================
Generated: ${now}

`;
  
  if (type === 'analytics') {
    const analytics = data as ReturnType<typeof getMockData> extends (infer T)[] ? never : ReturnType<typeof getMockData>;
    if ('summary' in data) {
      report += `
ACADEMIC LOAD INDEX (ALI)
-------------------------
Current ALI Score: ${data.summary.aliScore}/100
Risk Level: ${data.summary.aliScore <= 40 ? 'Low' : data.summary.aliScore <= 70 ? 'Moderate' : 'High'}

TASK SUMMARY
------------
Total Tasks Completed: ${data.summary.tasksCompleted}
Tasks Pending: ${data.summary.tasksPending}
Overdue Tasks: ${data.summary.overdueTasks}

PRODUCTIVITY
------------
Productivity Score: ${data.summary.productivityScore}/100
Current Streak: ${data.summary.currentStreak} days
Longest Streak: ${data.summary.longestStreak} days
Total Points: ${data.summary.totalPoints}
Badges Earned: ${data.summary.badgesEarned}

WEEKLY PERFORMANCE
------------------
`;
      data.weeklyData.forEach((week: any) => {
        report += `${week.week}: ${week.completed} tasks completed, Score: ${week.productivityScore}%\n`;
      });
      
      report += `
COURSE WORKLOAD
---------------
`;
      data.courseWorkload.forEach((course: any) => {
        report += `${course.course}: ${course.tasks} tasks, ${course.completionRate}% completion\n`;
      });
    }
  } else if (Array.isArray(data)) {
    report += `TOTAL RECORDS: ${data.length}\n\n`;
    data.forEach((item, index) => {
      report += `--- Record ${index + 1} ---\n`;
      Object.entries(item).forEach(([key, value]) => {
        report += `${key}: ${value ?? 'N/A'}\n`;
      });
      report += '\n';
    });
  }
  
  report += `
================================================================================
                    END OF REPORT
================================================================================
HeronPulse Academic OS - University of Makati CCIS
Generated automatically by HeronPulse
`;
  
  return report;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'tasks';
    const format = searchParams.get('format') || 'json';
    
    // Get data
    const data = getMockData(type, session.user.id as string);
    
    // Generate content based on format
    let content: string;
    let contentType: string;
    let filename: string;
    
    switch (format) {
      case 'csv':
        content = toCSV(Array.isArray(data) ? data : [data], type);
        contentType = 'text/csv';
        filename = `heronpulse-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'pdf':
        // For PDF, we return a text report that can be printed/saved as PDF
        content = toTextReport(data, type);
        contentType = 'text/plain';
        filename = `heronpulse-${type}-report-${new Date().toISOString().split('T')[0]}.txt`;
        break;
      case 'json':
      default:
        content = toJSON(data);
        contentType = 'application/json';
        filename = `heronpulse-${type}-${new Date().toISOString().split('T')[0]}.json`;
    }
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
