'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Users,
  GraduationCap,
  Calendar,
  MapPin,
  MoreHorizontal,
  Copy,
  Trash2,
  UserPlus,
  Link2,
  Check,
  X,
  Eye,
  Edit,
  Clock,
  BookOpen,
  Building,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClassMember {
  id: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    studentNumber?: string;
    yearLevel?: string;
    section?: string;
    avatarUrl?: string;
  };
  role: string;
  joinedAt: string;
}

interface ClassData {
  id: string;
  name: string;
  subjectCode: string;
  description?: string;
  schedule?: string;
  room?: string;
  semester: string;
  yearLevel: string;
  section: string;
  owner?: {
    id: string;
    displayName: string;
    email: string;
    role: string;
  };
  members?: ClassMember[];
  _count?: {
    members: number;
  };
}

interface Invitation {
  id: string;
  token: string;
  maxUses?: number;
  currentUses: number;
  expiresAt: string;
  status: string;
}

interface FacultyUser {
  id: string;
  displayName: string;
  email: string;
}

export default function ClassesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'student';
  
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [facultyList, setFacultyList] = useState<FacultyUser[]>([]);
  
  // Form state for creating class
  const [formData, setFormData] = useState({
    name: '',
    subjectCode: '',
    description: '',
    schedule: '',
    room: '',
    semester: '2024-2025 Second Semester',
    yearLevel: '1st Year',
    section: 'A',
    ownerId: '',
  });

  const isSuperAdmin = userRole === 'super_admin';
  const isFaculty = userRole === 'faculty';

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch faculty list for SuperAdmin
  const fetchFaculty = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const response = await fetch('/api/users?role=faculty');
      if (response.ok) {
        const data = await response.json();
        setFacultyList(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchClasses();
    fetchFaculty();
  }, [fetchClasses, fetchFaculty]);

  // Create class
  const handleCreateClass = async () => {
    if (!formData.name || !formData.subjectCode) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create class');
      }

      toast.success('Class created successfully!');
      setIsCreateDialogOpen(false);
      setFormData({
        name: '',
        subjectCode: '',
        description: '',
        schedule: '',
        room: '',
        semester: '2024-2025 Second Semester',
        yearLevel: '1st Year',
        section: 'A',
        ownerId: '',
      });
      fetchClasses();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create class');
    }
  };

  // Generate invitation link
  const handleGenerateInvite = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxUses: null, expiresInDays: 30 }),
      });

      if (!response.ok) throw new Error('Failed to generate invitation');

      const data = await response.json();
      setGeneratedLink(data.invitation.url);
      toast.success('Invitation link generated!');
      
      // Fetch updated invitations
      fetchInvitations(classId);
    } catch (error) {
      toast.error('Failed to generate invitation link');
    }
  };

  // Fetch invitations for a class
  const fetchInvitations = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/invitations`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  // Remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedClass) return;

    try {
      const response = await fetch(
        `/api/classes/${selectedClass.id}/members?memberId=${memberId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove member');

      toast.success('Member removed successfully');
      
      // Refresh members
      const classResponse = await fetch('/api/classes');
      const data = await classResponse.json();
      const updatedClass = data.classes.find((c: ClassData) => c.id === selectedClass.id);
      if (updatedClass) {
        setSelectedClass(updatedClass);
        setClasses(data.classes);
      }
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  // Filter classes by search
  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.owner?.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Classes</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? 'Manage all classes and assign faculty'
              : isFaculty
              ? 'Manage your classes and student enrollments'
              : 'View your enrolled classes'}
          </p>
        </div>
        
        {(isSuperAdmin || isFaculty) && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="min-h-[44px]">
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search classes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 min-h-[44px]"
        />
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No classes found</p>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? 'Try a different search term' : 'Create your first class to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClasses.map((classItem, index) => (
              <motion.div
                key={classItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {classItem.subjectCode}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {classItem.yearLevel} - {classItem.section}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg truncate">{classItem.name}</CardTitle>
                        {classItem.description && (
                          <CardDescription className="line-clamp-2">
                            {classItem.description}
                          </CardDescription>
                        )}
                      </div>
                      {(isSuperAdmin || (isFaculty && classItem.owner?.id === session?.user?.id)) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedClass(classItem);
                                fetchInvitations(classItem.id);
                                setIsInviteDialogOpen(true);
                              }}
                            >
                              <Link2 className="h-4 w-4 mr-2" />
                              Invitation Link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedClass(classItem);
                                setIsMembersDialogOpen(true);
                              }}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Members
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="space-y-2 text-sm">
                      {classItem.schedule && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{classItem.schedule}</span>
                        </div>
                      )}
                      {classItem.room && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{classItem.room}</span>
                        </div>
                      )}
                      {classItem.owner && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="h-4 w-4" />
                          <span>{classItem.owner.displayName}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{classItem.semester}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {classItem._count?.members || classItem.members?.length || 0} students
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(classItem);
                          setIsMembersDialogOpen(true);
                        }}
                        className="min-h-[44px]"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Class Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>
              Create a new class for students to join
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Data Structures and Algorithms"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            
            <div>
              <Label htmlFor="subjectCode">Subject Code *</Label>
              <Input
                id="subjectCode"
                placeholder="e.g., CS401"
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the class..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearLevel">Year Level *</Label>
                <Select
                  value={formData.yearLevel}
                  onValueChange={(v) => setFormData({ ...formData, yearLevel: v })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="section">Section *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(v) => setFormData({ ...formData, section: v })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="semester">Semester *</Label>
              <Select
                value={formData.semester}
                onValueChange={(v) => setFormData({ ...formData, semester: v })}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025 First Semester">2024-2025 First Semester</SelectItem>
                  <SelectItem value="2024-2025 Second Semester">2024-2025 Second Semester</SelectItem>
                  <SelectItem value="2025-2026 First Semester">2025-2026 First Semester</SelectItem>
                  <SelectItem value="2025-2026 Second Semester">2025-2026 Second Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                placeholder="e.g., MWF 9:00-10:00 AM"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            
            <div>
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                placeholder="e.g., Room 301, Computer Lab A"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="min-h-[44px]"
              />
            </div>
            
            {isSuperAdmin && facultyList.length > 0 && (
              <div>
                <Label htmlFor="owner">Assign Faculty</Label>
                <Select
                  value={formData.ownerId}
                  onValueChange={(v) => setFormData({ ...formData, ownerId: v })}
                >
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue placeholder="Select faculty (or leave empty to assign yourself)" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id}>
                        {faculty.displayName} ({faculty.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1 min-h-[44px]"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateClass} className="flex-1 min-h-[44px]">
                Create Class
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitation Link Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Class Invitation</DialogTitle>
            <DialogDescription>
              Share this link with students to let them join the class
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {generatedLink ? (
              <div className="space-y-2">
                <Label>Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="min-h-[44px] text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedLink)}
                    className="min-h-[44px] min-w-[44px]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This link expires in 30 days. Share it with your students.
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a shareable link for students to join this class
                </p>
                <Button
                  onClick={() => selectedClass && handleGenerateInvite(selectedClass.id)}
                  className="min-h-[44px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Invitation Link
                </Button>
              </div>
            )}
            
            {/* Existing Invitations */}
            {invitations.length > 0 && (
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Active Links</Label>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {invitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono truncate">
                            ...{inv.token.slice(-8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Uses: {inv.currentUses}/{inv.maxUses || '∞'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
                            copyToClipboard(`${baseUrl}/join/${inv.token}`);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedClass?.name} - Members
            </DialogTitle>
            <DialogDescription>
              {selectedClass?._count?.members || selectedClass?.members?.length || 0} students enrolled
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-2">
              {selectedClass?.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.user.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      {member.user.studentNumber && (
                        <p className="text-xs text-muted-foreground">
                          ID: {member.user.studentNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                    {(isSuperAdmin || (isFaculty && selectedClass.owner?.id === session?.user?.id)) &&
                      member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveMember(member.user.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
              
              {(!selectedClass?.members || selectedClass.members.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>No members yet</p>
                  <p className="text-sm">Generate an invitation link to add students</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
