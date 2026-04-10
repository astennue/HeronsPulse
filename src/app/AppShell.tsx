'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { FloatingPomodoro } from '@/components/ui/floating-pomodoro';
import { PomodoroProvider, usePomodoro } from '@/contexts/PomodoroContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { showPomodoro, togglePomodoro } = usePomodoro();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [mounted, status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading HeronPulse...</p>
        </motion.div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Get user streak from session or use default
  const userStreak = (session.user as any).currentStreak || 12;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        user={session.user} 
        currentStreak={userStreak}
        unreadNotifications={3}
        showPomodoro={showPomodoro}
        onTogglePomodoro={togglePomodoro}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <motion.div 
        className={cn(
          "min-h-screen flex flex-col pb-16 md:pb-0 transition-all duration-200",
          sidebarCollapsed ? "md:ml-16" : "md:ml-[260px]"
        )}
      >
        <Topbar 
          user={session.user} 
          unreadNotifications={3} 
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </main>
      </motion.div>

      {/* Floating Pomodoro Timer */}
      <AnimatePresence>
        {showPomodoro && (
          <FloatingPomodoro 
            isVisible={showPomodoro} 
            onToggle={togglePomodoro} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PomodoroProvider>
      <AppShellContent>{children}</AppShellContent>
    </PomodoroProvider>
  );
}
