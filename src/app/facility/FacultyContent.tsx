'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Plus,
  Eye,
  Mail,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  RefreshCw,
  Award,
  Send,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  UserPlus,
  FileText,
  Calendar,
  Settings,
  MessageSquare,
  Target,
  Zap,
  X,
  Star,
  Flame,
  User,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { SUBJECT_CODES, BADGE_CRITERIA_TYPES, getMaxClasses } from '@/lib/role-privileges';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';
import { Loader2, Link2, Copy, Check, ExternalLink } from 'lucide-react';

// ==================== TYPES ====================

interface StudentData {
  id: string;
  name: string;
  email: string;
  classId: string;
  aliScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  tasksCompleted: number;
  tasksPending: number;
  overdueTasks: number;
  deadlinesMet: number;
  loginFrequency: number;
  lastActive: Date;
  trend: 'up' | 'down' | 'stable';
  badges: { name: string; icon: string }[];
  points: number;
  streak: number;
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
  description?: string;
  semester?: string;
  members?: { id: string; name: string; email: string; avatarUrl?: string; joinedAt: Date; aliScore?: number; riskLevel?: string }[];
}

interface InvitationData {
  id: string;
  code: string;
  email?: string;
  expiresAt: Date;
  invitationLink: string;
  createdAt: Date;
}

interface InterventionData {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  type: 'warning' | 'support' | 'meeting' | 'reminder';
  subject: string;
  message: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  taggedUsers: { name: string; email: string }[];
}

interface BadgeData {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

// ==================== MOCK DATA ====================

const mockClasses: ClassData[] = [
  { id: '1', name: 'Software Engineering', subjectCode: 'CS401', section: 'BSCS-4A', schedule: 'MWF 9:00-10:00 AM', room: 'Rm 301', studentCount: 25, avgALI: 45, atRiskCount: 3, isActive: true, ownerName: 'Prof. Demo Faculty', ownerId: '2' },
  { id: '2', name: 'Web Development', subjectCode: 'CS402', section: 'BSCS-4B', schedule: 'TTh 1:00-2:30 PM', room: 'Lab 201', studentCount: 22, avgALI: 52, atRiskCount: 2, isActive: true, ownerName: 'Prof. Demo Faculty', ownerId: '2' },
  { id: '3', name: 'Capstone Project', subjectCode: 'CS405', section: 'BSCS-4A', schedule: 'F 3:00-5:00 PM', room: 'Rm 405', studentCount: 15, avgALI: 68, atRiskCount: 5, isActive: true, ownerName: 'Dr. Alice Garcia', ownerId: '6' },
  { id: '4', name: 'Database Systems', subjectCode: 'CS301', section: 'BSIT-3A', schedule: 'MWF 2:00-3:00 PM', room: 'Rm 202', studentCount: 30, avgALI: 58, atRiskCount: 4, isActive: true, ownerName: 'Dr. Alice Garcia', ownerId: '6' },
];

const mockStudents: StudentData[] = [
  { id: '1', name: 'Reiner Nuevas', email: 'reinernuevas@umak.edu.ph', classId: '1', aliScore: 45, riskLevel: 'Low', tasksCompleted: 12, tasksPending: 5, overdueTasks: 0, deadlinesMet: 10, loginFrequency: 5, lastActive: new Date(), trend: 'up', badges: [{ name: 'Week Warrior', icon: '🔥' }], points: 150, streak: 12 },
  { id: '2', name: 'John Doe', email: 'johndoe@umak.edu.ph', classId: '1', aliScore: 68, riskLevel: 'Moderate', tasksCompleted: 8, tasksPending: 10, overdueTasks: 2, deadlinesMet: 6, loginFrequency: 3, lastActive: new Date(Date.now() - 3600000), trend: 'stable', badges: [], points: 80, streak: 3 },
  { id: '3', name: 'Maria Santos', email: 'mariasantos@umak.edu.ph', classId: '1', aliScore: 82, riskLevel: 'High', tasksCompleted: 3, tasksPending: 15, overdueTasks: 5, deadlinesMet: 2, loginFrequency: 1, lastActive: new Date(Date.now() - 86400000), trend: 'down', badges: [], points: 30, streak: 0 },
  { id: '4', name: 'Alice Mercado', email: 'alicemercado@umak.edu.ph', classId: '2', aliScore: 35, riskLevel: 'Low', tasksCompleted: 15, tasksPending: 3, overdueTasks: 0, deadlinesMet: 14, loginFrequency: 6, lastActive: new Date(), trend: 'up', badges: [{ name: 'Early Bird', icon: '🌅' }], points: 200, streak: 20 },
  { id: '5', name: 'Bob Cruz', email: 'bobcruz@umak.edu.ph', classId: '2', aliScore: 75, riskLevel: 'Moderate', tasksCompleted: 6, tasksPending: 12, overdueTasks: 3, deadlinesMet: 5, loginFrequency: 2, lastActive: new Date(Date.now() - 7200000), trend: 'down', badges: [], points: 60, streak: 5 },
  { id: '6', name: 'Eva Torres', email: 'evatorres@umak.edu.ph', classId: '3', aliScore: 55, riskLevel: 'Moderate', tasksCompleted: 10, tasksPending: 8, overdueTasks: 1, deadlinesMet: 9, loginFrequency: 4, lastActive: new Date(Date.now() - 1800000), trend: 'stable', badges: [{ name: 'Week Warrior', icon: '🔥' }], points: 120, streak: 8 },
];

const mockInterventions: InterventionData[] = [
  { id: '1', studentId: '3', studentName: 'Maria Santos', studentEmail: 'mariasantos@umak.edu.ph', type: 'warning', subject: 'High ALI Score Alert', message: 'Your ALI score has increased to 82. Please meet with your adviser.', status: 'pending', createdAt: new Date(), taggedUsers: [] },
  { id: '2', studentId: '5', studentName: 'Bob Cruz', studentEmail: 'bobcruz@umak.edu.ph', type: 'support', subject: 'Declining Performance', message: 'We noticed your grades are declining. Let\'s discuss support options.', status: 'acknowledged', notes: 'Student acknowledged the intervention. Follow-up meeting scheduled.', createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 3600000), taggedUsers: [{ name: 'Dr. Garcia', email: 'garciad@umak.edu.ph' }] },
  { id: '3', studentId: '2', studentName: 'John Doe', studentEmail: 'johndoe@umak.edu.ph', type: 'meeting', subject: 'Schedule Consultation', message: 'Please schedule a consultation regarding your pending tasks.', status: 'resolved', notes: 'Met with student. Action plan created for task completion.', createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(Date.now() - 86400000), taggedUsers: [] },
];

const mockBadges: BadgeData[] = [
  { id: '1', name: 'Week Warrior', icon: '🔥', rarity: 'rare', points: 50 },
  { id: '2', name: 'Early Bird', icon: '🌅', rarity: 'common', points: 20 },
  { id: '3', name: 'Perfect Score', icon: '⭐', rarity: 'epic', points: 100 },
  { id: '4', name: 'Team Player', icon: '🤝', rarity: 'uncommon', points: 30 },
];

// All users for tagging
const allUsers = [
  { name: 'Dr. Alice Garcia', email: 'alicegarcia@umak.edu.ph', role: 'faculty' },
  { name: 'Prof. Demo Faculty', email: 'faculty.demo@umak.edu.ph', role: 'faculty' },
  { name: 'Reiner Nuevas', email: 'reinernuevas@umak.edu.ph', role: 'student' },
  { name: 'John Doe', email: 'johndoe@umak.edu.ph', role: 'student' },
  { name: 'Maria Santos', email: 'mariasantos@umak.edu.ph', role: 'student' },
  { name: 'Bob Cruz', email: 'bobcruz@umak.edu.ph', role: 'student' },
  { name: 'Alice Mercado', email: 'alicemercado@umak.edu.ph', role: 'student' },
  { name: 'Eva Torres', email: 'evatorres@umak.edu.ph', role: 'student' },
];

// ==================== USER TAG INPUT COMPONENT ====================

interface UserTagInputProps {
  taggedUsers: { name: string; email: string }[];
  onTaggedUsersChange: (users: { name: string; email: string }[]) => void;
  placeholder?: string;
}

function UserTagInput({ taggedUsers, onTaggedUsersChange, placeholder = "Type name or email to tag..." }: UserTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredUsers = useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase();
    return allUsers.filter(user => 
      (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) &&
      !taggedUsers.some(t => t.email === user.email)
    ).slice(0, 5);
  }, [inputValue, taggedUsers]);

  const handleSelectUser = (user: typeof allUsers[0]) => {
    onTaggedUsersChange([...taggedUsers, { name: user.name, email: user.email }]);
    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(0);
  };

  const handleRemoveTag = (email: string) => {
    onTaggedUsersChange(taggedUsers.filter(u => u.email !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredUsers.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredUsers[selectedIndex]) {
      e.preventDefault();
      handleSelectUser(filteredUsers[selectedIndex]);
    } else if (e.key === 'Backspace' && !inputValue && taggedUsers.length > 0) {
      handleRemoveTag(taggedUsers[taggedUsers.length - 1].email);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg min-h-[42px] bg-background">
        {taggedUsers.map((user) => (
          <Badge key={user.email} variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            {user.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(user.email)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={taggedUsers.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
        />
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border rounded-lg shadow-lg overflow-hidden">
          {filteredUsers.map((user, index) => (
            <button
              key={user.email}
              type="button"
              onClick={() => handleSelectUser(user)}
              className={cn(
                'w-full flex items-center gap-3 p-2 text-left hover:bg-muted transition-colors',
                index === selectedIndex && 'bg-muted'
              )}
            >
              <div className={cn(
                'p-1 rounded',
                user.role === 'faculty' ? 'bg-blue-500/10' : 'bg-green-500/10'
              )}>
                {user.role === 'faculty' 
                  ? <GraduationCap className="h-4 w-4 text-blue-500" />
                  : <User className="h-4 w-4 text-green-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function FacultyDashboardContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  // API data states
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  
  // Faculty ALI data from API
  const [facultyALIData, setFacultyALIData] = useState<{
    totalStudents: number;
    averageALI: number;
    riskDistribution: { Low: number; Moderate: number; High: number };
    classes: { id: string; name: string; avgALI: number; studentCount: number }[];
  } | null>(null);
  
  // Fetch classes from API
  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/classes');
      const result = await response.json();
      if (result.success && result.data) {
        setClasses(result.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          subjectCode: c.subjectCode,
          section: c.section || '',
          schedule: c.schedule || '',
          room: c.room || '',
          studentCount: c.studentCount || 0,
          avgALI: c.avgALI || 0,
          atRiskCount: c.atRiskCount || 0,
          isActive: c.isActive,
          ownerName: c.owner?.displayName || 'Unknown',
          ownerId: c.owner?.id || '',
          description: c.description,
          semester: c.semester,
          members: c.members,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      toast({ title: 'Error', description: 'Failed to load classes', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Fetch faculty ALI data from API
  const fetchFacultyALI = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/faculty-ali');
      const result = await response.json();
      if (result.success && result.data) {
        setFacultyALIData({
          totalStudents: result.data.totalStudents || 0,
          averageALI: result.data.averageALI || 0,
          riskDistribution: result.data.riskDistribution || { Low: 0, Moderate: 0, High: 0 },
          classes: result.data.classes || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch faculty ALI:', error);
    }
  }, []);
  
  useEffect(() => {
    if (session?.user) {
      fetchClasses();
      fetchFacultyALI();
    }
  }, [session, fetchClasses, fetchFacultyALI]);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Low' | 'Moderate' | 'High'>('all');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  
  // Classes tab filters
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  
  // Modal states
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [isAwardBadgeModalOpen, setIsAwardBadgeModalOpen] = useState(false);
  const [isStudentProfileOpen, setIsStudentProfileOpen] = useState(false);
  const [isInterventionDetailOpen, setIsInterventionDetailOpen] = useState(false);
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [interventionStudent, setInterventionStudent] = useState<StudentData | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionData | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassData | null>(null);
  
  // Form states
  const [classForm, setClassForm] = useState({
    name: '',
    subjectCode: '',
    section: '',
    schedule: '',
    room: '',
  });
  const [interventionForm, setInterventionForm] = useState({
    type: 'warning' as 'warning' | 'support' | 'meeting' | 'reminder',
    subject: '',
    message: '',
    taggedUsers: [] as { name: string; email: string }[],
  });
  const [interventionUpdateForm, setInterventionUpdateForm] = useState({
    status: '' as 'pending' | 'acknowledged' | 'resolved' | '',
    notes: '',
  });
  const [selectedBadgeId, setSelectedBadgeId] = useState('');
  const [awardReason, setAwardReason] = useState('');
  
  // Invitation modal state
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [createdInvitation, setCreatedInvitation] = useState<InvitationData | null>(null);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Intervention update state
  const [isUpdatingIntervention, setIsUpdatingIntervention] = useState(false);
  const [interventions, setInterventions] = useState<InterventionData[]>(mockInterventions);

  // Computed values
  const maxClasses = getMaxClasses('faculty');
  const canCreateClass = classes.length < maxClasses;

  // Get unique faculty and sections for filters
  const uniqueFaculty = useMemo(() => {
    const facultySet = new Map<string, { id: string; name: string }>();
    classes.forEach(c => {
      if (!facultySet.has(c.ownerId)) {
        facultySet.set(c.ownerId, { id: c.ownerId, name: c.ownerName });
      }
    });
    return Array.from(facultySet.values());
  }, [classes]);

  const uniqueSections = useMemo(() => {
    return [...new Set(classes.map(c => c.section).filter(Boolean))];
  }, [classes]);

  // Filtered classes for Classes tab
  const filteredClasses = useMemo(() => {
    let result = classes;
    
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
  }, [classes, facultyFilter, sectionFilter, classSearchQuery]);

  const filteredStudents = useMemo(() => {
    let result = mockStudents;
    
    if (selectedClass !== 'all') {
      result = result.filter(s => s.classId === selectedClass);
    }
    
    if (riskFilter !== 'all') {
      result = result.filter(s => s.riskLevel === riskFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [mockStudents, selectedClass, riskFilter, searchQuery]);

  const stats = useMemo(() => {
    // Use API data if available, otherwise fall back to mock data
    if (facultyALIData) {
      const total = facultyALIData.totalStudents;
      const lowRisk = facultyALIData.riskDistribution.Low;
      const moderateRisk = facultyALIData.riskDistribution.Moderate;
      const highRisk = facultyALIData.riskDistribution.High;
      const avgALI = Math.round(facultyALIData.averageALI);
      const avgCompletion = total > 0 ? Math.round((filteredStudents.reduce((sum, s) => sum + s.tasksCompleted, 0) / (filteredStudents.reduce((sum, s) => sum + s.tasksCompleted + s.tasksPending, 0) || 1)) * 100) : 0;
      
      return { total, lowRisk, moderateRisk, highRisk, avgALI, avgCompletion };
    }
    
    // Fallback to mock data
    const total = filteredStudents.length;
    const lowRisk = filteredStudents.filter(s => s.riskLevel === 'Low').length;
    const moderateRisk = filteredStudents.filter(s => s.riskLevel === 'Moderate').length;
    const highRisk = filteredStudents.filter(s => s.riskLevel === 'High').length;
    const avgALI = total > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + s.aliScore, 0) / total) : 0;
    const avgCompletion = total > 0 ? Math.round((filteredStudents.reduce((sum, s) => sum + s.tasksCompleted, 0) / (filteredStudents.reduce((sum, s) => sum + s.tasksCompleted + s.tasksPending, 0) || 1)) * 100) : 0;
    
    return { total, lowRisk, moderateRisk, highRisk, avgALI, avgCompletion };
  }, [filteredStudents, facultyALIData]);

  // Helper functions
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-500 bg-green-500/10';
      case 'Moderate': return 'text-yellow-500 bg-yellow-500/10';
      case 'High': return 'text-red-500 bg-red-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getInterventionTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-red-500 bg-red-500/10';
      case 'support': return 'text-blue-500 bg-blue-500/10';
      case 'meeting': return 'text-purple-500 bg-purple-500/10';
      case 'reminder': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  // Handlers
  const handleCreateClass = async () => {
    if (!canCreateClass) return;
    if (!classForm.name || !classForm.subjectCode || !classForm.section) {
      toast({ title: 'Error', description: 'Please fill in class name, subject code, and section.', variant: 'destructive' });
      return;
    }
    
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: classForm.name,
          subjectCode: classForm.subjectCode,
          section: classForm.section,
          schedule: classForm.schedule || null,
          room: classForm.room || null,
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        toast({ title: 'Class Created', description: `${classForm.name} has been created successfully.` });
        setIsClassModalOpen(false);
        setClassForm({ name: '', subjectCode: '', section: '', schedule: '', room: '' });
        
        // Refresh classes list
        await fetchClasses();
        
        // Create an invitation for the new class
        await createInvitation(result.data.id);
      } else {
        toast({ title: 'Error', description: result.error || 'Failed to create class', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create class', variant: 'destructive' });
    }
  };
  
  // Create invitation for a class
  const createInvitation = async (classId: string, email?: string) => {
    try {
      setIsCreatingInvitation(true);
      const response = await fetch(`/api/classes/${classId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || null }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setCreatedInvitation({
          id: result.data.id,
          code: result.data.code,
          email: result.data.email,
          expiresAt: new Date(result.data.expiresAt),
          invitationLink: result.data.invitationLink,
          createdAt: new Date(result.data.createdAt),
        });
        setIsInvitationModalOpen(true);
      }
    } catch (error) {
      console.error('Failed to create invitation:', error);
    } finally {
      setIsCreatingInvitation(false);
    }
  };
  
  // Copy invitation link to clipboard
  const copyInvitationLink = async () => {
    if (createdInvitation) {
      try {
        await navigator.clipboard.writeText(createdInvitation.invitationLink);
        setCopied(true);
        toast({ title: 'Copied!', description: 'Invitation link copied to clipboard' });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to copy to clipboard', variant: 'destructive' });
      }
    }
  };
  
  // Copy invitation code to clipboard
  const copyInvitationCode = async () => {
    if (createdInvitation) {
      try {
        await navigator.clipboard.writeText(createdInvitation.code);
        setCopiedCode(true);
        toast({ title: 'Copied!', description: 'Invitation code copied to clipboard' });
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to copy to clipboard', variant: 'destructive' });
      }
    }
  };
  
  // Send email invitation
  const sendEmailInvitation = async () => {
    if (!invitationEmail || !invitationEmail.includes('@umak.edu.ph')) {
      toast({ title: 'Error', description: 'Please enter a valid UMAK email address', variant: 'destructive' });
      return;
    }
    
    if (selectedClassDetail) {
      await createInvitation(selectedClassDetail.id, invitationEmail);
      setInvitationEmail('');
    }
  };

  const handleSendIntervention = () => {
    if (!interventionForm.subject || !interventionForm.message) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    toast({ 
      title: 'Intervention Sent', 
      description: `Intervention sent to ${interventionStudent?.name || 'student'}${interventionForm.taggedUsers.length > 0 ? ` and ${interventionForm.taggedUsers.length} others tagged` : ''}.` 
    });
    setIsInterventionModalOpen(false);
    setInterventionForm({ type: 'warning', subject: '', message: '', taggedUsers: [] });
    setInterventionStudent(null);
  };

  const handleAwardBadge = () => {
    if (!selectedBadgeId) {
      toast({ title: 'Error', description: 'Please select a badge to award.', variant: 'destructive' });
      return;
    }
    const badge = mockBadges.find(b => b.id === selectedBadgeId);
    toast({ title: 'Badge Awarded', description: `${badge?.name} has been awarded to ${selectedStudent?.name}.` });
    setIsAwardBadgeModalOpen(false);
    setSelectedBadgeId('');
    setAwardReason('');
    setSelectedStudent(null);
  };

  const openStudentProfile = (student: StudentData) => {
    setSelectedStudent(student);
    setIsStudentProfileOpen(true);
  };

  const openInterventionModal = (student: StudentData | null) => {
    setInterventionStudent(student);
    setIsInterventionModalOpen(true);
  };

  const openAwardBadgeModal = (student: StudentData) => {
    setSelectedStudent(student);
    setIsAwardBadgeModalOpen(true);
  };

  const openInterventionDetail = (intervention: InterventionData) => {
    setSelectedIntervention(intervention);
    setIsInterventionDetailOpen(true);
  };

  const openClassDetail = (classData: ClassData) => {
    setSelectedClassDetail(classData);
    setIsClassDetailOpen(true);
  };

  // Handle creating invitation for existing class
  const handleCreateInvitationForClass = async (classId: string) => {
    await createInvitation(classId);
  };

  // Handle intervention update via API
  const handleUpdateIntervention = async () => {
    if (!selectedIntervention) return;
    
    const newStatus = interventionUpdateForm.status || selectedIntervention.status;
    const notes = interventionUpdateForm.notes;
    
    // Check if there are actual changes
    if (newStatus === selectedIntervention.status && !notes) {
      toast({ 
        title: 'No Changes', 
        description: 'Please change the status or add notes before saving.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsUpdatingIntervention(true);
    
    try {
      const response = await fetch(`/api/interventions/${selectedIntervention.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes || undefined
        }),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        toast({ 
          title: 'Intervention Updated', 
          description: `Status changed to ${newStatus}` 
        });
        
        // Update the intervention in the local state
        setInterventions(prev => prev.map(i => 
          i.id === selectedIntervention.id 
            ? { 
                ...i, 
                status: newStatus, 
                notes: notes || i.notes,
                updatedAt: new Date() 
              }
            : i
        ));
        
        // Update selected intervention to reflect changes
        setSelectedIntervention(prev => prev ? {
          ...prev,
          status: newStatus,
          notes: notes || prev.notes,
          updatedAt: new Date()
        } : null);
        
        setIsInterventionDetailOpen(false);
        setInterventionUpdateForm({ status: '', notes: '' });
      } else {
        toast({ 
          title: 'Error', 
          description: result.error || 'Failed to update intervention', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Failed to update intervention:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update intervention. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsUpdatingIntervention(false);
    }
  };

  // Check if current user is SuperAdmin
  const isSuperAdmin = session?.user?.role === 'super_admin';
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{isSuperAdmin ? 'Faculty Overview' : 'Faculty Dashboard'}</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? 'View all faculty classes and manage students across the institution' 
              : 'Manage classes, monitor students, send interventions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast({ title: 'Export Report', description: 'Report exported successfully!' })}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={() => toast({ title: 'Refreshed', description: 'Data has been refreshed.' })}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsClassModalOpen(true)} disabled={!canCreateClass}>
            <Plus className="h-4 w-4 mr-2" />
            New Class
          </Button>
        </div>
      </div>

      {/* Class Limit Warning */}
      {!canCreateClass && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          You have reached the maximum of {maxClasses} classes.
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full">
          <TabsList className="grid w-full grid-cols-4 min-w-[320px] sm:min-w-0">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="classes" className="text-xs sm:text-sm">{isSuperAdmin ? 'All Classes' : 'My Classes'}</TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">Students</TabsTrigger>
            <TabsTrigger value="interventions" className="text-xs sm:text-sm">Interventions</TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Students</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Avg ALI</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.avgALI}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Completion</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.avgCompletion}%</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Low Risk</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-500">{stats.lowRisk}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Moderate</p>
                    <p className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.moderateRisk}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">High Risk</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.highRisk}</p>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Interventions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 sm:py-6 flex-col gap-2 min-h-[60px] sm:min-h-[70px]" onClick={() => setIsClassModalOpen(true)}>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Create Class</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 sm:py-6 flex-col gap-2 min-h-[60px] sm:min-h-[70px]" onClick={() => setActiveTab('students')}>
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">View Students</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 sm:py-6 flex-col gap-2 min-h-[60px] sm:min-h-[70px]" onClick={() => openInterventionModal(null)}>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Send Intervention</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 sm:py-6 flex-col gap-2 min-h-[60px] sm:min-h-[70px]" onClick={() => setIsAwardBadgeModalOpen(true)}>
                  <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">Award Badge</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Interventions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Interventions</CardTitle>
                <CardDescription>Latest intervention messages sent</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-3">
                    {interventions.slice(0, 4).map((intervention) => (
                      <div 
                        key={intervention.id} 
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => openInterventionDetail(intervention)}
                      >
                        <div className={cn('p-2 rounded-lg', getInterventionTypeColor(intervention.type))}>
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{intervention.studentName}</p>
                          <p className="text-xs text-muted-foreground truncate">{intervention.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">{intervention.type}</Badge>
                            <Badge variant="secondary" className="text-xs capitalize">{intervention.status}</Badge>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(intervention.createdAt, 'MMM d')}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* At-Risk Students Alert */}
          {stats.highRisk > 0 && (
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  High Risk Students Alert
                </CardTitle>
                <CardDescription>{stats.highRisk} students require immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filteredStudents.filter(s => s.riskLevel === 'High').map((student) => (
                    <Button 
                      key={student.id} 
                      variant="outline" 
                      size="sm"
                      className="border-red-500/30"
                      onClick={() => openInterventionModal(student)}
                    >
                      <AlertTriangle className="h-3 w-3 mr-2 text-red-500" />
                      {student.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Classes Tab */}
        <TabsContent value="classes" className="space-y-6">
          {/* Filters - Only show for SuperAdmin */}
          {isSuperAdmin && (
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search for Faculty (simpler view) */}
          {!isSuperAdmin && (
            <Card className="glass-card">
              <CardContent className="py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search your classes..."
                    value={classSearchQuery}
                    onChange={(e) => setClassSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Showing {filteredClasses.length} of {classes.length} {isSuperAdmin ? 'total' : 'your'} classes
              </p>
            </div>
            <Button onClick={() => setIsClassModalOpen(true)} disabled={!canCreateClass} className="w-full sm:w-auto min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />
              Create Class
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="glass-card hover:shadow-lg transition-all cursor-pointer hover:border-primary/50" 
                  onClick={() => openClassDetail(cls)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <CardDescription>{cls.subjectCode} • {cls.section}</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          toast({ title: 'Edit Class', description: 'Class editing feature coming soon!' });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="truncate">{cls.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {cls.schedule}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {cls.room}
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold">{cls.studentCount}</p>
                        <p className="text-xs text-muted-foreground">Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{cls.avgALI}</p>
                        <p className="text-xs text-muted-foreground">Avg ALI</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-red-500">{cls.atRiskCount}</p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); openClassDetail(cls); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Class
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Filters */}
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-full sm:w-48 h-11">
                      <SelectValue placeholder="Filter by class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'Low', 'Moderate', 'High'] as const).map((risk) => (
                    <Button
                      key={risk}
                      variant={riskFilter === risk ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setRiskFilter(risk)}
                      className="capitalize min-h-[44px] px-4"
                    >
                      {risk === 'all' ? 'All' : risk}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Student Monitor</CardTitle>
              <CardDescription>Real-time student performance and risk levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredStudents.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div 
                        className={cn(
                          'p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:bg-muted/50 transition-colors',
                          student.riskLevel === 'High' && 'border-l-4 border-l-red-500',
                          student.riskLevel === 'Moderate' && 'border-l-4 border-l-yellow-500',
                          student.riskLevel === 'Low' && 'border-l-4 border-l-green-500'
                        )}
                        onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                      >
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate text-sm sm:text-base">{student.name}</p>
                              {student.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                              {student.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                              {student.streak > 0 && (
                                <div className="flex items-center gap-1 text-orange-500">
                                  <Flame className="h-3 w-3" />
                                  <span className="text-xs">{student.streak}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</p>
                          </div>
                        </div>

                        {/* Mobile Stats Row */}
                        <div className="flex sm:hidden items-center gap-3 w-full">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">ALI</span>
                              <span className="font-bold">{student.aliScore}</span>
                            </div>
                            <Progress 
                              value={student.aliScore} 
                              className={cn(
                                'h-2',
                                student.riskLevel === 'High' && '[&>div]:bg-red-500',
                                student.riskLevel === 'Moderate' && '[&>div]:bg-yellow-500',
                                student.riskLevel === 'Low' && '[&>div]:bg-green-500'
                              )}
                            />
                          </div>
                          <Badge className={cn('capitalize text-xs', getRiskColor(student.riskLevel))}>
                            {student.riskLevel}
                          </Badge>
                          {expandedStudent === student.id ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* Desktop Stats */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-bold">{student.tasksCompleted}</p>
                            <p className="text-xs text-muted-foreground">Completed</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold">{student.loginFrequency}/wk</p>
                            <p className="text-xs text-muted-foreground">Logins</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold">{student.points}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                          </div>
                        </div>

                        {/* Desktop ALI Score */}
                        <div className="hidden md:block w-24">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">ALI</span>
                            <span className="font-bold">{student.aliScore}</span>
                          </div>
                          <Progress 
                            value={student.aliScore} 
                            className={cn(
                              'h-2',
                              student.riskLevel === 'High' && '[&>div]:bg-red-500',
                              student.riskLevel === 'Moderate' && '[&>div]:bg-yellow-500',
                              student.riskLevel === 'Low' && '[&>div]:bg-green-500'
                            )}
                          />
                        </div>

                        <Badge className={cn('hidden md:flex capitalize', getRiskColor(student.riskLevel))}>
                          {student.riskLevel}
                        </Badge>

                        <div className="hidden md:block">
                          {expandedStudent === student.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedStudent === student.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-muted/30 p-4"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4">
                              <div className="text-center p-3 rounded-lg bg-background">
                                <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-500" />
                                <p className="text-2xl font-bold">{student.tasksCompleted}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background">
                                <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                                <p className="text-2xl font-bold">{student.tasksPending}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background">
                                <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                                <p className="text-2xl font-bold">{student.overdueTasks}</p>
                                <p className="text-xs text-muted-foreground">Overdue</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background">
                                <Target className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                                <p className="text-2xl font-bold">{student.deadlinesMet}</p>
                                <p className="text-xs text-muted-foreground">Deadlines Met</p>
                              </div>
                              <div className="text-center p-3 rounded-lg bg-background">
                                <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                                <p className="text-2xl font-bold">{student.points}</p>
                                <p className="text-xs text-muted-foreground">Points</p>
                              </div>
                            </div>

                            {/* Badges */}
                            {student.badges.length > 0 && (
                              <div className="mb-4">
                                <p className="text-sm font-medium mb-2">Earned Badges</p>
                                <div className="flex gap-2">
                                  {student.badges.map((badge, i) => (
                                    <Badge key={i} variant="secondary" className="gap-1">
                                      <span>{badge.icon}</span>
                                      {badge.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => openStudentProfile(student)} className="min-h-[44px]">
                                <Eye className="h-4 w-4 mr-2" />
                                <span className="text-xs sm:text-sm">View Profile</span>
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openInterventionModal(student)} className="min-h-[44px]">
                                <Send className="h-4 w-4 mr-2" />
                                <span className="text-xs sm:text-sm">Send Intervention</span>
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openAwardBadgeModal(student)} className="min-h-[44px]">
                                <Award className="h-4 w-4 mr-2" />
                                <span className="text-xs sm:text-sm">Award Badge</span>
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interventions Tab */}
        <TabsContent value="interventions" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Intervention Messages</h2>
              <p className="text-sm text-muted-foreground">Send and track student interventions</p>
            </div>
            <Button onClick={() => openInterventionModal(null)} className="w-full sm:w-auto min-h-[44px]">
              <Send className="h-4 w-4 mr-2" />
              New Intervention
            </Button>
          </div>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {interventions.map((intervention) => (
                    <div 
                      key={intervention.id} 
                      className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => openInterventionDetail(intervention)}
                    >
                      <div className={cn('p-2 sm:p-3 rounded-lg flex-shrink-0', getInterventionTypeColor(intervention.type))}>
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium text-sm sm:text-base">{intervention.studentName}</p>
                          <Badge variant="outline" className="text-xs capitalize">{intervention.type}</Badge>
                          <Badge variant="secondary" className="text-xs capitalize">{intervention.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{intervention.subject}</p>
                        {intervention.taggedUsers.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Tagged: {intervention.taggedUsers.map(u => u.name).join(', ')}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {format(intervention.createdAt, 'PPp')}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="hidden sm:flex h-11 w-11">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Class Modal */}
      <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Create New Class</DialogTitle>
            <DialogDescription>
              {classes.length}/{maxClasses} classes created
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Class Name *</Label>
              <Input 
                placeholder="e.g., Software Engineering" 
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Subject Code *</Label>
              <Select value={classForm.subjectCode} onValueChange={(v) => setClassForm({ ...classForm, subjectCode: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_CODES.map((subject) => (
                    <SelectItem key={subject.code} value={subject.code}>
                      {subject.code} - {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Section *</Label>
              <Input 
                placeholder="e.g., BSCS-4A" 
                value={classForm.section}
                onChange={(e) => setClassForm({ ...classForm, section: e.target.value })}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">Enter the section/strand for this class (e.g., BSCS-4A, BSIT-3B)</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Schedule</Label>
              <Input 
                placeholder="e.g., MWF 9:00-10:00 AM" 
                value={classForm.schedule}
                onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Room</Label>
              <Input 
                placeholder="e.g., Rm 301" 
                value={classForm.room}
                onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsClassModalOpen(false)} className="w-full sm:w-auto min-h-[44px]">Cancel</Button>
              <Button onClick={handleCreateClass} disabled={isCreatingInvitation} className="w-full sm:w-auto min-h-[44px]">
                {isCreatingInvitation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Link Modal */}
      <Dialog open={isInvitationModalOpen} onOpenChange={setIsInvitationModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Class Invitation Created
            </DialogTitle>
            <DialogDescription>
              Share this invitation link with your students to join the class
            </DialogDescription>
          </DialogHeader>
          {createdInvitation && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                {/* Invitation Code with Copy Button */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Invitation Code</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={createdInvitation.code} 
                      readOnly 
                      className="font-mono text-lg font-bold h-11 text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyInvitationCode}
                      className="h-11 w-11 shrink-0"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Invitation Link with Copy Button */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Invitation Link</span>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={createdInvitation.invitationLink} 
                      readOnly 
                      className="font-mono text-xs h-11"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyInvitationLink}
                      className="h-11 w-11 shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {/* Expiration Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Expires: {format(createdInvitation.expiresAt, 'PPp')}
                  <Badge variant="outline" className="ml-auto">1 week</Badge>
                </div>
              </div>
              
              {/* Email Invitation Section */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Email Invitation (Optional)
                </Label>
                <p className="text-xs text-muted-foreground">Invite a specific student by their UMAK email</p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="student@umak.edu.ph" 
                    value={invitationEmail}
                    onChange={(e) => setInvitationEmail(e.target.value)}
                    className="h-11"
                    type="email"
                  />
                  <Button 
                    variant="outline" 
                    onClick={sendEmailInvitation}
                    disabled={isCreatingInvitation || !invitationEmail.includes('@umak.edu.ph')}
                    className="shrink-0 min-h-[44px]"
                  >
                    {isCreatingInvitation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setIsInvitationModalOpen(false)} className="min-h-[44px]">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Intervention Modal */}
      <Dialog open={isInterventionModalOpen} onOpenChange={setIsInterventionModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Send Intervention</DialogTitle>
            <DialogDescription>
              {interventionStudent ? `Send intervention to ${interventionStudent.name}` : 'Send intervention to student'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!interventionStudent && (
              <div className="space-y-2">
                <Label className="text-sm">Select Student</Label>
                <Select onValueChange={(v) => {
                  const student = mockStudents.find(s => s.id === v);
                  setInterventionStudent(student || null);
                }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm">Intervention Type</Label>
              <Select value={interventionForm.type} onValueChange={(v: any) => setInterventionForm({ ...interventionForm, type: v })}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="meeting">Meeting Request</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Subject</Label>
              <Input 
                placeholder="e.g., High ALI Score Alert" 
                value={interventionForm.subject}
                onChange={(e) => setInterventionForm({ ...interventionForm, subject: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Message</Label>
              <Textarea 
                placeholder="Enter your intervention message..."
                value={interventionForm.message}
                onChange={(e) => setInterventionForm({ ...interventionForm, message: e.target.value })}
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Tag Others (Optional)</Label>
              <UserTagInput 
                taggedUsers={interventionForm.taggedUsers}
                onTaggedUsersChange={(users) => setInterventionForm({ ...interventionForm, taggedUsers: users })}
                placeholder="Tag faculty or students..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setIsInterventionModalOpen(false); setInterventionStudent(null); }} className="w-full sm:w-auto min-h-[44px]">Cancel</Button>
              <Button onClick={handleSendIntervention} className="w-full sm:w-auto min-h-[44px]">Send Intervention</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Intervention Detail Modal */}
      <Dialog open={isInterventionDetailOpen} onOpenChange={setIsInterventionDetailOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Intervention Details</DialogTitle>
            <DialogDescription>
              View and update intervention information
            </DialogDescription>
          </DialogHeader>
          {selectedIntervention && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="text-sm">
                    {selectedIntervention.studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{selectedIntervention.studentName}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedIntervention.studentEmail}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="capitalize">{selectedIntervention.type}</Badge>
                <Badge variant="secondary" className="capitalize">{selectedIntervention.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Subject</p>
                <p className="text-sm">{selectedIntervention.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm text-muted-foreground">{selectedIntervention.message}</p>
              </div>
              {selectedIntervention.taggedUsers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tagged Users</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedIntervention.taggedUsers.map((user) => (
                      <Badge key={user.email} variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        {user.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Update Section */}
              <Separator />
              <div className="space-y-3">
                <p className="text-sm font-medium">Update Intervention</p>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select 
                    value={interventionUpdateForm.status || selectedIntervention.status} 
                    onValueChange={(v: 'pending' | 'acknowledged' | 'resolved') => 
                      setInterventionUpdateForm({ ...interventionUpdateForm, status: v })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending" disabled={selectedIntervention.status !== 'pending'}>Pending</SelectItem>
                      <SelectItem value="acknowledged" disabled={selectedIntervention.status === 'resolved'}>Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea
                    placeholder="Add notes about this update..."
                    value={interventionUpdateForm.notes}
                    onChange={(e) => setInterventionUpdateForm({ ...interventionUpdateForm, notes: e.target.value })}
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <Button 
                  onClick={handleUpdateIntervention}
                  className="w-full"
                  disabled={isUpdatingIntervention}
                >
                  {isUpdatingIntervention ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Save Update
                </Button>
              </div>
              
              {selectedIntervention.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Previous Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{selectedIntervention.notes}</p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Sent {format(selectedIntervention.createdAt, 'PPp')}
                {selectedIntervention.updatedAt && (
                  <> • Updated {format(selectedIntervention.updatedAt, 'PPp')}</>
                )}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Class Detail Modal */}
      <Dialog open={isClassDetailOpen} onOpenChange={setIsClassDetailOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Class Details</DialogTitle>
            <DialogDescription>
              {selectedClassDetail?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedClassDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-base sm:text-lg">{selectedClassDetail.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedClassDetail.subjectCode}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </div>
                  <p className="font-medium text-sm">{selectedClassDetail.schedule}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <BookOpen className="h-4 w-4" />
                    Room
                  </div>
                  <p className="font-medium text-sm">{selectedClassDetail.room}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                  <p className="text-xl sm:text-2xl font-bold">{selectedClassDetail.studentCount}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-muted/50">
                  <p className="text-xl sm:text-2xl font-bold">{selectedClassDetail.avgALI}</p>
                  <p className="text-xs text-muted-foreground">Avg ALI</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xl sm:text-2xl font-bold text-red-500">{selectedClassDetail.atRiskCount}</p>
                  <p className="text-xs text-muted-foreground">At Risk</p>
                </div>
              </div>

              {/* Students in this class */}
              <div>
                <p className="text-sm font-medium mb-3">Students in this class</p>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {mockStudents.filter(s => s.classId === selectedClassDetail.id).map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => {
                          setIsClassDetailOpen(false);
                          setSelectedStudent(student);
                          setIsStudentProfileOpen(true);
                        }}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        </div>
                        <Badge className={cn('capitalize text-xs', getRiskColor(student.riskLevel))}>
                          {student.riskLevel}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="default" 
                  className="flex-1 min-h-[44px]" 
                  onClick={() => { 
                    setIsClassDetailOpen(false); 
                    handleCreateInvitationForClass(selectedClassDetail.id); 
                  }}
                  disabled={isCreatingInvitation}
                >
                  {isCreatingInvitation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                  Create Invitation
                </Button>
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => { setIsClassDetailOpen(false); setActiveTab('students'); setSelectedClass(selectedClassDetail.id); }}>
                  <Users className="h-4 w-4 mr-2" />
                  View All Students
                </Button>
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => { setIsClassDetailOpen(false); openInterventionModal(null); }}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Intervention
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Award Badge Modal */}
      <Dialog open={isAwardBadgeModalOpen} onOpenChange={setIsAwardBadgeModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Award Badge</DialogTitle>
            <DialogDescription>
              {selectedStudent ? `Award a badge to ${selectedStudent.name}` : 'Select a student and badge'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedStudent && (
              <div className="space-y-2">
                <Label className="text-sm">Select Student</Label>
                <Select onValueChange={(v) => {
                  const student = mockStudents.find(s => s.id === v);
                  setSelectedStudent(student || null);
                }}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm">Select Badge</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockBadges.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => setSelectedBadgeId(badge.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left min-h-[60px]',
                      selectedBadgeId === badge.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                    )}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className={cn('text-xs capitalize', getRarityColor(badge.rarity))}>{badge.rarity}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">+{badge.points} pts</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Reason (Optional)</Label>
              <Input 
                placeholder="e.g., Excellent performance on the project" 
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setIsAwardBadgeModalOpen(false); setSelectedStudent(null); }} className="w-full sm:w-auto min-h-[44px]">Cancel</Button>
              <Button onClick={handleAwardBadge} className="w-full sm:w-auto min-h-[44px]">Award Badge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Profile Modal */}
      <Dialog open={isStudentProfileOpen} onOpenChange={setIsStudentProfileOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Student Profile</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0">
                  <AvatarFallback className="text-base sm:text-lg bg-primary text-primary-foreground">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium text-base sm:text-lg">{selectedStudent.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{selectedStudent.email}</p>
                  <Badge className={cn('mt-1 capitalize text-xs', getRiskColor(selectedStudent.riskLevel))}>
                    {selectedStudent.riskLevel} Risk
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg sm:text-xl font-bold">{selectedStudent.aliScore}</p>
                  <p className="text-xs text-muted-foreground">ALI Score</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg sm:text-xl font-bold">{selectedStudent.points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg sm:text-xl font-bold">{selectedStudent.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-lg sm:text-xl font-bold">{selectedStudent.streak}</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
              </div>

              {selectedStudent.badges.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Earned Badges</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.badges.map((badge, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 text-xs">
                        <span>{badge.icon}</span>
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => openInterventionModal(selectedStudent)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Intervention
                </Button>
                <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => openAwardBadgeModal(selectedStudent)}>
                  <Award className="h-4 w-4 mr-2" />
                  Award Badge
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
