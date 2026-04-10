'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Clock, Award, AlertCircle, Bell } from 'lucide-react';

interface Notification {
  id: number;
  type: 'deadline' | 'grade' | 'meeting' | 'overdue';
  title: string;
  time: string;
}

const notifications: Notification[] = [
  { id: 1, type: 'deadline', title: 'CS401 Assignment Due', time: 'Tomorrow' },
  { id: 2, type: 'grade', title: 'IT301 Grade Posted', time: 'Just now' },
  { id: 3, type: 'meeting', title: 'Team Meeting at 3PM', time: 'In 2 hours' },
  { id: 4, type: 'overdue', title: 'Research Paper Overdue', time: '2 days ago' },
];

const icons = {
  deadline: Clock,
  grade: Award,
  meeting: Bell,
  overdue: AlertCircle,
};

const colors = {
  deadline: 'bg-blue-500',
  grade: 'bg-green-500',
  meeting: 'bg-purple-500',
  overdue: 'bg-red-500',
};

export default function FloatingNotificationCard() {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (visibleNotifications.length < 2) {
        setVisibleNotifications((prev) => [...prev, notifications[currentIndex]]);
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
      } else {
        // Remove oldest and add new
        setVisibleNotifications((prev) => {
          const newNotif = notifications[currentIndex];
          setCurrentIndex((prev) => (prev + 1) % notifications.length);
          return [prev[1], newNotif];
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, visibleNotifications.length]);

  return (
    <div className="fixed right-4 top-20 z-40 space-y-2 pointer-events-none">
      <AnimatePresence>
        {visibleNotifications.map((notif, index) => {
          const Icon = icons[notif.type];
          return (
            <motion.div
              key={`${notif.id}-${index}`}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-background/90 backdrop-blur-md border rounded-lg p-3 shadow-lg min-w-[200px] max-w-[250px]"
            >
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded-full ${colors[notif.type]}`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
