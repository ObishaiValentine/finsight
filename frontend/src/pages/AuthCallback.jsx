import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useNavigation } from '../hooks/useNavigation';

export default function AuthCallback() {
  const { setActivePage } = useNavigation();

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase automatically detects the session from the URL hash
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Force a redirect to the dashboard by reloading the root and letting App.jsx handle it
        window.location.href = '/'; 
      } else {
        // If error, go back to login
        window.location.href = '/';
      }
    };
    
    handleAuth();
  }, [setActivePage]);

  return (
    <div className="min-h-dvh bg-app flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-500" />
        <p className="text-sm text-secondary">Verifying login...</p>
      </div>
    </div>
  );
}