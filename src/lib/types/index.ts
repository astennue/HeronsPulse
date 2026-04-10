// HeronPulse Academic OS - TypeScript Types
// College of Computing and Information Sciences, University of Makati

// ==================== USER TYPES ====================
export type UserRole = 'student' | 'faculty' | 'super_admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  courseCodes: string[];
  bio?: string;
  isOnline: boolean;
  lastSeenAt: Date;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  deadlinesMet: number;
  earlySubmissions: number;
  commentsMade: number;
  researchCompleted: number;
  productivityScore: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  tasksCompleted: number;
  deadlinesMet: number;
  earlySubmissions: number;
  commentsMade: number;
  researchCompleted: number;
  currentStreak: number;
  longestStreak: number;
  productivityScore: number;
}

// ==================== TASK TYPES ====================
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  boardId: string;
  projectId: string;
  createdById?: string;
  createdBy?: User;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  courseCode?: string;
  estimatedHours: number;
  actualHours: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  assignees: TaskAssignee[];
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
}

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  assignedAt: Date;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  taskId?: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  mentions: string[];
  reactions: Reaction[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

// ==================== PROJECT TYPES ====================
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: User;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  courseCode?: string;
  color: string;
  icon: string;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  members: ProjectMember[];
  boards: Board[];
  milestones: Milestone[];
  channels: Channel[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  milestoneTasks: MilestoneTask[];
}

export interface MilestoneTask {
  milestoneId: string;
  taskId: string;
}

// ==================== BOARD TYPES ====================
export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  createdById: string;
  createdBy: User;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  tasks: Task[];
}

// ==================== MESSAGING TYPES ====================
export interface Channel {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  createdById: string;
  createdBy: User;
  isPrivate: boolean;
  type: 'channel' | 'dm';
  createdAt: Date;
  
  // Relations
  members: ChannelMember[];
  messages: Message[];
}

export interface ChannelMember {
  id: string;
  channelId: string;
  userId: string;
  user: User;
  joinedAt: Date;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'system';
  parentId?: string;
  parent?: Message;
  replies?: Message[];
  mentions: string[];
  reactions: Reaction[];
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedAt: Date;
}

// ==================== NOTIFICATION TYPES ====================
export type NotificationType =
  | 'task_assigned'
  | 'deadline_approaching'
  | 'mention'
  | 'comment_reply'
  | 'milestone_due'
  | 'achievement_unlocked'
  | 'workload_alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

// ==================== ANALYTICS TYPES ====================
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface ALIInputs {
  taskDensity: number;
  assessmentIntensity: number;
  deadlineClustering: number;
  researchLoad: number;
  extracurricularLoad: number;
  partTimeWork: number;
}

export interface WorkloadData {
  id: string;
  userId: string;
  recordedDate: Date;
  // ALI Factors (6 factors as per proposal)
  taskDensity: number;
  assessmentIntensity: number;
  deadlineClustering: number;
  researchLoad: number;
  extracurricularLoad: number;
  partTimeWork: number;
  // Computed values
  aliScore: number;
  riskLevel: RiskLevel;
  createdAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  studentNumber?: string;
  yearLevel?: string;
  program?: string;
  organizations: Array<{ name: string; position: string }>;
  orgPositions: string[];
  extracurricularHours: number;
  hasPartTimeWork: boolean;
  workHoursPerWeek: number;
  workType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastResult {
  id: string;
  userId: string;
  forecastDate: Date;
  horizonDays: number;
  predictions: ForecastPrediction[];
  peakDate?: Date;
  peakScore?: number;
  currentAli?: number;
  generatedAt: Date;
}

export interface ForecastPrediction {
  date: string;
  predictedScore: number;
  ciLower: number;
  ciUpper: number;
  riskLevel: RiskLevel;
}

// ==================== POMODORO TYPES ====================
export interface PomodoroSession {
  id: string;
  userId: string;
  taskId?: string;
  task?: Task;
  durationSeconds: number;
  type: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
  startedAt: Date;
  endedAt: Date;
}

// ==================== ACTIVITY LOG TYPES ====================
export interface ActivityLog {
  id: string;
  userId?: string;
  entityType: 'task' | 'project' | 'board' | 'comment' | 'user';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'assigned';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ==================== GAMIFICATION TYPES ====================
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (stats: UserStats) => boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  tasksCompleted: number;
  deadlinesMet: number;
  productivityScore: number;
  currentStreak: number;
  badges: string[];
}

// ==================== PERMISSION TYPES ====================
export interface RolePermissions {
  canCreateBoard: boolean;
  canAssignTasks: boolean;
  canViewAnalytics: boolean;
  canViewLeaderboard: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    canCreateBoard: false,
    canAssignTasks: false,
    canViewAnalytics: true,
    canViewLeaderboard: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  faculty: {
    canCreateBoard: true,
    canAssignTasks: true,
    canViewAnalytics: true,
    canViewLeaderboard: true,
    canManageUsers: false,
    canAccessAdminPanel: false,
  },
  super_admin: {
    canCreateBoard: true,
    canAssignTasks: true,
    canViewAnalytics: true,
    canViewLeaderboard: true,
    canManageUsers: true,
    canAccessAdminPanel: true,
  },
};

// ==================== DEMO ACCOUNTS ====================
export const DEMO_ACCOUNTS = [
  { email: 'reinernuevas.acads@gmail.com', password: '@CSFDSARein03082026', role: 'student' as UserRole, displayName: 'Reiner Nuevas' },
  { email: 'faculty.demo@umak.edu.ph', password: 'Faculty@HeronPulse2026', role: 'faculty' as UserRole, displayName: 'Prof. Demo Faculty' },
  { email: 'superadmin@heronpulse.demo', password: 'Admin@HeronPulse2026', role: 'super_admin' as UserRole, displayName: 'HeronPulse Admin' },
];
