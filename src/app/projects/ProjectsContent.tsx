'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search,
  Calendar,
  CheckCircle2,
  Folder,
  Edit,
  Trash2,
  Eye,
  Shield,
  Users,
  GraduationCap,
  User,
  Loader2,
  LayoutGrid,
  GanttChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  format, 
  isToday, 
  addWeeks, 
  subWeeks, 
  addDays, 
  differenceInDays,
  startOfWeek as startOfWeekDate
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectModal, ProjectFormData } from '@/components/modals/ProjectModal';
import { ProjectDetailsModal } from '@/components/modals/ProjectDetailsModal';
import type { ProjectStatus } from '@/lib/types';
import { useProjects, createProject } from '@/hooks/api/useApi';

// Project interface from API
interface Project {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  courseCode: string | null;
  status: string;
  progress: number;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    displayName: string;
    role: string;
  };
  ownerRole?: string;
  members: Array<{
    id: string;
    name: string;
    avatarUrl?: string | null;
  }>;
  tasksTotal: number;
  tasksCompleted: number;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  on_hold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function ProjectsContent() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role as string || 'student';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'gantt'>('grid');
  
  // Fetch projects from API
  const { projects: apiProjects, isLoading, mutate } = useProjects();
  
  // Super Admin filters
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'student' | 'faculty'>('all');
  
  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const isSuperAdmin = userRole === 'super_admin';

  // Transform API projects to local format using useMemo
  const localProjects = useMemo(() => {
    if (!apiProjects || apiProjects.length === 0) return [];
    return apiProjects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon || '📁',
      color: p.color || '#1A56DB',
      courseCode: p.courseCode,
      status: p.status,
      progress: p.progress || 0,
      startDate: p.startDate,
      endDate: p.endDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      owner: p.owner,
      ownerRole: p.ownerRole || p.owner?.role,
      members: p.members || [],
      tasksTotal: p.tasksTotal || 0,
      tasksCompleted: p.tasksCompleted || 0,
    }));
  }, [apiProjects]);

  const filteredProjects = useMemo(() => {
    let result = localProjects;
    
    // Super Admin owner filter
    if (isSuperAdmin && ownerFilter !== 'all') {
      result = result.filter(p => p.ownerRole === ownerFilter);
    }
    
    // Apply status filter
    if (filter === 'active') {
      result = result.filter(p => p.status === 'active');
    } else if (filter === 'completed') {
      result = result.filter(p => p.status === 'completed');
    } else if (filter === 'archived') {
      result = result.filter(p => p.status === 'archived' || p.status === 'on_hold');
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query)) ||
        (p.courseCode?.toLowerCase().includes(query)) ||
        (p.owner?.displayName?.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [localProjects, filter, searchQuery, ownerFilter, isSuperAdmin]);

  // Stats for Super Admin
  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const active = filteredProjects.filter(p => p.status === 'active').length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    const avgProgress = filteredProjects.length > 0 
      ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length)
      : 0;
    return { total, active, completed, avgProgress };
  }, [filteredProjects]);

  const handleCreateProject = async (data: ProjectFormData) => {
    const result = await createProject({
      name: data.name,
      description: data.description,
      courseCode: data.courseCode,
      status: data.status,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
      color: data.color,
      icon: data.icon,
      members: data.members,
    });

    if (result.success) {
      setIsProjectModalOpen(false);
      mutate(); // Refresh projects from API
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleUpdateProject = (data: ProjectFormData) => {
    // For now, just close the modal - real update would call API
    if (editingProject) {
      mutate(); // Refresh to get updated data
    }
    setEditingProject(null);
    setIsProjectModalOpen(false);
  };

  const handleViewDetails = (project: Project) => {
    setViewingProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    // For now, just refresh - real delete would call API
    mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
            {isSuperAdmin ? 'All Projects Overview' : 'Projects'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {isSuperAdmin 
              ? 'Monitor all projects across students and faculty'
              : 'Manage your academic projects'}
          </p>
        </div>
        
        {/* Super Admin doesn't create projects */}
        {!isSuperAdmin && (
          <Button 
            onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
            className="w-full sm:w-auto min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Super Admin Stats */}
      {isSuperAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="glass-card">
            <CardContent className="p-3 sm:pt-4 text-center">
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Projects</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/30">
            <CardContent className="p-3 sm:pt-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-500">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-blue-500/30">
            <CardContent className="p-3 sm:pt-4 text-center">
              <p className="text-xl sm:text-2xl font-bold text-blue-500">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 sm:pt-4 text-center">
              <p className="text-xl sm:text-2xl font-bold">{stats.avgProgress}%</p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Status Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize min-h-[44px] px-3 sm:px-4 text-xs sm:text-sm"
            >
              {status === 'all' ? 'All Projects' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>
        
        {/* Search, Owner Filter, and View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Super Admin owner filter */}
          {isSuperAdmin && (
            <Select value={ownerFilter} onValueChange={(v: any) => setOwnerFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 min-h-[44px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          )}
          <div className="relative flex-1 sm:max-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isSuperAdmin ? "Search all projects..." : "Search projects..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[44px]"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="min-h-[44px] px-3 sm:px-4"
            >
              <LayoutGrid className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'gantt' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('gantt')}
              className="min-h-[44px] px-3 sm:px-4"
            >
              <GanttChart className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Gantt</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer group h-full">
                <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
                      onClick={() => handleViewDetails(project)}
                    >
                      <div 
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-lg sm:text-xl shrink-0"
                        style={{ backgroundColor: (project.color || '#1A56DB') + '20' }}
                      >
                        {project.icon || '📁'}
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-xs">{project.courseCode || 'No course'}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 min-h-[44px] min-w-[44px]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(project)} className="min-h-[44px]">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!isSuperAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => handleEditProject(project)} className="min-h-[44px]">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive min-h-[44px]"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0" onClick={() => handleViewDetails(project)}>
                  {/* Owner for Super Admin */}
                  {isSuperAdmin && project.owner && (
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'p-1 rounded',
                        project.ownerRole === 'faculty' ? 'bg-blue-500/10' : 'bg-green-500/10'
                      )}>
                        {project.ownerRole === 'faculty' 
                          ? <GraduationCap className="h-3 w-3 text-blue-500" />
                          : <User className="h-3 w-3 text-green-500" />
                        }
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{project.owner.displayName}</span>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided'}
                  </p>

                  {/* Progress */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                      <span>{project.tasksCompleted}/{project.tasksTotal}</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge 
                      variant="outline" 
                      className={cn('capitalize text-xs', statusColors[project.status] || statusColors.active)}
                    >
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <div className="flex -space-x-2">
                      {project.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-background">
                          <AvatarFallback className="text-[10px] sm:text-xs bg-primary text-primary-foreground">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 3 && (
                        <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] sm:text-xs">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gantt Chart View */}
      {viewMode === 'gantt' && (
        <ProjectGanttView 
          projects={filteredProjects} 
          onProjectClick={handleViewDetails}
          showOwner={isSuperAdmin}
        />
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Folder className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <p className="text-base sm:text-lg font-medium">No projects found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}

      {/* Project Create/Edit Modal (Students only) */}
      {!isSuperAdmin && (
        <ProjectModal
          open={isProjectModalOpen}
          onOpenChange={(open) => { setIsProjectModalOpen(open); if (!open) setEditingProject(null); }}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          initialData={editingProject ? {
            name: editingProject.name,
            description: editingProject.description || '',
            status: editingProject.status as ProjectStatus,
            startDate: editingProject.startDate ? new Date(editingProject.startDate) : undefined,
            endDate: editingProject.endDate ? new Date(editingProject.endDate) : undefined,
            courseCode: editingProject.courseCode || '',
            color: editingProject.color,
            icon: editingProject.icon,
            members: editingProject.members.map(m => m.id),
          } : undefined}
          mode={editingProject ? 'edit' : 'create'}
        />
      )}

      {/* Project Details Modal */}
      {viewingProject && (
        <ProjectDetailsModal
          open={isDetailsModalOpen}
          onOpenChange={(open) => { setIsDetailsModalOpen(open); if (!open) setViewingProject(null); }}
          project={viewingProject as any}
          onEdit={() => {
            setIsDetailsModalOpen(false);
            handleEditProject(viewingProject);
          }}
          onDelete={() => {
            handleDeleteProject(viewingProject.id);
            setIsDetailsModalOpen(false);
            setViewingProject(null);
          }}
          readOnly={isSuperAdmin}
        />
      )}
    </div>
  );
}

// Gantt Chart View Component for Projects
function ProjectGanttView({ 
  projects, 
  onProjectClick,
  showOwner = false 
}: { 
  projects: Project[]; 
  onProjectClick: (project: Project) => void;
  showOwner?: boolean;
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeekDate(new Date(), { weekStartsOn: 0 }));
  
  const weeks = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => addWeeks(currentWeekStart, i));
  }, [currentWeekStart]);

  const days = useMemo(() => {
    const allDays: Date[] = [];
    weeks.forEach(week => {
      for (let i = 0; i < 7; i++) {
        allDays.push(addDays(week, i));
      }
    });
    return allDays;
  }, [weeks]);

  const projectsWithDates = useMemo(() => {
    return projects.filter(p => p.startDate && p.endDate).sort((a, b) => {
      const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
      const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
      return aStart - bStart;
    });
  }, [projects]);

  const goToPreviousWeeks = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeeks = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeekDate(new Date(), { weekStartsOn: 0 }));

  const getProjectPosition = (project: Project) => {
    if (!project.startDate || !project.endDate) return null;
    
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    
    const startOffset = Math.max(0, differenceInDays(start, days[0]));
    const duration = differenceInDays(end, start) + 1;
    const visibleStart = Math.max(0, startOffset);
    const visibleEnd = Math.min(days.length - 1, startOffset + duration - 1);
    const visibleDuration = visibleEnd - visibleStart + 1;
    
    return {
      left: `${(visibleStart / days.length) * 100}%`,
      width: `${(visibleDuration / days.length) * 100}%`,
    };
  };

  // Color coding by project status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-400';
      default: return 'bg-primary';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 border-green-500/30';
      case 'completed': return 'bg-blue-500/10 border-blue-500/30';
      case 'on_hold': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'archived': return 'bg-gray-500/10 border-gray-500/30';
      default: return 'bg-primary/10 border-primary/30';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <GanttChart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Project Timeline
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousWeeks} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="min-h-[44px] text-xs sm:text-sm">Today</Button>
              <Button variant="ghost" size="icon" onClick={goToNextWeeks} className="min-h-[44px] min-w-[44px] hover:scale-110 transition-transform">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] sm:h-[600px]">
            <div className="min-w-[350px] sm:min-w-[1000px]">
              {/* Timeline Header */}
              <div className="sticky top-0 bg-card z-10 border-b">
                <div className="flex">
                  <div className="w-40 sm:w-64 shrink-0 p-1.5 sm:p-2 border-r font-medium text-xs sm:text-sm">Project</div>
                  <div className="flex-1 flex">
                    {weeks.map((week, i) => (
                      <div key={i} className="flex-1 text-center p-1.5 sm:p-2 border-r text-xs sm:text-sm font-medium">
                        <span className="hidden sm:inline">Week of </span>{format(week, 'MMM d')}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex">
                  <div className="w-40 sm:w-64 shrink-0 p-1 border-r"></div>
                  <div className="flex-1 flex">
                    {days.map((day, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          'flex-1 text-center p-0.5 sm:p-1 text-[10px] sm:text-xs border-r',
                          isToday(day) && 'bg-primary/10 font-bold'
                        )}
                      >
                        <div className="text-muted-foreground">{format(day, 'EEE')}</div>
                        <div className={isToday(day) ? 'text-primary' : ''}>{format(day, 'd')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Rows */}
              {projectsWithDates.length === 0 ? (
                <div className="p-8">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Folder className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                    <p className="text-base sm:text-lg font-medium">No projects with date ranges</p>
                    <p className="text-muted-foreground text-sm">Add start and end dates to projects to see them here</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y">
                  {projectsWithDates.map((project, index) => {
                    const position = getProjectPosition(project);
                    if (!position) return null;
                    
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ backgroundColor: 'var(--muted)' }}
                        className="flex cursor-pointer"
                        onClick={() => onProjectClick(project)}
                      >
                        <div className="w-40 sm:w-64 shrink-0 p-1.5 sm:p-2 border-r">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div 
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center text-xs sm:text-sm shrink-0"
                              style={{ backgroundColor: (project.color || '#1A56DB') + '20' }}
                            >
                              {project.icon || '📁'}
                            </div>
                            <span className="text-xs sm:text-sm font-medium truncate flex-1">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                            <Badge variant="outline" className="text-[10px] sm:text-xs">{project.courseCode || 'No course'}</Badge>
                            {showOwner && project.owner && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground truncate">{project.owner.displayName}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 relative h-12 sm:h-14">
                          <div className="absolute inset-0 flex">
                            {days.map((day, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  'flex-1 border-r h-full',
                                  isToday(day) && 'bg-primary/5'
                                )}
                              />
                            ))}
                          </div>
                          
                          <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: index * 0.02 + 0.1 }}
                            className={cn(
                              'absolute top-2 sm:top-3 h-8 sm:h-9 rounded-md flex items-center px-2 sm:px-3 text-white text-[10px] sm:text-xs font-medium shadow-sm border',
                              getStatusColor(project.status),
                              getStatusBgColor(project.status),
                              project.status === 'completed' && 'opacity-75'
                            )}
                            style={{
                              left: position.left,
                              width: position.width,
                              transformOrigin: 'left',
                            }}
                          >
                            <span className="truncate hidden sm:inline">{project.name}</span>
                            <span className="truncate sm:hidden">{project.progress}%</span>
                          </motion.div>
                          
                          {/* Progress indicator on the bar */}
                          <div 
                            className="absolute top-2 sm:top-3 left-0 h-8 sm:h-9 rounded-md bg-black/20"
                            style={{
                              left: position.left,
                              width: `calc(${position.width} * ${project.progress} / 100)`,
                            }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-muted-foreground">Completed</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-xs text-muted-foreground">On Hold</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-3 h-3 rounded bg-gray-400" />
          <span className="text-xs text-muted-foreground">Archived</span>
        </div>
      </div>
    </div>
  );
}
