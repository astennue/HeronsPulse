'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { 
  Search, 
  Bell, 
  ChevronRight,
  Command,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  CheckCircle2,
  Clock,
  MessageSquare,
  Trophy,
  Menu,
  AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';

interface TopbarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
  unreadNotifications?: number;
  onMenuClick?: () => void;
}

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/boards': 'Boards',
  '/projects': 'Projects',
  '/analytics': 'Analytics',
  '/messages': 'Messages',
  '/leaderboard': 'Leaderboard',
  '/calendar': 'Calendar',
  '/settings': 'Settings',
};

// Mock notifications
const mockNotifications = [
  { id: '1', type: 'task_assigned', title: 'New Task Assigned', body: 'Literature Review has been assigned to you', time: '5 min ago', read: false },
  { id: '2', type: 'deadline', title: 'Deadline Approaching', body: 'System Architecture Design is due in 2 days', time: '1 hour ago', read: false },
  { id: '3', type: 'mention', title: 'You were mentioned', body: 'John mentioned you in a comment', time: '2 hours ago', read: true },
  { id: '4', type: 'achievement', title: 'Achievement Unlocked!', body: 'You earned the "Week Warrior" badge', time: '1 day ago', read: true },
];

export function Topbar({ user, unreadNotifications = 3, onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size on client side only - prevents hydration mismatch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutConfirm(false);
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  // Generate breadcrumb
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const label = pageNames[href] || part.charAt(0).toUpperCase() + part.slice(1);
    return { href, label };
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'deadline':
        return <Clock className="h-4 w-4 text-red-500" />;
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to boards with search query
      router.push(`/boards?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Get current page title for mobile
  const currentPageTitle = pageNames[pathname] || pathParts[pathParts.length - 1]?.charAt(0).toUpperCase() + pathParts[pathParts.length - 1]?.slice(1) || 'Dashboard';

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 md:px-6 gap-2 overflow-hidden">
      {/* Left Section */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden shrink-0 min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb - Hidden on very small screens */}
        <nav className="hidden sm:flex items-center gap-1 md:gap-2 text-sm min-w-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground px-2 h-8"
            onClick={() => router.push('/dashboard')}
          >
            Home
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <motion.div
              key={crumb.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-1 md:gap-2 min-w-0"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium truncate">{crumb.label}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground px-2 h-8"
                  onClick={() => router.push(crumb.href)}
                >
                  <span className="truncate">{crumb.label}</span>
                </Button>
              )}
            </motion.div>
          ))}
        </nav>

        {/* Mobile Page Title */}
        <span className="sm:hidden font-semibold text-base truncate">
          {currentPageTitle}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
        {/* Search - Using state instead of typeof window to prevent hydration mismatch */}
        <motion.div
          initial={false}
          animate={{ width: searchOpen ? (isMobile ? 180 : 280) : 40 }}
          className="relative hidden sm:block"
        >
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.form
                key="search-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSearch}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-12 h-10"
                  autoFocus
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false);
                  }}
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                  ESC
                </kbd>
              </motion.form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                className="relative min-h-[40px] min-w-[40px]"
              >
                <Search className="h-5 w-5" />
                <kbd className="absolute -bottom-1 -right-1 pointer-events-none hidden md:inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>
              </Button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/boards?search=true')}
          className="sm:hidden min-h-[44px] min-w-[44px]"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative min-h-[44px] min-w-[44px]">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </motion.span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs">
                Mark all read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[280px]">
              {mockNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className="mt-0.5 shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notification.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hidden md:flex min-h-[40px] min-w-[40px]"
        >
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full min-h-[44px] min-w-[44px]">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)]" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                <Badge variant="secondary" className="w-fit mt-1 capitalize text-xs">
                  {user.role?.replace('_', ' ')}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
              {theme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogoutClick}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogoutConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
