import { User, Bell, Shield, Palette, AlertTriangle } from 'lucide-react';

export const settingsSections = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    description: 'Manage your personal information',
    keywords: ['avatar', 'picture', 'photo', 'name', 'email', 'phone', 'personal', 'account'],
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: Palette,
    description: 'Customize your experience',
    keywords: ['theme', 'dark', 'light', 'currency', 'language', 'display', 'appearance'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Control how you get alerts',
    keywords: ['alerts', 'emails', 'push', 'updates', 'marketing', 'notify'],
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    description: 'Protect your account',
    keywords: ['password', '2fa', 'two-factor', 'sessions', 'login', 'auth', 'change password'],
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: AlertTriangle,
    description: 'Irreversible actions',
    keywords: ['delete', 'remove', 'close', 'permanent', 'archive account'],
    danger: true,
  },
];

export const initialSettings = {
  profile: {
    fullName: 'Valentine O.',
    email: 'valentine@example.com',
    phone: '+234 801 234 5678',
  },
  preferences: {
    theme: 'dark',
    language: 'en',
    currency: 'NGN',
  },
  notifications: {
    emailAlerts: true,
    pushNotifications: false,
    transactionUpdates: true,
    marketingEmails: false,
  },
  security: {
    twoFactorEnabled: false,
  },
};