'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Clock, Target, AlertTriangle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Suggestion {
  id: string;
  type: 'deadline' | 'focus' | 'overdue' | 'goal';
  title: string;
  description: string;
  action: string;
}

const suggestions: Suggestion[] = [
  {
    id: '1',
    type: 'deadline',
    title: 'Deadline Approaching',
    description: 'CS401 Assignment due in 2 days',
    action: 'Start Now',
  },
  {
    id: '2',
    type: 'focus',
    title: 'Focus Time Suggested',
    description: 'You have 3 tasks in progress',
    action: 'Focus Mode',
  },
  {
    id: '3',
    type: 'overdue',
    title: 'Overdue Task',
    description: 'Research Paper was due yesterday',
    action: 'View Task',
  },
];

const icons = {
  deadline: Clock,
  focus: Target,
  overdue: AlertTriangle,
  goal: Target,
};

const colors = {
  deadline: 'text-blue-500 bg-blue-500/10',
  focus: 'text-purple-500 bg-purple-500/10',
  overdue: 'text-red-500 bg-red-500/10',
  goal: 'text-green-500 bg-green-500/10',
};

export default function SmartSuggestions() {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2 sm:space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = icons[suggestion.type];
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors group"
              >
                <div className={`p-1.5 sm:p-2 rounded-lg ${colors[suggestion.type]}`}>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs sm:text-sm truncate">{suggestion.title}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{suggestion.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 h-7 sm:h-8 text-[10px] sm:text-xs opacity-70 group-hover:opacity-100">
                  {suggestion.action}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
