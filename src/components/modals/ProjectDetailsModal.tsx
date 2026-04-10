'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  Edit, 
  Trash2, 
  ExternalLink,
  FolderKanban
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: Date;
    endDate?: Date;
    courseCode?: string;
    color: string;
    icon: string;
    progress: number;
    members: Array<{ id: string; name: string }>;
    tasksCompleted: number;
    tasksTotal: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  on_hold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function ProjectDetailsModal({ 
  open, 
  onOpenChange, 
  project, 
  onEdit, 
  onDelete,
  readOnly = false
}: ProjectDetailsModalProps) {
  const router = useRouter();

  const handleViewBoard = () => {
    onOpenChange(false);
    router.push(`/boards?project=${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: project.color + '20' }}
              >
                {project.icon}
              </div>
              <div>
                <DialogTitle className="text-xl">{project.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{project.courseCode}</Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('capitalize', statusColors[project.status])}
                  >
                    {project.status.replace('_', ' ')}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-3" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{project.tasksCompleted} completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{project.tasksTotal - project.tasksCompleted} remaining</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          {project.description && (
            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{project.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <p className="font-medium">
                {project.startDate ? format(project.startDate, 'MMMM d, yyyy') : 'Not set'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <p className="font-medium">
                {project.endDate ? format(project.endDate, 'MMMM d, yyyy') : 'Not set'}
              </p>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members ({project.members.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{project.tasksTotal}</p>
              <p className="text-xs text-muted-foreground">Total Tasks</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-500">{project.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-orange-500">{project.progress}%</p>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!readOnly && (
              <>
                <Button onClick={onEdit} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleViewBoard}>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  View Board
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {readOnly && (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleViewBoard}>
                  <FolderKanban className="h-4 w-4 mr-2" />
                  View in Board
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/analytics?project=${project.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Analytics
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
