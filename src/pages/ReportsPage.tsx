import { motion } from 'framer-motion';
import { InvoiceLinker } from '../components/invoice/InvoiceLinker';

export function ReportsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-[var(--color-muted)] mt-1">Link decoded barcodes to invoices and product lists</p>
      </div>
      <InvoiceLinker />
    </motion.div>
  );
}
