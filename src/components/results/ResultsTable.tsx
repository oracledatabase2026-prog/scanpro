import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../ui/Primitives';
import { useAppStore } from '../../store/useAppStore';
import { cx, FORMAT_LABELS, ALL_FORMATS, formatTime } from '../../utils/format';
import type { BarcodeResult, ConfidenceLevel } from '../../types';

const PAGE_SIZE = 8;

function confidenceTone(level: ConfidenceLevel): 'success' | 'warning' | 'danger' {
  if (level === 'high') return 'success';
  if (level === 'medium') return 'warning';
  return 'danger';
}

function looksLikeUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

export function ResultsTable() {
  const results = useAppStore((s) => s.results);
  const cameraResults = useAppStore((s) => s.cameraResults);
  const allResults = useMemo(() => [...results, ...cameraResults], [results, cameraResults]);

  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allResults.filter((r) => {
      const matchesSearch =
        search.trim() === '' ||
        r.value.toLowerCase().includes(search.toLowerCase()) ||
        r.fileName.toLowerCase().includes(search.toLowerCase());
      const matchesFormat = formatFilter === 'ALL' || r.format === formatFilter;
      return matchesSearch && matchesFormat;
    });
  }, [allResults, search, formatFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const copyValue = (r: BarcodeResult) => {
    navigator.clipboard.writeText(r.value).then(() => {
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  return (
    <Card>
      <CardHeader className="flex-col sm:flex-row items-start sm:items-center gap-3">
        <div>
          <h2 className="font-semibold text-lg">Results</h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">{filtered.length} of {allResults.length} decoded values</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted)]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search value or file&hellip;"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>
      </CardHeader>

      <div className="px-6 pt-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setFormatFilter('ALL');
            setPage(1);
          }}
          className={cx(
            'text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-pill)] border transition-colors',
            formatFilter === 'ALL'
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
          )}
        >
          All formats
        </button>
        {ALL_FORMATS.filter((fmt) => allResults.some((r) => r.format === fmt)).map((fmt) => (
          <button
            key={fmt}
            onClick={() => {
              setFormatFilter(fmt);
              setPage(1);
            }}
            className={cx(
              'text-xs font-semibold px-3 py-1.5 rounded-[var(--radius-pill)] border transition-colors',
              formatFilter === fmt
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {FORMAT_LABELS[fmt]}
          </button>
        ))}
      </div>

      <CardBody>
        {allResults.length === 0 ? (
          <div className="text-center py-12">
            <Inbox className="h-9 w-9 text-[var(--color-muted)] mx-auto mb-3" />
            <p className="font-medium">No results yet</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">Scan a file or use the live camera to see decoded barcodes here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide border-b border-[var(--color-border)]">
                    <th className="pb-3 pr-4">Format</th>
                    <th className="pb-3 pr-4">Value</th>
                    <th className="pb-3 pr-4">Location</th>
                    <th className="pb-3 pr-4">Confidence</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((r) => (
                    <ResultRow
                      key={r.id}
                      result={r}
                      expanded={expandedId === r.id}
                      onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      onCopy={() => copyValue(r)}
                      copied={copiedId === r.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 grid place-items-center rounded-[var(--radius-control)] border border-[var(--color-border)] disabled:opacity-40 hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)] transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 grid place-items-center rounded-[var(--radius-control)] border border-[var(--color-border)] disabled:opacity-40 hover:bg-[color-mix(in_oklab,var(--color-text)_5%,transparent)] transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

function ResultRow({
  result,
  expanded,
  onToggle,
  onCopy,
  copied,
}: {
  result: BarcodeResult;
  expanded: boolean;
  onToggle: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const url = looksLikeUrl(result.value);
  return (
    <>
      <tr className="border-b border-[var(--color-border)] last:border-0 hover:bg-[color-mix(in_oklab,var(--color-text)_2%,transparent)] transition-colors">
        <td className="py-3 pr-4">
          <Badge tone="primary">{FORMAT_LABELS[result.format]}</Badge>
        </td>
        <td className="py-3 pr-4 max-w-[220px]">
          <button onClick={onToggle} className="flex items-center gap-1.5 font-mono text-xs font-medium truncate hover:text-[var(--color-primary)] transition-colors">
            <ChevronDown className={cx('h-3.5 w-3.5 shrink-0 transition-transform', expanded && 'rotate-180')} />
            <span className="truncate">{result.value}</span>
          </button>
        </td>
        <td className="py-3 pr-4 text-[var(--color-muted)]">
          {result.fileName} {result.source === 'file' && `\u00b7 p.${result.page}`}
        </td>
        <td className="py-3 pr-4">
          <Badge tone={confidenceTone(result.confidence)} dot>
            {result.confidence}
          </Badge>
        </td>
        <td className="py-3 pr-4">
          <Badge tone={result.source === 'camera' ? 'primary' : 'success'}>
            {result.source === 'camera' ? 'Live' : 'Decoded'}
          </Badge>
        </td>
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={onCopy}
              className="h-7 w-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)] transition-colors"
              aria-label="Copy value"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-success)]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            {url && (
              <button
                onClick={() => window.open(result.value, '_blank', 'noopener,noreferrer')}
                className="h-7 w-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[color-mix(in_oklab,var(--color-text)_6%,transparent)] transition-colors"
                aria-label="Open link"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={6} className="p-0">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[color-mix(in_oklab,var(--color-text)_3%,transparent)] px-4 py-3 text-xs grid sm:grid-cols-2 gap-2 mb-2 rounded-[var(--radius-control)] mx-1">
                  <div><span className="text-[var(--color-muted)]">Full value: </span><span className="font-mono break-all">{result.value}</span></div>
                  <div><span className="text-[var(--color-muted)]">Detected at: </span>{formatTime(result.timestamp)}</div>
                  <div><span className="text-[var(--color-muted)]">Source: </span>{result.source}</div>
                  <div><span className="text-[var(--color-muted)]">Page: </span>{result.page}</div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
