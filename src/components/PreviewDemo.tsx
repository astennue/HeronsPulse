'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle2, Circle, GripVertical, Sparkles, CheckCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DemoTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  isNew?: boolean;
  isDragging?: boolean;
}

const initialTasks: DemoTask[] = [
  { id: '1', title: 'Complete CS401 Assignment', completed: false, priority: 'high' },
  { id: '2', title: 'Review IT301 Notes', completed: false, priority: 'medium' },
  { id: '3', title: 'Team Project Meeting', completed: false, priority: 'high' },
];

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

type DemoPhase = 'idle' | 'adding' | 'dragging' | 'completing' | 'done';

export default function PreviewDemo() {
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const progress = (tasks.filter(t => t.completed).length / tasks.length) * 100;

  useEffect(() => {
    const runDemo = async () => {
      const sequence = async () => {
        // Reset
        setTasks(initialTasks);
        setPhase('idle');
        setNewTaskTitle('');
        setDraggedTaskId(null);
        setCompletingTaskId(null);
        setShowCheckmark(false);

        await new Promise(r => { timeoutRef.current = setTimeout(r, 1000); });

        // Phase 1: Adding a new task
        setPhase('adding');
        const newTaskText = 'Submit Lab Report';
        for (let i = 0; i <= newTaskText.length; i++) {
          setNewTaskTitle(newTaskText.slice(0, i));
          await new Promise(r => { timeoutRef.current = setTimeout(r, 80); });
        }
        await new Promise(r => { timeoutRef.current = setTimeout(r, 500); });
        
        const newTask: DemoTask = {
          id: '4',
          title: newTaskText,
          completed: false,
          priority: 'medium',
          isNew: true,
        };
        setTasks(prev => [...prev, newTask]);
        setNewTaskTitle('');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 800); });
        setTasks(prev => prev.map(t => ({ ...t, isNew: false })));

        // Phase 2: Dragging task to reorder
        setPhase('dragging');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 500); });
        setDraggedTaskId('4');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 600); });
        
        // Animate the drag - move task to top
        setTasks(prev => {
          const taskIndex = prev.findIndex(t => t.id === '4');
          const newTasks = [...prev];
          const [task] = newTasks.splice(taskIndex, 1);
          newTasks.unshift({ ...task, isDragging: true });
          return newTasks;
        });
        await new Promise(r => { timeoutRef.current = setTimeout(r, 700); });
        setDraggedTaskId(null);
        setTasks(prev => prev.map(t => ({ ...t, isDragging: false })));
        await new Promise(r => { timeoutRef.current = setTimeout(r, 500); });

        // Phase 3: Completing tasks
        setPhase('completing');
        
        // Complete first task
        setCompletingTaskId('4');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 400); });
        setTasks(prev => prev.map(t => t.id === '4' ? { ...t, completed: true } : t));
        await new Promise(r => { timeoutRef.current = setTimeout(r, 600); });

        // Complete second task
        setCompletingTaskId('1');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 400); });
        setTasks(prev => prev.map(t => t.id === '1' ? { ...t, completed: true } : t));
        await new Promise(r => { timeoutRef.current = setTimeout(r, 600); });

        // Complete third task
        setCompletingTaskId('2');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 400); });
        setTasks(prev => prev.map(t => t.id === '2' ? { ...t, completed: true } : t));
        await new Promise(r => { timeoutRef.current = setTimeout(r, 600); });

        // Complete last task
        setCompletingTaskId('3');
        await new Promise(r => { timeoutRef.current = setTimeout(r, 400); });
        setTasks(prev => prev.map(t => t.id === '3' ? { ...t, completed: true } : t));
        setCompletingTaskId(null);

        // Show completion
        setPhase('done');
        setShowCheckmark(true);
        await new Promise(r => { timeoutRef.current = setTimeout(r, 2000); });

        // Restart demo
        runDemo();
      };

      sequence();
    };

    const timer = setTimeout(runDemo, 1500);
    
    return () => {
      clearTimeout(timer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'adding':
        return { text: 'Adding a new task...', icon: Plus };
      case 'dragging':
        return { text: 'Drag to reorder priorities', icon: GripVertical };
      case 'completing':
        return { text: 'Click to mark as done', icon: CheckCircle2 };
      case 'done':
        return { text: 'All tasks completed!', icon: Sparkles };
      default:
        return { text: 'Watch the demo...', icon: null };
    }
  };

  const phaseInfo = getPhaseLabel();

  return (
    <div className="space-y-4">
      {/* Phase indicator */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        {phaseInfo.icon && (
          <phaseInfo.icon className="h-4 w-4 text-primary" />
        )}
        <span>{phaseInfo.text}</span>
      </motion.div>

      <Card className="bg-background/80 backdrop-blur-sm border-primary/20 overflow-hidden relative">
        {/* Animated border glow */}
        {phase !== 'idle' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(26, 86, 219, 0.1), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        )}

        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Today&apos;s Tasks</h3>
              {showCheckmark && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <Badge className="bg-green-500 text-white">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Done!
                  </Badge>
                </motion.div>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {tasks.filter(t => t.completed).length}/{tasks.length} done
            </Badge>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* New task input animation */}
          <AnimatePresence>
            {phase === 'adding' && newTaskTitle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-2"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
                  <Plus className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-muted-foreground">{newTaskTitle}</span>
                  <span className="animate-pulse">|</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tasks */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: task.isDragging ? 1.02 : 1,
                    boxShadow: task.isDragging ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    layout: { duration: 0.4, type: 'spring' },
                    opacity: { duration: 0.2 },
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    task.isDragging 
                      ? 'border-primary bg-primary/10 shadow-lg z-10' 
                      : 'border-border'
                  } ${
                    completingTaskId === task.id 
                      ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/30' 
                      : ''
                  } ${task.completed ? 'bg-green-500/5 border-green-500/30' : ''} ${
                    task.isNew ? 'ring-2 ring-primary/30' : ''
                  }`}
                >
                  <GripVertical className={`h-4 w-4 ${task.isDragging ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  <motion.div
                    initial={false}
                    animate={{ scale: task.completed ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </motion.div>
                  <span className={`flex-1 transition-all ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Plus className="h-3 w-3" />
          <span>Add Task</span>
        </div>
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3" />
          <span>Drag & Drop</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Mark Done</span>
        </div>
      </div>
    </div>
  );
}
