import { motion } from 'framer-motion';
import { ScanLine, ShieldCheck, Zap, FileStack } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Primitives';

const FAQ = [
  {
    q: 'What file types are supported?',
    a: 'JPG, PNG, WEBP, and JFIF images, plus multi-page PDF documents. Each PDF page is rasterized and scanned individually.',
  },
  {
    q: 'Does anything leave my device?',
    a: 'No. Decoding happens entirely in your browser using a local barcode engine \u2014 files are never uploaded anywhere.',
  },
  {
    q: 'Why did a barcode fail to decode?',
    a: 'Try enabling auto-enhance and multi-attempt decoding in Settings, or rescan at a higher resolution if the source image is blurry.',
  },
  {
    q: 'Can I match scanned codes to a product list?',
    a: 'Yes \u2014 use the Reports tab to upload an invoice or product spreadsheet, map the barcode column, then match it against your scans.',
  },
];

export function HelpPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">About &amp; Help</h1>
        <p className="text-[var(--color-muted)] mt-1">Everything you need to know about ScanPro</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: ScanLine, title: 'Multi-format engine', desc: 'QR, EAN, UPC, Code 128/39, PDF-417, Data Matrix, and more.' },
          { icon: ShieldCheck, title: 'Private by design', desc: 'Every scan runs locally \u2014 nothing is ever uploaded.' },
          { icon: Zap, title: 'Fast & accurate', desc: 'Auto-enhance and multi-attempt decoding recover tough scans.' },
        ].map((f) => (
          <Card key={f.title} className="p-5">
            <f.icon className="h-6 w-6 text-[var(--color-primary)] mb-3" />
            <p className="font-semibold text-sm">{f.title}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">{f.desc}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <FileStack className="h-4 w-4" /> Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <Card key={item.q}>
              <CardBody>
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-sm text-[var(--color-muted)] mt-1.5 leading-relaxed">{item.a}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
