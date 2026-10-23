import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      // Removed 'error' from this line to fix the ESLint warning
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Bridge the gap: Save the Supabase session into your app's custom keys
        localStorage.setItem('finsight-token', session.access_token);
        localStorage.setItem('finsight-user', JSON.stringify(session.user));
        localStorage.setItem('finsight-last-active', Date.now().toString());
        
        window.location.href = '/'; 
      } else {
        window.location.href = '/'; 
      }
    };
    
    handleAuth();
  }, []);

  return (
    <div className="min-h-dvh bg-app flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm text-secondary">Verifying login...</p>
      </div>
    </div>
  );
}