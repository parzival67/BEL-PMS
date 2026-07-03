import type { AssemblyNode } from './assembly-data';

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const configuredHost = import.meta.env.VITE_BACKEND_HOST;
  const host =
    !configuredHost || configuredHost === 'auto'
      ? window.location.hostname
      : configuredHost;
  const port = import.meta.env.VITE_BACKEND_PORT || '8000';
  return `http://${host}:${port}`;
}

export const BASE_URL = resolveBaseUrl();
const API_BASE_URL = `${BASE_URL}/api/v1`;

export async function getProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export async function createProject(project: any) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function updateProject(projectId: string | number, project: any) {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(projectId: string | number) {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function createAssembly(assembly: any) {
  const res = await fetch(`${API_BASE_URL}/assemblies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assembly)
  });
  if (!res.ok) throw new Error('Failed to create assembly');
  return res.json();
}

export async function updateAssembly(id: string | number, assembly: any) {
  const res = await fetch(`${API_BASE_URL}/assemblies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assembly)
  });
  if (!res.ok) throw new Error('Failed to update assembly');
  return res.json();
}

export async function createPart(part: any) {
  const res = await fetch(`${API_BASE_URL}/parts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(part)
  });
  if (!res.ok) throw new Error('Failed to create part');
  return res.json();
}

export async function updatePart(id: string | number, part: any) {
  const res = await fetch(`${API_BASE_URL}/parts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(part)
  });
  if (!res.ok) throw new Error('Failed to update part');
  return res.json();
}

export async function deleteAssembly(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/assemblies/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete assembly');
}

export async function toggleInspectionPlanStatus(partId: string | number) {
  const res = await fetch(`${API_BASE_URL}/parts/${partId}/toggle-inspection-plan`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to toggle inspection plan status');
  return res.json();
}

export async function deletePart(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/parts/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete part');
}

export async function uploadDocument(data: FormData) {
  const res = await fetch(`${API_BASE_URL}/documents/`, {
    method: 'POST',
    body: data
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || 'Failed to upload document');
  }
  return res.json();
}

export async function upload3DDocument(data: FormData) {
  const res = await fetch(`${API_BASE_URL}/documents/3d-only`, {
    method: 'POST',
    body: data
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || 'Failed to upload 3D document');
  }
  return res.json();
}

export async function deleteDocument(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function getProjectDetails(projectId: string | number) {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/details`);
  if (!res.ok) throw new Error('Failed to fetch project details');
  return res.json();
}

export function buildHierarchy(projectDetails: any): AssemblyNode {
  const nodeMap = new Map<string, AssemblyNode>();

  const assemblies = projectDetails.assemblies || [];
  const parts = projectDetails.parts || [];

  const rootId = `proj-${projectDetails.id}`;
  const root: AssemblyNode = {
    id: rootId,
    name: projectDetails.name || 'Unknown Project',
    code: projectDetails.project_number || '',
    type: 'assembly',
    revision: '-',
    quantity: 1,
    uom: 'EA',
    status: 'active',
    description: projectDetails.customer_details || '',
    children: [],
    documents: []
  };
  nodeMap.set(rootId, root);

  assemblies.forEach((a: any) => {
    const asmId = `asm-${a.id}`;
    nodeMap.set(asmId, {
      id: asmId,
      name: a.name,
      code: a.no || `ASM-${a.id}`,
      type: 'assembly',
      revision: a.rev || 'R00',
      quantity: a.quantity || 1,
      uom: 'EA',
      status: 'active',
      description: '',
      children: [],
      documents: (a.documents || []).map((d: any) => ({
        id: String(d.id),
        label: d.title || d.label || 'Document',
        kind: d.doc_type === '2D' ? 'engineering_drawing' : d.doc_type === '3D' ? '3d_cad_model' : d.kind,
        format: d.file_format || d.format || '-',
        size: d.size || '-',
        url: d.download_url || d.url,
        preview_3d_url: d.preview_3d_url || null,
        updated: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : (d.updated || '')
      }))
    });
  });

  assemblies.forEach((a: any) => {
    const asmId = `asm-${a.id}`;
    const node = nodeMap.get(asmId)!;
    if (a.parent_assembly_id) {
      const parentId = `asm-${a.parent_assembly_id}`;
      const parent = nodeMap.get(parentId);
      if (parent && parent.children) {
        parent.children.push(node);
      } else {
        root.children!.push(node);
      }
    } else {
      root.children!.push(node);
    }
  });

  parts.forEach((p: any) => {
    const suffix = p.assembly_id ? `asm-${p.assembly_id}` : `proj-${p.project_id}`;
    const partId = `prt-${p.id}-${suffix}`;

    const pNode: AssemblyNode = {
      id: partId,
      name: p.name,
      code: p.part_no,
      type: 'part',
      revision: p.rev || 'R00',
      quantity: p.quantity || 1,
      uom: 'EA',
      status: 'active',
      planStatus: p.inspection_plan_status || false,
      planApprovedAt: p.inspection_plan_approved_at || undefined,
      createdAt: p.created_at,
      updatedAt: p.updated_at || p.created_at,
      description: '',
      children: [],
      documents: (p.documents || []).map((d: any) => ({
        id: String(d.id),
        label: d.title || d.label || 'Document',
        kind: d.doc_type === '2D' ? 'engineering_drawing' : d.doc_type === '3D' ? '3d_cad_model' : d.kind,
        format: d.file_format || d.format || '-',
        size: d.size || '-',
        url: d.download_url || d.url,
        preview_3d_url: d.preview_3d_url || null,
        updated: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : (d.updated || '')
      }))
    };

    if (p.assembly_id) {
      const parentId = `asm-${p.assembly_id}`;
      const parent = nodeMap.get(parentId);
      if (parent && parent.children) {
        parent.children.push(pNode);
      } else {
        root.children!.push(pNode);
      }
    } else {
      root.children!.push(pNode);
    }
  });

  return root;
}

// ── Inspection Planner API ──────────────────────────────────────────

export async function getPartDocuments(partId: string | number) {
  const res = await fetch(`${API_BASE_URL}/documents?part_id=${partId}`);
  if (!res.ok) throw new Error('Failed to fetch part documents');
  return res.json();
}

export async function getPartBalloons(partId: string | number) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-boxes/part/${partId}`);
  if (!res.ok) throw new Error('Failed to fetch balloons');
  return res.json();
}

export async function createBalloon(data: {
  part_id: number;
  pdf_id: string;
  bounding_box: { x: number; y: number; width: number; height: number; page: number };
  label?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-box`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create balloon');
  return res.json();
}

export async function detectZone(data: {
  part_id: number;
  pdf_id: string;
  bounding_box: { x: number; y: number; width: number; height: number; page: number };
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/detect-zone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to detect zone');
  return res.json();
}

export async function deleteBalloon(partId: number, balloonId: string) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-box/part/${partId}/${balloonId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete balloon');
  return res.json();
}

export async function deleteBalloonsBatch(partId: number, balloonIds: string[]) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-boxes/delete-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_id: partId, balloon_ids: balloonIds })
  });
  if (!res.ok) throw new Error('Failed to delete balloons in batch');
  return res.json();
}

export async function updateBalloonsBatch(partId: number, balloonIds: string[], data: {
  measuring_instrument?: string;
  sampling?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-boxes/update-batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_id: partId, balloon_ids: balloonIds, ...data })
  });
  if (!res.ok) throw new Error('Failed to update balloons in batch');
  return res.json();
}
export async function updateBalloon(partId: number, balloonId: string, data: {
  dimension_data?: any[];
  text_data?: any[];
  gdt_data?: any[];
  measuring_instrument?: string;
  sampling?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-box/part/${partId}/${balloonId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update balloon');
  return res.json();
}

export async function autoBallooning(data: {
  part_id: number;
  pdf_id: string;
  bounding_box: { x: number; y: number; width: number; height: number; page: number };
  scale_factor?: number;
  include_image?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/auto-ballooning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, include_image: data.include_image ?? false })
  });
  if (!res.ok) throw new Error('Failed to run auto-ballooning');
  return res.json();
}

export async function processDimensions(data: {
  part_id: number;
  pdf_id: string;
  bounding_box: { x: number; y: number; width: number; height: number; page: number };
  scale_factor?: number;
  include_image?: boolean;
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/process-dimensions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, include_image: data.include_image ?? false })
  });
  if (!res.ok) throw new Error('Failed to process dimensions');
  return res.json();
}

export function getBalloonedPdfUrl(pdfId: string | number) {
  return `${API_BASE_URL}/pdf-annotation/pdf/${pdfId}/download-ballooned`;
}

export async function getMeasurements(balloonId: number) {
  const res = await fetch(`${API_BASE_URL}/measurements?balloon_id=${balloonId}`);
  if (!res.ok) throw new Error('Failed to fetch measurements');
  return res.json();
}

export async function getMeasurementsByPart(partId: number, quantity: number = 1) {
  const res = await fetch(`${API_BASE_URL}/measurements?part_id=${partId}&quantity=${quantity}`);
  if (!res.ok) throw new Error('Failed to fetch measurements for part');
  return res.json();
}

export async function createMeasurement(data: any) {
  const res = await fetch(`${API_BASE_URL}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create measurement');
  return res.json();
}

export async function updateMeasurement(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/measurements/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update measurement');
  return res.json();
}

export async function deleteMeasurement(id: number) {
  const res = await fetch(`${API_BASE_URL}/measurements/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete measurement');
}

export async function getDrawingInfo(pdfId: string | number) {
  const res = await fetch(`${API_BASE_URL}/view-region/${pdfId}/info`);
  if (!res.ok) throw new Error('Failed to fetch PDF info');
  return res.json();
}

export async function getDrawingPageImage(
  pdfId: string | number,
  page: number,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number = 2.0,
  crop: boolean = true,
  autoRotate: boolean = true
) {
  const res = await fetch(
    `${API_BASE_URL}/view-region/${pdfId}?page=${page}&x=${x}&y=${y}&width=${width}&height=${height}&zoom_factor=${zoom}&crop=${crop}&auto_rotate=${autoRotate}`
  );

  if (!res.ok) throw new Error('Failed to extract drawing page image');
  return res.json();
}


export async function getReportTemplates() {
  const res = await fetch(`${API_BASE_URL}/report-templates`);
  if (!res.ok) throw new Error('Failed to fetch report templates');
  return res.json();
}

export async function getReportTemplate(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/report-templates/${id}`);
  if (!res.ok) throw new Error('Failed to fetch report template');
  return res.json();
}

export async function createReportTemplate(template: any) {
  const res = await fetch(`${API_BASE_URL}/report-templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to create report template');
  return res.json();
}

export async function updateReportTemplate(id: string | number, template: any) {
  const res = await fetch(`${API_BASE_URL}/report-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template)
  });
  if (!res.ok) throw new Error('Failed to update report template');
  return res.json();
}

export async function deleteReportTemplate(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/report-templates/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete report template');
}

export async function getAvailableFonts(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/report-templates/available-fonts`);
  if (!res.ok) throw new Error('Failed to fetch available fonts');
  return res.json();
}

// ── Instrument setup (categories + library) ─────────────────────────

export type CategoryTreeDTO = {
  id: number;
  name: string;
  device_count: number;
  children: CategoryTreeDTO[];
};

export type LibraryInstrumentDTO = {
  id: number;
  category_id: number;
  instrument_code: string;
  instrument_name?: string | null;
  manufacturer?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  range?: string | null;
  resolution?: string | null;
  accuracy?: string | null;
  last_calibration_date?: string | null;
  calibration?: string | null; // Next Cal Date
  calibration_interval?: number | null;
  status?: string | null;
  location?: string | null;
  available_qty: number;
  equipment_no?: string | null;
};

async function parseApiError(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json();
    if (typeof j?.detail === 'string') return j.detail;
    if (Array.isArray(j?.detail))
      return j.detail.map((x: { msg?: string }) => x?.msg ?? JSON.stringify(x)).join('; ');
  } catch {
    /* ignore */
  }
  return fallback;
}

export async function fetchInstrumentCategoryTree(): Promise<CategoryTreeDTO[]> {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/categories/tree`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load categories'));
  return res.json();
}

export async function createInstrumentCategory(body: { name: string; parent_id: number | null }) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Create category failed'));
  return res.json() as Promise<{ id: number; name: string; parent_id: number | null }>;
}

export async function deleteInstrumentCategory(id: number) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Delete category failed'));
  return res.json();
}

export async function fetchLibraryInstruments(categoryId: number): Promise<LibraryInstrumentDTO[]> {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/categories/${categoryId}/instruments`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to load instruments'));
  return res.json();
}

export async function createLibraryInstrument(body: Partial<LibraryInstrumentDTO> & { category_id: number; instrument_code: string }) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/instruments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Create instrument failed'));
  return res.json() as Promise<LibraryInstrumentDTO>;
}

export async function updateLibraryInstrument(id: number, body: Partial<LibraryInstrumentDTO>) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/instruments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Update instrument failed'));
  return res.json() as Promise<LibraryInstrumentDTO>;
}

export async function deleteLibraryInstrument(id: number) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/instruments/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Delete instrument failed'));
  return res.json();
}

export async function clearLibraryInstrumentsForCategory(categoryId: number) {
  const res = await fetch(`${API_BASE_URL}/instrument-setup/categories/${categoryId}/instruments`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Clear instruments failed'));
  return res.json();
}

// ── Bluetooth (backend /bluetooth) ──────────────────────────────────

export type BluetoothDiscovered = {
  address: string;
  name?: string | null;
  rssi?: number | null;
  connected?: boolean;
};

export type BluetoothSavedDevice = {
  id: number;
  name: string;
  device_id: string;
  mac_address: string;
  calibration?: string | null;
  signal_strength?: number | null;
  connected: boolean;
  created_at: string;
  next_calibration_date?: string | null;
  instrument_code?: string | null;
};

export async function bluetoothScan(): Promise<BluetoothDiscovered[]> {
  const res = await fetch(`${API_BASE_URL}/bluetooth/scan`, { method: 'POST' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bluetooth scan failed'));
  return res.json();
}

export async function bluetoothListDevices(): Promise<BluetoothSavedDevice[]> {
  const res = await fetch(`${API_BASE_URL}/bluetooth/devices`);
  if (!res.ok) throw new Error(await parseApiError(res, 'Failed to list Bluetooth devices'));
  return res.json();
}

export async function bluetoothSaveDevice(body: {
  name: string;
  device_id: string;
  mac_address: string;
  signal_strength?: number | null;
  connected?: boolean;
  calibration?: string | null;
}) {
  const res = await fetch(`${API_BASE_URL}/bluetooth/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Save Bluetooth device failed'));
  return res.json() as Promise<BluetoothSavedDevice>;
}

export async function bluetoothUpdateDevice(
  devicePk: number,
  body: Partial<{
    name: string;
    device_id: string;
    calibration: string;
    next_calibration_date: string;
  }>
) {
  const res = await fetch(`${API_BASE_URL}/bluetooth/devices/${devicePk}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Update Bluetooth device failed'));
  return res.json() as Promise<BluetoothSavedDevice>;
}

export async function bluetoothDeleteSavedDevice(deviceId: string) {
  const enc = encodeURIComponent(deviceId);
  const res = await fetch(`${API_BASE_URL}/bluetooth/devices/${enc}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await parseApiError(res, 'Delete Bluetooth device failed'));
  return res.json();
}

export async function bluetoothConnect(address: string, name?: string | null) {
  const res = await fetch(`${API_BASE_URL}/bluetooth/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, name: name ?? undefined }),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bluetooth connect failed'));
  return res.json();
}

export async function bluetoothDisconnect(address: string) {
  const res = await fetch(`${API_BASE_URL}/bluetooth/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  if (!res.ok) throw new Error(await parseApiError(res, 'Bluetooth disconnect failed'));
  return res.json();
}

export async function saveGridConfig(
  documentId: string | number,
  data: {
    sheet_size: string;
    orientation: string;
    rows: number;
    cols: number;
    grid_left: number;
    grid_top: number;
    grid_col_spacing: number;
    grid_row_spacing: number;
  }
) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/document/${documentId}/grid-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save grid configuration');
  return res.json();
}

export async function getNotesByPart(partId: string | number) {
  const res = await fetch(`${API_BASE_URL}/notes/part/${partId}`);
  if (!res.ok) throw new Error('Failed to fetch notes for part');
  return res.json();
}

export async function createNote(data: {
  part_id: number;
  document_id?: number | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  page?: number;
  note_text?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(noteId: number, data: {
  note_text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  page?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(noteId: number) {
  const res = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete note');
}

export async function deleteNotesByPart(partId: string | number) {
  const res = await fetch(`${API_BASE_URL}/notes/part/${partId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete notes for part');
}

export async function extractText(data: {
  part_id: number;
  pdf_id: string;
  bounding_box: { x: number; y: number; width: number; height: number; page: number };
}) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/extract-text`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to extract text');
  return res.json();
}
export async function reorderBalloons(partId: number, orderedDbIds: number[]) {
  const res = await fetch(`${API_BASE_URL}/pdf-annotation/bounding-boxes/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part_id: partId, ordered_db_ids: orderedDbIds })
  });
  if (!res.ok) throw new Error('Failed to reorder balloons');
  return res.json();
}
