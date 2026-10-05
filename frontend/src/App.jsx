import { useState } from 'react';
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
import { useNavigation } from './hooks/useNavigation';
import { useAuth } from './hooks/useAuth';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = { duration: 0.15, ease: 'easeOut' };

function App() {
  const { activePage } = useNavigation();
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState('login');

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

  if (!isAuthenticated) {
    if (authView === 'signup') {
      return <Signup onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToSignup={() => setAuthView('signup')} />;
  }

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
    <Layout>
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