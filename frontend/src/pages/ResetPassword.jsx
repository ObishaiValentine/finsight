import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthInput from '../components/AuthInput';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from the email link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one from the login page.');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      // Redirect to dashboard/home after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-app flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text mb-2">Set New Password</h1>
          <p className="text-sm text-secondary">Enter your new password below.</p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-6">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-primary mb-2">Password Updated!</h2>
            <p className="text-sm text-secondary">Redirecting you to the app...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}

            <AuthInput 
              label="New Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter new password" 
              icon={Lock} 
            />
            
            <AuthInput 
              label="Confirm New Password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              placeholder="Confirm new password" 
              icon={Lock} 
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 mt-4"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Update Password <ArrowRight size={16} /></>}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}