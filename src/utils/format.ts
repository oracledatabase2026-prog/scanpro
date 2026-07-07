export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export const FORMAT_LABELS: Record<string, string> = {
  QR_CODE: 'QR Code',
  EAN_13: 'EAN-13',
  EAN_8: 'EAN-8',
  CODE_128: 'Code 128',
  CODE_39: 'Code 39',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
  ITF: 'ITF',
  DATA_MATRIX: 'Data Matrix',
  PDF_417: 'PDF-417',
  AZTEC: 'Aztec',
  CODABAR: 'Codabar',
  UNKNOWN: 'Unknown',
};

export const ALL_FORMATS = Object.keys(FORMAT_LABELS).filter((f) => f !== 'UNKNOWN') as Array<
  keyof typeof FORMAT_LABELS
>;
