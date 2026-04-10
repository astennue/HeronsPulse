'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Folder
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock projects
const mockProjects = [
  {
    id: '1',
    name: 'CS Capstone Project 2026',
    description: 'Final year capstone project for the College of Computing and Information Sciences',
    icon: '🎓',
    color: '#1A56DB',
    courseCode: 'CS401',
    status: 'active',
    progress: 35,
    members: [
      { id: '1', name: 'Reiner N.', avatar: null },
      { id: '2', name: 'John D.', avatar: null },
      { id: '3', name: 'Maria S.', avatar: null },
    ],
    tasksCompleted: 12,
    tasksTotal: 34,
    dueDate: new Date(Date.now() + 90 * 86400000),
  },
  {
    id: '2',
    name: 'Web Development Course',
    description: 'Learn modern web development with React and Next.js',
    icon: '🌐',
    color: '#10B981',
    courseCode: 'IT301',
    status: 'active',
    progress: 68,
    members: [
      { id: '1', name: 'Reiner N.', avatar: null },
    ],
    tasksCompleted: 17,
    tasksTotal: 25,
    dueDate: new Date(Date.now() + 30 * 86400000),
  },
  {
    id: '3',
    name: 'Database Management System',
    description: 'Design and implement a relational database for a library system',
    icon: '🗄️',
    color: '#F59E0B',
    courseCode: 'CS302',
    status: 'completed',
    progress: 100,
    members: [
      { id: '1', name: 'Reiner N.', avatar: null },
      { id: '2', name: 'Alice M.', avatar: null },
    ],
    tasksCompleted: 20,
    tasksTotal: 20,
    dueDate: new Date(Date.now() - 10 * 86400000),
  },
  {
    id: '4',
    name: 'Machine Learning Research',
    description: 'Research paper on natural language processing techniques',
    icon: '🤖',
    color: '#8B5CF6',
    courseCode: 'CS405',
    status: 'on_hold',
    progress: 15,
    members: [
      { id: '1', name: 'Reiner N.', avatar: null },
    ],
    tasksCompleted: 3,
    tasksTotal: 20,
    dueDate: new Date(Date.now() + 120 * 86400000),
  },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  on_hold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  const filteredProjects = mockProjects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'active') return project.status === 'active';
    if (filter === 'completed') return project.status === 'completed';
    if (filter === 'archived') return project.status === 'archived' || project.status === 'on_hold';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your academic projects</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === 'all' ? 'All Projects' : status.replace('_', ' ')}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      {project.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{project.courseCode}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Project</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>{project.tasksCompleted}/{project.tasksTotal}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge 
                    variant="outline" 
                    className={cn('capitalize', statusColors[project.status])}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member, i) => (
                      <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {project.members.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
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

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or create a new project</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
