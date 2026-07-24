import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Stage } from '../context/AppContext';
import {
  Settings,
  Plus,
  LayoutGrid,
  Cog,
  Hash,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Package,
  Server,
  Layers,
  Cpu,
  FlaskConical,
  ClipboardCheck,
  Wrench,
  Pencil,
  Check,
  X,
  Zap,
  ZapOff,
  ListPlus
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────
const stageIcon = (id: string) => {
  if (id === 'igqa')      return <FlaskConical style={{ width: 11, height: 11 }} />;
  if (id === 'assembly')  return <Wrench style={{ width: 11, height: 11 }} />;
  if (id === 'testing')   return <Cpu style={{ width: 11, height: 11 }} />;
  if (id === 'qa-review') return <ClipboardCheck style={{ width: 11, height: 11 }} />;
  return <Layers style={{ width: 11, height: 11 }} />;
};

const stageColors = (id: string) => {
  if (id === 'igqa')      return { text: '#fbbf24', bg: 'rgba(251,191,36,0.05)',  border: 'rgba(251,191,36,0.18)' };
  if (id === 'assembly')  return { text: '#38bdf8', bg: 'rgba(56,189,248,0.05)',  border: 'rgba(56,189,248,0.18)' };
  if (id === 'testing')   return { text: '#a78bfa', bg: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.18)' };
  if (id === 'qa-review') return { text: '#10b981', bg: 'rgba(16,185,129,0.05)',  border: 'rgba(16,185,129,0.18)' };
  return { text: 'var(--color-on-surface-variant)', bg: 'transparent', border: 'var(--color-outline-variant)' };
};

// ── Inline editable label ────────────────────────────────────────────
const InlineEdit: React.FC<{
  value: string;
  onSave: (v: string) => void;
  disabled: boolean;
  textStyle?: React.CSSProperties;
}> = ({ value, onSave, disabled, textStyle }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          style={{
            flex: 1, height: 24, padding: '0 6px', fontSize: 11,
            backgroundColor: 'var(--color-surface-container)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-sm)', color: 'var(--color-surface-bright)',
            outline: 'none', fontFamily: 'var(--font-body)'
          }}
        />
        <button onClick={commit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <Check style={{ width: 12, height: 12, color: 'var(--color-tertiary)' }} />
        </button>
        <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
          <X style={{ width: 12, height: 12, color: 'var(--color-status-critical-txt)' }} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
      <span style={{ ...textStyle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
      {!disabled && (
        <button
          onClick={() => { setDraft(value); setEditing(true); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.4, flexShrink: 0 }}
          title="Rename"
        >
          <Pencil style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
        </button>
      )}
    </div>
  );
};

// ── Sub-stage row with ATE toggle and rename ─────────────────────────
const SubStageRow: React.FC<{
  sub: Stage['subStages'][0];
  productId: string;
  moduleId: string;
  stageId: string;
  isAdmin: boolean;
  onToggleAte: () => void;
  onRename: (name: string) => void;
}> = ({ sub, isAdmin, onToggleAte, onRename }) => {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 14px 7px 32px',
      borderTop: '1px solid var(--color-outline-variant)',
      backgroundColor: 'var(--color-surface-container-lowest)',
      transition: 'background 0.1s ease'
    }}>
      {/* Bullet */}
      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-outline-variant)', flexShrink: 0, marginRight: 2 }} />

      {/* Editable name */}
      <InlineEdit
        value={sub.name}
        onSave={onRename}
        disabled={!isAdmin}
        textStyle={{ fontSize: 11, color: 'var(--color-surface-bright)', fontWeight: 500 }}
      />

      {/* ATE toggle */}
      <button
        onClick={isAdmin ? onToggleAte : undefined}
        title={isAdmin ? (sub.isAte ? 'Remove ATE tag' : 'Mark as ATE') : 'Admin only'}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '2px 7px', borderRadius: 2, flexShrink: 0,
          border: `1px solid ${sub.isAte ? 'rgba(56,189,248,0.3)' : 'var(--color-outline-variant)'}`,
          backgroundColor: sub.isAte ? 'rgba(56,189,248,0.08)' : 'transparent',
          cursor: isAdmin ? 'pointer' : 'default',
          transition: 'all 0.15s ease'
        }}
      >
        {sub.isAte
          ? <Zap style={{ width: 9, height: 9, color: 'var(--color-primary)' }} />
          : <ZapOff style={{ width: 9, height: 9, color: 'var(--color-on-surface-variant)' }} />
        }
        <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: sub.isAte ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
          {sub.isAte ? 'ATE · OCR' : 'No ATE'}
        </span>
      </button>

      {/* Sub-stage ID badge */}
      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', backgroundColor: 'var(--color-surface-container-low)', padding: '1px 5px', borderRadius: 2, border: '1px solid var(--color-outline-variant)', flexShrink: 0 }}>
        {sub.id.length > 16 ? sub.id.slice(0, 16) + '…' : sub.id}
      </span>
    </div>
  );
};

// ── Add-Sub-Stage inline form ────────────────────────────────────────
const AddSubStageForm: React.FC<{
  stageId: string;
  isAdmin: boolean;
  onAdd: (name: string, isAte: boolean) => void;
}> = ({ stageId, isAdmin, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isAte, setIsAte] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), isAte);
    setName('');
    setIsAte(false);
    setOpen(false);
  };

  if (!open) {
    return (
      <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '8px 14px' }}>
        <button
          onClick={() => isAdmin && setOpen(true)}
          disabled={!isAdmin}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
            cursor: isAdmin ? 'pointer' : 'not-allowed',
            color: isAdmin ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            opacity: isAdmin ? 1 : 0.4, padding: 0
          }}
        >
          <ListPlus style={{ width: 12, height: 12 }} />
          Add Sub-Stage to {stageId.replace('-', ' ').toUpperCase()}
        </button>
      </div>
    );
  }

  return (
    <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '10px 14px', backgroundColor: 'rgba(56,189,248,0.02)' }}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.06em' }}>
          New Sub-Stage Definition
        </div>
        <input
          autoFocus
          type="text"
          placeholder="Sub-stage name (e.g. RF Power Verification)"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field"
          style={{ height: 30, fontSize: 11 }}
        />

        {/* ATE toggle row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => setIsAte(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-sm)',
              border: `1px solid ${isAte ? 'rgba(56,189,248,0.4)' : 'var(--color-outline-variant)'}`,
              backgroundColor: isAte ? 'rgba(56,189,248,0.1)' : 'var(--color-surface-container-low)',
              cursor: 'pointer', transition: 'all 0.15s ease'
            }}
          >
            {isAte
              ? <Zap style={{ width: 11, height: 11, color: 'var(--color-primary)' }} />
              : <ZapOff style={{ width: 11, height: 11, color: 'var(--color-on-surface-variant)' }} />
            }
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: isAte ? 'var(--color-primary)' : 'var(--color-on-surface-variant)' }}>
              {isAte ? 'ATE · OCR Validation ON' : 'ATE / OCR Off'}
            </span>
          </button>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ height: 28, padding: '0 10px', backgroundColor: 'transparent', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4,
                backgroundColor: name.trim() ? 'var(--color-primary)' : 'var(--color-surface-container)',
                color: name.trim() ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                border: 'none', borderRadius: 'var(--radius-sm)', cursor: name.trim() ? 'pointer' : 'not-allowed',
                fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus style={{ width: 10, height: 10 }} /> ADD
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ── Stage accordion with editable sub-stages ────────────────────────
const StageAccordion: React.FC<{
  stage: Stage;
  idx: number;
  productId: string;
  moduleId: string;
  isAdmin: boolean;
  onToggleAte: (stageId: string, subStageId: string) => void;
  onRenameSubStage: (stageId: string, subStageId: string, newName: string) => void;
  onAddSubStage: (stageId: string, name: string, isAte: boolean) => void;
}> = ({ stage, idx, isAdmin, onToggleAte, onRenameSubStage, onAddSubStage }) => {
  const [open, setOpen] = useState(true);
  const colors = stageColors(stage.id);
  const ateCount = stage.subStages.filter(s => s.isAte).length;

  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      {/* Stage header */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', cursor: 'pointer', backgroundColor: colors.bg }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: colors.text }}>{stageIcon(stage.id)}</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: colors.text }}>
            {idx + 1}. {stage.name}
          </span>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', backgroundColor: 'var(--color-surface-container)', padding: '1px 5px', borderRadius: 2, border: '1px solid var(--color-outline-variant)' }}>
            {stage.subStages.length} sub-stages
          </span>
          {ateCount > 0 && (
            <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 2, backgroundColor: 'rgba(56,189,248,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(56,189,248,0.2)' }}>
              {ateCount} ATE
            </span>
          )}
        </div>
        {open
          ? <ChevronDown style={{ width: 13, height: 13, color: colors.text }} />
          : <ChevronRight style={{ width: 13, height: 13, color: colors.text }} />
        }
      </div>

      {/* Sub-stage list + add form */}
      {open && (
        <div>
          {stage.subStages.length === 0 ? (
            <div style={{ padding: '10px 32px', fontSize: 11, color: 'var(--color-on-surface-variant)', borderTop: '1px solid var(--color-outline-variant)' }}>
              No sub-stages defined.
            </div>
          ) : (
            stage.subStages.map(sub => (
              <SubStageRow
                key={sub.id}
                sub={sub}
                productId=""
                moduleId=""
                stageId={stage.id}
                isAdmin={isAdmin}
                onToggleAte={() => onToggleAte(stage.id, sub.id)}
                onRename={name => onRenameSubStage(stage.id, sub.id, name)}
              />
            ))
          )}
          <AddSubStageForm
            stageId={stage.id}
            isAdmin={isAdmin}
            onAdd={(name, isAte) => onAddSubStage(stage.id, name, isAte)}
          />
        </div>
      )}
    </div>
  );
};

// ── Main Screen ────────────────────────────────────────────────────
export const AdminMaster: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    addProduct,
    addServiceToProduct,
    addModuleToProduct,
    addSubStageToStage,
    toggleSubStageAte,
    renameSubStage,
    currentRole
  } = useApp();

  const [newProductName, setNewProductName] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newModuleName, setNewModuleName] = useState('');
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);

  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeSerials = activeProduct?.services.map(s => s.serialNumber) || [];
  const activeModules = activeProduct?.services[0]?.modules || [];
  const isAdmin = currentRole === 'Admin';

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;
    addProduct(newProductName.trim());
    setNewProductName('');
  };

  const handleAddSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.trim() || !selectedProductId) return;
    addServiceToProduct(selectedProductId, newSerial.trim());
    setNewSerial('');
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !selectedProductId) return;
    addModuleToProduct(selectedProductId, newModuleName.trim());
    setNewModuleName('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── PAGE HEADER ───────────────────────────────── */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-surface-bright)', letterSpacing: '0.04em' }}>
              Master Configuration
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              Define products, configure modules, stages &amp; sub-stages, and manage service serial units
            </p>
          </div>
        </div>
        {!isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 'var(--radius-sm)' }}>
            <ShieldAlert style={{ width: 13, height: 13, color: 'var(--color-status-critical-txt)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)' }}>
              VIEW ONLY · Switch to Admin role to edit
            </span>
          </div>
        )}
      </div>

      {/* ── THREE-COLUMN BODY ────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* ══ COL 1: Product Configuration ═══════════════ */}
        <div style={{ width: 256, flexShrink: 0, borderRight: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <LayoutGrid style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Product Configuration
            </span>
          </div>

          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
            {products.map(p => {
              const isActive = selectedProductId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: isActive ? 'rgba(56,189,248,0.05)' : 'transparent', border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`, transition: 'all 0.15s ease', display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Package style={{ width: 11, height: 11, color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface-variant)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-surface-bright)', flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', backgroundColor: 'var(--color-surface-container)', padding: '1px 5px', borderRadius: 2, border: '1px solid var(--color-outline-variant)' }}>
                      {p.id.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, paddingLeft: 18 }}>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                      {p.services.length} serials · {p.modulesCount} modules
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add product */}
          <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '10px', flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: 6, letterSpacing: '0.06em' }}>Add New Product</div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input type="text" placeholder="Product name (e.g. ALNS)" value={newProductName} onChange={e => setNewProductName(e.target.value)} disabled={!isAdmin} className="input-field" style={{ height: 30, fontSize: 11 }} />
              <button type="submit" disabled={!isAdmin || !newProductName.trim()} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: (isAdmin && newProductName.trim()) ? 'var(--color-primary)' : 'var(--color-surface-container)', color: (isAdmin && newProductName.trim()) ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: (isAdmin && newProductName.trim()) ? 'pointer' : 'not-allowed', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', transition: 'all 0.2s ease' }}>
                <Plus style={{ width: 10, height: 10 }} /> Add Product
              </button>
            </form>
          </div>
        </div>

        {/* ══ COL 2: Modules + Stage/Sub-Stage Config ═══════ */}
        <div style={{ flex: 1, borderRight: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Cog style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
                Modules &amp; Stage Configuration
              </span>
            </div>
            {activeProduct && (
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}>
                {activeProduct.name.toUpperCase()}
              </span>
            )}
          </div>

          {!activeProduct ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
              Select a product to configure its modules
            </div>
          ) : (
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeModules.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-on-surface-variant)', fontSize: 12 }}>No modules defined yet.</div>
              ) : (
                activeModules.map(mod => {
                  const isExpanded = expandedModuleId === mod.id;
                  const stages: Stage[] = mod.stages ?? [];

                  return (
                    <div key={mod.id} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--color-surface-container-lowest)' }}>
                      {/* Module header */}
                      <div
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', cursor: 'pointer', backgroundColor: isExpanded ? 'var(--color-surface-container-low)' : 'transparent', transition: 'background 0.15s ease' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          {isExpanded
                            ? <ChevronDown style={{ width: 13, height: 13, color: 'var(--color-primary)', flexShrink: 0 }} />
                            : <ChevronRight style={{ width: 13, height: 13, color: 'var(--color-on-surface-variant)', flexShrink: 0 }} />
                          }
                          <Layers style={{ width: 12, height: 12, color: 'var(--color-primary)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{mod.name}</div>
                            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', marginTop: 1 }}>
                              {mod.id} · {stages.length} stages · {stages.reduce((t, s) => t + s.subStages.length, 0)} sub-stages · {stages.flatMap(s => s.subStages).filter(ss => ss.isAte).length} ATE
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded: Stage tree with full editing */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8, backgroundColor: 'var(--color-surface-container-lowest)' }}>
                          <div style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', marginBottom: 2 }}>
                            Stage &amp; Sub-Stage Definitions — click to expand/collapse stages
                          </div>
                          {stages.map((stage, sIdx) => (
                            <StageAccordion
                              key={stage.id}
                              stage={stage}
                              idx={sIdx}
                              productId={selectedProductId}
                              moduleId={mod.id}
                              isAdmin={isAdmin}
                              onToggleAte={(stageId, subId) => toggleSubStageAte(selectedProductId, mod.id, stageId, subId)}
                              onRenameSubStage={(stageId, subId, name) => renameSubStage(selectedProductId, mod.id, stageId, subId, name)}
                              onAddSubStage={(stageId, name, ate) => addSubStageToStage(selectedProductId, mod.id, stageId, name, ate)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Add module form */}
              <div style={{ borderTop: '1px solid var(--color-outline-variant)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: 6, letterSpacing: '0.06em' }}>
                  Map New Module to {activeProduct.name}
                </div>
                <form onSubmit={handleAddModule} style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Module name (e.g. Servo Drive Unit)" value={newModuleName} onChange={e => setNewModuleName(e.target.value)} disabled={!isAdmin} className="input-field" style={{ flex: 1, height: 30, fontSize: 11 }} />
                  <button type="submit" disabled={!isAdmin || !newModuleName.trim()} style={{ height: 30, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, backgroundColor: (isAdmin && newModuleName.trim()) ? 'var(--color-primary)' : 'var(--color-surface-container)', color: (isAdmin && newModuleName.trim()) ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: (isAdmin && newModuleName.trim()) ? 'pointer' : 'not-allowed', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.2s ease' }}>
                    <Plus style={{ width: 10, height: 10 }} /> Map Module
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ══ COL 3: Service Registry ═══════════════════════ */}
        <div style={{ width: 278, flexShrink: 0, backgroundColor: 'var(--color-surface-container-lowest)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <Server style={{ width: 12, height: 12, color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
              Service Registry
            </span>
          </div>

          {!activeProduct ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)', fontSize: 12, textAlign: 'center', padding: 16 }}>
              Select a product to manage serial units
            </div>
          ) : (
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em' }}>
                Registered Units — {activeProduct.name}
              </div>
              {activeSerials.length === 0 ? (
                <div style={{ padding: '20px 12px', textAlign: 'center', border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', color: 'var(--color-on-surface-variant)', fontSize: 11 }}>
                  No serial units registered
                </div>
              ) : (
                activeSerials.map((serial, idx) => (
                  <div key={serial} style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-container-low)', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Hash style={{ width: 12, height: 12, color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', flex: 1 }}>{serial}</span>
                    <span style={{ fontSize: 8, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', backgroundColor: 'var(--color-surface-container)', padding: '1px 5px', borderRadius: 2, border: '1px solid var(--color-outline-variant)', flexShrink: 0 }}>Unit {idx + 1}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeProduct && (
            <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: '10px', flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', marginBottom: 6, letterSpacing: '0.06em' }}>Register New Serial</div>
              <form onSubmit={handleAddSerial} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input type="text" placeholder="Serial Number (e.g. SN004)" value={newSerial} onChange={e => setNewSerial(e.target.value)} disabled={!isAdmin} className="input-field font-mono" style={{ height: 30, fontSize: 11 }} />
                <button type="submit" disabled={!isAdmin || !newSerial.trim()} style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: (isAdmin && newSerial.trim()) ? 'var(--color-primary)' : 'var(--color-surface-container)', color: (isAdmin && newSerial.trim()) ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: (isAdmin && newSerial.trim()) ? 'pointer' : 'not-allowed', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', transition: 'all 0.2s ease' }}>
                  <Plus style={{ width: 10, height: 10 }} /> Register Serial
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
