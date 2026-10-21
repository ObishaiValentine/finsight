import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Parser from './pages/Parser';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import { useNavigation } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';
import ResetPassword from './pages/ResetPassword';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = { duration: 0.15, ease: 'easeOut' };

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const LAST_ACTIVE_KEY = 'finsight-last-active';

function App() {
  const { activePage } = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [authView, setAuthView] = useState('login');
  const [showLanding, setShowLanding] = useState(true);

  // Logic to determine if we should show the app or the landing page
  useEffect(() => {
    // We wrap the state updates in a timeout to satisfy React 19 strict mode
    const checkSession = () => {
      if (isAuthenticated) {
        const lastActive = localStorage.getItem(LAST_ACTIVE_KEY);
        const now = Date.now();

        // If no last active time, or if it's been more than 15 mins, show landing
        if (!lastActive || (now - parseInt(lastActive, 10)) > SESSION_TIMEOUT) {
          setShowLanding(true);
        } else {
          // User is active recently, take them straight to the app
          setShowLanding(false);
        }
        
        // Update the last active time
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
      } else {
        // Not authenticated, always show landing
        setShowLanding(true);
      }
    };

    const timeoutId = setTimeout(checkSession, 0);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated]);

  // Track activity to reset the 15-minute timer while using the app
  useEffect(() => {
    if (!isAuthenticated || showLanding) return;

    const updateActivity = () => {
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    };

    // Update activity on interactions and tab visibility
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateActivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, showLanding]);

    // Intercept the password reset URL before the normal app logic
  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />;
  }

  // Initial app loading
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div
              className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-white font-bold text-2xl">F</span>
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-2xl ring-2 ring-blue-500/50"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 1. Not authenticated flow (Landing -> Auth)
  if (!isAuthenticated) {
    if (showLanding) {
      return (
        <Landing
          onNavigateToAuth={(view) => {
            setAuthView(view);
            setShowLanding(false);
          }}
          onGoToApp={() => setShowLanding(false)}
        />
      );
    }

    if (authView === 'signup') {
      return (
        <Signup
          onSwitchToLogin={() => setAuthView('login')}
          onBackToLanding={() => setShowLanding(true)}
        />
      );
    }

    return (
      <Login
        onSwitchToSignup={() => setAuthView('signup')}
        onBackToLanding={() => setShowLanding(true)}
      />
    );
  }

  // 2. Authenticated flow (Landing or App)
  if (showLanding) {
    return (
      <Landing
        onNavigateToAuth={() => {}}
        onGoToApp={() => {
          // Update last active time when they click "Dashboard"
          localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
          setShowLanding(false);
        }}
      />
    );
  }

  // 3. Render the actual App
  const renderPage = () => {
    switch (activePage) {
      case 'transactions': return <Transactions />;
      case 'analytics': return <Analytics />;
      case 'accounts': return <Accounts />;
      case 'settings': return <Settings />;
      case 'parser': return <Parser />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

   return (
    <Layout onGoHome={() => setShowLanding(true)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activePage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;