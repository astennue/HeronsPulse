// HeronPulse Academic OS - Role-Based Privileges Configuration
// This file defines all permissions, duties, and features for each role

// ==================== TYPES ====================

export type UserRole = 'student' | 'faculty' | 'super_admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RolePrivilege {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  scope: 'own' | 'class' | 'all';
}

export interface RoleConfig {
  name: string;
  description: string;
  icon: string;
  color: string;
  privileges: {
    tasks: RolePrivilege;
    projects: RolePrivilege;
    messages: RolePrivilege;
    analytics: RolePrivilege;
    users: RolePrivilege;
    settings: RolePrivilege;
    cms: RolePrivilege;
    audit: RolePrivilege;
    badges: RolePrivilege;
    classes: RolePrivilege;
    interventions: RolePrivilege;
    reports: RolePrivilege;
  };
  features: string[];
  restrictions: string[];
  novelFeatures: NovelFeature[];
  duties: string[];
  dashboardWidgets: DashboardWidget[];
}

export interface NovelFeature {
  name: string;
  description: string;
  icon: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: number;
}

// ==================== SUBJECT CODES (Predefined) ====================

export const SUBJECT_CODES = [
  { code: 'CS101', name: 'Introduction to Computing' },
  { code: 'CS201', name: 'Data Structures and Algorithms' },
  { code: 'CS301', name: 'Database Management Systems' },
  { code: 'CS302', name: 'Operating Systems' },
  { code: 'CS401', name: 'Software Engineering' },
  { code: 'CS402', name: 'Web Development' },
  { code: 'CS403', name: 'Mobile Application Development' },
  { code: 'CS404', name: 'Artificial Intelligence' },
  { code: 'CS405', name: 'Capstone Project' },
  { code: 'IT101', name: 'Fundamentals of Information Technology' },
  { code: 'IT201', name: 'Networking Fundamentals' },
  { code: 'IT301', name: 'Systems Analysis and Design' },
  { code: 'IT302', name: 'Information Security' },
  { code: 'IT401', name: 'IT Project Management' },
  { code: 'IS101', name: 'Management Information Systems' },
  { code: 'IS201', name: 'Business Analytics' },
];

// ==================== BADGE CRITERIA TYPES ====================

export const BADGE_CRITERIA_TYPES = [
  { type: 'manual', label: 'Manually Awarded', description: 'Awarded by faculty or admin' },
  { type: 'task_count', label: 'Task Completion Count', description: 'Awarded when user completes X tasks' },
  { type: 'streak', label: 'Login Streak', description: 'Awarded when user maintains X day streak' },
  { type: 'early_submission', label: 'Early Submissions', description: 'Awarded for submitting X tasks early' },
  { type: 'deadline_met', label: 'Deadlines Met', description: 'Awarded when user meets X deadlines' },
  { type: 'points', label: 'Points Threshold', description: 'Awarded when user reaches X points' },
  { type: 'research', label: 'Research Completed', description: 'Awarded for completing research tasks' },
  { type: 'collaboration', label: 'Team Collaboration', description: 'Awarded for participating in team projects' },
];

// ==================== ROLE CONFIGURATIONS ====================

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  student: {
    name: 'Student',
    description: 'Primary users who manage academic workload, collaborate on projects, and track productivity',
    icon: 'GraduationCap',
    color: 'green',
    privileges: {
      tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'own' },
      projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'own' },
      messages: { canCreate: true, canRead: true, canUpdate: false, canDelete: true, scope: 'own' },
      analytics: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'own' },
      users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, scope: 'own' },
      settings: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, scope: 'own' },
      cms: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'all' },
      audit: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, scope: 'own' },
      badges: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'all' },
      classes: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'own' },
      interventions: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'own' },
      reports: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, scope: 'own' },
    },
    features: [
      'Create and manage personal tasks',
      'Organize tasks with priorities and due dates',
      'Collaborate on team projects',
      'Invite team members via email',
      'Use Pomodoro Timer with BGM',
      'Track productivity and streaks',
      'Earn badges and achievements',
      'Compete on leaderboard',
      'Send and receive messages',
      'View personal analytics',
      'Set personal goals',
      'Upload attachments',
      'View class membership',
    ],
    restrictions: [
      'Cannot view other students\' private tasks',
      'Cannot modify tasks assigned by faculty',
      'Cannot access faculty dashboard',
      'Cannot manage system settings',
      'Cannot create badges or achievements',
      'Cannot view audit logs',
      'Cannot manage users',
      'Cannot create classes',
      'Maximum of joining 10 classes',
    ],
    novelFeatures: [
      {
        name: 'Floating Pomodoro Timer',
        description: 'Minimizable timer with built-in BGM and genre selection (Lo-fi, Nature, Classical, Electronic, Jazz)',
        icon: 'Timer',
      },
      {
        name: 'Academic Load Index Widget',
        description: 'Real-time ALI score with risk level indicator and workload recommendations',
        icon: 'Activity',
      },
      {
        name: 'Streak & Achievement System',
        description: 'Daily login streaks, task completion streaks, early submission bonuses, special event badges',
        icon: 'Flame',
      },
      {
        name: 'Team Collaboration Hub',
        description: 'Project chat rooms, file sharing, team calendar, email invitation system',
        icon: 'Users',
      },
    ],
    duties: [
      'Complete assigned tasks on time',
      'Participate in team projects',
      'Monitor personal workload using ALI',
      'Maintain productivity streaks',
      'Collaborate with team members',
      'Submit deliverables before deadlines',
      'Respond to faculty interventions',
    ],
    dashboardWidgets: [
      { id: 'welcome', title: 'Welcome Card', description: 'Streak and ALI score display', icon: 'User', priority: 1 },
      { id: 'upcoming-tasks', title: 'Upcoming Tasks', description: 'Tasks due soon', icon: 'Clock', priority: 2 },
      { id: 'project-progress', title: 'Project Progress', description: 'Active project cards', icon: 'FolderKanban', priority: 3 },
      { id: 'activity-feed', title: 'Recent Activity', description: 'Latest actions and updates', icon: 'Activity', priority: 4 },
      { id: 'pomodoro', title: 'Pomodoro Timer', description: 'Focus timer with BGM', icon: 'Timer', priority: 5 },
      { id: 'leaderboard', title: 'Leaderboard Position', description: 'Current ranking', icon: 'Trophy', priority: 6 },
      { id: 'badges', title: 'Earned Badges', description: 'Achievement showcase', icon: 'Award', priority: 7 },
    ],
  },

  faculty: {
    name: 'Faculty',
    description: 'Create and manage classes, monitor student progress, send interventions, and award achievements',
    icon: 'BookOpen',
    color: 'blue',
    privileges: {
      tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'class' },
      projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'class' },
      messages: { canCreate: true, canRead: true, canUpdate: false, canDelete: true, scope: 'class' },
      analytics: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'class' },
      users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'class' },
      settings: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, scope: 'own' },
      cms: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'all' },
      audit: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, scope: 'own' },
      badges: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, scope: 'class' },
      classes: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'own' },
      interventions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'class' },
      reports: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'class' },
    },
    features: [
      'Create up to 10 classes',
      'Add/remove students to classes',
      'View real-time student stats per class',
      'Track student ALI scores',
      'View task completion rates',
      'View login frequency',
      'View deadlines met ratio',
      'Send intervention messages to students',
      'Award badges and points to students',
      'Create and assign tasks to classes',
      'Send class announcements',
      'Generate class performance reports',
      'Export reports (PDF, CSV, Excel)',
      'Schedule weekly/monthly auto-reports',
      'View student profiles with full stats',
      'View student badge history',
    ],
    restrictions: [
      'Cannot access other faculty members\' classes',
      'Cannot modify system settings',
      'Cannot create or manage users',
      'Cannot access Super Admin features',
      'Cannot create system badges',
      'Cannot view system audit logs',
      'Maximum of 10 classes per faculty',
    ],
    novelFeatures: [
      {
        name: 'Class Management System',
        description: 'Create classes with subject codes, schedules, and rooms. Add up to 10 classes with student enrollment.',
        icon: 'BookOpen',
      },
      {
        name: 'Real-time Student Dashboard',
        description: 'View all student metrics: task completion rate, ALI score, login frequency, deadlines met, risk level.',
        icon: 'BarChart3',
      },
      {
        name: 'Intervention System',
        description: 'Send interventions (warning, support, meeting, reminder) to at-risk students with status tracking.',
        icon: 'AlertTriangle',
      },
      {
        name: 'Badge & Point Awards',
        description: 'Manually award badges and points to students for achievements and recognition.',
        icon: 'Award',
      },
      {
        name: 'Auto-Generated Reports',
        description: 'Schedule weekly and monthly reports for class performance, exported in PDF, CSV, or Excel.',
        icon: 'FileText',
      },
    ],
    duties: [
      'Create and manage classes',
      'Monitor student academic load',
      'Identify and support at-risk students',
      'Send timely interventions',
      'Award badges for achievements',
      'Provide feedback on submissions',
      'Generate progress reports',
      'Communicate important updates',
      'Schedule consultations when needed',
    ],
    dashboardWidgets: [
      { id: 'class-overview', title: 'My Classes', description: 'List of classes with student counts', icon: 'BookOpen', priority: 1 },
      { id: 'student-stats', title: 'Student Statistics', description: 'Real-time stats per student', icon: 'BarChart3', priority: 2 },
      { id: 'risk-alerts', title: 'Risk Alerts', description: 'High-risk student notifications', icon: 'AlertTriangle', priority: 3 },
      { id: 'interventions', title: 'Interventions', description: 'Pending and recent interventions', icon: 'Mail', priority: 4 },
      { id: 'ali-trend', title: 'Weekly ALI Trend', description: 'Class average over time', icon: 'TrendingUp', priority: 5 },
      { id: 'quick-actions', title: 'Quick Actions', description: 'Send intervention, award badge', icon: 'Zap', priority: 6 },
    ],
  },

  super_admin: {
    name: 'Super Admin',
    description: 'Full system control: user management (CRUD), badge creation, student/faculty boards, reports, and system settings',
    icon: 'Shield',
    color: 'purple',
    privileges: {
      tasks: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      projects: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      messages: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      analytics: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      users: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      settings: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      cms: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      audit: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      badges: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      classes: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      interventions: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
      reports: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, scope: 'all' },
    },
    features: [
      'Full user CRUD (create, read, update, delete)',
      'Bulk user operations (create, delete, assign roles)',
      'Activate/deactivate/delete user accounts',
      'View user profiles with full stats',
      'View user activity timeline',
      'View user badge history',
      'Impersonate users for support',
      'Create and manage badges',
      'Set badge criteria and rarity levels',
      'Award badges manually',
      'Student board with performance metrics',
      'Faculty board with class statistics',
      'Create system-wide announcements',
      'Manage CMS content',
      'View comprehensive audit logs',
      'Generate and export reports',
      'Schedule auto-generated reports',
      'Configure system settings',
      'Security settings management',
    ],
    restrictions: [
      'No restrictions - Full system access',
      'Responsible use expected',
      'Actions are logged for accountability',
      'Impersonation is tracked',
    ],
    novelFeatures: [
      {
        name: 'User Management System',
        description: 'Full CRUD for users with bulk operations, activate/deactivate/delete options, and activity timeline.',
        icon: 'Users',
      },
      {
        name: 'User Profile Viewer',
        description: 'View detailed student/faculty profiles with stats, badges earned, ALI history, activity timeline.',
        icon: 'User',
      },
      {
        name: 'Badge Management System',
        description: 'Create badges with name, description, icon, criteria (manual/task_count/streak/etc.), points, and rarity levels.',
        icon: 'Award',
      },
      {
        name: 'Student Performance Board',
        description: 'View all students with filters, see top performers, most improved, risk alerts, and achievement showcase.',
        icon: 'GraduationCap',
      },
      {
        name: 'Faculty Performance Board',
        description: 'View all faculty with class counts, student counts, class performance metrics, and activity stats.',
        icon: 'BookOpen',
      },
      {
        name: 'User Impersonation',
        description: 'Temporarily access user accounts for support purposes, with full audit logging.',
        icon: 'UserCog',
      },
      {
        name: 'Scheduled Reports',
        description: 'Configure weekly/monthly auto-generated reports in PDF, CSV, or Excel format.',
        icon: 'FileText',
      },
    ],
    duties: [
      'Maintain system health and uptime',
      'Manage user accounts and access',
      'Handle bulk user operations',
      'Create and manage badges',
      'Monitor audit logs for security',
      'Generate institutional reports',
      'Handle user support requests',
      'Respond to user inquiries',
      'Configure system settings',
      'Coordinate with faculty on needs',
    ],
    dashboardWidgets: [
      { id: 'user-stats', title: 'User Statistics', description: 'Total users by role, active/inactive', icon: 'Users', priority: 1 },
      { id: 'student-board', title: 'Student Board', description: 'Top performers, risk alerts', icon: 'GraduationCap', priority: 2 },
      { id: 'faculty-board', title: 'Faculty Board', description: 'Faculty with class counts', icon: 'BookOpen', priority: 3 },
      { id: 'user-management', title: 'User Management', description: 'User table with CRUD', icon: 'UserCog', priority: 4 },
      { id: 'badge-management', title: 'Badge Management', description: 'Create and manage badges', icon: 'Award', priority: 5 },
      { id: 'audit-logs', title: 'Audit Logs', description: 'Recent activity and filters', icon: 'FileText', priority: 6 },
      { id: 'reports', title: 'Reports', description: 'Scheduled and on-demand reports', icon: 'BarChart3', priority: 7 },
    ],
  },
};

// ==================== HELPER FUNCTIONS ====================

export function getRoleConfig(role: UserRole | string | undefined): RoleConfig {
  return ROLE_CONFIGS[role as UserRole] || ROLE_CONFIGS.student;
}

export function hasPrivilege(
  role: UserRole | string | undefined,
  resource: keyof RoleConfig['privileges'],
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const config = getRoleConfig(role);
  const privilege = config.privileges[resource];
  
  switch (action) {
    case 'create': return privilege.canCreate;
    case 'read': return privilege.canRead;
    case 'update': return privilege.canUpdate;
    case 'delete': return privilege.canDelete;
    default: return false;
  }
}

export function getPrivilegeScope(
  role: UserRole | string | undefined,
  resource: keyof RoleConfig['privileges']
): 'own' | 'class' | 'all' {
  const config = getRoleConfig(role);
  return config.privileges[resource].scope;
}

export function canAccessAdmin(role: UserRole | string | undefined): boolean {
  return role === 'super_admin';
}

export function canAccessFacultyBoard(role: UserRole | string | undefined): boolean {
  return role === 'faculty' || role === 'super_admin';
}

export function canManageUsers(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'users', 'create');
}

export function canCreateBadges(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'badges', 'create');
}

export function canAwardBadges(role: UserRole | string | undefined): boolean {
  return role === 'faculty' || role === 'super_admin';
}

export function canCreateClasses(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'classes', 'create');
}

export function canSendInterventions(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'interventions', 'create');
}

export function canImpersonate(role: UserRole | string | undefined): boolean {
  return role === 'super_admin';
}

export function getMaxClasses(role: UserRole | string | undefined): number {
  return role === 'faculty' ? 10 : role === 'super_admin' ? Infinity : 0;
}

export function getRoleColor(role: UserRole | string | undefined): string {
  const config = getRoleConfig(role);
  return config.color;
}

export function getRoleIcon(role: UserRole | string | undefined): string {
  const config = getRoleConfig(role);
  return config.icon;
}

export function getRoleName(role: UserRole | string | undefined): string {
  const config = getRoleConfig(role);
  return config.name;
}

// Navigation routes for each role
export function getRoleNavigation(role: UserRole | string | undefined): string[] {
  const baseRoutes = ['/', '/dashboard', '/projects', '/boards', '/calendar', '/messages', '/settings', '/analytics', '/leaderboard'];
  
  if (role === 'student') {
    return baseRoutes;
  }
  
  if (role === 'faculty') {
    return [...baseRoutes, '/facility'];
  }
  
  if (role === 'super_admin') {
    return [...baseRoutes, '/facility', '/admin'];
  }
  
  return baseRoutes;
}

export function canViewAuditLogs(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'audit', 'read');
}

export function canManageCMS(role: UserRole | string | undefined): boolean {
  return hasPrivilege(role, 'cms', 'update');
}

export function canMonitorStudents(role: UserRole | string | undefined): boolean {
  return role === 'faculty' || role === 'super_admin';
}

export function canAssignTasks(role: UserRole | string | undefined): boolean {
  return role === 'faculty' || role === 'super_admin';
}
