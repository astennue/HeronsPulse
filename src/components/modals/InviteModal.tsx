'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite?: (data: InviteData) => void;
  channelName?: string;
}

export interface InviteData {
  email: string;
  role: 'student' | 'faculty' | 'admin';
  message?: string;
}

const roles = [
  { value: 'student', label: 'Student', description: 'Can view and complete tasks' },
  { value: 'faculty', label: 'Faculty', description: 'Can monitor students and manage courses' },
  { value: 'admin', label: 'Admin', description: 'Full system access' },
];

const mockTeamMembers = [
  { id: '1', name: 'Reiner N.', email: 'reiner@umak.edu.ph', role: 'student' },
  { id: '2', name: 'John D.', email: 'john@umak.edu.ph', role: 'student' },
  { id: '3', name: 'Maria S.', email: 'maria@umak.edu.ph', role: 'faculty' },
];

export function InviteModal({ open, onOpenChange, onInvite, channelName = 'team' }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [message, setMessage] = useState('');
  const [recentInvites, setRecentInvites] = useState<{ email: string; time: Date }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const inviteData: InviteData = {
      email: email.trim(),
      role,
      message: message.trim() || undefined,
    };

    if (onInvite) {
      onInvite(inviteData);
    }

    // Add to recent invites
    setRecentInvites([{ email: email.trim(), time: new Date() }, ...recentInvites.slice(0, 4)]);
    
    // Reset form
    setEmail('');
    setMessage('');
    
    // Close the modal
    onOpenChange(false);
    
    console.log('Sending invite:', inviteData);
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `https://heronpulse.demo/invite/${Date.now()}`;
    navigator.clipboard.writeText(inviteLink);
    console.log('Invite link copied:', inviteLink);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Invite to {channelName}
          </DialogTitle>
          <DialogDescription>
            Invite team members to join your workspace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v: typeof role) => setRole(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Input
              id="message"
              placeholder="Add a personal note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!email.trim()} className="flex-1">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invite
            </Button>
            <Button type="button" variant="outline" onClick={handleCopyInviteLink}>
              Copy Link
            </Button>
          </div>

          {/* Recent Invites */}
          {recentInvites.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm text-muted-foreground">Recently Invited</Label>
              <div className="space-y-2">
                {recentInvites.map((invite, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <span className="text-sm">{invite.email}</span>
                    <Badge variant="secondary" className="text-xs">Sent</Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Team Members Preview */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm text-muted-foreground">Current Team Members</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mockTeamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                </div>
              ))}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
