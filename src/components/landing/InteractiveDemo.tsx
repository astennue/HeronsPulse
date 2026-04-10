'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Plus, 
  Trash2, 
  GripVertical, 
  Sun, 
  Moon, 
  Palette,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface InteractiveDemoProps {
  mode: 'preview' | 'interactive';
}

// Demo task data for preview mode
const demoTasks: Task[] = [
  { id: '1', title: 'Complete CS401 Project Proposal', completed: true, priority: 'high' },
  { id: '2', title: 'Review Literature for Research', completed: false, priority: 'high' },
  { id: '3', title: 'Submit IT301 Assignment', completed: false, priority: 'medium' },
  { id: '4', title: 'Prepare for Midterm Exam', completed: false, priority: 'low' },
];

// Preview mode - animated demo with play controls
function PreviewDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const resetDemo = useCallback(() => {
    setCurrentStep(0);
    setVisibleTasks([]);
    setCompletedTasks(new Set());
  }, []);

  const togglePlay = useCallback(() => {
    if (!isPlaying) {
      // Starting playback - reset first
      resetDemo();
      // Small delay to ensure reset completes
      setTimeout(() => {
        setIsPlaying(true);
      }, 50);
    } else {
      setIsPlaying(false);
    }
  }, [isPlaying, resetDemo]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        
        if (newStep <= demoTasks.length) {
          // Add tasks one by one
          setVisibleTasks(demoTasks.slice(0, newStep));
        } else if (newStep <= demoTasks.length + 2) {
          // Complete some tasks
          const taskIndex = newStep - demoTasks.length - 1;
          if (taskIndex >= 0 && taskIndex < demoTasks.length) {
            const taskToComplete = demoTasks[taskIndex];
            if (taskToComplete && !taskToComplete.completed) {
              setCompletedTasks(prev => new Set([...prev, taskToComplete.id]));
            }
          }
        } else {
          // Demo complete - stop and reset
          setIsPlaying(false);
          return 0;
        }
        
        return newStep;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const displayTasks = visibleTasks.length > 0 ? visibleTasks : demoTasks;
  const completedCount = completedTasks.size + demoTasks.filter(t => t.completed).length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 min-h-[400px] relative overflow-hidden">
      {/* Demo Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-semibold">Quick Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPlaying ? 'default' : 'secondary'} className={isPlaying ? 'bg-green-500' : ''}>
            {isPlaying ? 'Playing...' : 'Preview Mode'}
          </Badge>
        </div>
      </div>

      {/* Task List Animation */}
      <div className="space-y-3 relative z-10">
        <AnimatePresence mode="popLayout">
          {displayTasks.map((task, index) => {
            const isCompleted = task.completed || completedTasks.has(task.id);
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg bg-card border transition-all duration-200',
                  isCompleted && 'opacity-60 bg-green-50/50 dark:bg-green-950/20'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{ scale: isCompleted ? 1 : 0.8 }}
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
                    isCompleted ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                  )}
                >
                  <AnimatePresence>
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className={cn('flex-1 transition-all', isCompleted && 'line-through text-muted-foreground')}>
                  {task.title}
                </span>
                <Badge 
                  variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 relative z-10">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Progress
          </span>
          <span>{completedCount} of {demoTasks.length} completed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / demoTasks.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
      </div>

      {/* Play Controls */}
      <div className="mt-6 flex items-center justify-center gap-3 relative z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={resetDemo}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          size="sm"
          onClick={togglePlay}
          className="gap-2 min-w-[120px]"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Play Demo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Interactive mode - users can try it with working drag and drop
function InteractiveDemoPanel() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete CS401 Project Proposal', completed: false, priority: 'high' },
    { id: '2', title: 'Review Literature for Research', completed: false, priority: 'medium' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const addTask = useCallback(() => {
    if (newTask.trim()) {
      setTasks(prev => [...prev, {
        id: Date.now().toString(),
        title: newTask,
        completed: false,
        priority: 'medium'
      }]);
      setNewTask('');
    }
  }, [newTask]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Drag and drop handlers using HTML5 Drag API
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedId) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData('text/plain');
    
    if (dragId && dragId !== dropId) {
      setTasks(prev => {
        const newTasks = [...prev];
        const dragIndex = newTasks.findIndex(t => t.id === dragId);
        const dropIndex = newTasks.findIndex(t => t.id === dropId);
        
        if (dragIndex !== -1 && dropIndex !== -1) {
          const [draggedTask] = newTasks.splice(dragIndex, 1);
          newTasks.splice(dropIndex, 0, draggedTask);
        }
        
        return newTasks;
      });
    }
    
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-muted/30 min-h-[400px]">
      {/* Demo Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-semibold">Try It Yourself!</span>
        </div>
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Interactive
        </Badge>
      </div>

      {/* Add Task Input */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          className="flex-1"
        />
        <Button onClick={addTask} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Task List with Drag and Drop */}
      <div className="space-y-2 mb-4 min-h-[150px]">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={(e) => handleDragOver(e, task.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, task.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-card border cursor-grab active:cursor-grabbing transition-all duration-150',
                task.completed && 'opacity-60 bg-green-50/50 dark:bg-green-950/20',
                draggedId === task.id && 'opacity-50 scale-[0.98] border-dashed',
                dragOverId === task.id && draggedId !== task.id && 'border-primary border-2 bg-primary/5'
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  task.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground hover:border-primary'
                )}
              >
                <AnimatePresence>
                  {task.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <span className={cn('flex-1 text-left truncate', task.completed && 'line-through text-muted-foreground')}>
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No tasks yet. Add one above!</p>
          <p className="text-xs mt-1">Drag and drop to reorder tasks</p>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Progress
          </span>
          <span>{completedCount} of {tasks.length} completed</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: tasks.length > 0 ? `${(completedCount / tasks.length) * 100}%` : '0%' }}
            transition={{ duration: 0.3 }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        <p>💡 Tip: Drag tasks to reorder them</p>
      </div>

      {/* Theme Switcher Demo */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-2">Try different themes (use the theme switcher above!):</p>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-2">
            <Sun className="h-4 w-4" />
            Light
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Vibrant
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InteractiveDemo({ mode }: InteractiveDemoProps) {
  return (
    <div className="relative">
      {mode === 'preview' ? <PreviewDemo /> : <InteractiveDemoPanel />}
    </div>
  );
}
