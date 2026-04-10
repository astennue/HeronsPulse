-- ============================================
-- HeronPulse Academic OS - Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('student', 'faculty', 'super_admin');
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "TaskStatus" AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done');
CREATE TYPE "TaskPriority" AS ENUM ('urgent', 'high', 'medium', 'low');
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'completed', 'on_hold', 'archived');
CREATE TYPE "NotificationType" AS ENUM ('task_assigned', 'deadline_approaching', 'mention', 'comment_reply', 'milestone_due', 'achievement_unlocked', 'workload_alert', 'intervention_sent', 'badge_awarded');
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Moderate', 'High');
CREATE TYPE "BadgeRarity" AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE "ReportFrequency" AS ENUM ('weekly', 'monthly');
CREATE TYPE "ReportFormat" AS ENUM ('pdf', 'csv', 'excel');
CREATE TYPE "InterventionStatus" AS ENUM ('pending', 'acknowledged', 'resolved');

-- Create Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'student',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "courseCodes" TEXT NOT NULL DEFAULT '',
    "bio" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "deadlinesMet" INTEGER NOT NULL DEFAULT 0,
    "earlySubmissions" INTEGER NOT NULL DEFAULT 0,
    "commentsMade" INTEGER NOT NULL DEFAULT 0,
    "researchCompleted" INTEGER NOT NULL DEFAULT 0,
    "productivityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "courseCode" TEXT,
    "color" TEXT NOT NULL DEFAULT '#1A56DB',
    "icon" TEXT NOT NULL DEFAULT '📁',
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- Create Project Members Table
CREATE TABLE IF NOT EXISTS "project_members" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Boards Table
CREATE TABLE IF NOT EXISTS "boards" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "boards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "boards_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "boards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "boardId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "priority" "TaskPriority" NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "tags" TEXT NOT NULL DEFAULT '',
    "courseCode" TEXT,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "actualHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tasks_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Task Assignees Table
CREATE TABLE IF NOT EXISTS "task_assignees" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "task_assignees_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "task_assignees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Badges Table
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "rarity" "BadgeRarity" NOT NULL DEFAULT 'common',
    "points" INTEGER NOT NULL DEFAULT 0,
    "criteria" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- Create User Badges Table
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "awardedById" TEXT,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "reason" TEXT,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Workload Data Table
CREATE TABLE IF NOT EXISTS "workload_data" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "recordedDate" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    "taskDensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assessmentIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deadlineClustering" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "researchLoad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aliScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'Low',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
    CONSTRAINT "workload_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workload_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "task_assignees_taskId_userId_key" ON "task_assignees"("taskId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- ============================================
-- INSERT DEMO ACCOUNTS
-- Password hash function (same as in auth.ts)
-- ============================================

-- Insert Demo Users
INSERT INTO "users" ("email", "password", "displayName", "role", "bio", "isOnline", "currentStreak", "longestStreak", "tasksCompleted", "deadlinesMet", "productivityScore")
VALUES 
    ('reinernuevas.acads@gmail.com', '1b5d9e0c', 'Reiner Nuevas', 'student', 'Computer Science student at University of Makati', true, 12, 15, 45, 42, 1250),
    ('faculty.demo@umak.edu.ph', '1f8e2a7b', 'Prof. Demo Faculty', 'faculty', 'Faculty member at CCIS, University of Makati', true, 1, 3, 5, 5, 150),
    ('superadmin@heronpulse.demo', '2c3f5a8d', 'HeronPulse Admin', 'super_admin', 'System Administrator', true, 0, 0, 0, 0, 0)
ON CONFLICT ("email") DO UPDATE SET
    "displayName" = EXCLUDED."displayName",
    "role" = EXCLUDED."role",
    "password" = EXCLUDED."password";

-- Create a demo project
INSERT INTO "projects" ("id", "name", "description", "ownerId", "status", "courseCode", "progress")
SELECT 'demo-project-1', 'CS Capstone Project 2026', 'Final year capstone project for CCIS', u.id, 'active', 'CS401', 35
FROM "users" u WHERE u.email = 'faculty.demo@umak.edu.ph'
WHERE NOT EXISTS (SELECT 1 FROM "projects" WHERE "id" = 'demo-project-1');

-- Add student to project
INSERT INTO "project_members" ("projectId", "userId", "role")
SELECT 'demo-project-1', u.id, 'member'
FROM "users" u WHERE u.email = 'reinernuevas.acads@gmail.com'
WHERE NOT EXISTS (
    SELECT 1 FROM "project_members" pm 
    JOIN "users" u2 ON pm."userId" = u2.id 
    WHERE pm."projectId" = 'demo-project-1' AND u2.email = 'reinernuevas.acads@gmail.com'
);

-- Create demo board
INSERT INTO "boards" ("id", "projectId", "name", "description", "createdById", "isDefault")
SELECT 'demo-board-1', 'demo-project-1', 'Sprint 1', 'First sprint', u.id, true
FROM "users" u WHERE u.email = 'faculty.demo@umak.edu.ph'
WHERE NOT EXISTS (SELECT 1 FROM "boards" WHERE "id" = 'demo-board-1');

-- Create demo tasks
INSERT INTO "tasks" ("boardId", "projectId", "createdById", "title", "description", "status", "priority", "position")
SELECT 'demo-board-1', 'demo-project-1', u.id, 'Complete Project Proposal', 'Write the initial project proposal', 'done', 'high', 0
FROM "users" u WHERE u.email = 'faculty.demo@umak.edu.ph'
WHERE NOT EXISTS (SELECT 1 FROM "tasks" WHERE "title" = 'Complete Project Proposal' AND "boardId" = 'demo-board-1');

INSERT INTO "tasks" ("boardId", "projectId", "createdById", "title", "description", "status", "priority", "position")
SELECT 'demo-board-1', 'demo-project-1', u.id, 'Literature Review', 'Conduct comprehensive literature review', 'in_progress', 'high', 1
FROM "users" u WHERE u.email = 'faculty.demo@umak.edu.ph'
WHERE NOT EXISTS (SELECT 1 FROM "tasks" WHERE "title" = 'Literature Review' AND "boardId" = 'demo-board-1');

INSERT INTO "tasks" ("boardId", "projectId", "createdById", "title", "description", "status", "priority", "position")
SELECT 'demo-board-1', 'demo-project-1', u.id, 'System Architecture', 'Design the overall system architecture', 'todo', 'urgent', 2
FROM "users" u WHERE u.email = 'faculty.demo@umak.edu.ph'
WHERE NOT EXISTS (SELECT 1 FROM "tasks" WHERE "title" = 'System Architecture' AND "boardId" = 'demo-board-1');

-- Create demo badges
INSERT INTO "badges" ("id", "name", "description", "icon", "rarity", "points", "criteria")
VALUES 
    ('badge-first-task', 'First Steps', 'Complete your first task', '🎯', 'common', 10, '{"type": "task_count", "value": 1}'),
    ('badge-streak-7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'rare', 50, '{"type": "streak", "value": 7}'),
    ('badge-deadline-destroyer', 'Deadline Destroyer', 'Meet 10 deadlines on time', '⏰', 'epic', 100, '{"type": "deadlines_met", "value": 10}')
ON CONFLICT DO NOTHING;

-- Grant the student some badges
INSERT INTO "user_badges" ("userId", "badgeId")
SELECT u.id, 'badge-first-task' FROM "users" u WHERE u.email = 'reinernuevas.acads@gmail.com'
WHERE NOT EXISTS (
    SELECT 1 FROM "user_badges" ub 
    JOIN "users" u2 ON ub."userId" = u2.id 
    WHERE u2.email = 'reinernuevas.acads@gmail.com' AND ub."badgeId" = 'badge-first-task'
);

INSERT INTO "user_badges" ("userId", "badgeId")
SELECT u.id, 'badge-streak-7' FROM "users" u WHERE u.email = 'reinernuevas.acads@gmail.com'
WHERE NOT EXISTS (
    SELECT 1 FROM "user_badges" ub 
    JOIN "users" u2 ON ub."userId" = u2.id 
    WHERE u2.email = 'reinernuevas.acads@gmail.com' AND ub."badgeId" = 'badge-streak-7'
);

-- Create some notifications
INSERT INTO "notifications" ("userId", "type", "title", "body")
SELECT u.id, 'task_assigned', 'New Task Assigned', 'Literature Review has been assigned to you'
FROM "users" u WHERE u.email = 'reinernuevas.acads@gmail.com'
WHERE NOT EXISTS (
    SELECT 1 FROM "notifications" n 
    JOIN "users" u2 ON n."userId" = u2.id 
    WHERE u2.email = 'reinernuevas.acads@gmail.com' AND n."title" = 'New Task Assigned'
);

SELECT 'Database setup complete!' as result;
