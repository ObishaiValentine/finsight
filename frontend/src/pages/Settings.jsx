import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Search,
  Camera, Loader2, Check, AlertCircle, Smartphone,
  Eye, EyeOff, X, Save,
} from 'lucide-react';
import { settingsSections } from '../utils/settingsData';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

// ============ REUSABLE COMPONENTS ============

const Toggle = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative w-12 h-7 rounded-full transition-colors duration-300 flex items-center px-1 shrink-0 ${
      enabled ? 'bg-linear-to-r from-blue-500 to-cyan-400' : 'bg-gray-300 dark:bg-[#2a2a35]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <motion.div
      className="w-5 h-5 rounded-full bg-white shadow-md"
      animate={{ x: enabled ? 24 : 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    />
  </button>
);

const SettingsRow = ({ label, description, children, isLast }) => (
  <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-app' : ''}`}>
    <div className="pr-4">
      <p className="text-sm font-medium text-primary">{label}</p>
      {description && <p className="text-xs text-secondary mt-0.5">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-primary">{title}</h2>
    <p className="text-sm text-secondary mt-1">{description}</p>
  </div>
);

// ============ SECTIONS ============

function ProfileSection() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await authService.uploadAvatar(file);
      await refreshUser();
      setSuccess('Avatar updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authService.updateProfile(form);
      await refreshUser();
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const avatarInitial = (user?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  return (
    <div>
      <SectionHeader title="Profile" description="Manage your personal information and profile picture." />

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2"
        >
          <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-500">{success}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
        >
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-500">{error}</p>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white text-2xl">
                {avatarInitial}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 size={20} className="animate-spin text-white" />
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-app hover:bg-hover transition-colors disabled:opacity-60"
            >
              <Camera size={14} />
              Change Avatar
            </button>
            <p className="text-xs text-muted mt-1.5">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary">Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="mt-1 w-full bg-card border border-app rounded-lg px-3 py-2.5 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 w-full bg-card border border-app rounded-lg px-3 py-2.5 text-sm text-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-sm font-medium text-secondary">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+234 801 234 5678"
              className="mt-1 w-full bg-card border border-app rounded-lg px-3 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreferencesSection() {
  const { user, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState(user?.currency || 'NGN');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async (updates) => {
    setSaving(true);
    setSuccess('');
    try {
      await authService.updatePreferences(updates);
      await refreshUser();
      setSuccess('Preferences updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Silent fail or show error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Preferences" description="Customize your app experience." />

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2"
        >
          <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-500">{success}</p>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5">
        <SettingsRow label="Theme" description="Switch between light and dark mode.">
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary capitalize">{theme}</span>
            <Toggle enabled={theme === 'dark'} onChange={toggleTheme} />
          </div>
        </SettingsRow>

        <SettingsRow label="Language" description="Select your preferred language.">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              handleSave({ language: e.target.value });
            }}
            disabled={saving}
            className="bg-card border border-app rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
          >
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ha">Hausa</option>
            <option value="ig">Igbo</option>
          </select>
        </SettingsRow>

        <SettingsRow label="Currency" description="Choose your display currency." isLast>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              handleSave({ currency: e.target.value });
            }}
            disabled={saving}
            className="bg-card border border-app rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-60"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </SettingsRow>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { user, refreshUser } = useAuth();
  const [prefs, setPrefs] = useState({
    notification_email: user?.notification_email ?? true,
    notification_push: user?.notification_push ?? false,
    notification_transactions: user?.notification_transactions ?? true,
    notification_marketing: user?.notification_marketing ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleToggle = async (key) => {
    const newValue = !prefs[key];
    setPrefs({ ...prefs, [key]: newValue });
    setSaving(true);
    setSuccess('');

    try {
      await authService.updateNotifications({ [key]: newValue });
      await refreshUser();
      setSuccess('Notification preferences updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // Revert on error
      setPrefs({ ...prefs, [key]: !newValue });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Notifications" description="Control how and when you receive alerts." />

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2"
        >
          <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-500">{success}</p>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5">
        <SettingsRow label="Email Alerts" description="Receive important updates via email.">
          <Toggle enabled={prefs.notification_email} onChange={() => handleToggle('notification_email')} disabled={saving} />
        </SettingsRow>
        <SettingsRow label="Push Notifications" description="Get real-time alerts on your device.">
          <Toggle enabled={prefs.notification_push} onChange={() => handleToggle('notification_push')} disabled={saving} />
        </SettingsRow>
        <SettingsRow label="Transaction Updates" description="Alerts for every new transaction.">
          <Toggle enabled={prefs.notification_transactions} onChange={() => handleToggle('notification_transactions')} disabled={saving} />
        </SettingsRow>
        <SettingsRow label="Marketing Emails" description="Receive tips, offers, and product news." isLast>
          <Toggle enabled={prefs.notification_marketing} onChange={() => handleToggle('notification_marketing')} disabled={saving} />
        </SettingsRow>
      </div>
    </div>
  );
}

function SecuritySection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, newPass: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPass !== form.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (form.newPass.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(form.current, form.newPass);
      setSuccess('Password changed successfully');
      setModalOpen(false);
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Security" description="Keep your account safe and secure." />

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2"
        >
          <Check size={14} className="text-green-500 shrink-0 mt-0.5" />
          <p className="text-xs text-green-500">{success}</p>
        </motion.div>
      )}

      <div className="glass rounded-xl p-5 mb-6">
        <SettingsRow label="Password" description="Change your account password." isLast>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
          >
            Change
          </button>
        </SettingsRow>
      </div>

      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-primary mb-3">Active Sessions</h3>
        <div className="flex items-center gap-3">
          <Smartphone size={20} className="text-secondary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">Chrome on Windows</p>
            <p className="text-xs text-secondary">Current session</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
            Active
          </span>
        </div>
      </div>

      {/* Change password modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Change Password</h2>
                    <p className="text-xs text-muted">Update your login credentials</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      value={form.current}
                      onChange={(e) => setForm({ ...form, current: e.target.value })}
                      required
                      className="w-full bg-elevated border border-app rounded-xl px-4 py-3 pr-11 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                    >
                      {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.newPass ? 'text' : 'password'}
                      value={form.newPass}
                      onChange={(e) => setForm({ ...form, newPass: e.target.value })}
                      required
                      minLength={6}
                      className="w-full bg-elevated border border-app rounded-xl px-4 py-3 pr-11 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, newPass: !showPassword.newPass })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                    >
                      {showPassword.newPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-secondary mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      required
                      minLength={6}
                      className="w-full bg-elevated border border-app rounded-xl px-4 py-3 pr-11 text-sm text-primary focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
                    >
                      {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DangerZoneSection() {
  const { logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Type DELETE to confirm');
      return;
    }
    setDeleting(true);
    try {
      await authService.deleteAccount();
      await logout();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Danger Zone" description="These actions are permanent and cannot be undone." />

      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <div className="flex items-center justify-between">
          <div className="pr-4">
            <p className="text-sm font-semibold text-red-500">Delete Account</p>
            <p className="text-xs text-red-500/80 mt-0.5">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors shrink-0"
          >
            Delete
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-app rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-primary">Delete Account</h2>
                    <p className="text-xs text-muted">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm text-secondary mb-4">
                This will permanently delete your account, all transactions, and bank connections.
                Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm.
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-elevated border border-app rounded-xl px-4 py-3 text-sm text-primary mb-4 focus:outline-none focus:border-red-500 transition-colors font-mono"
              />

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-app text-secondary text-sm font-medium hover:bg-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting || confirmText !== 'DELETE'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Forever'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ MAIN PAGE ============

export default function Settings({ onReady }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Signal ready on mount
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  // ... rest

  // Filter sections based on search
  const filteredSections = searchQuery.trim()
    ? settingsSections.filter((section) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          section.label.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q) ||
          section.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : settingsSections;

  const hasNoMatches = searchQuery.trim() && filteredSections.length === 0;
  const isSearching = searchQuery.trim().length > 0;

  // When user clicks a filtered section, clear search
  const handleSectionClick = (id) => {
    setActiveSection(id);
    setSearchQuery('');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection />;
      case 'preferences': return <PreferencesSection />;
      case 'notifications': return <NotificationsSection />;
      case 'security': return <SecuritySection />;
      case 'danger': return <DangerZoneSection />;
      default: return null;
    }
  };  

  return (
  <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-1">Settings</h1>
        <p className="text-secondary text-sm md:text-base">Manage your account and app preferences</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="glass rounded-xl p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings... (try 'password', 'avatar', 'theme')"
              className="w-full bg-transparent border-0 pl-10 pr-10 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-0"
            />
            {isSearching && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-24 lg:pb-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <nav className="glass rounded-xl p-2 space-y-1 lg:sticky lg:top-24">
            {hasNoMatches ? (
              <div className="p-4 text-center">
                <Search size={20} className="text-muted mx-auto mb-2" />
                <p className="text-xs text-secondary mb-1">No settings found</p>
                <p className="text-[10px] text-muted">Try: 'password', 'theme', 'avatar'</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                {isSearching && (
                  <p className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-muted">
                    {filteredSections.length} match{filteredSections.length !== 1 ? 'es' : ''}
                  </p>
                )}
                {filteredSections.map((section) => {
                  const isActive = activeSection === section.id && !isSearching;
                  const isSearchMatch = isSearching && filteredSections.includes(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-500 font-medium'
                          : isSearchMatch
                          ? 'bg-blue-500/5 text-primary border border-blue-500/20'
                          : 'text-secondary hover:bg-hover hover:text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon
                          size={16}
                          className={section.danger && activeSection !== 'danger' ? 'text-red-500/70' : ''}
                        />
                        <span className="text-sm">{section.label}</span>
                      </div>
                      {isActive && (
                        <motion.div layoutId="active-settings-tab" className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                      {isSearchMatch && (
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-500">
                          Match
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </nav>
        </motion.div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}