/**
 * Template Export Utilities — calls backend API for proper format generation.
 */
import { BASE_URL } from './api';

const API = `${BASE_URL}/api/v1/report-templates/export`;

export interface ExportOptions {
  name: string;
  headerHtml: string;
  footerHtml: string;
  pageSettings: {
    pageSize: string;
    orientation: 'portrait' | 'landscape';
    margins: { top: number; bottom: number; left: number; right: number };
    headerSpacing: number;
    footerSpacing: number;
    fontFamily?: string;
    fontSize?: string;
  };
  bodyHtml?: string;
}

async function doExport(format: 'pdf' | 'docx' | 'xlsx', opts: ExportOptions): Promise<void> {
  const res = await fetch(`${API}/${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: opts.name,
      header_html: opts.headerHtml,
      footer_html: opts.footerHtml,
      description: JSON.stringify(opts.pageSettings),
      body_html: opts.bodyHtml,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || `Export to ${format} failed`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.name.replace(/[<>:"/\\|?*]/g, '_')}.${format}`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

export const exportToPdf  = (opts: ExportOptions) => doExport('pdf', opts);
export const exportToDocx = (opts: ExportOptions) => doExport('docx', opts);
export const exportToXlsx = (opts: ExportOptions) => doExport('xlsx', opts);

export async function getExportPdfBlob(opts: ExportOptions): Promise<Blob> {
  const res = await fetch(`${API}/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: opts.name,
      header_html: opts.headerHtml,
      footer_html: opts.footerHtml,
      description: JSON.stringify(opts.pageSettings),
      body_html: opts.bodyHtml,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Export failed' }));
    throw new Error(err.detail || 'Export to PDF failed');
  }

  return await res.blob();
}
