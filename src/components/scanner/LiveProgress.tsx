import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../ui/Primitives';
import { useAppStore } from '../../store/useAppStore';
import { formatTime } from '../../utils/format';

export function LiveProgress() {
  const files = useAppStore((s) => s.files);
  const isScanning = useAppStore((s) => s.isScanning);

  const current = files.find((f) => f.status === 'processing');
  const done = files.filter((f) => f.status === 'done').length;
  const total = files.length;
  const overallPct = total === 0 ? 0 : Math.round((done / total) * 100);

  const logs = useMemo(() => {
    return files
      .filter((f) => f.status !== 'queued')
      .slice()
      .reverse()
      .slice(0, 8)
      .map((f) => ({
        id: f.id,
        text:
          f.status === 'done'
            ? `${f.name} decoded \u2014 ${f.results.length} barcode${f.results.length === 1 ? '' : 's'} found`
            : f.status === 'error'
            ? `${f.name} failed \u2014 ${f.error ?? 'unknown error'}`
            : f.status === 'stopped'
            ? `${f.name} skipped \u2014 scan stopped`
            : `${f.name} processing\u2026 ${f.progress}%`,
        status: f.status,
      }));
  }, [files]);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Live Progress</h2>
        </CardHeader>
        <CardBody className="text-center py-10">
          <Clock className="h-8 w-8 text-[var(--color-muted)] mx-auto mb-3" />
          <p className="text-sm text-[var(--color-muted)]">Upload files to see live scan progress here.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-lg">Live Progress</h2>
        {isScanning && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning
          </span>
        )}
      </CardHeader>
      <CardBody>
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-medium">
            {current ? `Processing: ${current.name}` : isScanning ? 'Starting\u2026' : 'Idle'}
          </span>
          <span className="font-mono font-semibold">{overallPct}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-border)] overflow-hidden">
          <motion.div
            className="h-full bg-[var(--color-primary)]"
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-2">
          {done} of {total} file{total === 1 ? '' : 's'} complete
        </p>

        <div className="mt-5 rounded-[var(--radius-control)] bg-[color-mix(in_oklab,var(--color-text)_3%,transparent)] border border-[var(--color-border)] p-3 max-h-52 overflow-y-auto font-mono text-xs space-y-1.5">
          <AnimatePresence initial={false}>
            {logs.length === 0 && <p className="text-[var(--color-muted)]">Waiting for scan to start&hellip;</p>}
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2"
              >
                {log.status === 'done' && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />}
                {log.status === 'error' && <XCircle className="h-3.5 w-3.5 text-[var(--color-danger)] shrink-0 mt-0.5" />}
                {log.status === 'processing' && <Loader2 className="h-3.5 w-3.5 text-[var(--color-primary)] animate-spin shrink-0 mt-0.5" />}
                {log.status === 'stopped' && <Clock className="h-3.5 w-3.5 text-[var(--color-warning)] shrink-0 mt-0.5" />}
                <span className="text-[var(--color-text)]">
                  <span className="text-[var(--color-muted)]">[{formatTime(Date.now())}]</span> {log.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardBody>
    </Card>
  );
}
