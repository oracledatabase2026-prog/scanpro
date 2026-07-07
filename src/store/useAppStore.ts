import { create } from 'zustand';
import type {
  BarcodeResult,
  InvoiceRow,
  NavKey,
  ScanFile,
  ScanSettings,
  ToastItem,
  ToastVariant,
} from '../types';
import { genId } from '../utils/format';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  nav: NavKey;
  setNav: (n: NavKey) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  files: ScanFile[];
  addFiles: (files: ScanFile[]) => void;
  updateFile: (id: string, patch: Partial<ScanFile>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  results: BarcodeResult[];
  addResults: (results: BarcodeResult[]) => void;
  clearResults: () => void;

  cameraResults: BarcodeResult[];
  addCameraResult: (r: BarcodeResult) => void;
  clearCameraResults: () => void;
  removeCameraResults: (ids: string[]) => void;

  isScanning: boolean;
  setScanning: (v: boolean) => void;
  scanStartedAt: number | null;
  setScanStartedAt: (v: number | null) => void;

  settings: ScanSettings;
  updateSettings: (patch: Partial<ScanSettings>) => void;

  invoiceRows: InvoiceRow[];
  setInvoiceRows: (rows: InvoiceRow[]) => void;
  invoiceFileName: string | null;
  setInvoiceFileName: (n: string | null) => void;
  matchInvoice: () => void;
  clearInvoice: () => void;

  toasts: ToastItem[];
  pushToast: (variant: ToastVariant, title: string, description?: string) => string;
  dismissToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (localStorage.getItem('scanpro-theme') as 'light' | 'dark') || 'light',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('scanpro-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),

  nav: 'dashboard',
  setNav: (n) => set({ nav: n }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  files: [],
  addFiles: (files) => set((s) => ({ files: [...files, ...s.files] })),
  updateFile: (id, patch) =>
    set((s) => ({ files: s.files.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
  removeFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
  clearFiles: () => set({ files: [], results: [] }),

  results: [],
  addResults: (results) => set((s) => ({ results: [...s.results, ...results] })),
  clearResults: () => set({ results: [] }),

  cameraResults: [],
  addCameraResult: (r) => set((s) => ({ cameraResults: [r, ...s.cameraResults] })),
  clearCameraResults: () => set({ cameraResults: [] }),
  removeCameraResults: (ids) =>
    set((s) => ({ cameraResults: s.cameraResults.filter((r) => !ids.includes(r.id)) })),

  isScanning: false,
  setScanning: (v) => set({ isScanning: v }),
  scanStartedAt: null,
  setScanStartedAt: (v) => set({ scanStartedAt: v }),

  settings: {
    autoEnhance: true,
    deskew: true,
    multiAttempt: true,
    formats: [],
  },
  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  invoiceRows: [],
  setInvoiceRows: (rows) => set({ invoiceRows: rows }),
  invoiceFileName: null,
  setInvoiceFileName: (n) => set({ invoiceFileName: n }),
  matchInvoice: () => {
    const allResults = [...get().results, ...get().cameraResults];
    const foundValues = new Set(allResults.map((r) => r.value.trim()));
    set((s) => ({
      invoiceRows: s.invoiceRows.map((row) => {
        const match = foundValues.has(row.barcode.trim()) && row.barcode.trim() !== '';
        return { ...row, matched: match, matchedValue: match ? row.barcode : undefined };
      }),
    }));
  },
  clearInvoice: () => set({ invoiceRows: [], invoiceFileName: null }),

  toasts: [],
  pushToast: (variant, title, description) => {
    const id = genId('toast');
    set((s) => ({ toasts: [...s.toasts, { id, variant, title, description }] }));
    if (variant !== 'loading') {
      setTimeout(() => get().dismissToast(id), 4500);
    }
    return id;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
