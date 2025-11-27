/**
 * Sidebar Navigation Component
 */

import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Settings,
  ChevronLeft,
  X,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 flex flex-col
    bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
    transition-all duration-300 ease-in-out
    ${sidebarCollapsed ? 'w-20' : 'w-64'}
    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo & Close Button */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shrink-0">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap"
              >
                ProU
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Desktop collapse button */}
        <button
          onClick={toggleSidebarCollapsed}
          className={`hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-transform ${
            sidebarCollapsed ? 'rotate-180' : ''
          }`}
        >
          <ChevronLeft className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           location.pathname.startsWith(item.href + '/');
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium overflow-hidden whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Version */}
      <AnimatePresence mode="wait">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-xs text-gray-400 text-center">
              ProU Task Manager v1.0.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;
