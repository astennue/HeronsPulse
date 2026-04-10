import { PrismaClient, UserRole, UserStatus, BadgeRarity, TaskStatus, TaskPriority, ProjectStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.pomodoroSession.deleteMany();
  await prisma.forecastResult.deleteMany();
  await prisma.workloadData.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestoneTask.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.board.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.messageAttachment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.classMember.deleteMany();
  await prisma.classTask.deleteMany();
  await prisma.class.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.scheduledReport.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Cleared existing data');

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Week Warrior',
        description: 'Complete tasks for 7 consecutive days',
        icon: '🔥',
        rarity: BadgeRarity.rare,
        points: 50,
        criteria: JSON.stringify({ type: 'streak', value: 7 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Early Bird',
        description: 'Submit 5 tasks before deadline',
        icon: '🌅',
        rarity: BadgeRarity.common,
        points: 20,
        criteria: JSON.stringify({ type: 'early_submission', value: 5 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Perfect Score',
        description: 'Achieve 100% on 3 assessments',
        icon: '⭐',
        rarity: BadgeRarity.epic,
        points: 100,
        criteria: JSON.stringify({ type: 'manual', value: 0 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Team Player',
        description: 'Collaborate on 10 team projects',
        icon: '🤝',
        rarity: BadgeRarity.uncommon,
        points: 30,
        criteria: JSON.stringify({ type: 'collaboration', value: 10 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Legendary Scholar',
        description: 'Reach 1000 total points',
        icon: '👑',
        rarity: BadgeRarity.legendary,
        points: 200,
        criteria: JSON.stringify({ type: 'points', value: 1000 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Task Master',
        description: 'Complete 50 tasks',
        icon: '✅',
        rarity: BadgeRarity.rare,
        points: 75,
        criteria: JSON.stringify({ type: 'tasks_completed', value: 50 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Deadline Crusher',
        description: 'Meet 25 deadlines on time',
        icon: '⚡',
        rarity: BadgeRarity.rare,
        points: 60,
        criteria: JSON.stringify({ type: 'deadlines_met', value: 25 }),
      },
    }),
  ]);

  console.log('✓ Created badges');

  // Hash passwords for each demo account
  const adminPasswordHash = await hash('Admin@HeronPulse2026', 10);
  const facultyPasswordHash = await hash('Faculty@HeronPulse2026', 10);
  const studentPasswordHash = await hash('@CSFDSARein03082026', 10);
  const defaultPasswordHash = await hash('password123', 10);

  // Create users with the exact demo credentials
  const users = await Promise.all([
    // Super Admin - User's specified credentials
    prisma.user.create({
      data: {
        email: 'superadmin@heronpulse.demo',
        password: adminPasswordHash,
        displayName: 'HeronPulse Admin',
        role: UserRole.super_admin,
        status: UserStatus.active,
        isOnline: true,
        currentStreak: 0,
        totalPoints: 0,
      },
    }),
    // Faculty - User's specified credentials
    prisma.user.create({
      data: {
        email: 'faculty.demo@umak.edu.ph',
        password: facultyPasswordHash,
        displayName: 'Prof. Demo Faculty',
        role: UserRole.faculty,
        status: UserStatus.active,
        courseCodes: JSON.stringify(['CS401', 'CS302']),
        isOnline: true,
        currentStreak: 5,
        totalPoints: 150,
      },
    }),
    // Student - User's specified credentials
    prisma.user.create({
      data: {
        email: 'reinernuevas.acads@gmail.com',
        password: studentPasswordHash,
        displayName: 'Reiner Nuevas',
        role: UserRole.student,
        status: UserStatus.active,
        courseCodes: JSON.stringify(['CS401', 'IT301']),
        isOnline: true,
        currentStreak: 12,
        longestStreak: 15,
        tasksCompleted: 45,
        deadlinesMet: 40,
        earlySubmissions: 10,
        totalPoints: 320,
        productivityScore: 78,
      },
    }),
    prisma.user.create({
      data: {
        email: 'johndoe@umak.edu.ph',
        password: defaultPasswordHash,
        displayName: 'John Doe',
        role: UserRole.student,
        status: UserStatus.active,
        courseCodes: JSON.stringify(['CS401', 'CS302']),
        isOnline: true,
        currentStreak: 8,
        tasksCompleted: 23,
        totalPoints: 150,
      },
    }),
    prisma.user.create({
      data: {
        email: 'mariasantos@umak.edu.ph',
        password: defaultPasswordHash,
        displayName: 'Maria Santos',
        role: UserRole.student,
        status: UserStatus.suspended,
        courseCodes: JSON.stringify(['IT301', 'CS302']),
        isOnline: false,
        tasksCompleted: 12,
        totalPoints: 80,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bobcruz@umak.edu.ph',
        password: defaultPasswordHash,
        displayName: 'Bob Cruz',
        role: UserRole.student,
        status: UserStatus.active,
        courseCodes: JSON.stringify(['CS401', 'CS402']),
        isOnline: true,
        currentStreak: 8,
        tasksCompleted: 38,
        totalPoints: 280,
      },
    }),
    prisma.user.create({
      data: {
        email: 'evatorres@umak.edu.ph',
        password: defaultPasswordHash,
        displayName: 'Eva Torres',
        role: UserRole.student,
        status: UserStatus.active,
        courseCodes: JSON.stringify(['IT301', 'CS405']),
        isOnline: true,
        currentStreak: 20,
        longestStreak: 20,
        tasksCompleted: 52,
        totalPoints: 450,
        productivityScore: 92,
      },
    }),
  ]);

  console.log('✓ Created users');

  // Award some badges
  // User indices: 0=Admin, 1=Faculty, 2=Reiner, 3=John, 4=Maria, 5=Bob, 6=Eva
  await prisma.userBadge.createMany({
    data: [
      { userId: users[2].id, badgeId: badges[0].id }, // Reiner - Week Warrior
      { userId: users[2].id, badgeId: badges[1].id }, // Reiner - Early Bird
      { userId: users[5].id, badgeId: badges[0].id }, // Bob - Week Warrior
      { userId: users[6].id, badgeId: badges[0].id }, // Eva - Week Warrior
      { userId: users[6].id, badgeId: badges[2].id }, // Eva - Perfect Score
      { userId: users[3].id, badgeId: badges[1].id }, // John - Early Bird
    ],
  });

  console.log('✓ Awarded badges');

  // Create projects
  // User indices: 0=Admin, 1=Faculty, 2=Reiner, 3=John, 4=Maria, 5=Bob, 6=Eva
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'CS Capstone Project 2026',
        description: 'Final year capstone project for the College of Computing and Information Sciences',
        courseCode: 'CS401',
        status: ProjectStatus.active,
        color: '#1A56DB',
        icon: '🎓',
        ownerId: users[2].id, // Reiner
        members: {
          create: [
            { userId: users[2].id, role: 'owner' },
            { userId: users[3].id, role: 'member' },
            { userId: users[4].id, role: 'member' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Web Development Course',
        description: 'Learn modern web development with React and Next.js',
        courseCode: 'IT301',
        status: ProjectStatus.active,
        color: '#10B981',
        icon: '🌐',
        ownerId: users[5].id, // Bob
        members: {
          create: [
            { userId: users[5].id, role: 'owner' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Database Management System',
        description: 'Design and implement a relational database for a library system',
        courseCode: 'CS302',
        status: ProjectStatus.completed,
        color: '#F59E0B',
        icon: '🗄️',
        progress: 100,
        ownerId: users[6].id, // Eva
        members: {
          create: [
            { userId: users[6].id, role: 'owner' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'Machine Learning Research',
        description: 'Research paper on natural language processing techniques',
        courseCode: 'CS405',
        status: ProjectStatus.on_hold,
        color: '#8B5CF6',
        icon: '🤖',
        ownerId: users[4].id, // Maria (now index 4)
        members: {
          create: [
            { userId: users[4].id, role: 'owner' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'CS401 Course Development',
        description: 'Developing course materials for Software Engineering class',
        courseCode: 'CS401',
        status: ProjectStatus.active,
        color: '#3B82F6',
        icon: '📚',
        ownerId: users[1].id, // Prof. Faculty
        members: {
          create: [
            { userId: users[1].id, role: 'owner' },
          ],
        },
      },
    }),
    prisma.project.create({
      data: {
        name: 'IT201 Lab Materials',
        description: 'Creating lab exercises and projects for IT fundamentals',
        courseCode: 'IT201',
        status: ProjectStatus.active,
        color: '#10B981',
        icon: '🔬',
        ownerId: users[1].id, // Faculty (Dr. Garcia was removed)
        members: {
          create: [
            { userId: users[1].id, role: 'owner' },
          ],
        },
      },
    }),
  ]);

  console.log('✓ Created projects');

  // Create boards
  const boards = await Promise.all(
    projects.map(project =>
      prisma.board.create({
        data: {
          name: 'Main Board',
          description: 'Default board for this project',
          projectId: project.id,
          createdById: project.ownerId,
          isDefault: true,
        },
      })
    )
  );

  console.log('✓ Created boards');

  // Create tasks
  // User indices: 0=Admin, 1=Faculty, 2=Reiner, 3=John, 4=Maria, 5=Bob, 6=Eva
  const now = new Date();
  const tasks = await Promise.all([
    // Project 1 tasks (CS Capstone - owned by Reiner users[2])
    prisma.task.create({
      data: {
        title: 'Project Proposal Draft',
        description: 'Initial draft of the capstone project proposal',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[2].id, // Reiner
        status: TaskStatus.done,
        priority: TaskPriority.high,
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[2].id }], // Reiner
        },
        subtasks: {
          create: [
            { title: 'Research existing solutions', userId: users[2].id, isCompleted: true, position: 0 },
            { title: 'Write problem statement', userId: users[2].id, isCompleted: true, position: 1 },
            { title: 'Define objectives', userId: users[2].id, isCompleted: true, position: 2 },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Literature Review',
        description: 'Comprehensive review of related literature',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[2].id, // Reiner
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[2].id }, { userId: users[3].id }], // Reiner, John
        },
        subtasks: {
          create: [
            { title: 'Gather sources', userId: users[2].id, isCompleted: true, position: 0 },
            { title: 'Analyze papers', userId: users[2].id, isCompleted: true, position: 1 },
            { title: 'Write synthesis', userId: users[2].id, isCompleted: false, position: 2 },
            { title: 'Create bibliography', userId: users[3].id, isCompleted: false, position: 3 },
            { title: 'Review and edit', userId: users[2].id, isCompleted: false, position: 4 },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'System Architecture Design',
        description: 'Design the overall system architecture',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[2].id, // Reiner
        status: TaskStatus.todo,
        priority: TaskPriority.urgent,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[2].id }], // Reiner
        },
        subtasks: {
          create: [
            { title: 'Create component diagram', userId: users[2].id, isCompleted: false, position: 0 },
            { title: 'Design database schema', userId: users[2].id, isCompleted: false, position: 1 },
            { title: 'Define API endpoints', userId: users[2].id, isCompleted: false, position: 2 },
            { title: 'Document decisions', userId: users[2].id, isCompleted: false, position: 3 },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Database Schema',
        description: 'Design and implement database schema',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[3].id, // John
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[3].id }], // John
        },
        subtasks: {
          create: [
            { title: 'Create ERD', userId: users[3].id, isCompleted: false, position: 0 },
            { title: 'Write migrations', userId: users[3].id, isCompleted: false, position: 1 },
          ],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'UI Mockups',
        description: 'Create user interface mockups',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[2].id, // Reiner
        status: TaskStatus.backlog,
        priority: TaskPriority.low,
        dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        courseCode: 'IT301',
        assignees: {
          create: [{ userId: users[2].id }], // Reiner
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'User Authentication',
        description: 'Implement user authentication system',
        boardId: boards[0].id,
        projectId: projects[0].id,
        createdById: users[2].id, // Reiner
        status: TaskStatus.in_review,
        priority: TaskPriority.high,
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[2].id }, { userId: users[3].id }], // Reiner, John
        },
        subtasks: {
          create: [
            { title: 'Setup NextAuth', userId: users[2].id, isCompleted: true, position: 0 },
            { title: 'Create login page', userId: users[2].id, isCompleted: true, position: 1 },
            { title: 'Add Google OAuth', userId: users[3].id, isCompleted: true, position: 2 },
            { title: 'Test authentication', userId: users[2].id, isCompleted: true, position: 3 },
          ],
        },
      },
    }),
    // Faculty tasks
    prisma.task.create({
      data: {
        title: 'Prepare Midterm Exam',
        description: 'Create midterm examination for CS401',
        boardId: boards[4].id,
        projectId: projects[4].id,
        createdById: users[1].id,
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        courseCode: 'CS401',
        assignees: {
          create: [{ userId: users[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Grade Lab Reports',
        description: 'Grade submitted lab reports',
        boardId: boards[5].id,
        projectId: projects[5].id,
        createdById: users[1].id, // Faculty
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        dueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        courseCode: 'CS302',
        assignees: {
          create: [{ userId: users[1].id }], // Faculty
        },
      },
    }),
  ]);

  console.log('✓ Created tasks');

  // Create some workload data for analytics
  for (const user of users.filter(u => u.role === 'student')) {
    for (let i = 0; i < 7; i++) {
      await prisma.workloadData.create({
        data: {
          userId: user.id,
          recordedDate: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
          taskDensity: Math.random() * 30 + 20,
          assessmentIntensity: Math.random() * 25 + 15,
          deadlineClustering: Math.random() * 20 + 10,
          researchLoad: Math.random() * 15 + 5,
          aliScore: Math.random() * 50 + 30,
        },
      });
    }
  }

  console.log('✓ Created workload data');

  // Create notifications
  // User indices: 0=Admin, 1=Faculty, 2=Reiner, 3=John, 4=Maria, 5=Bob, 6=Eva
  await prisma.notification.createMany({
    data: [
      {
        userId: users[2].id, // Reiner
        type: 'deadline_approaching',
        title: 'Deadline Approaching',
        body: 'Literature Review is due in 3 days',
        link: '/boards',
      },
      {
        userId: users[2].id, // Reiner
        type: 'badge_awarded',
        title: 'Badge Unlocked!',
        body: 'You earned the Week Warrior badge! 🔥',
        link: '/settings',
      },
      {
        userId: users[3].id, // John
        type: 'task_assigned',
        title: 'New Task Assigned',
        body: 'You were assigned to Database Schema',
        link: '/boards',
      },
    ],
  });

  console.log('✓ Created notifications');

  // Create activity logs
  // User indices: 0=Admin, 1=Faculty, 2=Reiner, 3=John, 4=Maria, 5=Bob, 6=Eva
  await prisma.activityLog.createMany({
    data: [
      {
        userId: users[2].id, // Reiner
        entityType: 'task',
        entityId: tasks[0].id,
        action: 'completed',
        metadata: JSON.stringify({ title: 'Project Proposal Draft' }),
      },
      {
        userId: users[2].id, // Reiner
        entityType: 'project',
        entityId: projects[0].id,
        action: 'created',
        metadata: JSON.stringify({ name: 'CS Capstone Project 2026' }),
      },
      {
        userId: users[1].id, // Faculty
        entityType: 'task',
        entityId: tasks[6].id,
        action: 'created',
        metadata: JSON.stringify({ title: 'Prepare Midterm Exam' }),
      },
    ],
  });

  console.log('✓ Created activity logs');

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Accounts (Use these exact credentials):');
  console.log('  🎓 Student: reinernuevas.acads@gmail.com / @CSFDSARein03082026');
  console.log('  👨‍🏫 Faculty: faculty.demo@umak.edu.ph / Faculty@HeronPulse2026');
  console.log('  🔧 Admin: superadmin@heronpulse.demo / Admin@HeronPulse2026');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
