import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  useEffect(() => {
    let subscription = null;

    const handleAuth = async () => {
      try {
        // 1. Try getting session (Supabase v2 parses the URL hash automatically)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          localStorage.setItem('finsight-token', session.access_token);
          localStorage.setItem('finsight-user', JSON.stringify(session.user));
          localStorage.setItem('finsight-last-active', Date.now().toString());
          window.location.href = '/'; 
        } else {
          // 2. Fallback: If URL parsing wasn't fast enough, listen for the auth event
          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              localStorage.setItem('finsight-token', session.access_token);
              localStorage.setItem('finsight-user', JSON.stringify(session.user));
              localStorage.setItem('finsight-last-active', Date.now().toString());
              window.location.href = '/'; 
            }
          });
          subscription = data.subscription;

          // 3. Safety timeout: If nothing happens in 3 seconds, go back to landing
          setTimeout(() => {
            if (!localStorage.getItem('finsight-token')) {
              window.location.href = '/';
            }
          }, 3000);
        }
      } catch (err) {
        console.error('Auth error:', err);
        window.location.href = '/';
      }
    };
    
    handleAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
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