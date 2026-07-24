import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { ProductSelection } from './screens/ProductSelection';
import { ProductDashboard } from './screens/ProductDashboard';
import { ModuleWorkspace } from './screens/ModuleWorkspace';
import { StageDetail } from './screens/StageDetail';
import { QAReview } from './screens/QAReview';
import { AdminMaster } from './screens/AdminMaster';
import { Reports } from './screens/Reports';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { currentScreen, theme } = useApp();

  // Route selector
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'product-selection':
        return <ProductSelection />;
      case 'dashboard':
        return <ProductDashboard />;
      case 'workspace':
        return <ModuleWorkspace />;
      case 'stage-detail':
        return <StageDetail />;
      case 'qa-review':
        return <QAReview />;
      case 'admin-master':
        return <AdminMaster />;
      case 'reports':
        return <Reports />;
      default:
        return <WelcomeScreen />;
    }
  };

  // Common Bottom Status Bar component
  const StatusBar = () => (
    <div 
      style={{
        height: '28px',
        backgroundColor: 'var(--color-primary)',
        borderTop: '1px solid var(--color-outline-variant)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: 'var(--color-on-primary)',
        zIndex: 100,
        flexShrink: 0,
        transition: 'background-color 0.2s ease, color 0.2s ease'
      }}
      className="text-micro font-mono"
    >
      <span style={{ fontWeight: 700 }}>
        Developed by <span style={{ fontWeight: 400 }}>Central Manufacturing Technology Institute</span>
      </span>
    </div>
  );

  // Fullscreen welcome screen - no sidebar/header
  if (currentScreen === 'welcome') {
    return (
      <div 
        className={`theme-${theme}`} 
        style={{ 
          width: '100vw', 
          height: '100vh', 
          backgroundColor: 'var(--color-surface)', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
          <WelcomeScreen />
        </div>
        <StatusBar />
      </div>
    );
  }

  // Dashboard layout shell
  return (
    <div 
      className={`app-layout theme-${theme}`} 
      style={{
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface-variant)',
        fontFamily: 'var(--font-body)',
        transition: 'background-color 0.2s ease, color 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}
    >
      {/* Row containing Sidebar + Main WorkSpace Frame */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Workspace Frame */}
        <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Header Toolbar */}
          <Header />

          {/* Scrollable Page Space */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
