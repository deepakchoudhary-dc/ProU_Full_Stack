/**
 * Auth Layout Component
 * Layout for authentication pages (login, register)
 */

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const features = [
  'Organize projects and tasks efficiently',
  'Collaborate with your team seamlessly',
  'Track progress with visual dashboards',
  'Stay on top of deadlines and priorities',
];

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-12 flex-col justify-between">
        <div>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <span className="text-2xl font-bold text-white">P</span>
            </div>
            <span className="text-2xl font-bold text-white">ProU</span>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <h1 className="text-4xl font-bold text-white leading-tight">
              Manage your tasks<br />
              <span className="text-primary-200">with confidence</span>
            </h1>
            <p className="mt-4 text-lg text-primary-100/80 max-w-md">
              A powerful task management platform designed to help you and your 
              team stay organized and productive.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-primary-300" />
                <span className="text-primary-100">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-primary-200/60 text-sm"
        >
          © 2024 ProU Task Manager. All rights reserved.
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center bg-white dark:bg-gray-900 p-8 md:p-12 lg:p-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <span className="text-xl font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">ProU</span>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
