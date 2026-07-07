import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle, ScanLine } from 'lucide-react';
import { Button } from '../ui/Button';

export function Hero({ onStart, onLearnMore }: { onStart: () => void; onLearnMore: () => void }) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-12 pb-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-3 py-1 text-xs font-semibold mb-5">
          <ScanLine className="h-3.5 w-3.5" /> Client-side barcode engine
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08]">
          Extract every barcode with <span className="text-[var(--color-primary)]">pixel-perfect accuracy</span>
        </h1>
        <p className="mt-5 text-lg text-[var(--color-muted)] max-w-xl leading-relaxed">
          Decode QR codes, EAN, UPC, and Code 128/39 from images and multi-page PDFs &mdash; even skewed,
          rotated, or low-quality scans. Everything runs locally in your browser.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button size="lg" icon={<ArrowRight />} iconPosition="right" onClick={onStart}>
            Start scanning
          </Button>
          <Button size="lg" variant="outline" icon={<PlayCircle />} onClick={onLearnMore}>
            See how it works
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {['QR Code', 'EAN-13 / EAN-8', 'Code 128', 'Code 39', 'UPC-A / UPC-E', 'Multi-page PDF'].map((t) => (
            <span
              key={t}
              className="text-xs font-medium px-2.5 py-1.5 rounded-[var(--radius-control)] bg-[color-mix(in_oklab,var(--color-text)_4%,transparent)] text-[var(--color-muted)] border border-[var(--color-border)]"
            >
              {t}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative"
      >
        <div className="relative aspect-[4/3] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--shadow-elevated)] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-primary)_6%,transparent),transparent_60%)]" />
          <div className="absolute inset-6 rounded-xl border-2 border-dashed border-[color-mix(in_oklab,var(--color-primary)_30%,transparent)] grid place-items-center">
            <div className="grid grid-cols-6 gap-1.5 p-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 rounded-sm bg-[var(--color-text)]"
                  style={{ opacity: Math.random() > 0.35 ? 0.85 : 0.15, width: 6 + Math.random() * 6 }}
                />
              ))}
            </div>
            <motion.div
              className="absolute left-6 right-6 h-1 rounded-full bg-[var(--color-primary)] shadow-[0_0_16px_var(--color-primary)]"
              animate={{ top: ['8%', '92%', '8%'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute' }}
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[var(--radius-control)] bg-[var(--color-card)] border border-[var(--color-border)] px-4 py-2.5 shadow-[var(--shadow-card)]">
            <span className="text-xs font-semibold text-[var(--color-muted)]">Decoding frame&hellip;</span>
            <span className="text-xs font-mono font-semibold text-[var(--color-success)]">98.4% match</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
