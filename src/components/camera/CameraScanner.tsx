import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../ui/Primitives';
import { Button } from '../ui/Button';
import { createCameraReader, zxFormatToBarcodeFormat } from '../../services/barcodeService';
import { useAppStore } from '../../store/useAppStore';
import { genId, formatTime, FORMAT_LABELS } from '../../utils/format';
import type { BarcodeResult } from '../../types';

export function CameraScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState<string | null>(null);

  const cameraResults = useAppStore((s) => s.cameraResults);
  const addCameraResult = useAppStore((s) => s.addCameraResult);
  const clearCameraResults = useAppStore((s) => s.clearCameraResults);
  const settings = useAppStore((s) => s.settings);
  const pushToast = useAppStore((s) => s.pushToast);

  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  const start = async () => {
    setError(null);
    try {
      const reader = createCameraReader(settings.formats);
      const devices = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = devices;
      }
      const controls = await reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
        if (!result) return;
        const value = result.getText();
        setLastValue(value);
        const key = `${value}::${result.getBarcodeFormat()}`;
        if (seenRef.current.has(key)) return;
        seenRef.current.add(key);
        const r: BarcodeResult = {
          id: genId('cam'),
          fileId: 'camera',
          fileName: 'Live camera',
          page: 1,
          value,
          format: zxFormatToBarcodeFormat(result.getBarcodeFormat()),
          confidence: 'high',
          timestamp: Date.now(),
          source: 'camera',
        };
        addCameraResult(r);
        pushToast('success', 'Barcode detected', value.length > 40 ? value.slice(0, 40) + '\u2026' : value);
      });
      controlsRef.current = controls as any;
      setActive(true);
    } catch (err) {
      setError('Camera access was denied or is unavailable on this device.');
      console.error('Camera scanner error:', err);
      pushToast('error', 'Camera error', 'Could not access the camera.');
    }
  };

  const stop = () => {
    controlsRef.current?.stop();
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setActive(false);
  };

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-5">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Live Camera Scanner</h2>
          {active && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-success)]">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-pulse" /> Live
            </span>
          )}
        </CardHeader>
        <CardBody>
          <div className="relative aspect-video rounded-[var(--radius-control)] overflow-hidden bg-[#0B1120] border border-[var(--color-border)]">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            {active && (
              <motion.div
                className="absolute left-6 right-6 h-0.5 bg-[var(--color-danger)] shadow-[0_0_10px_var(--color-danger)]"
                animate={{ top: ['15%', '85%', '15%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {!active && (
              <div className="absolute inset-0 grid place-items-center text-white/60 text-sm">
                Camera preview will appear here
              </div>
            )}
          </div>
          {error && <p className="text-sm text-[var(--color-danger)] mt-3">{error}</p>}
          <div className="mt-4 flex items-center gap-3">
            {!active ? (
              <Button icon={<Camera />} onClick={start}>
                Start Camera
              </Button>
            ) : (
              <Button variant="danger" icon={<CameraOff />} onClick={stop}>
                Stop Camera
              </Button>
            )}
            {lastValue && (
              <span className="text-xs font-mono text-[var(--color-muted)] truncate max-w-[220px]">
                Last: {lastValue}
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Detected in this session</h3>
          <button
            onClick={() => {
              clearCameraResults();
              seenRef.current.clear();
            }}
            className="text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
            aria-label="Clear detections"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardBody className="max-h-[360px] overflow-y-auto space-y-2">
          {cameraResults.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-8">Point the camera at a barcode to begin.</p>
          ) : (
            cameraResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-medium truncate">{r.value}</p>
                  <p className="text-xs text-[var(--color-muted)]">{formatTime(r.timestamp)}</p>
                </div>
                <Badge tone="primary">{FORMAT_LABELS[r.format]}</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
