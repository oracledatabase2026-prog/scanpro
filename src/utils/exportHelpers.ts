import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { BarcodeResult, InvoiceRow } from '../types';
import { FORMAT_LABELS } from './format';

function resultsToRows(results: BarcodeResult[]) {
  return results.map((r) => ({
    File: r.fileName,
    Page: r.page,
    Value: r.value,
    Format: FORMAT_LABELS[r.format] ?? r.format,
    Confidence: r.confidence,
    Source: r.source,
    Time: new Date(r.timestamp).toLocaleString(),
  }));
}

export function exportResultsCsv(results: BarcodeResult[], filename = 'scan-results.csv') {
  const ws = XLSX.utils.json_to_sheet(resultsToRows(results));
  const csv = XLSX.utils.sheet_to_csv(ws);
  saveAs(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
}

export function exportResultsXlsx(results: BarcodeResult[], filename = 'scan-results.xlsx') {
  const ws = XLSX.utils.json_to_sheet(resultsToRows(results));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Results');
  XLSX.writeFile(wb, filename);
}

export function exportInvoiceXlsx(rows: InvoiceRow[], filename = 'invoice-linked.xlsx') {
  const data = rows.map((r) => ({
    'Product Code': r.productCode,
    'Product Name': r.productName,
    SKU: r.sku ?? '',
    Barcode: r.barcode,
    Status: r.matched ? 'Matched' : 'Unmatched',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice');
  XLSX.writeFile(wb, filename);
}

export interface ParsedInvoiceColumn {
  productCode?: string;
  productName?: string;
  barcode?: string;
  sku?: string;
}

export async function parseInvoiceFile(file: File): Promise<{ headers: string[]; rows: Record<string, any>[] }> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  const headers = rows.length ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

export function buildInvoiceRows(
  rows: Record<string, any>[],
  columns: ParsedInvoiceColumn
): InvoiceRow[] {
  return rows.map((row, idx) => ({
    id: `inv_${idx}`,
    productCode: columns.productCode ? String(row[columns.productCode] ?? '') : '',
    productName: columns.productName ? String(row[columns.productName] ?? '') : '',
    sku: columns.sku ? String(row[columns.sku] ?? '') : undefined,
    barcode: columns.barcode ? String(row[columns.barcode] ?? '') : '',
    matched: false,
  }));
}
