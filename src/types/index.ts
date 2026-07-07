export type BarcodeFormat =
  | 'QR_CODE'
  | 'EAN_13'
  | 'EAN_8'
  | 'CODE_128'
  | 'CODE_39'
  | 'UPC_A'
  | 'UPC_E'
  | 'ITF'
  | 'DATA_MATRIX'
  | 'PDF_417'
  | 'AZTEC'
  | 'CODABAR'
  | 'UNKNOWN';

export type FileStatus = 'queued' | 'processing' | 'done' | 'error' | 'stopped';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface BarcodeResult {
  id: string;
  fileId: string;
  fileName: string;
  page: number;
  value: string;
  format: BarcodeFormat;
  confidence: ConfidenceLevel;
  timestamp: number;
  source: 'file' | 'camera' | 'manual';
}

export interface ScanFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileStatus;
  progress: number;
  pageCount: number;
  results: BarcodeResult[];
  error?: string;
  thumbnail?: string;
  addedAt: number;
}

export interface ScanSettings {
  autoEnhance: boolean;
  deskew: boolean;
  multiAttempt: boolean;
  formats: BarcodeFormat[];
}

export interface SessionStats {
  filesProcessed: number;
  barcodesFound: number;
  pagesRead: number;
  successRate: number;
  durationMs: number;
}

export interface InvoiceRow {
  id: string;
  productCode: string;
  productName: string;
  sku?: string;
  barcode: string;
  matched: boolean;
  matchedValue?: string;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export type NavKey = 'dashboard' | 'scans' | 'camera' | 'reports' | 'history' | 'settings' | 'help';
