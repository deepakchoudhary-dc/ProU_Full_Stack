/**
 * Dashboard Page
 */

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { statsService } from '../services/stats';
import { taskService } from '../services/task';
import { useAuthStore } from '../stores/authStore';
import { Card, Button, Badge, StatCardSkeleton, TaskCardSkeleton } from '../components/ui';
import CompletionChart from '../components/charts/CompletionChart';
import type { Task } from '../types';

const Dashboard = () => {
  const { user } = useAuthStore();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsService.getDashboardStats(),
  });

  const { data: recentTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', { limit: 5 }],
    queryFn: () => taskService.getTasks({ limit: 5, sort: 'createdAt:desc' }),
  });

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
      change: '+2 this month',
    },
    {
      label: 'Total Tasks',
      value: stats?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-purple-500',
      change: '+12 this week',
    },
    {
      label: 'In Progress',
      value: stats?.tasksByStatus?.inProgress || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '3 due soon',
    },
    {
      label: 'Completed',
      value: stats?.tasksByStatus?.completed || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: `${stats?.completionRate?.toFixed(0) || 0}% rate`,
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'danger' | 'warning' | 'info'> = {
      HIGH: 'danger',
      MEDIUM: 'warning',
      LOW: 'info',
    };
    return variants[priority] || 'info';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
      TODO: 'default',
      IN_PROGRESS: 'primary',
      IN_REVIEW: 'warning',
      COMPLETED: 'success',
    };
    return variants[status] || 'default';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/tasks/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              New Task
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statCards.map((stat, index) => (
            <Card key={stat.label} hover className="relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              {/* Decorative gradient */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.color} opacity-10 rounded-full blur-2xl`} />
            </Card>
          ))
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Chart (full width of left column) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Completion Trend</h3>
            </div>
            <div className="p-4">
              <CompletionChart days={30} />
            </div>
          </Card>
        </motion.div>

        {/* Insight Cards (sidebar top) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Insights</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Overdue Tasks:</strong> {stats?.overdue || 0}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Completed This Week:</strong> {stats?.completedThisWeek || 0}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Completion Rate:</strong> {stats?.completionRate || 0}%
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card padding="none">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Tasks
                </h2>
                <Link to="/tasks">
                  <Button variant="ghost" size="sm">
                    View all
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasksLoading ? (
                <div className="p-4 space-y-3">
                  {Array(3).fill(0).map((_, i) => <TaskCardSkeleton key={i} />)}
                </div>
              ) : recentTasks?.data?.length ? (
                recentTasks.data.map((task: Task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {task.title}
                          </h3>
                          <Badge variant={getPriorityBadge(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {task.project && (
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {task.project.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(task.status)} dot>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
                  <Link to="/tasks/new" className="inline-block mt-4">
                    <Button size="sm">Create your first task</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link to="/projects/new" className="block">
                <Button variant="outline" className="w-full justify-start" icon={<FolderKanban className="h-4 w-4" />}>
                  Create Project
                </Button>
              </Link>
              <Link to="/tasks/new" className="block">
                <Button variant="outline" className="w-full justify-start" icon={<CheckSquare className="h-4 w-4" />}>
                  Add Task
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {stats?.upcomingTasks?.length ? (
                stats.upcomingTasks.slice(0, 3).map((task: Task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Due {task.dueDate && formatDate(task.dueDate)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No upcoming deadlines
                </p>
              )}
            </div>
          </Card>

          {/* Progress Overview */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Task Progress
            </h3>
            <div className="space-y-4">
              {['todo', 'inProgress', 'completed'].map((status) => {
                const count = stats?.tasksByStatus?.[status as keyof typeof stats.tasksByStatus] || 0;
                const total = stats?.totalTasks || 1;
                const percentage = Math.round((count / total) * 100);
                const colors: Record<string, string> = {
                  todo: 'bg-gray-500',
                  inProgress: 'bg-blue-500',
                  completed: 'bg-green-500',
                };

                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        {status.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[status]} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
