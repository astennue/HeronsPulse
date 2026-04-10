'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  FolderKanban, 
  BarChart3, 
  MessageSquare, 
  Trophy, 
  Calendar, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  ChevronLeft,
  ChevronRight,
  Timer,
  Bell,
  Flame,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Shield,
  GraduationCap,
  Sparkles,
  Info,
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { getRoleConfig, UserRole } from '@/lib/role-privileges';

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    loginCount?: number;
  };
  currentStreak?: number;
  unreadNotifications?: number;
  showPomodoro?: boolean;
  onTogglePomodoro?: () => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

// Navigation item colors - Monday.com/ClickUp style palette
const navItemColors: Record<string, { bg: string; text: string; activeBg: string }> = {
  '/dashboard': { bg: 'bg-blue-500/10', text: 'text-blue-500', activeBg: 'bg-blue-500/20' },
  '/boards': { bg: 'bg-green-500/10', text: 'text-green-500', activeBg: 'bg-green-500/20' },
  '/projects': { bg: 'bg-amber-500/10', text: 'text-amber-500', activeBg: 'bg-amber-500/20' },
  '/analytics': { bg: 'bg-purple-500/10', text: 'text-purple-500', activeBg: 'bg-purple-500/20' },
  '/messages': { bg: 'bg-cyan-500/10', text: 'text-cyan-500', activeBg: 'bg-cyan-500/20' },
  '/leaderboard': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', activeBg: 'bg-yellow-500/20' },
  '/calendar': { bg: 'bg-pink-500/10', text: 'text-pink-500', activeBg: 'bg-pink-500/20' },
  '/facility': { bg: 'bg-indigo-500/10', text: 'text-indigo-500', activeBg: 'bg-indigo-500/20' },
  '/admin': { bg: 'bg-red-500/10', text: 'text-red-500', activeBg: 'bg-red-500/20' },
};

// Navigation items - will be filtered by role
const getNavItems = (role: string | undefined) => {
  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/boards', label: 'Boards', icon: ClipboardList, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/messages', label: 'Messages', icon: MessageSquare, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/calendar', label: 'Calendar', icon: Calendar, roles: ['student', 'faculty', 'super_admin'] },
    { href: '/facility', label: 'Faculty Board', icon: GraduationCap, roles: ['faculty', 'super_admin'] },
    { href: '/admin', label: 'Admin Panel', icon: Shield, roles: ['super_admin'] },
  ];
  
  return items.filter(item => item.roles.includes(role || 'student'));
};

// Role colors
const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  student: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  faculty: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  super_admin: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
};

// Mock notifications
const mockNotifications = [
  { id: '1', type: 'task_assigned', title: 'New Task Assigned', body: 'Literature Review has been assigned to you', time: '5 min ago', read: false },
  { id: '2', type: 'deadline', title: 'Deadline Approaching', body: 'System Architecture Design is due in 2 days', time: '1 hour ago', read: false },
  { id: '3', type: 'mention', title: 'You were mentioned', body: 'John mentioned you in a comment', time: '2 hours ago', read: true },
  { id: '4', type: 'achievement', title: 'Achievement Unlocked!', body: 'You earned the "Week Warrior" badge', time: '1 day ago', read: true },
];

// Notifications Panel
function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="w-full max-w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={handleMarkAllRead}>Mark all read</Button>
      </div>
      <ScrollArea className="h-[280px]">
        <div className="space-y-3">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
                !notification.read && 'bg-primary/5 border-primary/20'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// Role Info Dialog
function RoleInfoDialog({ 
  open, 
  onClose, 
  role 
}: { 
  open: boolean; 
  onClose: () => void; 
  role: UserRole;
}) {
  const config = getRoleConfig(role);
  const colors = roleColors[role] || roleColors.student;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', colors.bg)}>
              <Sparkles className={cn('h-5 w-5', colors.text)} />
            </div>
            {config.name} Role
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Duties */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Your Duties & Responsibilities
            </h4>
            <ul className="space-y-1">
              {config.duties.map((duty, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  {duty}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Novel Features */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Your Unique Features
            </h4>
            <div className="space-y-2">
              {config.novelFeatures.map((feature, i) => (
                <div key={i} className={cn('p-3 rounded-lg border', colors.border, colors.bg)}>
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Restrictions */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Restrictions
            </h4>
            <ul className="space-y-1">
              {config.restrictions.map((restriction, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <X className="h-3 w-3 mt-1 text-red-400 shrink-0" />
                  {restriction}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sidebar Navigation Content Component (shared between desktop and mobile)
function SidebarNavContent({ 
  user, 
  currentStreak, 
  unreadNotifications, 
  showPomodoro, 
  onTogglePomodoro,
  isCollapsed = false,
  onNavigate
}: { 
  user: SidebarProps['user'];
  currentStreak: number;
  unreadNotifications: number;
  showPomodoro: boolean;
  onTogglePomodoro?: () => void;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Get navigation items based on user role
  const navItems = getNavItems(user.role);
  const roleConfig = getRoleConfig(user.role as UserRole);
  const colors = roleColors[user.role || 'student'] || roleColors.student;
  
  // Session count - hide role panel after 5 sessions
  const loginCount = user.loginCount || 1;
  const showRolePanel = loginCount < 5;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  const handlePomodoroClick = () => {
    if (onTogglePomodoro) {
      onTogglePomodoro();
    }
    onNavigate?.();
  };

  return (
    <>
      {/* User Profile */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b border-sidebar-border"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowRoleInfo(true)}
                  className={cn(
                    'text-xs capitalize px-2 py-0.5 rounded-full flex items-center gap-1 hover:opacity-80 transition-opacity',
                    colors.bg, colors.text
                  )}
                >
                  {user.role?.replace('_', ' ')}
                  <Info className="h-3 w-3" />
                </button>
                {/* Session count badge */}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                  Session #{loginCount}
                </Badge>
                {currentStreak > 0 && user.role === 'student' && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="h-3 w-3 streak-fire" />
                    <span className="text-xs font-medium">{currentStreak}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {/* Main Section */}
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main
            </p>
          )}
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const colors = navItemColors[item.href] || navItemColors['/dashboard'];
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link href={item.href} onClick={onNavigate}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 relative min-h-[44px] transition-all duration-200',
                      isCollapsed && 'justify-center px-2',
                      isActive && [colors.activeBg, colors.text, 'hover:bg-opacity-30']
                    )}
                  >
                    <div className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      isActive ? colors.bg : 'bg-transparent group-hover:bg-muted/50'
                    )}>
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive ? colors.text : 'text-muted-foreground')} />
                    </div>
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className={cn('truncate', isActive && 'font-medium')}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full', colors.bg.replace('/10', ''))}
                        style={{ backgroundColor: 'currentColor' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}

          {/* Tools Section - Only for non-super-admin */}
          {user.role !== 'super_admin' && !isCollapsed && (
            <>
              <Separator className="my-4" />
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tools
              </p>
            </>
          )}
          
          {/* Pomodoro Timer - Only for students */}
          {user.role === 'student' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant={showPomodoro ? 'secondary' : 'ghost'}
                onClick={handlePomodoroClick}
                className={cn(
                  'w-full justify-start gap-3 min-h-[44px]',
                  isCollapsed && 'justify-center px-2',
                  showPomodoro && 'bg-primary/10 text-primary'
                )}
              >
                <Timer className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span>Pomodoro Timer</span>}
                {showPomodoro && !isCollapsed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-2 h-2 rounded-full bg-green-500"
                  />
                )}
              </Button>
            </motion.div>
          )}

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 min-h-[44px]',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <div className="relative">
                    <Bell className="h-5 w-5 shrink-0" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && <span>Notifications</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
                <NotificationsPanel onClose={() => setShowNotifications(false)} />
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </nav>
      </ScrollArea>

      {/* Role Quick Info - Only when expanded and less than 5 sessions */}
      {!isCollapsed && showRolePanel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mx-2 mb-2 p-3 rounded-lg border', colors.border, colors.bg)}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold">Quick Tips</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs min-h-[32px]"
              onClick={() => setShowRoleInfo(true)}
            >
              View Role
            </Button>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {roleConfig.duties[0]}
          </p>
          <p className="text-[10px] text-muted-foreground mt-2 opacity-60">
            {5 - loginCount} more sessions until tips hide
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link href="/settings" onClick={onNavigate}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-3 min-h-[44px]',
              isCollapsed && 'justify-center px-2'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            'w-full justify-start gap-3 min-h-[44px]',
            isCollapsed && 'justify-center px-2'
          )}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowLogoutConfirm(true)}
          className={cn(
            'w-full justify-start gap-3 text-destructive hover:text-destructive min-h-[44px]',
            isCollapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>

      {/* Role Info Dialog */}
      <RoleInfoDialog 
        open={showRoleInfo} 
        onClose={() => setShowRoleInfo(false)} 
        role={user.role as UserRole} 
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of HeronPulse? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1 min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setShowLogoutConfirm(false);
                await handleLogout();
              }}
              className="flex-1 min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function Sidebar({ 
  user, 
  currentStreak = 0, 
  unreadNotifications = 4,
  showPomodoro = false,
  onTogglePomodoro,
  mobileOpen = false,
  onMobileOpenChange,
  isCollapsed: externalCollapsed,
  onCollapsedChange
}: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalCollapsed;

  const handlePomodoroClick = () => {
    if (onTogglePomodoro) {
      onTogglePomodoro();
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: isCollapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border glass-sidebar fixed left-0 top-0 z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <Image 
                  src="/logo.png" 
                  alt="HeronPulse Logo" 
                  width={36} 
                  height={36}
                  className="h-9 w-auto"
                />
                <span className="font-bold text-lg gradient-text">HeronPulse</span>
              </motion.div>
            )}
          </AnimatePresence>
          {isCollapsed && (
            <Image 
              src="/logo.png" 
              alt="HeronPulse Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto mx-auto"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0 min-h-[44px] min-w-[44px]"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Content */}
        <SidebarNavContent 
          user={user}
          currentStreak={currentStreak}
          unreadNotifications={unreadNotifications}
          showPomodoro={showPomodoro}
          onTogglePomodoro={onTogglePomodoro}
          isCollapsed={isCollapsed}
        />
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="p-0 w-[280px] max-w-[85vw]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full bg-sidebar">
            {/* Logo for mobile */}
            <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo.png" 
                  alt="HeronPulse Logo" 
                  width={36} 
                  height={36}
                  className="h-9 w-auto"
                />
                <span className="font-bold text-lg gradient-text">HeronPulse</span>
              </div>
            </div>
            {/* Navigation Content for mobile */}
            <SidebarNavContent 
              user={user}
              currentStreak={currentStreak}
              unreadNotifications={unreadNotifications}
              showPomodoro={showPomodoro}
              onTogglePomodoro={onTogglePomodoro}
              isCollapsed={false}
              onNavigate={() => onMobileOpenChange?.(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          <Link href="/dashboard" className="flex-1 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                'min-h-[44px] min-w-[44px]',
                pathname === '/dashboard' && [navItemColors['/dashboard'].activeBg, navItemColors['/dashboard'].text]
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/boards" className="flex-1 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                'min-h-[44px] min-w-[44px]',
                pathname.startsWith('/boards') && [navItemColors['/boards'].activeBg, navItemColors['/boards'].text]
              )}
            >
              <ClipboardList className="h-5 w-5" />
            </Button>
          </Link>
          {user.role === 'student' && (
            <div className="flex-1 flex justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  'min-h-[44px] min-w-[44px]',
                  showPomodoro && 'text-orange-500 bg-orange-500/10'
                )}
                onClick={handlePomodoroClick}
              >
                <Timer className="h-5 w-5" />
              </Button>
            </div>
          )}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <div className="flex-1 flex justify-center">
                <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
              <NotificationsPanel onClose={() => setShowNotifications(false)} />
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/settings" className="flex-1 flex justify-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                'min-h-[44px] min-w-[44px]',
                pathname === '/settings' && 'text-slate-500 bg-slate-500/10'
              )}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
