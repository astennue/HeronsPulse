# HeronPulse - Detailed Figma Design Prompts

## 🎨 Global Design System

### Color Palette

#### Light Mode (Default)
- **Background**: `#F8FAFC` (Slate 50)
- **Foreground**: `#0F172A` (Slate 900)
- **Card**: `#FFFFFF`
- **Primary**: `#1A56DB` (UMak Blue)
- **Primary Light**: `#3B82F6` (Blue 500)
- **Accent**: `#F59E0B` (Amber 500 - Gold)
- **Muted**: `#F1F5F9` (Slate 100)
- **Muted Foreground**: `#64748B` (Slate 500)
- **Border**: `#E2E8F0` (Slate 200)
- **Success**: `#10B981` (Emerald 500)
- **Warning**: `#F59E0B` (Amber 500)
- **Danger**: `#EF4444` (Red 500)

#### Dark Mode
- **Background**: `#0A0F1E` (Deep Navy)
- **Foreground**: `#F9FAFB` (Slate 50)
- **Card**: `#111827` (Slate 900)
- **Primary**: `#3B82F6` (Blue 500)
- **Muted**: `#1F2937` (Slate 800)
- **Border**: `#374151` (Slate 700)

#### Vibrant Mode
- **Background**: `#FAFBFC`
- **Primary**: `#2563EB` (Blue 600)
- **Accent**: `#FBBF24` (Amber 400)

### Feature Colors (Navigation & Icons)
- Dashboard: `#3B82F6` (Blue)
- Boards/Tasks: `#10B981` (Green)
- Projects: `#F59E0B` (Amber)
- Analytics: `#8B5CF6` (Purple)
- Timer: `#F97316` (Orange)
- Calendar: `#EC4899` (Pink)
- Leaderboard: `#EAB308` (Yellow)
- Admin: `#EF4444` (Red)

### Typography
- **Headings**: Metropolis (Bold, 700)
- **Body**: Inter (Regular, 400; Medium, 500)
- **Font Sizes**:
  - H1: 48-60px (3rem-3.75rem)
  - H2: 36-48px (2.25rem-3rem)
  - H3: 24-30px (1.5rem-1.875rem)
  - Body: 14-16px (0.875rem-1rem)
  - Small: 12-14px (0.75rem-0.875rem)

### Border Radius
- **Default**: 10px (0.625rem)
- **Small**: 6px
- **Large**: 14px
- **Full**: 9999px (rounded-full)

### Shadows
- **Card**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **Hover**: `0 12px 24px -8px rgba(0, 0, 0, 0.15)`
- **Glass Card**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`

### Glassmorphism
- **Background**: `rgba(255, 255, 255, 0.8)`
- **Blur**: 16px
- **Border**: `rgba(255, 255, 255, 0.3)`

### Animations
- **Duration**: 200-500ms
- **Easing**: `ease-out`, `ease-in-out`
- **Hover Lift**: `translateY(-4px)`
- **Scale**: `scale(1.02-1.1)`
- **Fade**: `opacity 0 → 1`

---

## 📄 Page-by-Page Specifications

---

## 1. Landing Page (/)

### Splash Screen
- Full-screen white background
- Centered logo (120x120px)
- Logo animation: Scale 0.8 → 1.1 → 1, then fade out
- Progress bar at bottom (4px height, primary color)
- Duration: 2 seconds
- Text: "HeronPulse" below logo (Metropolis Bold, 24px)

### Navigation Bar (Fixed)
- **Height**: 56-64px
- **Background**: `rgba(255, 255, 255, 0.8)` with `backdrop-blur: 16px`
- **Border-bottom**: 1px solid `#E2E8F0`
- **Layout**: 
  - Left: Logo (32-40px) + "HeronPulse" text
  - Right: Theme Switcher icon + "Sign In" ghost button + "Get Started" primary button

### Hero Section
- **Padding**: 128px top, 64px bottom
- **Layout**: 2-column grid (equal width on desktop)
- **Left Column**:
  - Large logo (64-96px) with pulse animation
  - Badge: "Academic Work Operating System" (pill shape, primary bg)
  - H1: "Your Academic Workflow, Elevated." with gradient text
  - Description: 16-18px, muted color
  - CTA buttons: "Start Now" (primary) + "Explore Features" (outline)
  - Live indicator: Green pulsing dot + "X students online"
- **Right Column**:
  - Floating device mockups (desktop, tablet, mobile)
  - Glassmorphism cards with feature badges
  - Background glow: Gradient radial

### Interactive Demo Section
- Two tabs: "Watch Demo" | "Try It"
- **Preview Mode**: Animated task list with progress bar
- **Interactive Mode**: Working task list with drag-and-drop
- Card: Glass effect, border 2px primary/20

### Stats Grid
- 4-column grid
- Glassmorphism cards with icons
- Animated counters
- Hover: Scale 1.05, lift -4px

### Features Section
- Background: `#F1F5F9` (muted/30)
- 3-column grid (responsive: 1 → 2 → 3)
- **Card Dimensions**: min-height 200px, uniform
- Each card:
  - Icon container: 48x48px, rounded-lg, colored background (10% opacity)
  - Number badge: 24x24px circle, top-right
  - Title: 18px bold
  - Description: 14px muted
- Hover: Border primary/20, icon scale 1.1

### How It Works Section
- 4-column grid
- **Card Dimensions**: min-height 220px, uniform
- Each card:
  - Step number: 48x48px circle, colored (blue/purple/green/yellow)
  - Icon circle: 48-56px, primary/10 background
  - Title: 18px bold
  - Description: 14px muted
- Connector lines between cards (desktop only)

### CTA Section
- Background: `rgba(26, 86, 219, 0.05)` (primary/5)
- Floating shapes background
- Center-aligned content
- Large "Start Now" button with shimmer effect
- Note: "Only @umak.edu.ph accounts allowed"

### Footer
- Border-top: 1px solid border color
- 3-column layout (responsive)
- Left: Logo + "HeronPulse Academic OS"
- Center: Links (Privacy, Terms, Help)
- Right: Copyright text
- Padding: 48px vertical

---

## 2. Login Page (/login)

### Layout
- Split-screen: 60/40 ratio
- **Left Panel** (hidden on mobile/tablet):
  - Gradient: `#1A56DB` → `#3B82F6` → `#1A56DB`
  - Floating shapes, particles, grid pattern overlay
  - Content:
    - Logo + "HeronPulse" (white text)
    - H1: "Your Academic Workflow, Elevated."
    - Typewriter effect on "Elevated."
    - Live stats (3 columns)
    - Feature cards at bottom (glassmorphism)
  - Gradient overlay at bottom

### Right Panel - Login Form
- Centered content, max-width 400px
- Theme switcher at top-right
- Mobile logo (visible only on mobile)
- **Login Card**:
  - Gradient stripe at top (primary → purple → pink, 4px height)
  - Title: "Welcome back"
  - Subtitle: "Sign in to your account to continue"
  - Email input with icon
  - Password input with show/hide toggle
  - "Remember me" checkbox + "Forgot password?" link
  - "Sign In" button (full width, with shimmer on hover)
  - Divider: "Or continue with"
  - Google Sign-In button (outline style)
  - Footer text: "@umak.edu.ph only" with green check
  - Online indicator: Pulsing green dot + count

---

## 3. Dashboard (/dashboard) - Student View

### App Shell
- **Sidebar** (260px width, collapsible to 64px):
  - Logo area: 64px height
  - User profile: Avatar, name, role badge, streak indicator
  - Navigation items with colored icons
  - Tools section: Pomodoro timer, Notifications
  - Quick tips card
  - Footer: Settings, Theme toggle, Logout

- **Topbar** (56-64px height):
  - Left: Breadcrumb navigation
  - Right: Search, Notifications bell, Theme toggle, User menu

- **Main Content**:
  - Padding: 16-24px
  - Animation: Fade in, translateY 16px

### Dashboard Content
- **Welcome Banner**:
  - Glassmorphism card
  - Greeting + motivational message
  - Streak badge (orange/fire themed)

- **Smart Suggestions Panel**:
  - Yellow lightbulb icon
  - Suggestion chips with priority colors

- **Stats Grid** (4 columns):
  - ALI Gauge: Semi-circular gauge with animated needle
  - Completed Tasks: Green icon, counter
  - In Progress: Blue icon, progress bar
  - Overdue: Red pulsing icon
  - Upcoming: Calendar icon

- **Charts Row** (2 columns):
  - Weekly Progress: Line chart with gradient fill
  - Task Distribution: Donut chart with legend

- **Content Grid**:
  - Recent Tasks: Scrollable list, priority borders
  - Productivity Score: Large number with progress bar
  - Recent Activity: Timeline with icons

- **Floating Action Button**:
  - Bottom-right, 56px circle
  - Expands to show "New Task" and "Start Timer"

---

## 4. Dashboard (/dashboard) - Faculty View

### Differences from Student
- **Navigation**: Additional "Faculty Board" item
- **No Pomodoro Timer** in sidebar
- **Dashboard Content**:
  - Classes overview instead of personal tasks
  - Student progress cards
  - Assignment management quick actions
  - Class schedule summary

---

## 5. Dashboard (/dashboard) - Super Admin View

### Additional Navigation
- "Admin Panel" item (red accent)

### Dashboard Content
- System-wide statistics
- User activity charts
- Risk alerts section
- Quick management actions

---

## 6. Projects Page (/projects)

### Header
- Title: "Projects" or "All Projects Overview" (admin)
- "New Project" button (not for admin)

### Admin Stats Row
- Total Projects, Active, Completed, Average Progress

### Filters
- Status filter buttons: All | Active | Completed | Archived
- Owner filter (admin only): All Users | Students | Faculty
- Search input with icon

### Projects Grid
- 3-column grid (responsive)
- **Project Card**:
  - Icon container: 40px, emoji, colored background
  - Title: 16px bold
  - Course code badge
  - Description: 2-line clamp
  - Progress bar: 8px height
  - Stats: Tasks completed, Due date
  - Status badge (colored)
  - Member avatars (stacked)
- Hover: Scale 1.01, shadow enhancement

---

## 7. Boards Page (/boards)

### Layout
- Full-width Kanban board
- Horizontal scroll on mobile

### Columns
- Backlog, To Do, In Progress, In Review, Done
- **Column Styling**:
  - Gradient backgrounds (different per column)
  - Column header: Icon, title, count
  - Add task button at bottom

### Task Cards
- Priority border-left (4px colored)
- Title, course badge, due date
- Drag handle on hover

---

## 8. Analytics Page (/analytics)

### Charts Section
- Productivity trend: Line/area chart
- Task completion: Bar chart
- Risk distribution: Pie chart
- Course performance: Horizontal bar

### Stats Cards
- Key metrics with trend indicators
- Comparison to previous period

---

## 9. Calendar Page (/calendar)

### Layout
- Full calendar grid
- Sidebar with upcoming events
- Event types with color coding

---

## 10. Leaderboard Page (/leaderboard)

### Layout
- Top 3 podium display
- Full rankings table
- Filters: Weekly | Monthly | All Time

### User Cards
- Avatar, name, points, streak
- Badges earned
- Rank number

---

## 11. Settings Page (/settings)

### Tabs
- Profile, Notifications, Appearance, Privacy

### Profile Tab
- Avatar upload
- Name, email, bio fields
- Course selection

---

## 12. Admin Panel (/admin) - Super Admin Only

### Tabs
- Dashboard, Users, Students, Faculty, Badges, Reports

### Dashboard Tab
- System stats cards
- Weekly activity chart
- Risk distribution pie chart
- High-risk students alert section

### Users Tab
- Search and filter bar
- Role/Status dropdowns
- Bulk action button
- User table with:
  - Checkbox for selection
  - Avatar, name, email
  - Role badge (colored)
  - Status badge
  - Last login date
  - Action buttons (View, Edit, More)

### Students Tab
- Top performers list
- Most improved
- Risk distribution

### Faculty Tab
- Faculty cards with class count
- Student count per faculty

### Badges Tab
- Badge management
- Create/Edit badge modal
- Badge rarity colors

### Reports Tab
- Scheduled reports list
- Create report modal
- Export options

---

## 🎭 Animation Specifications

### Page Transitions
- Fade in: 300ms ease-out
- Fade out: 200ms ease-in
- Scale: 0.98 → 1

### Hover Effects
- **Cards**: translateY(-4px), shadow increase, 200ms
- **Buttons**: Scale 1.02, shimmer effect
- **Icons**: Scale 1.1, rotate 10-15deg

### Loading States
- Skeleton with shimmer animation
- Spinner: 1s linear infinite rotation

### Micro-interactions
- Checkboxes: Scale bounce on check
- Counters: Count up animation 1.5s
- Progress bars: Width animation 0.5s

---

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Sidebar becomes bottom navigation
- Cards stack vertically
- Tables become card lists
- Reduced padding/margins
- Touch-friendly targets (44px min-height)

---

## 🔔 Notification System

### Toast Notifications
- Position: Bottom-right (desktop), Top (mobile)
- Duration: 4-5 seconds
- Animation: Slide in from right
- Types: Success (green), Error (red), Warning (yellow), Info (blue)

### Badge/Indicator
- Red dot with count
- Pulse animation for new notifications

---

## 🎨 Component Library

### Buttons
- Primary: Solid primary color, white text
- Secondary: Muted background
- Outline: Border only
- Ghost: No background
- Sizes: sm (32px), md (40px), lg (48px)

### Inputs
- Height: 44-48px
- Border: 1px solid border color
- Focus: 2px ring primary/20
- Icons: Left-aligned, 16-20px

### Cards
- Background: Card color
- Border: 1px solid border
- Radius: 10px (lg)
- Shadow: Default shadow
- Hover: Enhanced shadow

### Badges
- Pill shape (rounded-full)
- Sizes: xs, sm, md, lg
- Variants: default, secondary, outline, destructive

### Avatars
- Sizes: xs (24px), sm (32px), md (40px), lg (48px)
- Fallback: Primary background, white text, initials

---

This comprehensive design system should provide everything needed to recreate the HeronPulse interface in Figma with pixel-perfect accuracy.
