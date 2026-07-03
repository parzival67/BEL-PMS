import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronDown, ChevronRight, ChevronsDown, ChevronsUp,
  Search, Plus, FileEdit, Trash2, Download, Upload,
  FileText, Box, Boxes, Maximize, ZoomIn, ZoomOut,
  ListChecks, AlertTriangle, ArrowRight, Edit2, MoreVertical, X,
  ClipboardCheck, FileBarChart, Award, ClipboardList, Loader2
} from 'lucide-react';
import { InteractiveDrawing, type InteractiveDrawingRef } from '../components/ui/InteractiveDrawing';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProjectDetails, buildHierarchy, deleteAssembly, deletePart, deleteDocument, getPartBalloons, getNotesByPart, BASE_URL } from '../lib/api';
import {
  flattenTree, findPath,
  type AssemblyNode, type QmsDocument, type QmsDocKind,
} from '../lib/assembly-data';
import { PartModal } from '../components/ui/PartModal';
import { DocumentUploadModal } from '../components/ui/DocumentUploadModal';
import { Viewer3D } from '../components/ui/Viewer3D';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// ── Doc Kind Metadata ──────────────────────────────────────────────
const DOC_KIND_META: Record<QmsDocKind, { label: string; icon: typeof FileText; color: string }> = {
  engineering_drawing: { label: 'Engineering Drawing', icon: FileText, color: 'text-sky-400' },
  '3d_cad_model': { label: '3D CAD Model', icon: Box, color: 'text-violet-400' },
  inspection_plan: { label: 'Ballooned drawing', icon: ClipboardCheck, color: 'text-emerald-400' },
  inspection_report: { label: 'Inspection Report', icon: FileBarChart, color: 'text-amber-400' },
  material_certificate: { label: 'Material Certificate', icon: Award, color: 'text-teal-400' },
  process_sheet: { label: 'Process Sheet', icon: ListChecks, color: 'text-indigo-400' },
  ncr_report: { label: 'NCR Report', icon: AlertTriangle, color: 'text-red-400' },
};

const DOC_GROUPS = [
  {
    id: 'design',
    label: 'Design & Engineering',
    kinds: ['engineering_drawing', '3d_cad_model'] as QmsDocKind[],
  },
  {
    id: 'quality',
    label: 'Quality & Inspection',
    kinds: ['inspection_plan', 'inspection_report', 'ncr_report'] as QmsDocKind[],
  },
  {
    id: 'mfg',
    label: 'Manufacturing & Compliance',
    kinds: ['process_sheet', 'material_certificate'] as QmsDocKind[],
  },
];

// ── Assembly Tree Row ──────────────────────────────────────────────
function TreeRow({
  node, depth, selectedId, expanded, onSelect, onToggle, onAdd, onEdit, onDelete, searchQuery = '',
}: {
  node: AssemblyNode; depth: number; selectedId: string | null;
  expanded: Record<string, boolean>;
  onSelect: (id: string) => void; onToggle: (id: string) => void;
  onAdd: (parentId: string | null, mode: 'part' | 'assembly') => void;
  onEdit: (node: AssemblyNode) => void;
  onDelete: (node: { id: string, name: string }) => void;
  searchQuery?: string;
}) {
  const children = node.children ?? [];
  const isAssembly = node.type === 'assembly';
  const Icon = isAssembly ? Boxes : Box;
  const isSelected = selectedId === node.id;
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Search logic: node matches if name or code contains query
  const query = searchQuery.toLowerCase();

  useEffect(() => {
    if (!isActionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setIsActionMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActionMenuOpen]);

  // Helper to check if any descendant matches
  const hasMatchingDescendant = useMemo(() => {
    if (!query) return false;
    const check = (n: AssemblyNode): boolean => {
      if (n.name.toLowerCase().includes(query)) return true;
      if (n.code && n.code.toLowerCase().includes(query)) return true;
      return (n.children ?? []).some(check);
    };
    return (node.children ?? []).some(check);
  }, [node.children, query]);

  const matchesSelf = !query ||
    node.name.toLowerCase().includes(query) ||
    (node.code && node.code.toLowerCase().includes(query));

  const isVisible = matchesSelf || hasMatchingDescendant;

  if (!isVisible) return null;

  const isOpen = expanded[node.id] ?? !!query; // Auto-expand on search
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1.5 pr-2 py-[7px] cursor-pointer relative',
          isSelected
            ? 'bg-primary/[0.08]'
            : isAssembly
              ? 'bg-surface-container-low/50 border-y border-outline-variant/15 my-[2px] hover:bg-surface-container-low/80'
              : 'hover:bg-surface-container-low/60'
        )}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => onSelect(node.id)}
      >
        {isSelected && <div className="absolute left-0 top-[2px] bottom-[2px] w-[3px] bg-primary rounded-full" />}
        <button
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
          className={cn('w-4 h-4 flex items-center justify-center shrink-0', !hasChildren && 'invisible')}
        >
          {hasChildren && (isOpen
            ? <ChevronDown className="w-3 h-3 text-on-surface-variant/40" />
            : <ChevronRight className="w-3 h-3 text-on-surface-variant/40" />
          )}
        </button>
        <Icon className={cn(
          'w-3.5 h-3.5 shrink-0',
          isSelected
            ? 'text-primary'
            : isAssembly
              ? 'text-emerald-500 dark:text-emerald-400'
              : 'text-on-surface-variant/35'
        )} />
        <span className={cn(
          'text-xs font-body truncate flex-1 tracking-normal',
          isSelected
            ? 'text-surface-bright font-bold'
            : isAssembly
              ? 'text-surface-bright font-semibold'
              : 'text-on-surface-variant/80 font-medium'
        )}>
          {node.name}
          {!isAssembly && node.code && (
            <span className="ml-1.5 text-[10px] font-mono font-medium text-on-surface-variant/45">
              ({node.code})
            </span>
          )}
        </span>
        <span className={cn(
          'shrink-0 text-[8px] font-display font-black uppercase tracking-wider px-1.5 py-[1px] rounded-xs border',
          isAssembly
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold opacity-100'
            : 'bg-sky-500/5 text-sky-600/80 dark:text-sky-400/80 border-sky-500/10 font-medium opacity-60'
        )}>
          {isAssembly ? 'ASM' : 'PRT'}
        </span>
        {node.type === 'part' && node.planStatus && (
          <div className="shrink-0 w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center" title="Plan Approved">
            <ClipboardCheck className="w-2 h-2 text-emerald-500" />
          </div>
        )}
        <div className="relative shrink-0" ref={actionMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsActionMenuOpen(v => !v);
            }}
            className={cn(
              'w-6 h-6 flex items-center justify-center rounded-sm transition-colors',
              isActionMenuOpen
                ? 'text-primary bg-primary/10'
                : 'text-on-surface-variant/35 opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10'
            )}
            title="More actions"
            aria-label="More actions"
            aria-expanded={isActionMenuOpen}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          <AnimatePresence>
            {isActionMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[150px] overflow-hidden rounded-sm border border-outline-variant bg-surface-container-lowest shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onEdit(node);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-medium text-on-surface-variant hover:bg-primary/5 hover:text-primary"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsActionMenuOpen(false);
                    onAdd(node.id, 'part');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-medium text-on-surface-variant hover:bg-emerald-500/5 hover:text-emerald-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add child
                </button>
                {depth > 0 && (
                  <button
                    onClick={() => {
                      setIsActionMenuOpen(false);
                      onDelete({ id: node.id, name: node.name });
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-[11px] font-medium text-on-surface-variant hover:bg-red-500/5 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 border-l border-outline-variant/50" style={{ marginLeft: `${depth * 14 + 16}px` }} />
          {children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hierarchy Breadcrumb ───────────────────────────────────────────
function HierarchyBreadcrumb({ path }: { path: AssemblyNode[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {path.map((node, i) => (
        <div key={node.id} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-on-surface-variant/20 shrink-0" />}
          <span className={cn(
            'text-[11px] font-body',
            i === path.length - 1 ? 'text-primary font-semibold' : 'text-on-surface-variant/50'
          )}>
            {node.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Document List Item ─────────────────────────────────────────────
function DocListItem({ doc, isSelected, onClick, onDelete }: { doc: QmsDocument; isSelected: boolean; onClick: () => void; onDelete?: (id: string, label: string) => void }) {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const cleanLabel = (label: string) => {
    return label.replace(/(_?APPROVED|_?DRAFT)/gi, '').trim();
  };
  const meta = DOC_KIND_META[doc.kind];
  const Icon = meta.icon;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 text-left relative border-b border-outline-variant/30 last:border-b-0',
          isSelected ? 'bg-primary/[0.06]' : 'hover:bg-surface-container-low'
        )}
      >
        {isSelected && <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-primary rounded-full" />}
        <div className={cn('w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border', isSelected ? 'bg-primary/10 border-primary/20' : 'bg-surface-container border-outline-variant/30')}>
          <Icon className={cn('w-3.5 h-3.5', isSelected ? meta.color : meta.color)} />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <p className={cn('text-[11px] font-body truncate leading-none', isSelected ? 'text-surface-bright font-semibold' : 'text-on-surface-variant font-medium')}>
            {cleanLabel(doc.label)}
          </p>
          <p className="text-[9px] font-mono text-on-surface-variant/40 mt-1.5 leading-none uppercase tracking-wider">
            {doc.format} · {doc.size} · {doc.updated || new Date().toISOString().split('T')[0]}
          </p>
        </div>
      </button>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-1">
        <button
          disabled={isDownloading}
          onClick={async (e) => { 
            e.stopPropagation(); 
            const backendBase = BASE_URL;
            
            let downloadUrl = doc.url;
            if (doc.kind === 'inspection_plan') {
              const pdfId = doc.id.includes('-') ? doc.id.split('-').pop() : doc.id;
              downloadUrl = `/api/v1/pdf-annotation/pdf/${pdfId}/download-ballooned`;
            }

            if (!downloadUrl) return;
            const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `${backendBase}${downloadUrl}`;

            try {
              setIsDownloading(true);
              const response = await fetch(fullUrl);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              const fileName = cleanLabel(doc.label);
              const extension = doc.format.toLowerCase() || 'pdf';
              link.download = fileName.toLowerCase().endsWith(`.${extension}`) ? fileName : `${fileName}.${extension}`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => window.URL.revokeObjectURL(url), 100);
            } catch (error) {
              console.error('Download failed:', error);
              window.open(fullUrl, '_blank');
            } finally {
              setIsDownloading(false);
            }
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-sm bg-surface-container-low text-on-surface-variant/70 border border-outline-variant/50 shadow-sm",
            isDownloading ? "cursor-wait" : "hover:text-primary hover:bg-primary/10"
          )}
          title={isDownloading ? "Preparing file..." : "Download Document"}
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
        </button>
        {onDelete && doc.kind !== 'inspection_plan' && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id, doc.label); }}
            className="w-7 h-7 flex items-center justify-center rounded-sm bg-surface-container-low text-on-surface-variant/70 hover:text-red-500 hover:bg-red-500/10 border border-outline-variant/50 shadow-sm"
            title="Delete Document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Empty Doc Slot ─────────────────────────────────────────────────
function EmptyDocSlot({ kind, onUpload }: { kind: QmsDocKind; onUpload: () => void }) {
  const meta = DOC_KIND_META[kind];
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-outline-variant/20 last:border-b-0 relative">
      <div className="w-7 h-7 rounded-sm bg-surface-container-low/50 border border-dashed border-outline-variant/30 flex items-center justify-center shrink-0">
        <meta.icon className="w-3.5 h-3.5 text-on-surface-variant/15" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-body font-medium text-on-surface-variant/25 truncate">{meta.label}s</p>
      </div>
      <button
        onClick={onUpload}
        className="shrink-0 flex items-center gap-1.5 text-[9px] font-display font-black uppercase tracking-wider text-primary/60 hover:text-primary px-2.5 py-1 rounded-sm border border-dashed border-primary/25 hover:border-primary/60 hover:bg-primary/5"
      >
        <Upload className="w-3 h-3" />
        Upload File
      </button>
    </div>
  );
}

// ── Document Preview Panel ─────────────────────────────────────────
// ── Document Preview Panel ─────────────────────────────────────────
function DocPreview({ doc, partId, isMaximized, onToggleMaximize }: { doc: QmsDocument | null; partId: string | null; isMaximized?: boolean; onToggleMaximize?: () => void }) {
  const drawingRef = useRef<InteractiveDrawingRef>(null);
  const [balloons, setBalloons] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingBalloons, setLoadingBalloons] = useState(false);

  useEffect(() => {
    if (!partId || !doc || doc.kind !== 'inspection_plan') {
      setBalloons([]);
      setNotes([]);
      setLoadingBalloons(false);
      return;
    }

    let cancelled = false;
    async function fetchBalloonsAndNotes() {
      try {
        setLoadingBalloons(true);
        // Ensure we only pass the numeric ID if partId is string like 'prt-123'
        const id = partId!.startsWith('prt-') ? parseInt(partId!.split('-')[1]) : parseInt(partId!);
        
        const [balloonsData, notesData] = await Promise.all([
          getPartBalloons(id),
          getNotesByPart(id)
        ]);

        if (!cancelled) {
          setBalloons(balloonsData.bounding_boxes || []);
          setNotes(notesData || []);
        }
      } catch (err) {
        console.error('Failed to fetch balloons/notes for preview:', err);
        if (!cancelled) {
          setBalloons([]);
          setNotes([]);
        }
      } finally {
        if (!cancelled) setLoadingBalloons(false);
      }
    }

    fetchBalloonsAndNotes();
    return () => { cancelled = true; };
  }, [partId, doc?.id, doc?.kind]);

  const memoizedBalloons = useMemo(() => balloons, [balloons]);

  if (!doc) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6 border-2 border-dashed border-outline-variant/20 rounded-sm bg-surface-container-low/10">
        <div className="relative">
          <FileText className="w-16 h-16 text-on-surface-variant/5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-6 h-6 text-on-surface-variant/10" />
          </div>
        </div>
        <div>
          <p className="text-xs font-display font-black text-on-surface-variant/20 uppercase tracking-widest">No Selection</p>
          <p className="text-[10px] font-body text-on-surface-variant/15 mt-1">Select a document to view its preview</p>
        </div>
      </div>
    );
  }

  const meta = DOC_KIND_META[doc.kind];

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest relative">
      {/* Loading Overlay for Balloons */}
      {loadingBalloons && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/20 backdrop-blur-[2px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
        </div>
      )}

      {/* Preview toolbar */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-outline-variant bg-surface-container-low/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn('w-6 h-6 rounded-sm flex items-center justify-center bg-surface-container border border-outline-variant/20')}>
            {React.createElement(meta.icon, { className: cn('w-3.5 h-3.5', meta.color) })}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-display font-black text-surface-bright uppercase truncate leading-none">
              {doc.label} {doc.kind === 'inspection_plan' && <span className="text-primary/60 ml-1.5">(Inspection Mode)</span>}
            </p>
            <p className="text-[8px] font-mono font-bold text-on-surface-variant/30 mt-1 uppercase tracking-widest truncate">{meta.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">

          <button
            onClick={onToggleMaximize}
            className={cn(
              "w-7 h-7 flex items-center justify-center rounded-sm",
              isMaximized ? "bg-primary/10 text-primary" : "text-on-surface-variant/40 hover:text-primary hover:bg-primary/10"
            )}
            title={isMaximized ? "Exit Fullscreen" : "Fullscreen Preview"}
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
          {isMaximized && (
            <button
              onClick={onToggleMaximize}
              className="w-7 h-7 flex items-center justify-center rounded-sm text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 border border-outline-variant/30 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview content */}
      <div id="preview-content-container" className="group/preview flex-1 flex items-center justify-center relative overflow-hidden bg-surface-container-lowest">
        {doc.kind === '3d_cad_model' && doc.preview_3d_url ? (
          <Viewer3D url={`${BASE_URL}${doc.preview_3d_url}`} />
        ) : (doc.kind === 'engineering_drawing' || doc.kind === 'inspection_plan' || doc.kind === 'inspection_report' || doc.kind === 'material_certificate' || doc.kind === 'process_sheet' || doc.kind === 'ncr_report') && doc.url ? (
          <div className="relative w-full h-full bg-surface-container-low/20">
            {/* Control Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1.5 bg-surface-container-lowest/95 backdrop-blur-md rounded-full border border-outline-variant/50 dark:border-white/20 shadow-2xl dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] opacity-0 group-hover/preview:opacity-100 duration-300 transform translate-y-2 group-hover/preview:translate-y-0">
              <button
                onClick={() => drawingRef.current?.zoomIn()}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => drawingRef.current?.zoomOut()}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="w-[1px] h-4 bg-outline-variant mx-1" />
              <button
                onClick={() => drawingRef.current?.resetView()}
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5"
                title="Fit to View"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>

            <InteractiveDrawing
              ref={drawingRef}
              pdfId={(doc.kind === 'engineering_drawing' || doc.kind === 'inspection_plan') ? (doc.id.split('-').pop()) : null}
              directImageSrc={['jpg', 'jpeg', 'png', 'webp'].includes(doc.format.toLowerCase()) ? `${BASE_URL}${doc.url}` : null}
              balloons={memoizedBalloons}
              notes={notes}
              activeTool="pan"
              sidebarOffset={0}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 p-12 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-sm border border-outline-variant/50 bg-surface-container-highest/20 flex items-center justify-center backdrop-blur-sm">
                {React.createElement(doc.kind === '3d_cad_model' ? Box : meta.icon, { className: "w-12 h-12 text-on-surface-variant/20" })}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-display font-black text-on-surface-variant/40 uppercase tracking-[0.4em]">No Preview Available</h4>
              <p className="text-[9px] font-body text-on-surface-variant/30 uppercase tracking-widest max-w-[240px] leading-relaxed mx-auto">This file type cannot be rendered directly in the engineering workbench</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview footer */}
      <div className="shrink-0 flex items-center gap-4 px-4 py-2 border-t border-outline-variant bg-surface-container-low/30">
        <p className="text-[9px] font-mono text-on-surface-variant/30 uppercase tracking-wider">Format: {doc.format}</p>
        <p className="text-[9px] font-mono text-on-surface-variant/30 uppercase tracking-wider">Size: {doc.size}</p>
        <p className="text-[9px] font-mono text-on-surface-variant/30 uppercase tracking-wider italic">Ref: {doc.id.split('-').slice(0, 2).join('-')}</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export const AssemblyView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState('Assembly View');
  const [projectNumber, setProjectNumber] = useState('');
  const [projectCustomer, setProjectCustomer] = useState('');

  const [root, setRoot] = useState<AssemblyNode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);

  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [partModalMode, setPartModalMode] = useState<'part' | 'assembly'>('part');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editNode, setEditNode] = useState<AssemblyNode | null>(null);
  const [targetParentId, setTargetParentId] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<{ id: string, name: string } | null>(null);

  const [uploadTargetGroup, setUploadTargetGroup] = useState<{ id: string, label: string } | null>(null);
  const [uploadTargetKind, setUploadTargetKind] = useState<string | null>(null);

  const [isDocDeleteModalOpen, setIsDocDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<{ id: string, label: string } | null>(null);

  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);

  const initialSelectionDone = useRef(false);

  const fetchDetails = useCallback(() => {
    if (projectId) {
      getProjectDetails(projectId)
        .then((data: any) => {
          setProjectTitle(data.name || 'Assembly View');
          setProjectNumber(data.project_number || '');
          setProjectCustomer(data.customer_details || '');
          const hierarchy = buildHierarchy(data);
          setRoot(hierarchy);
          if (!initialSelectionDone.current) {
            initialSelectionDone.current = true;

            // Expand all components in the hierarchy by default
            const nextExpanded: Record<string, boolean> = {};
            const walkExpand = (node: AssemblyNode) => {
              if (node.children && node.children.length > 0) {
                nextExpanded[node.id] = true;
                node.children.forEach(walkExpand);
              }
            };
            walkExpand(hierarchy);
            setExpanded(nextExpanded);

            // Select the first part (node.type === 'part') by default
            let firstPartId: string | null = null;
            const findFirstPart = (node: AssemblyNode): boolean => {
              if (node.type === 'part') {
                firstPartId = node.id;
                return true;
              }
              if (node.children) {
                for (const child of node.children) {
                  if (findFirstPart(child)) {
                    return true;
                  }
                }
              }
              return false;
            };
            findFirstPart(hierarchy);

            const targetId = firstPartId || (hierarchy.children && hierarchy.children.length > 0 ? hierarchy.children[0].id : hierarchy.id);
            setSelectedId(targetId);
          }
        })
        .catch(console.error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const index = useMemo(() => root ? flattenTree(root) : new Map<string, AssemblyNode>(), [root]);
  const selected = selectedId ? index.get(selectedId) ?? null : null;
  const hierarchyPath = useMemo(() => root && selectedId ? findPath(root, selectedId) : [], [root, selectedId]);

  const nodeDocs = useMemo(() => {
    const docs = [...(selected?.documents ?? [])];
    if (selected?.type === 'part' && selected.planStatus) {
      const hasPlanDoc = docs.some(d => d.kind === 'inspection_plan');
      if (!hasPlanDoc) {
        const drawingDoc = docs.find(d => d.kind === 'engineering_drawing');
        if (drawingDoc) {
          docs.push({
            ...drawingDoc,
            id: `virtual-ip-${drawingDoc.id}`,
            kind: 'inspection_plan',
            label: `Ballooned drawing`,
          });
        }
      }
    }
    return docs;
  }, [selected]);

  useEffect(() => {
    // Prioritize Drawing > 3D Model > Anything else
    const drawingDoc = nodeDocs.find(d => d.kind === 'engineering_drawing');
    const cadDoc = nodeDocs.find(d => d.kind === '3d_cad_model');
    const anyDoc = nodeDocs[0] ?? null;

    setPreviewDocId(drawingDoc?.id ?? cadDoc?.id ?? anyDoc?.id ?? null);
  }, [nodeDocs]);

  const previewDoc = useMemo(() =>
    nodeDocs.find(d => d.id === previewDocId) ?? null
    , [nodeDocs, previewDocId]);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded(p => ({ ...p, [id]: !(p[id] ?? false) }));
  }, []);

  const expandAll = useCallback(() => {
    if (!root) return;
    const next: Record<string, boolean> = {};
    const walk = (node: AssemblyNode) => {
      if (node.children && node.children.length > 0) {
        next[node.id] = true;
        node.children.forEach(walk);
      }
    };
    walk(root);
    setExpanded(next);
  }, [root]);

  const collapseAll = useCallback(() => {
    if (root) {
      setExpanded({ [root.id]: true });
    } else {
      setExpanded({});
    }
  }, [root]);

  const openPartModal = useCallback((parentId: string | null = null, mode: 'part' | 'assembly' = 'part') => {
    setEditNode(null);
    setTargetParentId(parentId ? parseInt(parentId.split('-')[1]) : null);
    setPartModalMode(mode);
    setIsPartModalOpen(true);
  }, []);

  const openEditModal = useCallback((node: AssemblyNode) => {
    setEditNode(node);
    setTargetParentId(null);
    setPartModalMode(node.type);
    setIsPartModalOpen(true);
  }, []);

  const handleDelete = useCallback((node: { id: string, name: string }) => {
    setNodeToDelete(node);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!nodeToDelete) return;
    try {
      const type = nodeToDelete.id.startsWith('asm-') ? 'assembly' : 'part';
      const id = parseInt(nodeToDelete.id.split('-')[1]);

      if (type === 'assembly') {
        await deleteAssembly(id);
      } else {
        await deletePart(id);
      }

      setIsDeleteModalOpen(false);
      setNodeToDelete(null);
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert('Failed to delete component');
    }
  };

  const handleDocDelete = useCallback((id: string, label: string) => {
    setDocToDelete({ id, label });
    setIsDocDeleteModalOpen(true);
  }, []);

  const confirmDocDelete = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete.id);
      setIsDocDeleteModalOpen(false);
      setDocToDelete(null);
      if (previewDocId === docToDelete.id) setPreviewDocId(null);
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert('Failed to delete document');
    }
  };

  return (
    <div className="min-h-full h-full flex-1 flex flex-col overflow-hidden px-8 pt-8 pb-4 bg-surface">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-4 pb-4 border-b border-outline-variant mb-4">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-sm border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-display font-black text-surface-bright leading-none tracking-tight">
            {projectTitle}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs font-mono font-bold text-primary/70 tracking-tight">{projectNumber || projectId}</span>
            {projectCustomer && (
              <>
                <span className="text-xs text-on-surface-variant/30">·</span>
                <span className="text-xs font-body text-on-surface-variant/50">{projectCustomer}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">

        {/* ❶ Left: Assembly Tree (25%) */}
        <div className="flex flex-col min-h-0 rounded-sm border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm" style={{ flex: '0 0 25%', minWidth: '260px' }}>
          <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-b border-outline-variant bg-surface-container-low/40">
            <Boxes className="w-4 h-4 text-primary" />
            <p className="text-xs font-display font-black text-surface-bright uppercase tracking-wider leading-none flex-1">
              Assembly Discovery
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openPartModal(null, 'part')}
                className="w-7 h-7 flex items-center justify-center rounded-sm bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40 group"
                title="Create Root Part"
              >
                <Box className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openPartModal(null, 'assembly')}
                className="w-7 h-7 flex items-center justify-center rounded-sm bg-surface-container border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40"
                title="Create Root Assembly"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2 ml-1">
              <button onClick={expandAll} title="Expand all" className="w-6 h-6 flex items-center justify-center rounded-sm text-on-surface-variant/60 hover:text-primary hover:bg-primary/5">
                <ChevronsDown className="w-3.5 h-3.5" />
              </button>
              <button onClick={collapseAll} title="Collapse all" className="w-6 h-6 flex items-center justify-center rounded-sm text-on-surface-variant/60 hover:text-primary hover:bg-primary/5">
                <ChevronsUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="shrink-0 px-3 py-2.5 border-b border-outline-variant bg-surface-container-low/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/20" />
              <input
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find components..."
                className="w-full h-9 pl-10 pr-3 rounded-sm text-xs font-body bg-surface-container-low border border-outline-variant text-surface-bright placeholder:text-on-surface-variant/20 outline-none focus:border-primary/40"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
            <div className="min-w-max py-2">
              {root ? (
                <TreeRow
                  node={root}
                  depth={0}
                  selectedId={selectedId}
                  expanded={expanded}
                  onSelect={setSelectedId}
                  onToggle={toggleExpanded}
                  onAdd={openPartModal}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  searchQuery={searchQuery}
                />
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface-container mx-auto mb-3 flex items-center justify-center">
                    <Boxes className="w-6 h-6 text-on-surface-variant/20" />
                  </div>
                  <p className="text-xs font-display font-black text-on-surface-variant/20 uppercase tracking-widest">No Structure</p>
                  <p className="text-[10px] text-on-surface-variant/30 mt-1">This project has no assemblies or parts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ❷ Right: Details (Full Height) */}
        <div className="flex-1 flex flex-col min-h-0 gap-4 overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden"
              >
                {/* ── Precision Asset Data (Top Panel Redesign) ─────────────────────── */}
                <div className="shrink-0 rounded-sm border border-outline-variant bg-surface-container-lowest shadow-sm overflow-hidden flex">

                  {/* Identification Block */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between px-6 pt-6 pb-5 bg-primary/[0.02]">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-sm bg-surface-container border border-outline-variant flex items-center justify-center shrink-0 shadow-inner mt-0.5 text-primary">
                            {selected.type === 'assembly' ? <Boxes className="w-6 h-6 text-primary" /> : <Box className="w-6 h-6 text-sky-500" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <h2 className="text-[26px] font-display font-black text-surface-bright leading-none tracking-tight">
                                {selected.name}
                              </h2>
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  'text-[9px] font-display font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-xs border',
                                  selected.type === 'assembly'
                                    ? 'bg-primary/5 text-primary border-primary/20'
                                    : 'bg-sky-500/5 text-sky-500 border-sky-500/20'
                                )}
                                >
                                  {selected.type}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-center">
                              <HierarchyBreadcrumb path={hierarchyPath} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-4 flex flex-col gap-2">
                        <button onClick={() => openEditModal(selected)} className="h-8 px-4 flex items-center gap-2 rounded-sm bg-surface-container border border-outline-variant text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/40 shadow-sm">
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit Details
                        </button>
                      </div>

                      {selected.description && (
                        <div className="border-l border-outline-variant/30 pl-5 py-0.5 ml-6 w-[280px] shrink-0 hidden lg:block">
                          <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-on-surface-variant/30 leading-none mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Overview
                          </p>
                          <p className="text-xs font-body text-on-surface-variant/80 leading-relaxed max-w-xs">{selected.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-5 gap-px bg-outline-variant/30 border-t border-outline-variant mt-auto">
                      {[
                        { label: 'Part Number', value: selected.code, mono: true },
                        { label: 'Qty/Asm', value: `${selected.quantity}`, mono: true },
                        { label: 'Classification', value: selected.type.toUpperCase(), mono: false },
                        { label: 'Assoc. Data', value: `${nodeDocs.length} DOCS`, mono: true },
                        {
                          label: 'Plan Status',
                          value: selected.type === 'part' ? (selected.planStatus ? 'APPROVED' : 'DRAFT') : 'N/A',
                          date: selected.type === 'part' && selected.planStatus ? selected.planApprovedAt : undefined,
                          mono: false,
                          color: selected.type === 'part' ? (selected.planStatus ? 'text-emerald-500' : 'text-amber-500') : ''
                        },
                      ].map(item => (
                        <div key={item.label} className="bg-surface-container-lowest px-6 py-3 flex flex-col justify-center min-h-[64px]">
                          <p className="text-[9px] font-display font-black uppercase tracking-[0.2em] text-on-surface-variant/30 leading-none">{item.label}</p>
                          <div className="mt-1.5 flex flex-col gap-1">
                            <p className={cn('text-sm font-bold leading-none truncate', item.mono ? 'font-mono tracking-tight' : 'font-display', (item as any).color || 'text-surface-bright')}>
                              {item.value}
                            </p>
                            {(item as any).date && (
                              <p className="text-[10px] font-mono font-bold text-on-surface-variant/40 leading-none truncate">
                                {new Date((item as any).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date((item as any).date).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vertical Action Stack */}
                  <div className="shrink-0 w-[240px] border-l border-outline-variant bg-surface-container-low/20 p-4 flex flex-col gap-3 justify-center relative shadow-[inset_1px_0_0_0_rgba(255,255,255,0.02)]">
                    <button
                      onClick={() => {
                        if (selected.type === 'part') {
                          const numericId = selected.id.split('-')[1];
                          navigate(`/assembly/${projectId}/inspection-planner/${numericId}`);
                        } else {
                          alert('Please select a Part (not an Assembly) to open the Inspection Planner.');
                        }
                      }}
                      className="flex items-center justify-between px-4 h-[54px] rounded-sm border border-primary/20 bg-primary/5 text-primary hover:bg-primary/15 group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList className="w-4 h-4" />
                        <span className="text-[10px] font-display font-black uppercase tracking-widest text-left leading-[1.2]">Inspection<br />Planner</span>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                    </button>

                    <button
                      onClick={() => {
                        if (selected.type === 'part') {
                          const numericId = selected.id.split('-')[1];
                          if (!selected.planStatus) {
                            alert('Please approve the Inspection Plan first before opening the Inspection Report.');
                            return;
                          }
                          navigate(`/assembly/${projectId}/inspection-report/${numericId}`);
                        } else {
                          alert('Please select a Part (not an Assembly) to open the Inspection Report.');
                        }
                      }}
                      className="flex items-center justify-between px-4 h-[54px] rounded-sm border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/40 hover:bg-primary/5 group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-display font-black uppercase tracking-widest text-left leading-[1.2]">Inspection<br />Report</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>

                {/* ── Documents + Preview (bottom, two columns, expanded) */}
                <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">

                  {/* Document List (left) */}
                  <div className="flex flex-col min-h-0 rounded-sm border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm" style={{ flex: '0 0 32%', minWidth: '280px' }}>
                    <div className="shrink-0 px-4 py-3 border-b border-outline-variant bg-surface-container-low/40 flex items-center justify-between">
                      <p className="text-[11px] font-display font-black text-surface-bright uppercase tracking-wider leading-none">
                        Documentation Matrix
                      </p>
                      <ListChecks className="w-4 h-4 text-on-surface-variant/20" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {DOC_GROUPS.map((group, gIdx) => {
                        const groupDocs = nodeDocs.filter(d => group.kinds.includes(d.kind));

                        return (
                          <div key={group.id} className={cn(gIdx > 0 && 'mt-2')}>
                            <div className="px-4 py-2 bg-surface-container-low/50 border-y border-outline-variant/20 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-display font-black uppercase tracking-[0.15em] text-surface-bright leading-none">{group.label}</span>
                                <span className="px-1.5 py-0.5 rounded-xs bg-surface-container-highest text-[8px] font-mono text-on-surface-variant/60">{groupDocs.length}</span>
                              </div>
                              {!(group.id === 'design' && groupDocs.length > 0) && (
                                <button
                                  onClick={() => { setUploadTargetGroup(group); setUploadTargetKind(null); setIsUploadModalOpen(true); }}
                                  className="w-6 h-6 flex items-center justify-center rounded-sm text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20"
                                  title={`Upload to ${group.label}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div className="bg-surface-container-lowest">
                              {group.kinds.map((kind: any) => {
                                const docs = groupDocs.filter(d => d.kind === kind);
                                if (docs.length > 0) {
                                  return docs.map(doc => (
                                    <DocListItem
                                      key={doc.id} doc={doc}
                                      isSelected={previewDocId === doc.id}
                                      onClick={() => setPreviewDocId(doc.id)}
                                      onDelete={handleDocDelete}
                                    />
                                  ));
                                }
                                return <EmptyDocSlot key={kind} kind={kind as QmsDocKind} onUpload={() => { setUploadTargetGroup(group); setUploadTargetKind(kind); setIsUploadModalOpen(true); }} />;
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="shrink-0 p-3 bg-surface-container-low/20 border-t border-outline-variant/30 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-on-surface-variant/40 uppercase">Total Files: {nodeDocs.length}</span>
                      <button className="text-[9px] font-display font-black text-primary uppercase tracking-widest hover:underline">Download Pack</button>
                    </div>
                  </div>

                  {/* Preview (right, expanded) */}
                  <div className={cn(
                    "flex-1 min-h-0 rounded-sm border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm",
                    isPreviewMaximized && "fixed inset-8 z-[100] shadow-2xl ring-1 ring-primary/20"
                  )}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={previewDoc?.id ?? 'empty'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="h-full"
                      >
                        <DocPreview
                          doc={previewDoc}
                          partId={selectedId}
                          isMaximized={isPreviewMaximized}
                          onToggleMaximize={() => setIsPreviewMaximized(!isPreviewMaximized)}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center rounded-sm border border-outline-variant bg-surface-container-lowest border-dashed">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-surface-container mx-auto mb-4 flex items-center justify-center">
                    <Boxes className="w-8 h-8 text-on-surface-variant/10" />
                  </div>
                  <p className="text-sm font-display font-black text-on-surface-variant/20 uppercase tracking-[0.2em]"> Select a component to view details </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        onSuccess={fetchDetails}
        projectId={parseInt(projectId || '0')}
        parentAssemblyId={targetParentId}
        initialMode={partModalMode}
        editNode={editNode}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => { setIsUploadModalOpen(false); setUploadTargetGroup(null); setUploadTargetKind(null); }}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          setUploadTargetGroup(null);
          setUploadTargetKind(null);
          fetchDetails();
        }}
        targetNode={selected ? { id: selected.id, name: selected.name, type: selected.type } : null}
        targetGroup={uploadTargetGroup}
        targetKind={uploadTargetKind}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        nodeName={nodeToDelete?.name}
      />

      <DocDeleteConfirmModal
        isOpen={isDocDeleteModalOpen}
        onClose={() => setIsDocDeleteModalOpen(false)}
        onConfirm={confirmDocDelete}
        docLabel={docToDelete?.label}
      />
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, nodeName }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-surface-bright/20 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-surface-container-lowest rounded-sm border border-outline-variant p-6"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-black text-surface-bright uppercase">Confirm Deletion</h3>
              <p className="text-xs font-body text-on-surface-variant font-medium">
                Are you sure you want to delete <span className="text-primary font-bold">"{nodeName}"</span>? All child sub-assemblies and parts will also be removed.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-sm text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 h-10 rounded-sm bg-red-500 text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const DocDeleteConfirmModal = ({ isOpen, onClose, onConfirm, docLabel }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-surface-bright/20 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-surface-container-lowest rounded-sm border border-outline-variant p-6"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-black text-surface-bright uppercase">Delete Document</h3>
              <p className="text-xs font-body text-on-surface-variant font-medium">
                Are you sure you want to delete <span className="text-primary font-bold">"{docLabel}"</span>? This will permanently remove the file and all its versions.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full mt-2">
              <button onClick={onClose} className="flex-1 h-10 rounded-sm text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant">
                Cancel
              </button>
              <button onClick={onConfirm} className="flex-1 h-10 rounded-sm bg-red-500 text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-red-600">
                Delete File
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
