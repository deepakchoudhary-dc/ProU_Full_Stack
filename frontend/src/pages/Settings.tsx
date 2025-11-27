/**
 * Settings Page
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Shield,
  Save,
  Camera,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { userService } from '../services/user';
import { authService } from '../services/auth';
import { Card, Button, Input } from '../components/ui';

interface ProfileForm {
  name: string;
  email: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const { user, setAuth } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordForm>();

  const newPassword = watch('newPassword');

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => userService.updateProfile(data),
    onSuccess: (response) => {
      setAuth(response.data, localStorage.getItem('token') || '');
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
    onSuccess: () => {
      resetPassword();
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
        >
          {successMessage}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Card padding="sm" className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </Card>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
                <Input
                  label="Full Name"
                  icon={<User className="h-5 w-5" />}
                  error={profileErrors.name?.message}
                  {...registerProfile('name', { required: 'Name is required' })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail className="h-5 w-5" />}
                  error={profileErrors.email?.message}
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={updateProfileMutation.isPending}
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Change Password
              </h2>
              <form
                onSubmit={handlePasswordSubmit((data) =>
                  changePasswordMutation.mutate({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                  })
                )}
                className="space-y-4"
              >
                <Input
                  label="Current Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  error={passwordErrors.currentPassword?.message}
                  {...registerPassword('currentPassword', {
                    required: 'Current password is required',
                  })}
                />
                <Input
                  label="New Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  icon={<Lock className="h-5 w-5" />}
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  })}
                />
                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={changePasswordMutation.isPending}
                    icon={<Shield className="h-4 w-4" />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Theme
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <option.icon className={`h-6 w-6 mx-auto mb-2 ${
                      theme === option.value
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      theme === option.value
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email notifications', description: 'Receive updates via email' },
                  { id: 'tasks', label: 'Task reminders', description: 'Get notified about upcoming deadlines' },
                  { id: 'comments', label: 'Comment notifications', description: 'When someone comments on your tasks' },
                  { id: 'mentions', label: 'Mentions', description: 'When someone mentions you' },
                ].map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {setting.label}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {setting.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
