import { motion } from 'framer-motion';
import { ScannerPanel } from '../components/scanner/ScannerPanel';
import { LiveProgress } from '../components/scanner/LiveProgress';
import { ResultsTable } from '../components/results/ResultsTable';

export function ScansPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scans</h1>
        <p className="text-[var(--color-muted)] mt-1">Upload files and manage barcode extraction jobs</p>
      </div>
      <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-5">
        <ScannerPanel />
        <LiveProgress />
      </div>
      <ResultsTable />
    </motion.div>
  );
}
