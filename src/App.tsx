import { AnimatePresence } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Toaster } from './components/ui/Toaster';
import { PageSkeleton } from './components/ui/PageSkeleton';
import { useAppStore } from './store/useAppStore';
import { DashboardPage } from './pages/DashboardPage';

const ScansPage = lazy(() => import('./pages/ScansPage').then((m) => ({ default: m.ScansPage })));
const CameraPage = lazy(() => import('./pages/CameraPage').then((m) => ({ default: m.CameraPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const HelpPage = lazy(() => import('./pages/HelpPage').then((m) => ({ default: m.HelpPage })));

function App() {
  const nav = useAppStore((s) => s.nav);

  const renderPage = () => {
    switch (nav) {
      case 'dashboard':
        return <DashboardPage />;
      case 'scans':
        return <ScansPage />;
      case 'camera':
        return <CameraPage />;
      case 'reports':
        return <ReportsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      case 'help':
        return <HelpPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Suspense fallback={<PageSkeleton />}>
            <AnimatePresence mode="wait">{renderPage()}</AnimatePresence>
          </Suspense>
        </main>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
