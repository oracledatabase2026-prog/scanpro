import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UploadCloud,
  Play,
  Square,
  RotateCcw,
  Download,
  FileImage,
  FileText,
  X,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Divider } from '../ui/Primitives';
import { Button } from '../ui/Button';
import { useDropzone } from '../../hooks/useDropzone';
import { useAppStore } from '../../store/useAppStore';
import { fileRegistry, useScanner } from '../../hooks/useScanner';
import { genId, formatBytes, ALL_FORMATS, FORMAT_LABELS, cx } from '../../utils/format';
import { exportResultsCsv, exportResultsXlsx } from '../../utils/exportHelpers';
import type { ScanFile } from '../../types';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', '.jfif', 'application/pdf'];

export function ScannerPanel() {
  const files = useAppStore((s) => s.files);
  const addFiles = useAppStore((s) => s.addFiles);
  const removeFile = useAppStore((s) => s.removeFile);
  const isScanning = useAppStore((s) => s.isScanning);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const results = useAppStore((s) => s.results);
  const pushToast = useAppStore((s) => s.pushToast);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { runScan, stopScan, resetScan } = useScanner();

  const onFiles = useCallback(
    (incoming: File[]) => {
      const scanFiles: ScanFile[] = incoming.map((file) => {
        const id = genId('file');
        fileRegistry.set(id, file);
        return {
          id,
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          status: 'queued',
          progress: 0,
          pageCount: file.type === 'application/pdf' ? 0 : 1,
          results: [],
          addedAt: Date.now(),
        };
      });
      addFiles(scanFiles);
      pushToast('info', `${scanFiles.length} file${scanFiles.length === 1 ? '' : 's'} added`, 'Ready to scan.');
    },
    [addFiles, pushToast]
  );

  const dz = useDropzone(onFiles, ACCEPTED);

  const queuedCount = files.filter((f) => f.status === 'queued').length;
  const hasResults = results.length > 0;

  const toggleFormat = (fmt: string) => {
    const list = settings.formats;
    updateSettings({
      formats: list.includes(fmt as any) ? list.filter((f) => f !== fmt) : [...list, fmt as any],
    });
  };

  return (
    <Card className="overflow-visible">
      <CardHeader>
        <div>
          <h2 className="font-semibold text-lg">Scanner</h2>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">Upload images or PDFs to extract barcodes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download />}
            disabled={!hasResults}
            onClick={() => exportResultsCsv(results)}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download />}
            disabled={!hasResults}
            onClick={() => exportResultsXlsx(results)}
          >
            Excel
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        <div
          onDrop={dz.onDrop}
          onDragOver={dz.onDragOver}
          onDragLeave={dz.onDragLeave}
          onClick={dz.openPicker}
          className={cx(
            'rounded-[var(--radius-control)] border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200',
            dz.isDragging
              ? 'border-[var(--color-primary)] bg-[color-mix(in_oklab,var(--color-primary)_6%,transparent)]'
              : 'border-[var(--color-border)] hover:border-[color-mix(in_oklab,var(--color-primary)_50%,var(--color-border))] hover:bg-[color-mix(in_oklab,var(--color-text)_2%,transparent)]'
          )}
        >
          <input
            ref={dz.inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={dz.onInputChange}
          />
          <motion.div
            animate={{ y: dz.isDragging ? -4 : 0 }}
            className="mx-auto h-12 w-12 rounded-full bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] grid place-items-center mb-3"
          >
            <UploadCloud className="h-6 w-6 text-[var(--color-primary)]" />
          </motion.div>
          <p className="font-medium">Drag & drop files here, or click to browse</p>
          <p className="text-sm text-[var(--color-muted)] mt-1">Supports JPG, PNG, WEBP, JFIF, and multi-page PDF</p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5"
              >
                {f.type === 'application/pdf' ? (
                  <FileText className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                ) : (
                  <FileImage className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatBytes(f.size)} &middot; {f.status}
                    {f.status === 'processing' && ` \u2022 ${f.progress}%`}
                  </p>
                </div>
                {f.status === 'processing' && (
                  <div className="h-1.5 w-20 rounded-full bg-[var(--color-border)] overflow-hidden shrink-0">
                    <div
                      className="h-full bg-[var(--color-primary)] transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileRegistry.delete(f.id);
                    removeFile(f.id);
                  }}
                  className="shrink-0 h-7 w-7 grid place-items-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger)_8%,transparent)] transition-colors"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Divider className="my-5" />

        <button
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <Sliders className="h-4 w-4" />
          Advanced settings
          <ChevronDown className={cx('h-4 w-4 transition-transform duration-200', advancedOpen && 'rotate-180')} />
        </button>

        {advancedOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 space-y-4 overflow-hidden"
          >
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { key: 'autoEnhance' as const, label: 'Auto-enhance contrast' },
                { key: 'deskew' as const, label: 'Deskew rotated scans' },
                { key: 'multiAttempt' as const, label: 'Multi-attempt decoding' },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={settings[opt.key]}
                    onChange={(e) => updateSettings({ [opt.key]: e.target.checked })}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted)] mb-2">
                Barcode formats (leave empty to detect all)
              </p>
              <div className="flex flex-wrap gap-2">
                {ALL_FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={cx(
                      'text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-pill)] border transition-colors duration-200',
                      settings.formats.includes(fmt as any)
                        ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'
                    )}
                  >
                    {FORMAT_LABELS[fmt]}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <Divider className="my-5" />

        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Play />} disabled={queuedCount === 0 || isScanning} loading={isScanning} onClick={runScan}>
            Start Scan {queuedCount > 0 && `(${queuedCount})`}
          </Button>
          <Button variant="outline" icon={<Square />} disabled={!isScanning} onClick={stopScan}>
            Stop Scan
          </Button>
          <Button variant="ghost" icon={<RotateCcw />} disabled={files.length === 0} onClick={resetScan}>
            Reset
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
