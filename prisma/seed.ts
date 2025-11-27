/**
 * Database Seed Script
 * Creates initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// String constants for enums (SQLite doesn't support enums)
const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

const ProjectStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  COMPLETED: 'COMPLETED',
  ON_HOLD: 'ON_HOLD',
} as const;

const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
} as const;

const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log('📧 Creating users...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@prou.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  // Create regular users
  const userPassword = await bcrypt.hash('user123', 12);
  const john = await prisma.user.create({
    data: {
      email: 'john@prou.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@prou.com',
      password: userPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.USER,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    },
  });

  console.log('🏷️ Creating tags...');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Frontend', color: '#3b82f6' } }),
    prisma.tag.create({ data: { name: 'Backend', color: '#10b981' } }),
    prisma.tag.create({ data: { name: 'Bug', color: '#ef4444' } }),
    prisma.tag.create({ data: { name: 'Feature', color: '#8b5cf6' } }),
    prisma.tag.create({ data: { name: 'Documentation', color: '#f59e0b' } }),
    prisma.tag.create({ data: { name: 'Testing', color: '#06b6d4' } }),
  ]);

  console.log('📁 Creating projects...');

  // Create projects
  const webApp = await prisma.project.create({
    data: {
      name: 'ProU Web Application',
      description: 'Main web application for task management with modern UI/UX',
      color: '#6366f1',
      icon: 'rocket',
      status: ProjectStatus.ACTIVE,
      ownerId: admin.id,
    },
  });

  const mobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'React Native mobile application for iOS and Android',
      color: '#10b981',
      icon: 'smartphone',
      status: ProjectStatus.ACTIVE,
      ownerId: john.id,
    },
  });

  const apiDocs = await prisma.project.create({
    data: {
      name: 'API Documentation',
      description: 'Comprehensive API documentation and developer guides',
      color: '#f59e0b',
      icon: 'book',
      status: ProjectStatus.ACTIVE,
      ownerId: jane.id,
    },
  });

  console.log('✅ Creating tasks...');

  // Create tasks for Web App project
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design dashboard layout',
        description: 'Create wireframes and mockups for the main dashboard view',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: webApp.id,
        creatorId: admin.id,
        assigneeId: john.id,
        completedAt: new Date(),
        order: 1,
        tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Set up JWT-based authentication with login, register, and logout',
        status: TaskStatus.COMPLETED,
        priority: Priority.URGENT,
        projectId: webApp.id,
        creatorId: admin.id,
        assigneeId: admin.id,
        completedAt: new Date(),
        order: 2,
        tags: { connect: [{ id: tags[1].id }, { id: tags[3].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create task CRUD API endpoints',
        description: 'Implement RESTful endpoints for task management operations',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        projectId: webApp.id,
        creatorId: admin.id,
        assigneeId: john.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        order: 3,
        tags: { connect: [{ id: tags[1].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Add dark mode support',
        description: 'Implement theme switching with dark/light mode toggle',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: webApp.id,
        creatorId: john.id,
        assigneeId: jane.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        order: 4,
        tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write unit tests for API',
        description: 'Add comprehensive test coverage for all API endpoints',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        projectId: webApp.id,
        creatorId: admin.id,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        order: 5,
        tags: { connect: [{ id: tags[5].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix navigation bug on mobile',
        description: 'Sidebar not closing properly on mobile devices after navigation',
        status: TaskStatus.IN_REVIEW,
        priority: Priority.HIGH,
        projectId: webApp.id,
        creatorId: jane.id,
        assigneeId: john.id,
        order: 6,
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] },
      },
    }),
    // Mobile App tasks
    prisma.task.create({
      data: {
        title: 'Set up React Native project',
        description: 'Initialize project with Expo and configure development environment',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: mobileApp.id,
        creatorId: john.id,
        assigneeId: john.id,
        completedAt: new Date(),
        order: 1,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design mobile navigation',
        description: 'Implement bottom tab navigation and stack navigators',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        projectId: mobileApp.id,
        creatorId: john.id,
        assigneeId: jane.id,
        order: 2,
      },
    }),
    // API Docs tasks
    prisma.task.create({
      data: {
        title: 'Document authentication endpoints',
        description: 'Write comprehensive documentation for auth API with examples',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        projectId: apiDocs.id,
        creatorId: jane.id,
        assigneeId: jane.id,
        completedAt: new Date(),
        order: 1,
        tags: { connect: [{ id: tags[4].id }] },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create API usage examples',
        description: 'Add code examples in multiple languages (JavaScript, Python, cURL)',
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        projectId: apiDocs.id,
        creatorId: jane.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        order: 2,
        tags: { connect: [{ id: tags[4].id }] },
      },
    }),
  ]);

  console.log('💬 Creating comments...');

  // Create some comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great progress on this! The design looks clean and modern.',
        taskId: tasks[0].id,
        authorId: admin.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'I\'ve added JWT refresh token support as well.',
        taskId: tasks[1].id,
        authorId: admin.id,
      },
    }),
    prisma.comment.create({
      data: {
        content: 'Working on the validation middleware now. Should be done by tomorrow.',
        taskId: tasks[2].id,
        authorId: john.id,
      },
    }),
  ]);

  console.log('✨ Seeding completed successfully!');
  console.log('\n📋 Created:');
  console.log(`   - 3 Users (admin@prou.com / admin123, john@prou.com / user123, jane@prou.com / user123)`);
  console.log(`   - 6 Tags`);
  console.log(`   - 3 Projects`);
  console.log(`   - 10 Tasks`);
  console.log(`   - 3 Comments`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
