import { useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { decodeFile } from '../services/barcodeService';
import { genId } from '../utils/format';
import type { BarcodeResult } from '../types';

export function useScanner() {
  const stopRef = useRef(false);

  const files = useAppStore((s) => s.files);
  const updateFile = useAppStore((s) => s.updateFile);
  const addResults = useAppStore((s) => s.addResults);
  const setScanning = useAppStore((s) => s.setScanning);
  const setScanStartedAt = useAppStore((s) => s.setScanStartedAt);
  const settings = useAppStore((s) => s.settings);
  const pushToast = useAppStore((s) => s.pushToast);

  const runScan = useCallback(async () => {
    stopRef.current = false;
    setScanning(true);
    setScanStartedAt(Date.now());
    const toastId = pushToast('loading', 'Scan in progress', 'Decoding queued files\u2026');

    const queued = useAppStore.getState().files.filter((f) => f.status === 'queued');
    let totalFound = 0;

    for (const file of queued) {
      if (stopRef.current) {
        updateFile(file.id, { status: 'stopped' });
        continue;
      }
      updateFile(file.id, { status: 'processing', progress: 0 });
      try {
        const rawFile = fileRegistry.get(file.id);
        if (!rawFile) throw new Error('File data unavailable');

        const { results, pageCount } = await decodeFile(rawFile, {
          settings,
          onPage: (page, total) => {
            updateFile(file.id, { progress: Math.round((page / total) * 100) });
          },
        });

        const barcodeResults: BarcodeResult[] = results.map((r) => ({
          id: genId('bc'),
          fileId: file.id,
          fileName: file.name,
          page: r.page,
          value: r.value,
          format: r.format,
          confidence: r.confidence,
          timestamp: Date.now(),
          source: 'file',
        }));

        totalFound += barcodeResults.length;
        addResults(barcodeResults);
        updateFile(file.id, { status: 'done', progress: 100, pageCount, results: barcodeResults });
      } catch (err) {
        updateFile(file.id, { status: 'error', error: (err as Error).message || 'Decode failed' });
      }
    }

    setScanning(false);
    useAppStore.getState().dismissToast(toastId);
    if (stopRef.current) {
      pushToast('warning', 'Scan stopped', 'Remaining files were left in the queue.');
    } else {
      pushToast('success', 'Scan complete', `${totalFound} barcode${totalFound === 1 ? '' : 's'} found across ${queued.length} file${queued.length === 1 ? '' : 's'}.`);
    }
  }, [settings, updateFile, addResults, setScanning, setScanStartedAt, pushToast]);

  const stopScan = useCallback(() => {
    stopRef.current = true;
  }, []);

  const resetScan = useCallback(() => {
    stopRef.current = false;
    fileRegistry.clear();
    useAppStore.getState().clearFiles();
    setScanStartedAt(null);
  }, [setScanStartedAt]);

  return { runScan, stopScan, resetScan, files };
}

/** Keeps raw File objects out of the zustand store (which should stay serializable-ish). */
export const fileRegistry = new Map<string, File>();
