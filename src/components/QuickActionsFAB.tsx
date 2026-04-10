'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ClipboardList, FolderPlus, CalendarPlus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface QuickActionsFABProps {
  onNewTask?: () => void;
  onNewProject?: () => void;
  onNewEvent?: () => void;
  onStartPomodoro?: () => void;
}

export default function QuickActionsFAB({
  onNewTask,
  onNewProject,
  onNewEvent,
  onStartPomodoro,
}: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: QuickAction[] = [
    {
      id: 'task',
      label: 'New Task',
      icon: <ClipboardList className="h-4 w-4" />,
      onClick: () => {
        onNewTask?.();
        setIsOpen(false);
      },
    },
    {
      id: 'project',
      label: 'New Project',
      icon: <FolderPlus className="h-4 w-4" />,
      onClick: () => {
        onNewProject?.();
        setIsOpen(false);
      },
    },
    {
      id: 'event',
      label: 'New Event',
      icon: <CalendarPlus className="h-4 w-4" />,
      onClick: () => {
        onNewEvent?.();
        setIsOpen(false);
      },
    },
    {
      id: 'pomodoro',
      label: 'Start Timer',
      icon: <Clock className="h-4 w-4" />,
      onClick: () => {
        onStartPomodoro?.();
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-14 sm:bottom-16 right-0 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 justify-end"
              >
                <span className="text-xs sm:text-sm font-medium bg-background/90 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-sm border">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full shadow-lg"
                  onClick={action.onClick}
                >
                  {action.icon}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="icon"
          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-xl transition-transform ${
            isOpen ? 'rotate-45' : ''
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Plus className="h-5 w-5 sm:h-6 sm:w-6" />}
        </Button>
      </motion.div>
    </div>
  );
}
