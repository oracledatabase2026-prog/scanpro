import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import { Hero } from '../components/dashboard/Hero';
import { StatisticsGrid } from '../components/dashboard/StatisticsGrid';
import { ScannerPanel } from '../components/scanner/ScannerPanel';
import { LiveProgress } from '../components/scanner/LiveProgress';
import { ResultsTable } from '../components/results/ResultsTable';
import { useAppStore } from '../store/useAppStore';

const ChartsSection = lazy(() => import('../components/charts/ChartsSection').then((m) => ({ default: m.ChartsSection })));

export function DashboardPage() {
  const setNav = useAppStore((s) => s.setNav);

  return (
    <div className="space-y-8 pb-4">
      <Hero onStart={() => setNav('scans')} onLearnMore={() => setNav('help')} />
      <StatisticsGrid />
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 grid xl:grid-cols-[1.3fr_0.7fr] gap-5"
      >
        <ScannerPanel />
        <LiveProgress />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
      >
        <ResultsTable />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8"
      >
        <Suspense
          fallback={
            <div className="grid lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton h-64 rounded-[var(--radius-card)]" />
              ))}
            </div>
          }
        >
          <ChartsSection />
        </Suspense>
      </motion.section>
    </div>
  );
}
