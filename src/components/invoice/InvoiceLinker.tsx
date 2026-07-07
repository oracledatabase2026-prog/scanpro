import { useCallback, useRef, useState } from 'react';
import { FileSpreadsheet, Link2, Download, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, Divider } from '../ui/Primitives';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { parseInvoiceFile, buildInvoiceRows, exportInvoiceXlsx } from '../../utils/exportHelpers';

export function InvoiceLinker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [colMap, setColMap] = useState<{ productCode?: string; productName?: string; barcode?: string; sku?: string }>({});

  const invoiceRows = useAppStore((s) => s.invoiceRows);
  const setInvoiceRows = useAppStore((s) => s.setInvoiceRows);
  const invoiceFileName = useAppStore((s) => s.invoiceFileName);
  const setInvoiceFileName = useAppStore((s) => s.setInvoiceFileName);
  const matchInvoice = useAppStore((s) => s.matchInvoice);
  const pushToast = useAppStore((s) => s.pushToast);

  const onUpload = useCallback(
    async (file: File) => {
      try {
        const { headers, rows } = await parseInvoiceFile(file);
        setHeaders(headers);
        setRawRows(rows);
        setInvoiceFileName(file.name);
        const guess = (keys: string[]) => headers.find((h) => keys.some((k) => h.toLowerCase().includes(k)));
        setColMap({
          productCode: guess(['code', 'id']),
          productName: guess(['name', 'product', 'description']),
          barcode: guess(['barcode', 'ean', 'upc', 'sku']),
          sku: guess(['sku']),
        });
        pushToast('success', 'Invoice loaded', `${rows.length} rows found in ${file.name}`);
      } catch {
        pushToast('error', 'Could not read file', 'Please upload a valid .xlsx or .csv file.');
      }
    },
    [pushToast, setInvoiceFileName]
  );

  const buildRows = () => {
    if (!colMap.barcode) {
      pushToast('warning', 'Select a barcode column', 'Choose which column holds the barcode value.');
      return;
    }
    const rows = buildInvoiceRows(rawRows, colMap);
    setInvoiceRows(rows);
    pushToast('info', 'Rows mapped', `${rows.length} products ready to match.`);
  };

  const matchedCount = invoiceRows.filter((r) => r.matched).length;

  return (
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-lg">Invoice Linking</h2>
        </CardHeader>
        <CardBody>
          <div
            onClick={() => inputRef.current?.click()}
            className="rounded-[var(--radius-control)] border-2 border-dashed border-[var(--color-border)] p-6 text-center cursor-pointer hover:border-[color-mix(in_oklab,var(--color-primary)_50%,var(--color-border))] transition-colors"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
            <FileSpreadsheet className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-2" />
            <p className="font-medium text-sm">{invoiceFileName ?? 'Upload invoice or product list'}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">.xlsx, .xls, or .csv</p>
          </div>

          {headers.length > 0 && (
            <>
              <Divider className="my-4" />
              <p className="text-xs font-semibold text-[var(--color-muted)] mb-2">Map columns</p>
              <div className="space-y-2.5">
                {(['productCode', 'productName', 'barcode', 'sku'] as const).map((field) => (
                  <div key={field} className="flex items-center gap-3">
                    <label className="text-sm w-28 shrink-0 capitalize text-[var(--color-muted)]">
                      {field === 'productCode' ? 'Code' : field === 'productName' ? 'Name' : field === 'barcode' ? 'Barcode *' : 'SKU'}
                    </label>
                    <select
                      value={colMap[field] ?? ''}
                      onChange={(e) => setColMap((m) => ({ ...m, [field]: e.target.value || undefined }))}
                      className="flex-1 text-sm rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">&mdash; none &mdash;</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" onClick={buildRows}>
                  Map rows
                </Button>
                <Button size="sm" variant="secondary" icon={<Link2 />} disabled={invoiceRows.length === 0} onClick={matchInvoice}>
                  Match against scans
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <h3 className="font-semibold">Matched products</h3>
            {invoiceRows.length > 0 && (
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                {matchedCount} of {invoiceRows.length} matched
              </p>
            )}
          </div>
          <Button size="sm" variant="secondary" icon={<Download />} disabled={invoiceRows.length === 0} onClick={() => exportInvoiceXlsx(invoiceRows)}>
            Export
          </Button>
        </CardHeader>
        <CardBody className="max-h-[420px] overflow-y-auto">
          {invoiceRows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-10">
              Upload a product list and map its barcode column to link scanned codes with product data.
            </p>
          ) : (
            <div className="space-y-2">
              {invoiceRows.map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{row.productName || row.productCode || 'Unnamed product'}</p>
                    <p className="text-xs text-[var(--color-muted)] font-mono truncate">{row.barcode || '\u2014'}</p>
                  </div>
                  {row.matched ? (
                    <Badge tone="success" dot>
                      <CheckCircle2 className="h-3 w-3" /> Matched
                    </Badge>
                  ) : (
                    <Badge tone="neutral">
                      <XCircle className="h-3 w-3" /> Unmatched
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
