'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Activity,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  X,
  Clock,
  Server,
  HardDrive,
  Cpu,
  Mail,
  Ban,
  Key,
  UserCog,
  FileBarChart,
  Globe,
  Lock,
  AlertTriangle,
  Info,
  Award,
  Save,
  GraduationCap,
  BookOpen,
  Flame,
  Star,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  UserCheck,
  UserX,
  MoreVertical,
  Copy,
  BadgeCheck,
  Crown,
  Zap,
  Filter,
} from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BADGE_CRITERIA_TYPES, BadgeRarity, SUBJECT_CODES } from '@/lib/role-privileges';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// ==================== TYPES ====================

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
  courseCodes: string[];
  // Stats
  tasksCompleted: number;
  streak: number;
  points: number;
  badges: { name: string; icon: string; rarity: string }[];
  aliScore?: number;
  classCount?: number;
  studentCount?: number;
  avgStudentALI?: number; // For faculty: average ALI of all their students
}

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  points: number;
  criteriaType: string;
  criteriaValue: number;
  isActive: boolean;
  createdAt: Date;
}

interface ActivityLogData {
  id: string;
  userName: string;
  action: string;
  entityType: string;
  details: string;
  ip: string;
  timestamp: Date;
}

interface ReportData {
  id: string;
  name: string;
  type: string;
  frequency: 'weekly' | 'monthly';
  format: 'pdf' | 'csv' | 'excel';
  lastRun: Date | null;
  nextRun: Date | null;
  isActive: boolean;
}

interface EventData {
  id: string;
  title: string;
  type: string;
  date: Date;
  visibility: 'student' | 'faculty' | 'all';
  createdBy: string;
}

interface ClassData {
  id: string;
  name: string;
  subjectCode: string;
  section: string;
  schedule: string;
  room: string;
  studentCount: number;
  avgALI: number;
  atRiskCount: number;
  isActive: boolean;
  ownerName: string;
  ownerId: string;
}

// ==================== MOCK DATA ====================

const mockUsers: UserData[] = [
  { id: '1', name: 'Reiner Nuevas', email: 'reinernuevas@umak.edu.ph', role: 'student', status: 'active', lastLogin: new Date(), createdAt: new Date('2024-08-15'), courseCodes: ['CS401', 'IT301'], tasksCompleted: 45, streak: 12, points: 320, badges: [{ name: 'Week Warrior', icon: '🔥', rarity: 'rare' }, { name: 'Early Bird', icon: '🌅', rarity: 'common' }], aliScore: 45 },
  { id: '2', name: 'Prof. Demo Faculty', email: 'faculty@umak.edu.ph', role: 'faculty', status: 'active', lastLogin: new Date(Date.now() - 3600000), createdAt: new Date('2024-07-01'), courseCodes: ['CS401', 'CS302'], tasksCompleted: 0, streak: 0, points: 0, badges: [], classCount: 3, studentCount: 62, avgStudentALI: 52 },
  { id: '3', name: 'HeronPulse Admin', email: 'admin@heronpulse.demo', role: 'super_admin', status: 'active', lastLogin: new Date(Date.now() - 7200000), createdAt: new Date('2024-01-01'), courseCodes: [], tasksCompleted: 0, streak: 0, points: 0, badges: [] },
  { id: '4', name: 'John Doe', email: 'johndoe@umak.edu.ph', role: 'student', status: 'inactive', lastLogin: new Date(Date.now() - 604800000), createdAt: new Date('2024-09-01'), courseCodes: ['CS401'], tasksCompleted: 23, streak: 0, points: 150, badges: [{ name: 'Early Bird', icon: '🌅', rarity: 'common' }], aliScore: 68 },
  { id: '5', name: 'Maria Santos', email: 'mariasantos@umak.edu.ph', role: 'student', status: 'suspended', lastLogin: new Date(Date.now() - 1209600000), createdAt: new Date('2024-08-20'), courseCodes: ['IT301', 'CS302'], tasksCompleted: 12, streak: 0, points: 80, badges: [], aliScore: 82 },
  { id: '6', name: 'Dr. Alice Garcia', email: 'alicegarcia@umak.edu.ph', role: 'faculty', status: 'active', lastLogin: new Date(Date.now() - 86400000), createdAt: new Date('2024-06-15'), courseCodes: ['CS405', 'IT201'], tasksCompleted: 0, streak: 0, points: 0, badges: [], classCount: 2, studentCount: 35, avgStudentALI: 61 },
  { id: '7', name: 'Bob Cruz', email: 'bobcruz@umak.edu.ph', role: 'student', status: 'active', lastLogin: new Date(Date.now() - 3600000), createdAt: new Date('2024-09-15'), courseCodes: ['CS401', 'CS402'], tasksCompleted: 38, streak: 8, points: 280, badges: [{ name: 'Week Warrior', icon: '🔥', rarity: 'rare' }], aliScore: 55 },
  { id: '8', name: 'Eva Torres', email: 'evatorres@umak.edu.ph', role: 'student', status: 'active', lastLogin: new Date(), createdAt: new Date('2024-10-01'), courseCodes: ['IT301'], tasksCompleted: 52, streak: 20, points: 450, badges: [{ name: 'Week Warrior', icon: '🔥', rarity: 'rare' }, { name: 'Perfect Score', icon: '⭐', rarity: 'epic' }], aliScore: 28 },
];

const mockBadges: BadgeData[] = [
  { id: '1', name: 'Week Warrior', description: 'Complete tasks for 7 consecutive days', icon: '🔥', rarity: 'rare', points: 50, criteriaType: 'streak', criteriaValue: 7, isActive: true, createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Early Bird', description: 'Submit 5 tasks before deadline', icon: '🌅', rarity: 'common', points: 20, criteriaType: 'early_submission', criteriaValue: 5, isActive: true, createdAt: new Date('2024-01-15') },
  { id: '3', name: 'Perfect Score', description: 'Achieve 100% on 3 assessments', icon: '⭐', rarity: 'epic', points: 100, criteriaType: 'manual', criteriaValue: 0, isActive: true, createdAt: new Date('2024-02-01') },
  { id: '4', name: 'Team Player', description: 'Collaborate on 10 team projects', icon: '🤝', rarity: 'uncommon', points: 30, criteriaType: 'collaboration', criteriaValue: 10, isActive: true, createdAt: new Date('2024-02-15') },
  { id: '5', name: 'Legendary Scholar', description: 'Reach 1000 total points', icon: '👑', rarity: 'legendary', points: 200, criteriaType: 'points', criteriaValue: 1000, isActive: true, createdAt: new Date('2024-03-01') },
];

const mockActivityLogs: ActivityLogData[] = [
  { id: '1', userName: 'Reiner Nuevas', action: 'login', entityType: 'user', details: 'User logged in successfully', ip: '192.168.1.100', timestamp: new Date() },
  { id: '2', userName: 'Prof. Demo Faculty', action: 'create', entityType: 'task', details: 'Created new task "Midterm Exam"', ip: '192.168.1.101', timestamp: new Date(Date.now() - 1800000) },
  { id: '3', userName: 'HeronPulse Admin', action: 'update', entityType: 'user', details: 'Suspended user account: Maria Santos', ip: '192.168.1.1', timestamp: new Date(Date.now() - 7200000) },
  { id: '4', userName: 'John Doe', action: 'complete', entityType: 'task', details: 'Completed task "Chapter 5 Report"', ip: '192.168.1.102', timestamp: new Date(Date.now() - 3600000) },
  { id: '5', userName: 'HeronPulse Admin', action: 'award', entityType: 'badge', details: 'Awarded "Week Warrior" to Bob Cruz', ip: '192.168.1.1', timestamp: new Date(Date.now() - 10800000) },
  { id: '6', userName: 'HeronPulse Admin', action: 'impersonate', entityType: 'user', details: 'Impersonated user: Reiner Nuevas', ip: '192.168.1.1', timestamp: new Date(Date.now() - 3600000) },
];

const mockReports: ReportData[] = [
  { id: '1', name: 'Weekly Student Performance', type: 'student_performance', frequency: 'weekly', format: 'pdf', lastRun: new Date(Date.now() - 604800000), nextRun: new Date(Date.now() + 86400000), isActive: true },
  { id: '2', name: 'Monthly Faculty Summary', type: 'faculty_performance', frequency: 'monthly', format: 'excel', lastRun: new Date(Date.now() - 2592000000), nextRun: new Date(Date.now() + 172800000), isActive: true },
  { id: '3', name: 'System Analytics Report', type: 'system_analytics', frequency: 'weekly', format: 'pdf', lastRun: new Date(Date.now() - 86400000), nextRun: new Date(Date.now() + 604800000), isActive: true },
];

const mockEvents: EventData[] = [
  { id: '1', title: 'System Maintenance', type: 'maintenance', date: new Date(Date.now() + 86400000), visibility: 'all', createdBy: 'HeronPulse Admin' },
  { id: '2', title: 'Faculty Meeting', type: 'meeting', date: new Date(Date.now() + 172800000), visibility: 'faculty', createdBy: 'HeronPulse Admin' },
  { id: '3', title: 'Student Orientation', type: 'orientation', date: new Date(Date.now() + 259200000), visibility: 'student', createdBy: 'HeronPulse Admin' },
];

const mockClasses: ClassData[] = [
  { id: '1', name: 'Software Engineering', subjectCode: 'CS401', section: 'BSCS-4A', schedule: 'MWF 9:00-10:00 AM', room: 'Rm 301', studentCount: 25, avgALI: 45, atRiskCount: 3, isActive: true, ownerName: 'Prof. Demo Faculty', ownerId: '2' },
  { id: '2', name: 'Web Development', subjectCode: 'CS402', section: 'BSCS-4B', schedule: 'TTh 1:00-2:30 PM', room: 'Lab 201', studentCount: 22, avgALI: 52, atRiskCount: 2, isActive: true, ownerName: 'Prof. Demo Faculty', ownerId: '2' },
  { id: '3', name: 'Capstone Project', subjectCode: 'CS405', section: 'BSCS-4A', schedule: 'F 3:00-5:00 PM', room: 'Rm 405', studentCount: 15, avgALI: 68, atRiskCount: 5, isActive: true, ownerName: 'Dr. Alice Garcia', ownerId: '6' },
  { id: '4', name: 'Database Systems', subjectCode: 'CS301', section: 'BSIT-3A', schedule: 'MWF 2:00-3:00 PM', room: 'Rm 202', studentCount: 30, avgALI: 58, atRiskCount: 4, isActive: true, ownerName: 'Dr. Alice Garcia', ownerId: '6' },
  { id: '5', name: 'Data Structures', subjectCode: 'CS201', section: 'BSCS-2A', schedule: 'MWF 10:00-11:00 AM', room: 'Rm 105', studentCount: 35, avgALI: 42, atRiskCount: 6, isActive: true, ownerName: 'Prof. Demo Faculty', ownerId: '2' },
];

// Chart data
const weeklyData = [
  { week: 'Week 1', students: 45, faculty: 12, tasks: 234 },
  { week: 'Week 2', students: 48, faculty: 12, tasks: 256 },
  { week: 'Week 3', students: 52, faculty: 14, tasks: 289 },
  { week: 'Week 4', students: 49, faculty: 13, tasks: 278 },
  { week: 'Week 5', students: 55, faculty: 15, tasks: 312 },
  { week: 'Week 6', students: 58, faculty: 16, tasks: 345 },
];

const riskDistribution = [
  { name: 'Low Risk', value: 45, color: '#10B981' },
  { name: 'Moderate', value: 30, color: '#F59E0B' },
  { name: 'High Risk', value: 25, color: '#EF4444' },
];

const performanceByRole = [
  { name: 'Students', avgCompletion: 78, avgALI: 52 },
  { name: 'Faculty', avgCompletion: 85, avgClasses: 4 },
];

// ==================== MAIN COMPONENT ====================

export function AdminDashboardContent() {
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'faculty' | 'super_admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Class filter states
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  
  // Faculty filter states
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [facultyStatusFilter, setFacultyStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  
  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'student' as 'student' | 'faculty' | 'super_admin',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    password: '',
    courseCodes: [] as string[],
    maxClasses: 5,
    sendInvitation: true,
  });
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    rarity: 'common' as BadgeRarity,
    points: 10,
    criteriaType: 'manual',
    criteriaValue: 0,
  });
  const [bulkAction, setBulkAction] = useState<'activate' | 'deactivate' | 'delete' | 'assignRole'>('activate');
  const [bulkRole, setBulkRole] = useState<'student' | 'faculty'>('student');
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'student_performance',
    frequency: 'weekly' as 'weekly' | 'monthly',
    format: 'pdf' as 'pdf' | 'csv' | 'excel',
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'announcement',
    date: '',
    visibility: 'all' as 'student' | 'faculty' | 'all',
  });

  // Stats
  const systemStats = {
    totalUsers: mockUsers.length,
    students: mockUsers.filter(u => u.role === 'student').length,
    faculty: mockUsers.filter(u => u.role === 'faculty').length,
    admins: mockUsers.filter(u => u.role === 'super_admin').length,
    activeUsers: mockUsers.filter(u => u.status === 'active').length,
    suspendedUsers: mockUsers.filter(u => u.status === 'suspended').length,
    totalTasks: 234,
    totalProjects: 45,
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    let result = mockUsers;
    
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter(u => u.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [roleFilter, statusFilter, searchQuery]);

  // Get unique faculty and sections for class filtering
  const uniqueFaculty = useMemo(() => {
    const facultySet = new Map<string, { id: string; name: string }>();
    mockClasses.forEach(c => {
      if (!facultySet.has(c.ownerId)) {
        facultySet.set(c.ownerId, { id: c.ownerId, name: c.ownerName });
      }
    });
    return Array.from(facultySet.values());
  }, []);

  const uniqueSections = useMemo(() => {
    return [...new Set(mockClasses.map(c => c.section).filter(Boolean))];
  }, []);

  // Filtered classes
  const filteredClasses = useMemo(() => {
    let result = mockClasses;
    
    if (facultyFilter !== 'all') {
      result = result.filter(c => c.ownerId === facultyFilter);
    }
    
    if (sectionFilter !== 'all') {
      result = result.filter(c => c.section === sectionFilter);
    }
    
    if (classSearchQuery.trim()) {
      const query = classSearchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.subjectCode.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        c.section.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [facultyFilter, sectionFilter, classSearchQuery]);

  // Filtered faculty
  const filteredFaculty = useMemo(() => {
    let result = mockUsers.filter(u => u.role === 'faculty');
    
    if (facultyStatusFilter !== 'all') {
      result = result.filter(u => u.status === facultyStatusFilter);
    }
    
    if (facultySearchQuery.trim()) {
      const query = facultySearchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [facultyStatusFilter, facultySearchQuery]);

  // Helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-500/10 text-purple-500">Super Admin</Badge>;
      case 'faculty':
        return <Badge className="bg-blue-500/10 text-blue-500">Faculty</Badge>;
      default:
        return <Badge className="bg-green-500/10 text-green-500">Student</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500/10 text-gray-500">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/10 text-red-500">Suspended</Badge>;
      default:
        return null;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  // Handlers
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleCreateUser = async () => {
    // Validation
    if (!userForm.name || !userForm.email || !userForm.password) {
      toast({ title: 'Validation Error', description: 'Name, email, and password are required.', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          password: userForm.password,
          courseCodes: userForm.role === 'student' ? userForm.courseCodes : undefined,
          maxClasses: userForm.role === 'faculty' ? userForm.maxClasses : undefined,
          sendInvitation: userForm.sendInvitation,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ 
          title: 'User Created', 
          description: data.data.message || `${userForm.name} has been created successfully.` 
        });
        setIsUserModalOpen(false);
        setUserForm({ 
          name: '', 
          email: '', 
          role: 'student', 
          status: 'active', 
          password: '', 
          courseCodes: [], 
          maxClasses: 5, 
          sendInvitation: true 
        });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to create user.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create user. Please try again.', variant: 'destructive' });
    }
  };

  const handleUpdateUser = () => {
    toast({ title: 'User Updated', description: `${selectedUser?.name}'s profile has been updated.` });
    setIsUserModalOpen(false);
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    toast({ title: 'User Deleted', description: `${user?.name} has been permanently deleted.`, variant: 'destructive' });
  };

  const handleDeactivateUser = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    toast({ title: 'User Deactivated', description: `${user?.name}'s account has been deactivated.` });
  };

  const handleImpersonate = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    setSelectedUser(user || null);
    setIsImpersonateModalOpen(true);
  };

  const handleConfirmImpersonate = () => {
    toast({ title: 'Impersonation Started', description: `You are now viewing as ${selectedUser?.name}. A notification has been sent to them.` });
    setIsImpersonateModalOpen(false);
    // In real app, this would redirect to dashboard with impersonated session
  };

  const handleCreateBadge = () => {
    toast({ title: 'Badge Created', description: `${badgeForm.name} badge has been created.` });
    setIsBadgeModalOpen(false);
    setBadgeForm({ name: '', description: '', icon: '🏆', rarity: 'common', points: 10, criteriaType: 'manual', criteriaValue: 0 });
  };

  const handleBulkAction = () => {
    const actionText = bulkAction === 'assignRole' ? `assigned as ${bulkRole}` : bulkAction + 'd';
    toast({ title: 'Bulk Action Complete', description: `${selectedUsers.length} users have been ${actionText}.` });
    setIsBulkModalOpen(false);
    setSelectedUsers([]);
  };

  const handleScheduleReport = () => {
    toast({ title: 'Report Scheduled', description: `${reportForm.name} has been scheduled for ${reportForm.frequency} generation.` });
    setIsReportModalOpen(false);
    setReportForm({ name: '', type: 'student_performance', frequency: 'weekly', format: 'pdf' });
  };

  const handleCreateEvent = () => {
    const visibilityText = eventForm.visibility === 'all' ? 'everyone' : eventForm.visibility + 's only';
    toast({ title: 'Event Created', description: `${eventForm.title} will be visible to ${visibilityText}.` });
    setIsEventModalOpen(false);
    setEventForm({ title: '', type: 'announcement', date: '', visibility: 'all' });
  };

  const openUserDetail = (user: UserData) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const openEditUser = (user: UserData) => {
    setSelectedUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditMode(true);
    setIsUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">Monitor and manage the entire institution</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsReportModalOpen(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
          <Button variant="outline" onClick={() => setIsEventModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-7 min-w-[500px] sm:min-w-0">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="classes" className="text-xs sm:text-sm">Classes</TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">Students</TabsTrigger>
            <TabsTrigger value="faculty" className="text-xs sm:text-sm">Faculty</TabsTrigger>
            <TabsTrigger value="badges" className="text-xs sm:text-sm">Badges</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* Dashboard Tab - Analytics Overview */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{systemStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-500">{systemStats.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-blue-500">{systemStats.faculty}</p>
                <p className="text-xs text-muted-foreground">Faculty</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{systemStats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Total Tasks</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-green-500">{systemStats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="pt-4 text-center">
                <p className="text-xl sm:text-2xl font-bold text-red-500">{systemStats.suspendedUsers}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>User engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="faculty" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Student risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Risk Alerts */}
          <Card className="glass-card border-red-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-500 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
                High Risk Students Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mockUsers.filter(u => u.role === 'student' && (u.aliScore || 0) > 60).map((student) => (
                  <Button 
                    key={student.id} 
                    variant="outline" 
                    size="sm"
                    className="border-red-500/30 min-h-[44px] text-xs sm:text-sm"
                    onClick={() => openUserDetail(student)}
                  >
                    <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                    <span className="truncate max-w-[100px] sm:max-w-none">{student.name}</span> <span className="hidden sm:inline">(ALI: {student.aliScore})</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">User Management</h2>
              <p className="text-sm text-muted-foreground">Manage all users, roles, and permissions</p>
            </div>
            <Button onClick={() => { setEditMode(false); setUserForm({ name: '', email: '', role: 'student', status: 'active', password: '', courseCodes: [], maxClasses: 5, sendInvitation: true }); setIsUserModalOpen(true); }} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
                      <SelectTrigger className="w-full sm:w-32 h-11">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="super_admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                      <SelectTrigger className="w-full sm:w-32 h-11">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedUsers.length > 0 && (
                      <Button variant="outline" onClick={() => setIsBulkModalOpen(true)} className="w-full sm:w-auto min-h-[44px]">
                        <Zap className="h-4 w-4 mr-2" />
                        Bulk Action ({selectedUsers.length})
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded h-5 w-5"
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Last login: {format(user.lastLogin, 'MMM d, yyyy')}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => openUserDetail(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditUser(user)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                            <UserCog className="h-4 w-4 mr-2" />
                            Impersonate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                            <UserX className="h-4 w-4 mr-2" />
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="glass-card hidden md:block">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b">
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                            onChange={handleSelectAll}
                            className="rounded h-5 w-5"
                          />
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Login</th>
                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b hover:bg-muted/30"
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleSelectUser(user.id)}
                              className="rounded h-5 w-5"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">{getRoleBadge(user.role)}</td>
                          <td className="p-3">{getStatusBadge(user.status)}</td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {format(user.lastLogin, 'MMM d, yyyy')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openUserDetail(user)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Impersonate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeactivateUser(user.id)}>
                                    <UserX className="h-4 w-4 mr-2" />
                                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">All Classes</h2>
              <p className="text-sm text-muted-foreground">Manage and view all classes across the institution</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search classes by name, code, faculty, or section..."
                      value={classSearchQuery}
                      onChange={(e) => setClassSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                    <SelectTrigger className="w-full sm:w-48 h-11">
                      <SelectValue placeholder="Filter by faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculty</SelectItem>
                      {uniqueFaculty.map((faculty) => (
                        <SelectItem key={faculty.id} value={faculty.id}>{faculty.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="w-full sm:w-40 h-11">
                      <SelectValue placeholder="Filter by section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {uniqueSections.map((section) => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredClasses.length} of {mockClasses.length} classes
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <CardDescription>{cls.subjectCode} • {cls.section}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">{cls.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <UserCog className="h-4 w-4" />
                      <span className="truncate">{cls.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span className="truncate">{cls.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{cls.studentCount}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div>
                        <p className={cn(
                          "text-lg font-bold",
                          cls.avgALI > 60 && "text-red-500",
                          cls.avgALI > 40 && cls.avgALI <= 60 && "text-yellow-500",
                          cls.avgALI <= 40 && "text-green-500"
                        )}>{cls.avgALI}</p>
                        <p className="text-xs text-muted-foreground">Avg ALI</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-500">{cls.atRiskCount}</p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No classes found matching your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Performers */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsers.filter(u => u.role === 'student').sort((a, b) => b.points - a.points).slice(0, 5).map((student, index) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <span className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        index === 0 && 'bg-yellow-500 text-yellow-900',
                        index === 1 && 'bg-gray-300 text-gray-700',
                        index === 2 && 'bg-amber-600 text-amber-100',
                        index > 2 && 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.points} pts</p>
                      </div>
                      {student.streak > 0 && (
                        <div className="flex items-center gap-1 text-orange-500">
                          <Flame className="h-3 w-3" />
                          <span className="text-xs">{student.streak}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Most Improved */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Most Improved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsers.filter(u => u.role === 'student' && u.tasksCompleted > 20).slice(0, 5).map((student) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.tasksCompleted} tasks</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">+{Math.floor(Math.random() * 30 + 10)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Alerts */}
            <Card className="glass-card border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockUsers.filter(u => u.role === 'student' && (u.aliScore || 0) > 60).map((student) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-500/10">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-red-500 text-white text-xs">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-red-500">ALI: {student.aliScore}</p>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => openUserDetail(student)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Faculty Tab */}
        <TabsContent value="faculty" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Faculty Management</h2>
              <p className="text-sm text-muted-foreground">View and manage faculty members</p>
            </div>
          </div>
          
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search faculty by name or email..."
                      value={facultySearchQuery}
                      onChange={(e) => setFacultySearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <Select value={facultyStatusFilter} onValueChange={(v: any) => setFacultyStatusFilter(v)}>
                    <SelectTrigger className="w-full sm:w-40 h-11">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {filteredFaculty.length} of {mockUsers.filter(u => u.role === 'faculty').length} faculty members
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((faculty) => (
              <Card key={faculty.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-500 text-white">
                        {faculty.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{faculty.name}</CardTitle>
                      <CardDescription>{faculty.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{faculty.classCount}</p>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{faculty.studentCount}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <Activity className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                      <p className={cn(
                        "text-lg font-bold",
                        (faculty.avgStudentALI ?? 0) > 60 && "text-red-500",
                        (faculty.avgStudentALI ?? 0) > 40 && (faculty.avgStudentALI ?? 0) <= 60 && "text-yellow-500",
                        (faculty.avgStudentALI ?? 0) <= 40 && "text-green-500"
                      )}>{faculty.avgStudentALI ?? '-'}</p>
                      <p className="text-xs text-muted-foreground">Avg ALI</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => openUserDetail(faculty)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleImpersonate(faculty.id)}>
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFaculty.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No faculty members found matching your filters</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Badge Management</h2>
              <p className="text-sm text-muted-foreground">Create and manage achievement badges</p>
            </div>
            <Button onClick={() => setIsBadgeModalOpen(true)} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockBadges.map((badge) => (
              <Card key={badge.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center text-3xl border-2',
                      getRarityColor(badge.rarity)
                    )}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{badge.name}</h3>
                        <Badge variant="outline" className={cn('text-xs capitalize', getRarityColor(badge.rarity))}>
                          {badge.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>+{badge.points} pts</span>
                        <span>Criteria: {badge.criteriaType}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Scheduled Reports</h2>
              <p className="text-sm text-muted-foreground">Auto-generated institutional reports</p>
            </div>
            <Button onClick={() => setIsReportModalOpen(true)} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockReports.map((report) => (
              <Card key={report.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <Badge variant={report.isActive ? 'default' : 'secondary'}>
                      {report.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {report.frequency === 'weekly' ? 'Every week' : 'Every month'} • {report.format.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Last run: {report.lastRun ? format(report.lastRun, 'MMM d, yyyy') : 'Never'}</p>
                    <p>Next run: {report.nextRun ? format(report.nextRun, 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editMode ? 'Edit User' : 'Create New User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input 
                placeholder="Enter full name" 
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email (@umak.edu.ph)</Label>
              <Input 
                type="email"
                placeholder="email@umak.edu.ph" 
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Select value={userForm.role} onValueChange={(v: any) => setUserForm({ ...userForm, role: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Password field - only for new users */}
            {!editMode && (
              <div className="space-y-2">
                <Label className="text-sm">Password</Label>
                <Input 
                  type="password"
                  placeholder="Enter password (min 6 characters)" 
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="h-11"
                />
              </div>
            )}
            
            {/* Course codes for students */}
            {userForm.role === 'student' && (
              <div className="space-y-2">
                <Label className="text-sm">Course Codes</Label>
                <Select 
                  value="" 
                  onValueChange={(v) => {
                    if (v && !userForm.courseCodes.includes(v)) {
                      setUserForm({ ...userForm, courseCodes: [...userForm.courseCodes, v] });
                    }
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Add course code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_CODES.filter(s => !userForm.courseCodes.includes(s.code)).map((subject) => (
                      <SelectItem key={subject.code} value={subject.code}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {userForm.courseCodes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userForm.courseCodes.map((code) => (
                      <Badge key={code} variant="secondary" className="gap-1">
                        {code}
                        <button
                          type="button"
                          onClick={() => setUserForm({ ...userForm, courseCodes: userForm.courseCodes.filter(c => c !== code) })}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Max classes for faculty */}
            {userForm.role === 'faculty' && (
              <div className="space-y-2">
                <Label className="text-sm">Maximum Classes Allowed</Label>
                <Input 
                  type="number"
                  min="1"
                  max="20"
                  value={userForm.maxClasses}
                  onChange={(e) => setUserForm({ ...userForm, maxClasses: parseInt(e.target.value) || 5 })}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Default is 5 classes maximum</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="text-sm">Status</Label>
              <Select value={userForm.status} onValueChange={(v: any) => setUserForm({ ...userForm, status: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Send invitation checkbox */}
            {!editMode && (
              <div className="flex items-center gap-2">
                <Switch
                  id="sendInvitation"
                  checked={userForm.sendInvitation}
                  onCheckedChange={(checked) => setUserForm({ ...userForm, sendInvitation: checked })}
                />
                <Label htmlFor="sendInvitation" className="text-sm font-normal cursor-pointer">
                  Send email invitation to user
                </Label>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsUserModalOpen(false)} className="w-full sm:w-auto min-h-[44px]">Cancel</Button>
              <Button onClick={editMode ? handleUpdateUser : handleCreateUser} className="w-full sm:w-auto min-h-[44px]">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Detail Modal */}
      <Dialog open={isUserDetailModalOpen} onOpenChange={setIsUserDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(selectedUser.role)}
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>
              </div>

              {selectedUser.role === 'student' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.tasksCompleted}</p>
                      <p className="text-xs text-muted-foreground">Tasks Done</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.points}</p>
                      <p className="text-xs text-muted-foreground">Points</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold text-orange-500">{selectedUser.streak}</p>
                      <p className="text-xs text-muted-foreground">Streak</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.aliScore || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">ALI Score</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedUser.role === 'faculty' && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.classCount}</p>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl font-bold">{selectedUser.studentCount}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedUser.badges && selectedUser.badges.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Earned Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.badges.map((badge, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        <span>{badge.icon}</span>
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setIsUserDetailModalOpen(false); openEditUser(selectedUser); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => handleImpersonate(selectedUser.id)}>
                  <UserCog className="h-4 w-4 mr-2" />
                  Impersonate
                </Button>
                <Button variant="outline" className="text-red-500" onClick={() => handleDeleteUser(selectedUser.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Impersonate Confirmation Modal */}
      <Dialog open={isImpersonateModalOpen} onOpenChange={setIsImpersonateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Impersonation</DialogTitle>
            <DialogDescription>
              You are about to impersonate {selectedUser?.name}. This action will be logged and a notification will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-sm text-yellow-600">
                ⚠️ The user will receive a notification that an admin accessed their account for support purposes at {format(new Date(), 'PPp')}.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImpersonateModalOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmImpersonate}>
                <UserCog className="h-4 w-4 mr-2" />
                Start Impersonation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Badge Modal */}
      <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Badge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge Name</Label>
                <Input 
                  placeholder="e.g., Week Warrior" 
                  value={badgeForm.name}
                  onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Icon (Emoji)</Label>
                <Input 
                  placeholder="🏆" 
                  value={badgeForm.icon}
                  onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Badge description..."
                value={badgeForm.description}
                onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rarity</Label>
                <Select value={badgeForm.rarity} onValueChange={(v: BadgeRarity) => setBadgeForm({ ...badgeForm, rarity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">⬜ Common</SelectItem>
                    <SelectItem value="uncommon">🟢 Uncommon</SelectItem>
                    <SelectItem value="rare">🔵 Rare</SelectItem>
                    <SelectItem value="epic">🟣 Epic</SelectItem>
                    <SelectItem value="legendary">🟡 Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input 
                  type="number"
                  value={badgeForm.points}
                  onChange={(e) => setBadgeForm({ ...badgeForm, points: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criteria Type</Label>
                <Select value={badgeForm.criteriaType} onValueChange={(v) => setBadgeForm({ ...badgeForm, criteriaType: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BADGE_CRITERIA_TYPES.map((type) => (
                      <SelectItem key={type.type} value={type.type}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {badgeForm.criteriaType !== 'manual' && (
                <div className="space-y-2">
                  <Label>Criteria Value</Label>
                  <Input 
                    type="number"
                    value={badgeForm.criteriaValue}
                    onChange={(e) => setBadgeForm({ ...badgeForm, criteriaValue: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBadgeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateBadge}>Create Badge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Apply action to {selectedUsers.length} selected users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={bulkAction} onValueChange={(v: any) => setBulkAction(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate Users</SelectItem>
                  <SelectItem value="deactivate">Deactivate Users</SelectItem>
                  <SelectItem value="delete">Delete Users</SelectItem>
                  <SelectItem value="assignRole">Assign Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {bulkAction === 'assignRole' && (
              <div className="space-y-2">
                <Label>New Role</Label>
                <Select value={bulkRole} onValueChange={(v: any) => setBulkRole(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {bulkAction === 'delete' && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                ⚠️ This action cannot be undone. Users will be permanently deleted.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkModalOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkAction} variant={bulkAction === 'delete' ? 'destructive' : 'default'}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input 
                placeholder="e.g., Weekly Student Performance" 
                value={reportForm.name}
                onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportForm.type} onValueChange={(v) => setReportForm({ ...reportForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student_performance">Student Performance</SelectItem>
                  <SelectItem value="faculty_performance">Faculty Performance</SelectItem>
                  <SelectItem value="system_analytics">System Analytics</SelectItem>
                  <SelectItem value="risk_analysis">Risk Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={reportForm.frequency} onValueChange={(v: any) => setReportForm({ ...reportForm, frequency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={reportForm.format} onValueChange={(v: any) => setReportForm({ ...reportForm, format: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>
              <Button onClick={handleScheduleReport}>Schedule Report</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create System Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input 
                placeholder="e.g., System Maintenance" 
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventForm.type} onValueChange={(v) => setEventForm({ ...eventForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">📢 Announcement</SelectItem>
                  <SelectItem value="maintenance">🔧 Maintenance</SelectItem>
                  <SelectItem value="meeting">📅 Meeting</SelectItem>
                  <SelectItem value="orientation">🎓 Orientation</SelectItem>
                  <SelectItem value="deadline">⏰ Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={eventForm.visibility} onValueChange={(v: any) => setEventForm({ ...eventForm, visibility: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 Everyone (Students & Faculty)</SelectItem>
                  <SelectItem value="student">🎓 Students Only</SelectItem>
                  <SelectItem value="faculty">👨‍🏫 Faculty Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 text-sm">
              This event will be visible to {eventForm.visibility === 'all' ? 'everyone' : eventForm.visibility + ' only'}.
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
