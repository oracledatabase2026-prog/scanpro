import {
  BrowserMultiFormatReader,
  DecodeHintType,
  BarcodeFormat as ZXBarcodeFormat,
  BinaryBitmap,
  HybridBinarizer,
  NotFoundException,
  type Result,
} from '@zxing/library';
import { HTMLCanvasElementLuminanceSource } from '@zxing/library/esm/browser/HTMLCanvasElementLuminanceSource';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { BarcodeFormat, ConfidenceLevel } from '../types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const FORMAT_MAP: Record<number, BarcodeFormat> = {
  [ZXBarcodeFormat.QR_CODE]: 'QR_CODE',
  [ZXBarcodeFormat.EAN_13]: 'EAN_13',
  [ZXBarcodeFormat.EAN_8]: 'EAN_8',
  [ZXBarcodeFormat.CODE_128]: 'CODE_128',
  [ZXBarcodeFormat.CODE_39]: 'CODE_39',
  [ZXBarcodeFormat.UPC_A]: 'UPC_A',
  [ZXBarcodeFormat.UPC_E]: 'UPC_E',
  [ZXBarcodeFormat.ITF]: 'ITF',
  [ZXBarcodeFormat.DATA_MATRIX]: 'DATA_MATRIX',
  [ZXBarcodeFormat.PDF_417]: 'PDF_417',
  [ZXBarcodeFormat.AZTEC]: 'AZTEC',
  [ZXBarcodeFormat.CODABAR]: 'CODABAR',
};

function buildReader(formats?: BarcodeFormat[]) {
  const hints = new Map();
  if (formats && formats.length) {
    const reverse: Record<string, number> = {};
    Object.entries(FORMAT_MAP).forEach(([k, v]) => (reverse[v] = Number(k)));
    const zxFormats = formats.map((f) => reverse[f]).filter((f) => f !== undefined);
    if (zxFormats.length) hints.set(DecodeHintType.POSSIBLE_FORMATS, zxFormats);
  }
  hints.set(DecodeHintType.TRY_HARDER, true);
  return new BrowserMultiFormatReader(hints);
}

function resultToConfidence(result: Result): ConfidenceLevel {
  const points = result.getResultPoints?.() ?? [];
  if (points.length >= 3) return 'high';
  if (points.length >= 1) return 'medium';
  return 'medium';
}

/** Apply lightweight contrast/sharpen enhancement to a canvas in place. */
export function enhanceCanvas(canvas: HTMLCanvasElement, deskewDeg = 0) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  if (deskewDeg !== 0) {
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d')!;
    octx.translate(off.width / 2, off.height / 2);
    octx.rotate((deskewDeg * Math.PI) / 180);
    octx.drawImage(canvas, -off.width / 2, -off.height / 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off, 0, 0);
  }
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const contrast = 1.25;
  const intercept = 128 * (1 - contrast);
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const v = Math.min(255, Math.max(0, gray * contrast + intercept));
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

async function imageToCanvas(image: HTMLImageElement): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  return canvas;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  return doc.numPages;
}

async function pdfPageToCanvas(doc: pdfjsLib.PDFDocumentProxy, pageNum: number): Promise<HTMLCanvasElement> {
  const page = await doc.getPage(pageNum);
  const viewport = page.getViewport({ scale: 2.2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

export interface DecodeOptions {
  settings: {
    autoEnhance: boolean;
    deskew: boolean;
    multiAttempt: boolean;
    formats: BarcodeFormat[];
  };
  onPage?: (page: number, total: number) => void;
}

export interface DecodedBarcode {
  value: string;
  format: BarcodeFormat;
  confidence: ConfidenceLevel;
  page: number;
}

async function decodeCanvas(reader: BrowserMultiFormatReader, canvas: HTMLCanvasElement, attempts: number) {
  const results: DecodedBarcode[] = [];
  const seen = new Set<string>();

  const tryDecode = (c: HTMLCanvasElement): Result[] => {
    try {
      const luminanceSource = new HTMLCanvasElementLuminanceSource(c);
      const binarizer = new HybridBinarizer(luminanceSource);
      const bitmap = new BinaryBitmap(binarizer);
      const result = reader.decodeBitmap(bitmap);
      return result ? [result] : [];
    } catch (err) {
      if (err instanceof NotFoundException) return [];
      return [];
    }
  };

  const push = (rs: Result[], page: number) => {
    for (const r of rs) {
      const fmt = FORMAT_MAP[r.getBarcodeFormat()] ?? 'UNKNOWN';
      const key = `${r.getText()}::${fmt}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({ value: r.getText(), format: fmt, confidence: resultToConfidence(r), page });
    }
  };

  push(tryDecode(canvas), 1);

  if (attempts > 1 && results.length === 0) {
    const rotations = [90, 180, 270, 10, -10];
    for (const deg of rotations.slice(0, attempts - 1)) {
      const clone = document.createElement('canvas');
      clone.width = canvas.width;
      clone.height = canvas.height;
      clone.getContext('2d')!.drawImage(canvas, 0, 0);
      enhanceCanvas(clone, deg);
      push(tryDecode(clone), 1);
      if (results.length > 0) break;
    }
  }

  return results;
}

export async function decodeFile(
  file: File,
  options: DecodeOptions
): Promise<{ results: DecodedBarcode[]; pageCount: number }> {
  const reader = buildReader(options.settings.formats);
  const attempts = options.settings.multiAttempt ? 4 : 1;
  const allResults: DecodedBarcode[] = [];

  if (file.type === 'application/pdf') {
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buf }).promise;
    const total = doc.numPages;
    for (let p = 1; p <= total; p++) {
      const canvas = await pdfPageToCanvas(doc, p);
      if (options.settings.autoEnhance) enhanceCanvas(canvas);
      const pageResults = await decodeCanvas(reader, canvas, attempts);
      pageResults.forEach((r) => (r.page = p));
      allResults.push(...pageResults);
      options.onPage?.(p, total);
    }
    return { results: allResults, pageCount: total };
  }

  const image = await loadImage(file);
  const canvas = await imageToCanvas(image);
  if (options.settings.autoEnhance) enhanceCanvas(canvas);
  const results = await decodeCanvas(reader, canvas, attempts);
  options.onPage?.(1, 1);
  return { results, pageCount: 1 };
}

export function createCameraReader(formats?: BarcodeFormat[]) {
  return buildReader(formats);
}

export function zxFormatToBarcodeFormat(fmt: number): BarcodeFormat {
  return FORMAT_MAP[fmt] ?? 'UNKNOWN';
}
