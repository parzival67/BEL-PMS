// ── Assembly / BOM Data Types & Sample Data ────────────────────────

export type QmsDocKind =
  | 'engineering_drawing'
  | '3d_cad_model'
  | 'inspection_plan'
  | 'inspection_report'
  | 'material_certificate'
  | 'process_sheet'
  | 'ncr_report';

export interface QmsDocument {
  id: string;
  label: string;
  kind: QmsDocKind;
  format: string;
  size: string;
  updated: string;
  url?: string;
  preview_3d_url?: string;
}

export interface AssemblyNode {
  id: string;
  name: string;
  code: string;
  type: 'assembly' | 'part';
  revision: string;
  quantity: number;
  uom: string;
  status: 'active' | 'draft' | 'obsolete';
  planStatus?: boolean;
  planApprovedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  description: string;
  children?: AssemblyNode[];
  documents?: QmsDocument[];
}

// ── Sample Hierarchy ───────────────────────────────────────────────

export const SAMPLE_ASSEMBLY: AssemblyNode = {
  id: 'asm-001',
  name: 'Precision Gear Hub',
  code: 'ASM-2026-001',
  type: 'assembly',
  revision: 'R03',
  quantity: 1,
  uom: 'EA',
  status: 'active',
  description: 'Top-level gear hub assembly for aerospace actuator module.',
  documents: [
    { id: 'doc-001', label: 'GearHub_Assembly_R03.pdf', kind: 'engineering_drawing', format: 'PDF', size: '2.4 MB', updated: '2026-03-15' },
    { id: 'doc-002', label: 'GearHub_ASM.step', kind: '3d_cad_model', format: 'STEP', size: '18.7 MB', updated: '2026-03-14' },
    { id: 'doc-003', label: 'GearHub_InspPlan_R03.pdf', kind: 'inspection_plan', format: 'PDF', size: '1.1 MB', updated: '2026-03-10' },
    { id: 'doc-004', label: 'GearHub_ProcessSheet.pdf', kind: 'process_sheet', format: 'PDF', size: '640 KB', updated: '2026-03-08' },
  ],
  children: [
    {
      id: 'asm-002',
      name: 'Drive Shaft Sub-Assembly',
      code: 'ASM-2026-010',
      type: 'assembly',
      revision: 'R02',
      quantity: 1,
      uom: 'EA',
      status: 'active',
      description: 'Central drive shaft with bearing mounts and seals.',
      documents: [
        { id: 'doc-010', label: 'DriveShaft_Asm_R02.pdf', kind: 'engineering_drawing', format: 'PDF', size: '1.8 MB', updated: '2026-02-28' },
        { id: 'doc-011', label: 'DriveShaft_ASM.step', kind: '3d_cad_model', format: 'STEP', size: '12.3 MB', updated: '2026-02-27' },
        { id: 'doc-012', label: 'DriveShaft_ProcessSheet.pdf', kind: 'process_sheet', format: 'PDF', size: '380 KB', updated: '2026-02-20' },
      ],
      children: [
        {
          id: 'prt-001',
          name: 'Main Shaft',
          code: 'PRT-2026-101',
          type: 'part',
          revision: 'R01',
          quantity: 1,
          uom: 'EA',
          status: 'active',
          description: 'Hardened steel main shaft, 42mm OD.',
          documents: [
            { id: 'doc-020', label: 'MainShaft_Dwg_R01.pdf', kind: 'engineering_drawing', format: 'PDF', size: '890 KB', updated: '2026-01-20' },
            { id: 'doc-021', label: 'MainShaft.step', kind: '3d_cad_model', format: 'STEP', size: '4.2 MB', updated: '2026-01-19' },
            { id: 'doc-022', label: 'MainShaft_InspPlan.pdf', kind: 'inspection_plan', format: 'PDF', size: '540 KB', updated: '2026-01-18' },
            { id: 'doc-023', label: 'MainShaft_InspReport_Lot42.pdf', kind: 'inspection_report', format: 'PDF', size: '1.2 MB', updated: '2026-03-22' },
            { id: 'doc-024', label: 'MainShaft_MatCert_4140.pdf', kind: 'material_certificate', format: 'PDF', size: '180 KB', updated: '2025-11-05' },
            { id: 'doc-025', label: 'MainShaft_ProcessSheet.pdf', kind: 'process_sheet', format: 'PDF', size: '290 KB', updated: '2026-01-15' },
          ],
        },
        {
          id: 'prt-002',
          name: 'Radial Bearing 6208',
          code: 'PRT-2026-102',
          type: 'part',
          revision: 'R00',
          quantity: 2,
          uom: 'EA',
          status: 'active',
          description: 'Deep groove ball bearing, 40x80x18mm.',
          documents: [
            { id: 'doc-030', label: 'Bearing6208_Spec.pdf', kind: 'engineering_drawing', format: 'PDF', size: '320 KB', updated: '2025-12-10' },
            { id: 'doc-031', label: 'Bearing6208_MatCert.pdf', kind: 'material_certificate', format: 'PDF', size: '95 KB', updated: '2025-12-08' },
          ],
        },
        {
          id: 'prt-003',
          name: 'Shaft Seal CR-12',
          code: 'PRT-2026-103',
          type: 'part',
          revision: 'R00',
          quantity: 2,
          uom: 'EA',
          status: 'active',
          description: 'Nitrile rubber radial shaft seal.',
          documents: [
            { id: 'doc-035', label: 'ShaftSeal_MatCert.pdf', kind: 'material_certificate', format: 'PDF', size: '110 KB', updated: '2025-11-20' },
          ],
        },
      ],
    },
    {
      id: 'asm-003',
      name: 'Gear Train Assembly',
      code: 'ASM-2026-020',
      type: 'assembly',
      revision: 'R01',
      quantity: 1,
      uom: 'EA',
      status: 'active',
      description: 'Helical gear train with 3-stage reduction.',
      documents: [
        { id: 'doc-040', label: 'GearTrain_Asm_R01.pdf', kind: 'engineering_drawing', format: 'PDF', size: '2.1 MB', updated: '2026-03-05' },
        { id: 'doc-041', label: 'GearTrain_ASM.step', kind: '3d_cad_model', format: 'STEP', size: '22.5 MB', updated: '2026-03-04' },
        { id: 'doc-042', label: 'GearTrain_InspPlan.pdf', kind: 'inspection_plan', format: 'PDF', size: '780 KB', updated: '2026-03-02' },
        { id: 'doc-043', label: 'GearTrain_InspReport_B12.pdf', kind: 'inspection_report', format: 'PDF', size: '1.5 MB', updated: '2026-03-20' },
        { id: 'doc-044', label: 'GearTrain_ProcessSheet.pdf', kind: 'process_sheet', format: 'PDF', size: '520 KB', updated: '2026-02-28' },
        { id: 'doc-045', label: 'GearTrain_NCR_0042.pdf', kind: 'ncr_report', format: 'PDF', size: '340 KB', updated: '2026-03-25' },
      ],
      children: [
        {
          id: 'prt-004',
          name: 'Input Pinion Gear',
          code: 'PRT-2026-201',
          type: 'part',
          revision: 'R02',
          quantity: 1,
          uom: 'EA',
          status: 'active',
          description: 'Helical pinion, 14-tooth, module 2.5.',
          documents: [
            { id: 'doc-050', label: 'InputPinion_R02.pdf', kind: 'engineering_drawing', format: 'PDF', size: '670 KB', updated: '2026-02-15' },
            { id: 'doc-051', label: 'InputPinion.step', kind: '3d_cad_model', format: 'STEP', size: '3.8 MB', updated: '2026-02-14' },
            { id: 'doc-052', label: 'InputPinion_MatCert.pdf', kind: 'material_certificate', format: 'PDF', size: '145 KB', updated: '2026-01-10' },
          ],
        },
        {
          id: 'prt-005',
          name: 'Output Spur Gear',
          code: 'PRT-2026-202',
          type: 'part',
          revision: 'R01',
          quantity: 1,
          uom: 'EA',
          status: 'active',
          description: 'Spur gear, 56-tooth, module 2.5.',
          documents: [
            { id: 'doc-060', label: 'OutputGear_R01.pdf', kind: 'engineering_drawing', format: 'PDF', size: '720 KB', updated: '2026-01-28' },
            { id: 'doc-061', label: 'OutputGear.step', kind: '3d_cad_model', format: 'STEP', size: '5.1 MB', updated: '2026-01-27' },
            { id: 'doc-062', label: 'OutputGear_InspReport_Lot8.pdf', kind: 'inspection_report', format: 'PDF', size: '880 KB', updated: '2026-03-12' },
          ],
        },
        {
          id: 'prt-006',
          name: 'Gear Spacer Ring',
          code: 'PRT-2026-203',
          type: 'part',
          revision: 'R00',
          quantity: 3,
          uom: 'EA',
          status: 'draft',
          description: 'Aluminium spacer ring, 2mm thick.',
        },
      ],
    },
    {
      id: 'prt-007',
      name: 'Housing Base Plate',
      code: 'PRT-2026-301',
      type: 'part',
      revision: 'R01',
      quantity: 1,
      uom: 'EA',
      status: 'active',
      description: 'CNC machined aluminium base plate with mounting holes.',
      documents: [
        { id: 'doc-070', label: 'BasePlate_R01.pdf', kind: 'engineering_drawing', format: 'PDF', size: '1.4 MB', updated: '2026-03-01' },
        { id: 'doc-071', label: 'BasePlate.step', kind: '3d_cad_model', format: 'STEP', size: '8.9 MB', updated: '2026-02-28' },
        { id: 'doc-072', label: 'BasePlate_InspPlan.pdf', kind: 'inspection_plan', format: 'PDF', size: '420 KB', updated: '2026-02-25' },
        { id: 'doc-073', label: 'BasePlate_InspReport_L7.pdf', kind: 'inspection_report', format: 'PDF', size: '980 KB', updated: '2026-03-18' },
        { id: 'doc-074', label: 'BasePlate_MatCert_6061.pdf', kind: 'material_certificate', format: 'PDF', size: '160 KB', updated: '2025-10-12' },
        { id: 'doc-075', label: 'BasePlate_ProcessSheet.pdf', kind: 'process_sheet', format: 'PDF', size: '310 KB', updated: '2026-02-20' },
        { id: 'doc-076', label: 'BasePlate_NCR_0038.pdf', kind: 'ncr_report', format: 'PDF', size: '280 KB', updated: '2026-03-22' },
      ],
    },
    {
      id: 'prt-008',
      name: 'M8x25 Hex Bolt',
      code: 'PRT-2026-302',
      type: 'part',
      revision: 'R00',
      quantity: 12,
      uom: 'EA',
      status: 'active',
      description: 'Grade 10.9 hex bolt, zinc plated.',
      documents: [
        { id: 'doc-080', label: 'HexBolt_MatCert_10.9.pdf', kind: 'material_certificate', format: 'PDF', size: '78 KB', updated: '2025-09-15' },
      ],
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────

export function flattenTree(node: AssemblyNode): Map<string, AssemblyNode> {
  const map = new Map<string, AssemblyNode>();
  const walk = (n: AssemblyNode) => {
    map.set(n.id, n);
    (n.children ?? []).forEach(walk);
  };
  walk(node);
  return map;
}

export function findPath(root: AssemblyNode, targetId: string): AssemblyNode[] {
  if (root.id === targetId) return [root];
  for (const child of root.children ?? []) {
    const path = findPath(child, targetId);
    if (path.length > 0) return [root, ...path];
  }
  return [];
}

export function updateNode(
  root: AssemblyNode,
  id: string,
  updater: (node: AssemblyNode) => AssemblyNode
): AssemblyNode {
  if (root.id === id) return updater(root);
  const children = root.children ?? [];
  if (children.length === 0) return root;
  let changed = false;
  const next = children.map((c) => {
    const updated = updateNode(c, id, updater);
    if (updated !== c) changed = true;
    return updated;
  });
  return changed ? { ...root, children: next } : root;
}

export function deleteNode(root: AssemblyNode, targetId: string): AssemblyNode {
  if (root.id === targetId) return root; // can't delete root
  const children = root.children ?? [];
  const filtered = children.filter(c => c.id !== targetId);
  const mapped = filtered.map(c => deleteNode(c, targetId));
  return { ...root, children: mapped };
}
