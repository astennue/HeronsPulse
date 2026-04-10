'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Shield, 
  Palette,
  Check,
  Award,
  KeyRound,
  Camera,
  Loader2,
  Upload,
  X,
  Save,
  GraduationCap
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RolePrivilegesDisplay, RoleBadge } from '@/components/ui/role-privileges-display';
import { useToast } from '@/hooks/use-toast';
import { StudentAcademicInfo } from '@/components/settings/StudentAcademicInfo';

const appearanceOptions = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Globe },
];

const accentColors = [
  '#1A56DB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Generate default avatar URL using UI Avatars service
function generateDefaultAvatar(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Using UI Avatars service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200&bold=true&format=svg`;
}

// Profile data interface
interface ProfileData {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  loginCount: number;
  lastLoginAt: string | null;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  productivityScore: number;
  totalPoints: number;
  createdAt: string;
}

export function SettingsContent() {
  const { data: session, update: updateSession } = useSession();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const userRole = (session?.user as any)?.role || 'student';
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    deadline: true,
    mentions: true,
    achievements: true,
  });
  const [selectedAccent, setSelectedAccent] = useState('#1A56DB');
  
  // Profile state
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Load profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/profile');
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.data);
          setDisplayName(data.data.displayName || '');
          setBio(data.data.bio || '');
          setAvatarUrl(data.data.avatarUrl);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF)';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size must be less than 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`;
    }
    return null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    
    // Validate file
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      toast({ title: 'Upload Error', description: error, variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        
        // Upload to API
        const response = await fetch('/api/users/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarData: dataUrl, avatarType: 'base64' }),
        });

        const result = await response.json();
        
        if (result.success) {
          setAvatarUrl(dataUrl);
          toast({ 
            title: 'Avatar Updated', 
            description: 'Your profile picture has been updated successfully!' 
          });
          
          // Update session
          updateSession({ image: dataUrl });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError('Failed to upload image. Please try again.');
      toast({ 
        title: 'Upload Failed', 
        description: err.message || 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvatarUrl(null);
        toast({ title: 'Avatar Removed', description: 'Your profile picture has been removed.' });
        updateSession({ image: null });
      }
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to remove avatar. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleUseDefaultAvatar = () => {
    const name = displayName || session?.user?.name || 'User';
    const defaultAvatar = generateDefaultAvatar(name);
    setAvatarUrl(defaultAvatar);
    toast({ 
      title: 'Default Avatar Applied', 
      description: 'A default avatar has been set based on your initials.' 
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          avatarUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
        toast({ 
          title: 'Profile Saved', 
          description: 'Your profile has been updated successfully!' 
        });
        
        // Update session
        updateSession({ name: displayName, image: avatarUrl });
      } else {
        throw new Error(result.error || 'Failed to save profile');
      }
    } catch (err: any) {
      toast({ 
        title: 'Save Failed', 
        description: err.message || 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    // In a real app, this would call an API
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
  };

  const getInitials = () => {
    return displayName?.split(' ').map(n => n[0]).join('') || 
           session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U';
  };

  const getMemberSince = () => {
    if (profileData?.createdAt) {
      return new Date(profileData.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    return 'January 2025';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto justify-start sm:justify-center gap-1 p-1 h-auto">
          <TabsTrigger value="profile" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          {userRole === 'student' && (
            <TabsTrigger value="academic" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="role" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
            <Award className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Role</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
            <Palette className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
            <Bell className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 min-w-0 flex-shrink-0 min-h-[44px] px-3 sm:px-4">
            <KeyRound className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile" />
                    ) : null}
                    <AvatarFallback className="text-base sm:text-lg bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity min-h-[44px] min-w-[44px]"
                  >
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-white" />
                    ) : (
                      <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="space-y-2 w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={isUploading} className="min-h-[44px]">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Change Avatar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleUseDefaultAvatar} disabled={isUploading} className="min-h-[44px]">
                      <User className="h-4 w-4 mr-2" />
                      Use Default
                    </Button>
                    {avatarUrl && (
                      <Button variant="ghost" size="sm" onClick={handleRemoveAvatar} className="min-h-[44px]">
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max 10MB. Or use default avatar based on initials.
                  </p>
                  {uploadError && (
                    <p className="text-xs text-destructive">{uploadError}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Display Name</Label>
                  <Input 
                    id="name" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="h-11" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input id="email" value={profileData?.email || session?.user?.email || ''} disabled className="h-11" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                  <Input 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..." 
                    className="h-11" 
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving || !displayName.trim()}
                  className="min-h-[44px] w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Role & Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Role</span>
                <RoleBadge role={userRole} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Member since</span>
                <span className="text-sm">{getMemberSince()}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Session count</span>
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  #{profileData?.loginCount || 1}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Tasks completed</span>
                <span className="text-sm font-medium">{profileData?.tasksCompleted || 0}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Current streak</span>
                <div className="flex items-center gap-1 text-orange-500">
                  <span className="text-sm font-medium">{profileData?.currentStreak || 0} days</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-sm sm:text-base">Total Points</span>
                <span className="text-sm font-medium text-primary">{profileData?.totalPoints || 0}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Info Tab - Students Only */}
        {userRole === 'student' && (
          <TabsContent value="academic" className="space-y-6">
            <StudentAcademicInfo />
          </TabsContent>
        )}

        {/* Role Privileges Tab */}
        <TabsContent value="role" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Role & Privileges
              </CardTitle>
              <CardDescription>
                View your current role, duties, features, and restrictions within HeronPulse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolePrivilegesDisplay currentRole={userRole} />
            </CardContent>
          </Card>

          {/* Show all roles comparison for admin */}
          {userRole === 'super_admin' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>All Roles Comparison</CardTitle>
                <CardDescription>Compare privileges across all user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <RolePrivilegesDisplay currentRole={userRole} showAllRoles compact />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {appearanceOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.id;
                  
                  return (
                    <motion.button
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border-2 transition-colors min-h-[80px] sm:min-h-[88px]',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent hover:border-muted-foreground/20 bg-muted/50'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', isSelected && 'text-primary')} />
                      <span className="text-xs sm:text-sm font-medium">{option.label}</span>
                      {isSelected && (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Accent Color</CardTitle>
              <CardDescription>Choose your accent color</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {accentColors.map((color) => (
                  <motion.button
                    key={color}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedAccent(color)}
                    className={cn(
                      'w-11 h-11 rounded-full border-2 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      selectedAccent === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Select ${color} accent color`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm sm:text-base">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  className="flex-shrink-0"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm sm:text-base">Push Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  className="flex-shrink-0"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm sm:text-base">Deadline Reminders</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get reminded before task deadlines</p>
                </div>
                <Switch
                  checked={notifications.deadline}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, deadline: checked })}
                  className="flex-shrink-0"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm sm:text-base">Mention Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get notified when someone mentions you</p>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, mentions: checked })}
                  className="flex-shrink-0"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-4 py-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <Label className="text-sm sm:text-base">Achievement Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get notified when you unlock achievements</p>
                </div>
                <Switch
                  checked={notifications.achievements}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, achievements: checked })}
                  className="flex-shrink-0"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
                  Password updated successfully!
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Current Password</Label>
                <Input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">New Password</Label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Confirm New Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button onClick={handlePasswordChange} className="w-full sm:w-auto min-h-[44px]">Update Password</Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm sm:text-base">Delete Account</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="min-h-[44px] w-full sm:w-auto"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      console.log('Account deletion requested');
                      toast({ 
                        title: 'Account Deletion', 
                        description: 'Account deletion feature coming soon.',
                        variant: 'destructive'
                      });
                    }
                  }}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
