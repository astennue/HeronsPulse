# HeronPulse Academic OS - Role-Based Privileges System

## Overview

HeronPulse implements a comprehensive role-based access control (RBAC) system with three distinct user roles, each with unique privileges, duties, and novel features designed for the CCIS at University of Makati.

---

## 🎓 STUDENT ROLE

### Primary Purpose
Students are the primary users who manage their academic workload, collaborate on projects, and track their productivity using gamification elements.

### Core Privileges

#### Task Management
- ✅ Create, read, update, and delete their own tasks
- ✅ Assign tasks to themselves
- ✅ Organize tasks into projects they're members of
- ✅ Set task priorities, due dates, and estimated hours
- ✅ Create and complete subtasks
- ✅ Add comments to tasks they have access to

#### Project Participation
- ✅ View projects they are invited to
- ✅ Create new projects (become project owner)
- ✅ Invite other students to projects via email
- ✅ Collaborate on project boards (Kanban, Calendar, Gantt views)
- ✅ Create milestones and track progress
- ✅ Upload attachments to project tasks

#### Productivity Tools
- ✅ Access Pomodoro Timer with built-in ambient music/BGM
- ✅ Choose music genres (Lo-fi, Nature, Classical, Electronic, Jazz)
- ✅ Track focus sessions and breaks
- ✅ View personal analytics and productivity scores
- ✅ Set personal goals and track streaks

#### Communication
- ✅ Send and receive messages with team members
- ✅ Create and join channels within projects
- ✅ Mention other users in comments
- ✅ Receive notifications for mentions and assignments

#### Gamification
- ✅ Earn badges for achievements
- ✅ Compete on leaderboard with other students
- ✅ Track personal streaks and milestones
- ✅ View earned badges and points

### Restrictions
- ❌ Cannot view other students' private tasks
- ❌ Cannot modify tasks assigned by faculty
- ❌ Cannot access faculty dashboard or monitoring features
- ❌ Cannot manage system settings or users

### Novel Features

1. **Floating Pomodoro Timer** - Minimizable timer with built-in BGM
   - Genre selection: Lo-fi, Nature Sounds, Classical, Electronic, Jazz
   - Volume control and track selection
   - Session history tracking

2. **Academic Load Index (ALI) Widget** - Personal workload visualization
   - Real-time ALI score
   - Risk level indicator
   - Recommendations for workload management

3. **Streak & Achievement System**
   - Daily login streaks
   - Task completion streaks
   - Early submission bonuses
   - Special event badges

4. **Team Collaboration Hub**
   - Project chat rooms
   - File sharing
   - Team calendar
   - Email invitation system (prompts signup if no account)

---

## 👨‍🏫 FACULTY ROLE

### Primary Purpose
Faculty members monitor student progress, manage course-related projects, set academic goals, and intervene when students show signs of academic risk.

### Core Privileges

#### Student Monitoring (Primary Feature)
- ✅ View all students enrolled in their courses
- ✅ Monitor student ALI (Academic Load Index) scores
- ✅ Track student task completion rates
- ✅ View attendance patterns
- ✅ Identify at-risk students (High ALI score)
- ✅ Send alerts and messages to students
- ✅ Schedule consultations/meetings

#### Course Management
- ✅ Create and manage course projects
- ✅ Assign tasks to students
- ✅ Set deadlines and milestones
- ✅ Grade task completions (optional)
- ✅ Provide feedback on submissions

#### Analytics & Reporting
- ✅ View class-wide analytics
- ✅ Generate student performance reports
- ✅ Compare student progress across courses
- ✅ Export data for grading purposes

#### Communication
- ✅ Send messages to individual students
- ✅ Create course-wide announcements
- ✅ Respond to student queries
- ✅ Schedule meetings via calendar

### Restrictions
- ❌ Cannot access other faculty members' student data (unless department head)
- ❌ Cannot modify system settings
- ❌ Cannot create or manage users
- ❌ Cannot access Super Admin features

### Novel Features

1. **Student Risk Dashboard**
   - Real-time risk level indicators (Low, Moderate, High)
   - Color-coded student cards
   - Trend analysis (improving/stable/declining)
   - Quick action buttons for intervention

2. **ALI Monitoring System**
   - Academic Load Index tracking per student
   - Historical ALI trends
   - Predictive alerts for upcoming high-workload periods
   - Class average comparisons

3. **Goal Setting for Students**
   - Set academic goals for individual students
   - Track goal progress
   - Send encouragement/notifications
   - Milestone celebrations

4. **Attendance & Engagement Tracker**
   - View student login activity
   - Track task submission patterns
   - Identify disengaged students
   - Automated intervention triggers

5. **Performance Analytics**
   - Course-level performance charts
   - Student comparison metrics
   - Progress over time graphs
   - Exportable reports

---

## 🛡️ SUPER ADMIN ROLE

### Primary Purpose
Complete system control including user management, content management, security settings, and comprehensive analytics for institutional oversight.

### Core Privileges

#### User Management
- ✅ Create, read, update, delete any user account
- ✅ Assign roles to users (student, faculty, admin)
- ✅ Suspend or ban user accounts
- ✅ Reset user passwords
- ✅ View all user activity
- ✅ Manage user permissions

#### Content Management System (CMS)
- ✅ Create and edit system pages
- ✅ Manage help articles and documentation
- ✅ Update policies (Privacy, Terms of Service)
- ✅ Create and publish announcements
- ✅ Badge creation and management
- ✅ Achievement criteria configuration

#### System Configuration
- ✅ General settings (system name, institution, academic year)
- ✅ Security settings (password policies, session timeouts, 2FA)
- ✅ Notification settings
- ✅ Integration settings
- ✅ Theme and branding customization

#### Analytics & Monitoring
- ✅ System-wide analytics dashboard
- ✅ User activity metrics
- ✅ Performance statistics
- ✅ Storage and database management
- ✅ API usage monitoring

#### Audit & Security
- ✅ View comprehensive audit logs
- ✅ Filter logs by action, user, date
- ✅ Export audit reports
- ✅ Security incident tracking
- ✅ Login attempt monitoring

#### Faculty & Student Boards
- ✅ Faculty performance board
- ✅ Student performance board
- ✅ Leaderboard management
- ✅ Badge assignment

### Restrictions
- ❌ None - Full system access (with responsibility)

### Novel Features

1. **CMS Analytics Dashboard**
   - Real-time system statistics
   - User growth charts
   - Active sessions map
   - Storage usage metrics
   - API call statistics

2. **Badge & Achievement Creator**
   - Create custom badges with:
     - Name and description
     - Custom icon selection
     - Achievement criteria
     - Point values
     - Rarity levels
   - Award badges manually or automatically

3. **Comprehensive Audit System**
   - All user actions logged
   - Searchable and filterable
   - IP address tracking
   - Session management
   - Exportable reports

4. **Faculty Performance Board**
   - Faculty member rankings
   - Student satisfaction metrics
   - Course completion rates
   - Engagement scores

5. **Student Performance Board**
   - Top performers
   - Most improved students
   - Risk alerts summary
   - Achievement showcase

6. **System Health Monitor**
   - Server status indicators
   - Database health
   - Background job status
   - CDN status
   - Error rate tracking

---

## 🔐 Permission Matrix

| Feature | Student | Faculty | Super Admin |
|---------|:-------:|:-------:|:-----------:|
| **Tasks** |
| Create own tasks | ✅ | ✅ | ✅ |
| Edit own tasks | ✅ | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ | ✅ |
| Assign tasks to others | ❌ | ✅ | ✅ |
| View all tasks | ❌ | Course only | ✅ |
| **Projects** |
| Create projects | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ✅ |
| Delete projects | Owner only | ✅ | ✅ |
| View all projects | ❌ | Course only | ✅ |
| **Monitoring** |
| View own analytics | ✅ | ✅ | ✅ |
| View student ALI | ❌ | ✅ | ✅ |
| View all students | ❌ | Course only | ✅ |
| Set student goals | ❌ | ✅ | ✅ |
| **Communication** |
| Send messages | ✅ | ✅ | ✅ |
| Create announcements | ❌ | Course only | ✅ |
| System announcements | ❌ | ❌ | ✅ |
| **Admin** |
| Manage users | ❌ | ❌ | ✅ |
| System settings | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |
| Badge creation | ❌ | ❌ | ✅ |
| CMS management | ❌ | ❌ | ✅ |

---

## 📊 Dashboard Structure by Role

### Student Dashboard
1. Welcome card with streak and ALI score
2. Upcoming tasks overview
3. Project progress cards
4. Recent activity feed
5. Quick actions (New Task, New Project)
6. Pomodoro timer access
7. Leaderboard position
8. Earned badges showcase

### Faculty Dashboard
1. Student monitoring overview (primary)
   - Total students
   - Risk distribution (Low/Moderate/High)
   - Average ALI score
   - At-risk alerts
2. Student list with expandable details
3. Weekly ALI trend chart
4. Course workload comparison
5. Risk distribution pie chart
6. Quick actions (Set Goal, Message, Schedule Meeting)

### Super Admin Dashboard (CMS Analytics)
1. System statistics cards
   - Total users
   - Active projects
   - Server uptime
   - Database size
2. System health monitor
3. Recent activity feed
4. User management table
5. Audit log viewer
6. CMS content manager
7. Badge creator
8. Faculty & Student boards

---

## 🎯 Implementation Priority

### Phase 1: Core Role System
- [x] Database schema with UserRole enum
- [x] Role-based navigation filtering
- [x] Session role handling

### Phase 2: Role-Specific Features
- [ ] Student: Pomodoro with BGM
- [ ] Faculty: Student monitoring dashboard
- [ ] Admin: CMS and user management

### Phase 3: Advanced Features
- [ ] Badge system implementation
- [ ] Audit logging system
- [ ] Analytics dashboards

### Phase 4: Polish & Testing
- [ ] Permission enforcement
- [ ] UI/UX refinements
- [ ] Performance optimization
