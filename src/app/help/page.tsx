'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Video,
  FileText,
  Settings,
  Users,
  BarChart3,
  Calendar,
  Target,
  Award,
  Zap,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    faqs: [
      {
        question: 'How do I create a HeronPulse account?',
        answer: `To create an account:

1. Go to the HeronPulse login page
2. Click "Sign In" and use your @umak.edu.ph email
3. For demo purposes, use the provided demo credentials on the login page

Only University of Makati students and faculty with valid @umak.edu.ph email addresses can create accounts.`
      },
      {
        question: 'What are the different user roles?',
        answer: `HeronPulse has three user roles:

**Student**: Access to personal task management, Pomodoro timer, analytics, calendar, and team collaboration features.

**Faculty**: All student features plus class management, student monitoring, intervention tools, and badge awarding capabilities.

**Super Admin**: Full system administration including user management, badge creation, scheduled reports, and system settings.`
      },
      {
        question: 'How do I navigate the application?',
        answer: `Use the sidebar on the left to navigate between sections:

- **Dashboard**: Overview of your academic progress
- **Boards**: Task management with Kanban, Calendar, Gantt, and List views
- **Projects**: Manage your academic projects
- **Analytics**: View detailed performance insights
- **Messages**: Communicate with team members
- **Leaderboard**: See rankings and achievements
- **Calendar**: Schedule and deadlines view

On mobile, use the bottom navigation bar or the hamburger menu.`
      }
    ]
  },
  {
    id: 'tasks-projects',
    title: 'Tasks & Projects',
    icon: Target,
    faqs: [
      {
        question: 'How do I create a new task?',
        answer: `To create a new task:

1. Click the "New Task" button on the Dashboard or Boards page
2. Fill in the task details:
   - Title and description
   - Status (Backlog, To Do, In Progress, In Review, Done)
   - Priority (Urgent, High, Medium, Low)
   - Due date and course code
   - Estimated hours
   - Assignees (tag team members)
3. Click "Create Task" to save

You can also create tasks from the Boards page using the Kanban columns.`
      },
      {
        question: 'What is the Academic Load Index (ALI)?',
        answer: `The Academic Load Index (ALI) is a score from 0-100 that measures your current workload:

**0-40 (Low Risk)**: Manageable workload. Great time to take on additional tasks.

**41-70 (Moderate Risk)**: Busier period ahead. Consider prioritizing and delegating.

**71-100 (High Risk)**: Heavy workload. Focus on completing existing tasks before adding new ones.

The ALI is calculated based on:
- Task density (number of tasks and deadlines)
- Assessment intensity (upcoming exams and submissions)
- Deadline clustering (how close deadlines are to each other)
- Research load (ongoing research and thesis work)`
      },
      {
        question: 'How do I use the different board views?',
        answer: `HeronPulse offers four board views:

**Kanban View**: Drag and drop tasks between status columns (Backlog, To Do, In Progress, In Review, Done). Great for visual workflow management.

**List View**: See all tasks in a table format with sortable columns. Best for quick scanning and filtering.

**Calendar View**: Tasks displayed on a calendar by due date. Perfect for deadline planning.

**Gantt View**: Timeline view showing task duration and overlaps. Ideal for project planning and resource management.

Switch between views using the tabs at the top of the Boards page.`
      }
    ]
  },
  {
    id: 'gamification',
    title: 'Gamification & Achievements',
    icon: Award,
    faqs: [
      {
        question: 'How do I earn badges?',
        answer: `Badges are awarded for various achievements:

**Automatic Badges**:
- Week Warrior: Complete tasks for 7 consecutive days
- Early Bird: Submit tasks before the deadline
- Deadline Destroyer: Meet all deadlines in a month

**Manual Badges**:
- Faculty can award badges for exceptional performance
- Super Admin can create custom badges

Check your earned badges in Settings > Profile or on the Leaderboard page.`
      },
      {
        question: 'What are streaks and how do they work?',
        answer: `Streaks track your daily activity:

- Complete at least one task per day to maintain your streak
- The streak counter increases each consecutive day
- Missing a day resets your streak to 0
- Your longest streak is also tracked

Streaks contribute to:
- Your overall productivity score
- Leaderboard rankings
- Badge eligibility (like Week Warrior)

The fire icon next to your name shows your current streak.`
      },
      {
        question: 'How does the leaderboard work?',
        answer: `The leaderboard ranks students by points:

**Earning Points**:
- Complete tasks: +10 points
- Meet deadlines: +5 bonus points
- Early submission: +10 bonus points
- Earn badges: +20-200 points (by rarity)

**Time Periods**:
- This Week: Rankings reset weekly
- This Month: Rankings reset monthly
- All Time: Cumulative ranking

**Top Performers**:
- Top 3 get special recognition on the podium
- Achievements are highlighted in profiles`
      }
    ]
  },
  {
    id: 'faculty-features',
    title: 'Faculty Features',
    icon: Users,
    faqs: [
      {
        question: 'How do I create and manage classes?',
        answer: `Faculty can create up to 10 classes:

1. Go to Faculty Board > My Classes
2. Click "New Class"
3. Enter class details:
   - Class name and subject code
   - Schedule and room
4. Students can be added to classes

**Class Features**:
- View enrolled students
- Monitor average ALI scores
- See at-risk student counts
- Send class-wide interventions`
      },
      {
        question: 'How do I monitor student progress?',
        answer: `The Student Monitor shows real-time data for each student:

**Metrics Tracked**:
- Academic Load Index (ALI)
- Tasks completed vs. pending
- Overdue tasks
- Login frequency
- Deadline compliance

**Risk Levels**:
- Green (Low): Student is on track
- Yellow (Moderate): Needs attention
- Red (High): Requires intervention

**Actions**:
- View detailed student profile
- Send intervention message
- Award badges
- Schedule meetings`
      },
      {
        question: 'How do I send interventions to students?',
        answer: `Interventions help support at-risk students:

**Intervention Types**:
- Warning: Alert about concerning trends
- Support: Offer help and resources
- Meeting: Request a consultation
- Reminder: Gentle nudge about deadlines

**To Send**:
1. Select a student or use Quick Actions
2. Choose intervention type
3. Write subject and message
4. Optionally tag other faculty
5. Send intervention

Students receive interventions in their notification center.`
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    icon: HelpCircle,
    faqs: [
      {
        question: 'Why am I not receiving notifications?',
        answer: `Check these settings:

1. **Browser Notifications**:
   - Click the lock icon in your browser address bar
   - Allow notifications for HeronPulse

2. **In-App Settings**:
   - Go to Settings > Notifications
   - Enable the notification types you want

3. **Email Notifications**:
   - Verify your email in Settings > Profile
   - Check spam/junk folder

If issues persist
 try logging out and back in
 or clear your browser cache.`
      },
      {
        question: 'The app is running slowly. What can I do?',
        answer: `Try these solutions:

1. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete

2. **Disable Extensions**:
   - Some browser extensions can slow down web apps
   - Try in an incognito/private window

3. **Check Internet Connection**:
   - Slow internet can affect real-time features
   - Try a different network

4. **Browser Compatibility**:
   - Use Chrome, Firefox, Edge, or Safari (latest versions)
   - Update your browser if needed`
      },
      {
        question: 'How do I change my password or update my profile?',
        answer: `**Update Profile**:
1. Go to Settings > Profile
2. Edit your display name and bio
3. Upload a new avatar (max 10MB)
4. Click "Save Changes"

**Change Password**:
1. Go to Settings > Security
2. Enter your current password
3. Enter and confirm your new password (min 8 characters)
4. Click "Update Password"

**Account Deletion**:
- Go to Settings > Security > Danger Zone
- Click "Delete Account"
- This action is irreversible`
      }
    ]
  }
];

const quickLinks = [
  { title: 'User Guide', icon: BookOpen, href: '#getting-started', description: 'Learn the basics of HeronPulse' },
  { title: 'Video Tutorials', icon: Video, href: '#', description: 'Watch step-by-step guides' },
  { title: 'Contact Support', icon: MessageCircle, href: '#', description: 'Get help from our team' },
  { title: 'Report a Bug', icon: AlertCircle, href: '#', description: 'Help us improve HeronPulse' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredFaqs = searchQuery.trim() 
    ? faqCategories.map(cat => ({
        ...cat,
        faqs: cat.faqs.filter(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.faqs.length > 0)
    : faqCategories;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.png" 
              alt="HeronPulse Logo" 
              width={32} 
              height={32}
              className="h-8 w-auto"
            />
            <span className="font-bold text-lg">HeronPulse</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary/5 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold">How can we help you?</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions, learn how to use HeronPulse features
 and get support when you need it.
            </p>
            {/* Mobile Search */}
            <div className="relative sm:hidden mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:border-primary/50">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <link.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{link.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          {filteredFaqs.map((category, catIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.faqs.length} questions</CardDescription>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="pt-0">
                        <Separator className="mb-4" />
                        <Accordion type="single" collapsible className="w-full">
                          {category.faqs.map((faq, faqIndex) => (
                            <AccordionItem key={faqIndex} value={`${category.id}-${faqIndex}`}>
                              <AccordionTrigger className="text-left">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                                  {faq.answer}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground text-sm">
                Try different keywords or browse the categories above
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Still need help?</h2>
            <p className="text-muted-foreground mb-4">
              Our support team is available Monday-Friday, 8:00 AM - 5:00 PM PHT
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Community Forum
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Email: support@heronpulse.umak.edu.ph
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>2025 HeronPulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/legal" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/help" className="hover:text-foreground">Help Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
