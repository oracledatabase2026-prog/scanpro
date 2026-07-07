import { ScanLine } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] mt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--color-muted)]">
          <ScanLine className="h-4 w-4" />
          <span className="text-sm">ScanPro &mdash; barcode intelligence, entirely in your browser</span>
        </div>
        <p className="text-xs text-[var(--color-muted)]">No files ever leave your device.</p>
      </div>
    </footer>
  );
}
