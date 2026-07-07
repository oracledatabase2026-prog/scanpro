import { motion } from 'framer-motion';
import { History, FileImage, FileText } from 'lucide-react';
import { Card, CardBody, Badge } from '../components/ui/Primitives';
import { useAppStore } from '../store/useAppStore';
import { formatBytes, formatTime } from '../utils/format';

export function HistoryPage() {
  const files = useAppStore((s) => s.files);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-[var(--color-muted)] mt-1">All files processed during this session</p>
      </div>
      <Card>
        <CardBody>
          {files.length === 0 ? (
            <div className="text-center py-14">
              <History className="h-9 w-9 text-[var(--color-muted)] mx-auto mb-3" />
              <p className="font-medium">No scan history yet</p>
              <p className="text-sm text-[var(--color-muted)] mt-1">Files you scan will be listed here for this session.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files
                .slice()
                .sort((a, b) => b.addedAt - a.addedAt)
                .map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-3">
                    {f.type === 'application/pdf' ? (
                      <FileText className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                    ) : (
                      <FileImage className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {formatBytes(f.size)} &middot; {formatTime(f.addedAt)} &middot; {f.results.length} barcode{f.results.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <Badge
                      tone={f.status === 'done' ? 'success' : f.status === 'error' ? 'danger' : f.status === 'processing' ? 'primary' : 'neutral'}
                    >
                      {f.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}
