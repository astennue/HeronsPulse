// HeronPulse Academic OS - Type Definitions
import { UserRole } from '@prisma/client';

// Demo accounts for testing
export const DEMO_ACCOUNTS = [
  { 
    email: 'reinernuevas.acads@gmail.com', 
    password: '@CSFDSARein03082026', 
    role: 'student' as UserRole, 
    displayName: 'Reiner Nuevas',
  },
  { 
    email: 'faculty.demo@umak.edu.ph', 
    password: 'Faculty@HeronPulse2026', 
    role: 'faculty' as UserRole, 
    displayName: 'Prof. Demo Faculty',
  },
  { 
    email: 'superadmin@heronpulse.demo', 
    password: 'Admin@HeronPulse2026', 
    role: 'super_admin' as UserRole, 
    displayName: 'HeronPulse Admin',
  },
];

// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: string;
  bio?: string | null;
  isOnline: boolean;
  lastSeenAt: Date;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  deadlinesMet: number;
  productivityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task types
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  tags: string[];
  courseCode?: string | null;
  estimatedHours: number;
  actualHours: number;
  position: number;
  projectId: string;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project types
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  courseCode?: string | null;
  color: string;
  icon: string;
  progress: number;
  ownerId: string;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ALI (Academic Load Index) types
export interface ALIData {
  score: number;
  taskDensity: number;
  assessmentIntensity: number;
  deadlineClustering: number;
  researchLoad: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
}

// Badge types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

// Notification types
export type NotificationType = 
  | 'task_assigned'
  | 'deadline_approaching'
  | 'mention'
  | 'comment_reply'
  | 'milestone_due'
  | 'achievement_unlocked'
  | 'workload_alert'
  | 'intervention_sent'
  | 'badge_awarded';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  currentStreak: number;
  aliScore: number;
  upcomingDeadlines: Task[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: Date;
}
