import useSWR from 'swr';
import { TaskStatus, TaskPriority } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// User stats hook
export function useUserStats() {
  const { data, error, isLoading, mutate } = useSWR('/api/users/stats', fetcher);
  
  return {
    stats: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Projects hook
export function useProjects(options?: {
  status?: string;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.search) params.set('search', options.search);
  
  const query = params.toString();
  const url = query ? `/api/projects?${query}` : '/api/projects';
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    projects: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Tasks hook
export function useTasks(options?: {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  search?: string;
  role?: 'student' | 'faculty';
}) {
  const params = new URLSearchParams();
  if (options?.status) params.set('status', options.status);
  if (options?.priority) params.set('priority', options.priority);
  if (options?.projectId) params.set('projectId', options.projectId);
  if (options?.search) params.set('search', options.search);
  if (options?.role) params.set('role', options.role);
  
  const query = params.toString();
  const url = query ? `/api/tasks?${query}` : '/api/tasks';
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    tasks: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Analytics hook
export function useAnalytics(days = 7) {
  const { data, error, isLoading, mutate } = useSWR(`/api/analytics?days=${days}`, fetcher);
  
  return {
    analytics: data?.data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Notifications hook
export function useNotifications(limit = 20, unreadOnly = false) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/notifications?limit=${limit}&unreadOnly=${unreadOnly}`,
    fetcher
  );
  
  return {
    notifications: data?.data?.notifications || [],
    unreadCount: data?.data?.unreadCount || 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Create project mutation
export async function createProject(data: {
  name: string;
  description?: string;
  courseCode?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  icon?: string;
  members?: string[];
}) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Create task mutation
export async function createTask(data: {
  title: string;
  description?: string;
  projectId: string;
  boardId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  courseCode?: string;
  estimatedHours?: number;
  assignees?: string[];
  subtasks?: { title: string }[];
}) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Update task status mutation
export async function updateTaskStatus(taskId: string, status: TaskStatus, position?: number) {
  const res = await fetch('/api/tasks/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, status, position }),
  });
  return res.json();
}

// Update task mutation
export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  courseCode?: string;
  startDate?: string;
}) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Delete task mutation
export async function deleteTask(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  });
  return res.json();
}

// Mark notifications as read mutation
export async function markNotificationsRead(notificationIds?: string[], markAllRead = false) {
  const res = await fetch('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notificationIds, markAllRead }),
  });
  return res.json();
}
