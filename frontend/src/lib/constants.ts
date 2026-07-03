export type Status = 'In-Progress' | 'Pending' | 'NC' | 'Certified';

export const ALL_ORDERS = [
  { name: 'Precision Gear Hub', number: 'QO-2026-001', ref: 'LOT-8842-X', customer: 'Aerospace Corp', created: '2026-01-12', status: 'In-Progress' },
  { name: 'Neural Link V4', number: 'QO-2026-008', ref: 'LOT-1102-B', customer: 'MedTech Global', created: '2026-02-04', status: 'In-Progress' },
  { name: 'Hydraulic Seal 12mm', number: 'QO-2026-015', ref: 'LOT-9941-A', customer: 'Heavy Industries', created: '2026-02-18', status: 'Pending' },
  { name: 'Titanium Fastener', number: 'QO-2026-022', ref: 'LOT-4432-Z', customer: 'SpaceX Labs', created: '2026-03-01', status: 'NC' },
  { name: 'Optical Lens G3', number: 'QO-2026-031', ref: 'LOT-7712-C', customer: 'Optics Plus', created: '2026-03-10', status: 'In-Progress' },
  { name: 'Sensor Array S8', number: 'QO-2026-045', ref: 'LOT-2210-Y', customer: 'SmartSystems', created: '2026-03-15', status: 'In-Progress' },
  { name: 'Valve Assembly Kit', number: 'QO-2026-052', ref: 'LOT-5588-Q', customer: 'Fluid Power', created: '2026-03-20', status: 'In-Progress' },
  { name: 'Legacy Pump Unit', number: 'QO-2025-999', ref: 'LOT-0001-L', customer: 'Heritage Eng', created: '2025-11-28', status: 'Certified' },
  { name: 'Pressure Plate 22', number: 'QO-2026-060', ref: 'LOT-6611-Q', customer: 'Auto Parts Co', created: '2026-03-22', status: 'Pending' },
  { name: 'Magnetic Core Beta', number: 'QO-2026-071', ref: 'LOT-3390-C', customer: 'Electronic Sol', created: '2026-03-23', status: 'In-Progress' },
  { name: 'Cryo Container XL', number: 'QO-2026-079', ref: 'LOT-7729-H', customer: 'Global Logistics', created: '2026-03-24', status: 'NC' },
  { name: 'Standard Nut M10', number: 'QO-2025-980', ref: 'LOT-1145-M', customer: 'Hardware Inc', created: '2025-10-10', status: 'Certified' },
];

export const STATUS_CFG: Record<Status, { dot: string; chip: string; pulse?: true }> = {
  'In-Progress': { dot: 'bg-emerald-500', chip: 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', pulse: true },
  Pending: { dot: 'bg-amber-500', chip: 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  NC: { dot: 'bg-red-500', chip: 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20' },
  Certified: { dot: 'bg-zinc-500/10', chip: 'bg-zinc-500/5 text-zinc-500 dark:text-zinc-400 border-zinc-500/20' },
};

export const SUMMARY_META = [
  { label: 'Total Orders', key: null, accent: 'bg-primary' },
  { label: 'Live Inspection', key: 'In-Progress', accent: 'bg-emerald-500' },
  { label: 'Pending Release', key: 'Pending', accent: 'bg-amber-500' },
  { label: 'NC', key: 'NC', accent: 'bg-red-500' },
];

export const PAGE_SIZES = [5, 10, 25];
