# ProU Task Manager

<div align="center">

![ProU Task Manager](https://img.shields.io/badge/ProU-Task%20Manager-6366f1?style=for-the-badge&logo=checkmarx&logoColor=white)

A modern, full-stack task management application built with **Node.js**, **Express**, **TypeScript**, **Prisma**, **React**, and **TailwindCSS**.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Frontend Guide](#-frontend-guide)
- [Database Schema](#-database-schema)
- [Design Decisions](#-design-decisions)
- [Bonus Features](#-bonus-features)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)

---

## 🌟 Overview

ProU Task Manager is a comprehensive project and task management application designed to help teams organize, track, and collaborate on work efficiently. It features a modern, responsive UI with dark/light mode support, real-time updates, and a robust RESTful API.

### Key Highlights

- 🎨 **Beautiful, Modern UI** - Clean design with smooth animations and micro-interactions
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🌙 **Dark/Light Mode** - System preference detection with manual toggle
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 📊 **Dashboard Analytics** - Visual statistics and productivity insights
- 🏷️ **Flexible Organization** - Projects, tags, priorities, and status workflows

---

## ✨ Features

### Core Features
- ✅ User registration and authentication (JWT)
- ✅ Create, read, update, delete (CRUD) projects
- ✅ Create, read, update, delete (CRUD) tasks
- ✅ Task assignment to team members
- ✅ Task status workflow (Todo → In Progress → In Review → Completed)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due date tracking with overdue indicators
- ✅ Task comments and discussions
- ✅ Tag/label system for categorization
- ✅ Search and filter capabilities

### Bonus Features
- 🌓 Dark/Light mode with system preference detection
- 🔒 Role-based access control (Admin/User)
- 📊 Dashboard with statistics and charts
- 📱 Responsive design (mobile-first)
- ✅ Form validation with real-time feedback
- 🧪 Unit tests with Jest
- 🐳 Docker support for easy deployment
- ⚡ Optimistic UI updates
- 🎭 Loading states and skeleton screens
- ♿ Accessibility considerations (ARIA labels, keyboard navigation)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **Prisma** | ORM and database toolkit |
| **SQLite/PostgreSQL** | Database (SQLite for dev, PostgreSQL for prod) |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **express-validator** | Input validation |
| **Jest** | Testing framework |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **TailwindCSS** | Styling |
| **React Router** | Navigation |
| **React Query** | Server state management |
| **Zustand** | Client state management |
| **Lucide Icons** | Icon library |
| **Framer Motion** | Animations |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                              CLIENT                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React + TypeScript + TailwindCSS + React Query + Zustand  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                              SERVER                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Express.js + TypeScript + Prisma ORM             │ │
│  │                                                             │ │
│  │  Routes → Middleware → Controllers → Services → Database   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Prisma Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                            DATABASE                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              SQLite (dev) / PostgreSQL (prod)              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
ProU_Backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── config/            # Configuration files
│   │   ├── database.ts    # Prisma client
│   │   └── index.ts       # App config
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── user.controller.ts
│   │   ├── tag.controller.ts
│   │   └── stats.controller.ts
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # JWT authentication
│   │   ├── validation.ts  # Input validation
│   │   └── errorHandler.ts
│   ├── routes/            # API routes
│   │   ├── auth.routes.ts
│   │   ├── project.routes.ts
│   │   ├── task.routes.ts
│   │   └── ...
│   ├── utils/             # Utility functions
│   │   ├── errors.ts      # Custom error classes
│   │   ├── response.ts    # Response helpers
│   │   └── asyncHandler.ts
│   ├── __tests__/         # Unit tests
│   └── server.ts          # Entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── ...
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **Git**

### Installation

#### 1. Clone the repository

```bash
git clone <repository-url>
cd ProU_Backend
```

#### 2. Backend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional, creates demo data)
npm run prisma:seed

# Start the development server
npm run dev
```

The backend will be running at `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:3000`

### Demo Credentials

After seeding the database, you can use these accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@prou.com | admin123 | Admin |
| john@prou.com | user123 | User |
| jane@prou.com | user123 | User |

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/me` | Update profile | Yes |
| PUT | `/auth/password` | Change password | Yes |

#### Project Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/projects` | List all projects | Yes |
| POST | `/projects` | Create project | Yes |
| GET | `/projects/:id` | Get project | Yes |
| PUT | `/projects/:id` | Update project | Yes |
| DELETE | `/projects/:id` | Delete project | Yes |
| GET | `/projects/:id/stats` | Get project stats | Yes |

#### Task Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tasks` | List all tasks | Yes |
| POST | `/tasks` | Create task | Yes |
| GET | `/tasks/:id` | Get task | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes |
| POST | `/tasks/:id/comments` | Add comment | Yes |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete comment | Yes |
| PATCH | `/tasks/reorder` | Reorder tasks | Yes |

#### Other Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users` | List users | Yes |
| GET | `/users/search` | Search users | Yes |
| GET | `/tags` | List tags | Yes |
| POST | `/tags` | Create tag | Yes |
| GET | `/stats/dashboard` | Dashboard stats | Yes |
| GET | `/stats/activity` | Recent activity | Yes |
| GET | `/stats/productivity` | Productivity data | Yes |

### Response Format

#### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "errors": [ ... ]  // Validation errors (if applicable)
  }
}
```

---

## 🎨 Frontend Guide

### Key Components

- **Dashboard** - Overview with statistics, recent activity, and quick actions
- **Projects** - List and manage projects with task counts
- **Tasks** - Kanban-style board or list view for task management
- **Task Detail** - Full task information with comments
- **Settings** - User profile and theme preferences

### State Management

- **React Query** - Server state (API data caching, background refetch)
- **Zustand** - Client state (UI state, theme, sidebar)

### Styling

- **TailwindCSS** - Utility-first CSS framework
- **CSS Variables** - Theme colors for dark/light mode
- **Framer Motion** - Smooth animations and transitions

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Project   │       │    Task     │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │──┐    │ id          │──┐    │ id          │
│ email       │  │    │ name        │  │    │ title       │
│ password    │  │    │ description │  │    │ description │
│ firstName   │  │    │ color       │  │    │ status      │
│ lastName    │  │    │ icon        │  │    │ priority    │
│ avatar      │  │    │ status      │  │    │ dueDate     │
│ role        │  │    │ ownerId ────│──┘    │ projectId ──│──┐
│ createdAt   │  │    │ createdAt   │       │ creatorId ──│──┤
│ updatedAt   │  │    │ updatedAt   │       │ assigneeId ─│──┤
└─────────────┘  │    └─────────────┘       │ createdAt   │  │
                 │                          │ updatedAt   │  │
                 │                          └─────────────┘  │
                 │                                           │
                 └───────────────────────────────────────────┘

┌─────────────┐       ┌─────────────┐
│   Comment   │       │    Tag      │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ content     │       │ name        │
│ taskId      │       │ color       │
│ authorId    │       │             │
│ createdAt   │       └─────────────┘
│ updatedAt   │              │
└─────────────┘              │
                             │ Many-to-Many
                     ┌───────┴───────┐
                     │   TaskTags    │
                     └───────────────┘
```

---

## 🎯 Design Decisions

### Why TypeScript?
- Type safety catches errors at compile time
- Better IDE support with autocomplete and refactoring
- Self-documenting code with interfaces and types
- Easier maintenance in larger codebases

### Why Prisma?
- Type-safe database queries with auto-generated client
- Easy schema migrations and management
- Works with multiple databases (SQLite, PostgreSQL, MySQL)
- Excellent developer experience

### Why React Query?
- Automatic caching and background refetching
- Optimistic updates for better UX
- Built-in loading and error states
- Reduces boilerplate for data fetching

### Why TailwindCSS?
- Rapid UI development with utility classes
- Consistent design system
- Easy responsive design
- Excellent dark mode support

### Why SQLite for Development?
- Zero configuration required
- No separate database server needed
- Fast for development and testing
- Easy to switch to PostgreSQL for production

---

## 🎁 Bonus Features Implemented

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin/User)
- Secure password hashing with bcrypt
- Protected routes and middleware

### 2. Dark/Light Mode
- System preference detection
- Manual toggle with persistence
- Smooth transition animations
- Consistent theming across components

### 3. Form Validation
- Real-time validation feedback
- Server-side validation with express-validator
- Clear error messages
- Input sanitization

### 4. Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Collapsible sidebar for mobile

### 5. Unit Tests
- Jest test framework
- Controller and utility tests
- Mock implementations for database
- Coverage reporting

### 6. Docker Support
- Multi-stage Dockerfile
- Docker Compose for full stack
- Environment variable configuration
- Production-ready setup

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Goals
- Controllers: 80%+
- Utilities: 90%+
- Middleware: 70%+

---

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Production Checklist
- [ ] Set strong JWT_SECRET
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Enable gzip compression

---

## 🔮 Future Improvements

- [ ] Real-time updates with WebSockets
- [ ] File attachments for tasks
- [ ] Email notifications
- [ ] Calendar view for due dates
- [ ] Task templates
- [ ] Time tracking
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Export to CSV/PDF
- [ ] Mobile app (React Native)

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤 Author

Built with ❤️ for ProU Internship Assessment

---

<div align="center">

**[⬆ Back to Top](#prou-task-manager)**

</div>
