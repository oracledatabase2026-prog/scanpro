import { FileCheck2, ScanBarcode, FileStack, Percent, Timer } from 'lucide-react';
import { StatCard } from './StatCard';
import { useAppStore } from '../../store/useAppStore';
import { formatDuration } from '../../utils/format';
import { useMemo } from 'react';

export function StatisticsGrid() {
  const files = useAppStore((s) => s.files);
  const results = useAppStore((s) => s.results);
  const scanStartedAt = useAppStore((s) => s.scanStartedAt);

  const stats = useMemo(() => {
    const filesProcessed = files.filter((f) => f.status === 'done').length;
    const barcodesFound = results.length;
    const pagesRead = files.reduce((acc, f) => acc + (f.status === 'done' ? f.pageCount : 0), 0);
    const errored = files.filter((f) => f.status === 'error').length;
    const totalDone = filesProcessed + errored;
    const successRate = totalDone === 0 ? 100 : Math.round((filesProcessed / totalDone) * 100);
    const durationMs = scanStartedAt ? Date.now() - scanStartedAt : 0;
    return { filesProcessed, barcodesFound, pagesRead, successRate, durationMs };
  }, [files, results, scanStartedAt]);

  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-2">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard index={0} label="Files Processed" value={String(stats.filesProcessed)} icon={FileCheck2} tone="primary" trend={8} trendLabel="vs last session" />
        <StatCard index={1} label="Barcodes Found" value={String(stats.barcodesFound)} icon={ScanBarcode} tone="success" trend={12} trendLabel="vs last session" />
        <StatCard index={2} label="Pages Read" value={String(stats.pagesRead)} icon={FileStack} tone="primary" trend={4} trendLabel="vs last session" />
        <StatCard index={3} label="Success Rate" value={`${stats.successRate}%`} icon={Percent} tone={stats.successRate > 80 ? 'success' : 'warning'} trend={stats.successRate > 80 ? 2 : -3} trendLabel="detection accuracy" />
        <StatCard index={4} label="Session Duration" value={formatDuration(stats.durationMs)} icon={Timer} tone="warning" />
      </div>
    </section>
  );
}
