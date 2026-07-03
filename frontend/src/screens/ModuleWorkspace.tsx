import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Stage, SubStage, DocumentRecord } from '../context/AppContext';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Clock,
  Eye,
  Check,
  X,
  Inbox,
  ThumbsUp,
  ThumbsDown,
  Percent,
  FileBarChart2,
  ClipboardCheck,
  Send
} from 'lucide-react';

// ── Status helpers ─────────────────────────────────────────────────
const STATUS_META: Record<SubStage['status'], { label: string; color: string; bg: string; dotColor: string }> = {
  completed:      { label: 'Approved',       color: 'var(--color-tertiary)',              bg: 'rgba(16,185,129,0.10)',  dotColor: '#10b981' },
  running:        { label: 'In Progress',    color: 'var(--color-primary)',               bg: 'rgba(56,189,248,0.10)', dotColor: '#38bdf8' },
  pending_review: { label: 'Pending QA',     color: 'var(--color-status-pending-txt)',   bg: 'rgba(251,191,36,0.10)', dotColor: '#fbbf24' },
  rejected:       { label: 'Rejected',       color: 'var(--color-status-critical-txt)', bg: 'rgba(248,113,113,0.10)', dotColor: '#f87171' },
  inactive:       { label: 'Inactive',       color: 'var(--color-status-inactive-txt)', bg: 'rgba(161,161,170,0.10)', dotColor: '#71717a' },
};

const StatusDot: React.FC<{ status: SubStage['status']; size?: number }> = ({ status, size = 8 }) => {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: meta.dotColor,
        flexShrink: 0,
        boxShadow: `0 0 ${size}px ${meta.dotColor}66`
      }}
    />
  );
};

const StatusBadge: React.FC<{ status: SubStage['status'] }> = ({ status }) => {
  const meta = STATUS_META[status];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 8px',
      borderRadius: 2,
      fontSize: 10,
      fontWeight: 800,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: meta.color,
      backgroundColor: meta.bg,
      border: `1px solid ${meta.dotColor}33`
    }}>
      <StatusDot status={status} size={6} />
      {meta.label}
    </span>
  );
};

// ── Metric Card ────────────────────────────────────────────────────
const MetricCell: React.FC<{
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
}> = ({ label, value, color, icon }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 4, flex: 1,
    padding: '10px 14px',
    backgroundColor: 'var(--color-surface-container-low)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-outline-variant)',
    minWidth: 0
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-on-surface-variant)' }}>
      {icon}
      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </span>
    </div>
    <span style={{
      fontSize: 18, fontWeight: 900, fontFamily: 'var(--font-mono)',
      color: color ?? 'var(--color-surface-bright)',
      lineHeight: 1
    }}>
      {value}
    </span>
  </div>
);

// ── Document preview row ───────────────────────────────────────────
const DocRow: React.FC<{ doc: DocumentRecord; onPreview: () => void }> = ({ doc, onPreview }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-surface-container-low)',
    border: '1px solid var(--color-outline-variant)'
  }}>
    <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <FileText style={{ width: 15, height: 15, color: 'var(--color-primary)' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {doc.fileName}
      </div>
      <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
        {doc.fileSize} · Uploaded by {doc.uploadedBy} · {doc.timestamp}
      </div>
    </div>
    <span style={{
      fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      padding: '2px 6px', borderRadius: 2,
      color: doc.status === 'APPROVED' ? 'var(--color-tertiary)' : doc.status === 'REJECTED' ? 'var(--color-status-critical-txt)' : 'var(--color-status-pending-txt)',
      backgroundColor: doc.status === 'APPROVED' ? 'rgba(16,185,129,0.10)' : doc.status === 'REJECTED' ? 'rgba(248,113,113,0.10)' : 'rgba(251,191,36,0.10)'
    }}>
      {doc.status}
    </span>
    <button
      onClick={onPreview}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 8px', border: '1px solid var(--color-outline-variant)',
        background: 'var(--color-surface-container-lowest)',
        color: 'var(--color-on-surface-variant)',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
        fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
      }}
    >
      <Eye style={{ width: 11, height: 11 }} /> Preview
    </button>
  </div>
);

// ── Checklist item ─────────────────────────────────────────────────
const CheckItem: React.FC<{ label: string; checked: boolean }> = ({ label, checked }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 10px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-container-low)',
    borderLeft: `3px solid ${checked ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)'}`
  }}>
    {checked
      ? <Check style={{ width: 12, height: 12, color: 'var(--color-tertiary)', flexShrink: 0 }} />
      : <X style={{ width: 12, height: 12, color: 'var(--color-status-critical-txt)', flexShrink: 0 }} />
    }
    <span style={{ fontSize: 11, color: 'var(--color-surface-bright)' }}>{label}</span>
  </div>
);

// ── FQA Review Card ────────────────────────────────────────────────
const FQAReviewCard: React.FC<{ doc: DocumentRecord; subStage: SubStage }> = ({ doc, subStage }) => {
  const { currentRole, reviewDocument, selectedModuleId, selectedStageId } = useApp();
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApproved   = doc.status === 'APPROVED';
  const isRejected   = doc.status === 'REJECTED';
  const isPending    = doc.status === 'PENDING';
  const borderColor  = isApproved ? 'var(--color-tertiary)' : isRejected ? 'var(--color-status-critical-txt)' : 'var(--color-status-pending-txt)';

  const hasClearance = currentRole === 'Admin' || currentRole === 'Final QA';

  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true);
    setTimeout(() => {
      reviewDocument(selectedModuleId, selectedStageId, subStage.id, doc.id, status, remarks || 'Specifications validated.');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div style={{
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 'var(--radius-sm)',
      padding: '14px 16px',
      backgroundColor: 'var(--color-surface-container-low)',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Visual Seal Stamp Background if Checked */}
      {isApproved && (
        <div style={{
          position: 'absolute', right: '-15px', bottom: '-8px',
          border: '2px dashed rgba(16, 185, 129, 0.4)',
          borderRadius: '4px',
          padding: '4px 8px',
          color: 'var(--color-tertiary)',
          fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)',
          transform: 'rotate(-12deg)',
          opacity: 0.35,
          userSelect: 'none', pointerEvents: 'none',
          textTransform: 'uppercase'
        }}>
          QC PASSED
        </div>
      )}
      {isRejected && (
        <div style={{
          position: 'absolute', right: '-15px', bottom: '-8px',
          border: '2px dashed rgba(239, 68, 68, 0.4)',
          borderRadius: '4px',
          padding: '4px 8px',
          color: 'var(--color-status-critical-txt)',
          fontSize: '9px', fontWeight: 900, fontFamily: 'var(--font-mono)',
          transform: 'rotate(-12deg)',
          opacity: 0.35,
          userSelect: 'none', pointerEvents: 'none',
          textTransform: 'uppercase'
        }}>
          QC REJECTED
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-surface-bright)' }}>
          Review by FQA
        </span>
        <span style={{
          fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          padding: '3px 8px', borderRadius: 2,
          color: borderColor,
          backgroundColor: isApproved ? 'rgba(16,185,129,0.10)' : isRejected ? 'rgba(248,113,113,0.10)' : 'rgba(251,191,36,0.10)',
          border: `1px solid ${borderColor}33`
        }}>
          {doc.status}
        </span>
      </div>

      {isPending ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {hasClearance ? (
            <>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter audit remarks or observations..."
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  height: '56px',
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px',
                  fontSize: '11px',
                  color: 'var(--color-surface-bright)',
                  fontFamily: 'var(--font-body)',
                  resize: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleReview('APPROVED')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-tertiary)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--color-tertiary)',
                    cursor: 'pointer', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                    transition: 'all 0.2s ease'
                  }}
                  className="btn-ghost"
                >
                  <ThumbsUp style={{ width: 13, height: 13 }} />
                  OK
                </button>
                <button
                  onClick={() => handleReview('REJECTED')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-status-critical-txt)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-status-critical-txt)',
                    cursor: 'pointer', fontSize: '10px', fontWeight: 900, fontFamily: 'var(--font-mono)',
                    transition: 'all 0.2s ease'
                  }}
                  className="btn-ghost"
                >
                  <ThumbsDown style={{ width: 13, height: 13 }} />
                  NOT OK
                </button>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 8,
              padding: '10px', backgroundColor: 'rgba(251, 191, 36, 0.05)',
              borderRadius: 'var(--radius-sm)', border: '1px solid rgba(251, 191, 36, 0.15)',
              alignItems: 'center', textAlign: 'center'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--color-status-pending-txt)', fontWeight: 700 }}>
                🔒 Awaiting Reviewer Action
              </span>
              <span style={{ fontSize: '9px', color: 'var(--color-on-surface-variant)', lineHeight: 1.3 }}>
                Final QA signature level required. Switch login level in toolbar to Final QA or Admin.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 2,
              border: `1px solid ${isApproved ? 'var(--color-tertiary)' : 'var(--color-outline-variant)'}`,
              backgroundColor: isApproved ? 'rgba(16,185,129,0.10)' : 'transparent',
              opacity: isApproved ? 1 : 0.4
            }}>
              <ThumbsUp style={{ width: 13, height: 13, color: isApproved ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)' }} />
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', color: isApproved ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)' }}>
                OK
              </span>
            </div>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', borderRadius: 2,
              border: `1px solid ${isRejected ? 'var(--color-status-critical-txt)' : 'var(--color-outline-variant)'}`,
              backgroundColor: isRejected ? 'rgba(248,113,113,0.10)' : 'transparent',
              opacity: isRejected ? 1 : 0.4
            }}>
              <ThumbsDown style={{ width: 13, height: 13, color: isRejected ? 'var(--color-status-critical-txt)' : 'var(--color-on-surface-variant)' }} />
              <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', color: isRejected ? 'var(--color-status-critical-txt)' : 'var(--color-on-surface-variant)' }}>
                NOT OK
              </span>
            </div>
          </div>

          {doc.remarks && (
            <div style={{
              padding: '8px 10px', borderRadius: 2,
              backgroundColor: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)'
            }}>
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', fontStyle: 'italic' }}>
                "{doc.remarks}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────
export const ModuleWorkspace: React.FC = () => {
  const {
    products,
    selectedProductId,
    selectedSerial,
    setSelectedSerial,
    selectedModuleId,
    setSelectedStageId,
    setSelectedSubStageId,
    uploadSubStageDocument
  } = useApp();

  // ── Context resolution ──────────────────────────────────────────
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeSerials = activeProduct?.services.map(s => s.serialNumber) ?? [];
  const serialIndex   = activeSerials.indexOf(selectedSerial);
  const activeService = activeProduct?.services.find(s => s.serialNumber === selectedSerial);
  const activeModule  = activeService?.modules.find(m => m.id === selectedModuleId);

  // ── Tree selection state ────────────────────────────────────────
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [selectedStageId, setLocalStageId]  = useState<string>(activeModule?.stages[0]?.id ?? '');
  const [selectedSubId, setLocalSubId]      = useState<string>(activeModule?.stages[0]?.subStages[0]?.id ?? '');

  // Expand all stages on mount
  useEffect(() => {
    if (activeModule) {
      const initial: Record<string, boolean> = {};
      activeModule.stages.forEach(s => { initial[s.id] = true; });
      setExpandedStages(initial);
    }
  }, [selectedModuleId, selectedSerial]);

  // Reset selection when serial changes
  useEffect(() => {
    const mod = activeProduct?.services.find(s => s.serialNumber === selectedSerial)?.modules.find(m => m.id === selectedModuleId);
    if (mod) {
      setLocalStageId(mod.stages[0]?.id ?? '');
      setLocalSubId(mod.stages[0]?.subStages[0]?.id ?? '');
    }
  }, [selectedSerial, selectedModuleId]);

  // ── Active selection ────────────────────────────────────────────
  const activeStage   = activeModule?.stages.find(s => s.id === selectedStageId);
  const activeSubStage = activeStage?.subStages.find(ss => ss.id === selectedSubId);
  const lastDoc       = activeSubStage?.documentHistory[0];
  const hasDocs       = (activeSubStage?.documentHistory.length ?? 0) > 0;

  // ── Calculated metrics ──────────────────────────────────────────
  const receivedQty  = lastDoc?.totalItems   ?? 0;
  const acceptedQty  = lastDoc?.approvedCount ?? 0;
  const rejectedQty  = lastDoc?.rejectedCount ?? 0;
  const passPercent  = receivedQty > 0 ? Math.round((acceptedQty / receivedQty) * 100) : 0;

  // ── Upload form state ───────────────────────────────────────────
  const [uploadMode, setUploadMode]       = useState(false);
  const [fileName, setFileName]           = useState('');
  const [totalItems, setTotalItems]       = useState(50);
  const [approvedCount, setApprovedCount] = useState(50);
  const [startTime, setStartTime]         = useState('09:00');
  const [endTime, setEndTime]             = useState('10:00');
  const [uploading, setUploading]         = useState(false);
  const [simFail, setSimFail]             = useState(false);
  const [previewDoc, setPreviewDoc]       = useState<DocumentRecord | null>(null);

  const rejectedCount = Math.max(0, totalItems - approvedCount);
  const duration = (() => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let d = (eh * 60 + em) - (sh * 60 + sm);
      return d < 0 ? d + 1440 : d;
    } catch { return 0; }
  })();

  const canUpload     = activeSubStage?.status === 'running' || activeSubStage?.status === 'rejected';

  const selectNode = (stageId: string, subId: string) => {
    setLocalStageId(stageId);
    setLocalSubId(subId);
    setSelectedStageId(stageId);
    setSelectedSubStageId(subId);
    setUploadMode(false);
    setFileName('');
    setSimFail(false);
  };

  const handleUploadSubmit = () => {
    if (!fileName) return;
    setUploading(true);
    setTimeout(() => {
      uploadSubStageDocument(
        selectedModuleId, selectedStageId, selectedSubId,
        { fileName, fileSize: '1.2 MB', isAte: activeSubStage?.isAte ?? false, totalItems, approvedCount, rejectedCount, startTime, endTime, durationMinutes: duration },
        simFail
      );
      setUploading(false);
      setUploadMode(false);
      setFileName('');
    }, 1200);
  };

  // ── Stage status icon helper ────────────────────────────────────
  const stageStatusDot = (stage: Stage) => {
    const statuses = stage.subStages.map(s => s.status);
    if (statuses.every(s => s === 'completed'))     return <StatusDot status="completed" size={8} />;
    if (statuses.some(s => s === 'rejected'))       return <StatusDot status="rejected" size={8} />;
    if (statuses.some(s => s === 'pending_review')) return <StatusDot status="pending_review" size={8} />;
    if (statuses.some(s => s === 'running'))        return <StatusDot status="running" size={8} />;
    return <StatusDot status="inactive" size={8} />;
  };

  // ───────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <div style={{
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--color-outline-variant)',
        backgroundColor: 'var(--color-surface-container-lowest)',
        flexShrink: 0, gap: 16
      }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {activeProduct?.name} · Module Workspace
            </span>
            <span style={{ fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-display)', color: 'var(--color-surface-bright)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {activeModule?.name}
            </span>
          </div>
        </div>

        {/* Serial Number Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
            Serial Unit:
          </span>
          <button
            onClick={() => serialIndex > 0 && setSelectedSerial(activeSerials[serialIndex - 1])}
            disabled={serialIndex <= 0}
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)',
              background: 'transparent', cursor: serialIndex <= 0 ? 'not-allowed' : 'pointer',
              color: serialIndex <= 0 ? 'var(--color-outline-variant)' : 'var(--color-on-surface-variant)'
            }}
          >
            <ChevronLeft style={{ width: 14, height: 14 }} />
          </button>

          <select
            value={selectedSerial}
            onChange={(e) => setSelectedSerial(e.target.value)}
            className="select-field"
            style={{
              height: 28,
              minWidth: 112,
              padding: '0 28px 0 10px',
              fontSize: 10,
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-primary)',
              backgroundColor: 'rgba(56,189,248,0.10)',
              borderColor: 'var(--color-primary)'
            }}
          >
            {activeSerials.map(sn => (
              <option key={sn} value={sn}>{sn}</option>
            ))}
          </select>

          <button
            onClick={() => serialIndex < activeSerials.length - 1 && setSelectedSerial(activeSerials[serialIndex + 1])}
            disabled={serialIndex >= activeSerials.length - 1}
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)',
              background: 'transparent', cursor: serialIndex >= activeSerials.length - 1 ? 'not-allowed' : 'pointer',
              color: serialIndex >= activeSerials.length - 1 ? 'var(--color-outline-variant)' : 'var(--color-on-surface-variant)'
            }}
          >
            <ChevronRight style={{ width: 14, height: 14 }} />
          </button>

          {/* Overall module progress */}
          <div style={{
            marginLeft: 8,
            padding: '4px 10px', height: 28,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface-container-low)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Progress</span>
            <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>
              {activeModule?.progress ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY: Left Tree + Right Detail ──────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT TREE PANEL ──────────────────────────────────── */}
        <div style={{
          width: 320,
          flexShrink: 0,
          borderRight: '1px solid var(--color-outline-variant)',
          backgroundColor: 'var(--color-surface-container-lowest)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid var(--color-outline-variant)',
            fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--color-on-surface-variant)'
          }}>
            Stage Hierarchy
          </div>

          {activeModule?.stages.map(stage => {
            const isExpanded = !!expandedStages[stage.id];
            return (
              <div key={stage.id}>
                {/* Stage header row */}
                <div
                  onClick={() => setExpandedStages(prev => ({ ...prev, [stage.id]: !prev[stage.id] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 14px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? 'var(--color-surface-container)' : 'transparent',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    transition: 'background 0.15s'
                  }}
                >
                  {isExpanded
                    ? <ChevronDown style={{ width: 15, height: 15, color: 'var(--color-on-surface-variant)', flexShrink: 0 }} />
                    : <ChevronRight style={{ width: 15, height: 15, color: 'var(--color-on-surface-variant)', flexShrink: 0 }} />
                  }
                  {stageStatusDot(stage)}
                  <span style={{
                    fontSize: 13, fontWeight: 900, fontFamily: 'var(--font-display)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    color: 'var(--color-surface-bright)', flex: 1
                  }}>
                    {stage.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                    {stage.subStages.filter(s => s.status === 'completed').length}/{stage.subStages.length}
                  </span>
                </div>

                {/* Sub-stage rows */}
                {isExpanded && stage.subStages.map(sub => {
                  const isActive = sub.id === selectedSubId && stage.id === selectedStageId;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => selectNode(stage.id, sub.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 14px 10px 32px',
                        cursor: 'pointer',
                        backgroundColor: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                        borderBottom: '1px solid var(--color-outline-variant)',
                        transition: 'all 0.12s'
                      }}
                    >
                      <StatusDot status={sub.status} size={7} />
                      <span style={{
                        fontSize: 13, fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--color-surface-bright)' : 'var(--color-on-surface-variant)',
                        lineHeight: 1.3, flex: 1
                      }}>
                        {sub.name}
                      </span>
                      {sub.isAte && (
                        <span style={{
                          fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)',
                          backgroundColor: 'rgba(56,189,248,0.12)', color: 'var(--color-primary)',
                          padding: '2px 5px', borderRadius: 2
                        }}>
                          ATE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT DETAIL PANEL ───────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18, background: 'linear-gradient(180deg, var(--color-surface), var(--color-surface-container-low))' }}>

          {!activeSubStage ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
              Select a sub-stage from the tree on the left.
            </div>
          ) : (
            <>
              {/* ── SECTION 1: Sub-stage header card ───────────── */}
              <div style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-sm)',
                padding: '18px 22px',
                display: 'flex', flexDirection: 'column', gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'var(--color-on-surface-variant)',
                        backgroundColor: 'var(--color-surface-container)',
                        padding: '2px 6px', borderRadius: 2
                      }}>
                        {activeStage?.name} Stage
                      </span>
                      {activeSubStage.isAte && (
                        <span style={{
                          fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                          backgroundColor: 'rgba(56,189,248,0.12)', color: 'var(--color-primary)',
                          padding: '2px 6px', borderRadius: 2, border: '1px solid rgba(56,189,248,0.2)'
                        }}>
                          ATE Mode
                        </span>
                      )}
                    </div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-surface-bright)', letterSpacing: '0.04em' }}>
                      {activeSubStage.name}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={activeSubStage.status} />
                    {canUpload && !uploadMode && (
                      <button
                        onClick={() => setUploadMode(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '0 16px', height: 34,
                          backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)',
                          border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                          letterSpacing: '0.06em'
                        }}
                      >
                        <Upload style={{ width: 12, height: 12 }} />
                        Upload Report
                      </button>
                    )}
                    {uploadMode && (
                      <button
                        onClick={() => { setUploadMode(false); setFileName(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '0 14px', height: 34,
                          background: 'transparent', color: 'var(--color-on-surface-variant)',
                          border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                          fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase'
                        }}
                      >
                        <X style={{ width: 12, height: 12 }} /> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-stage details metadata panel */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '16px 24px',
                  borderTop: '1px dashed var(--color-outline-variant)',
                  paddingTop: '12px',
                  marginTop: '4px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>SOP Reference</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)' }}>SOP-{activeStage?.id.toUpperCase()}-0942-REV3</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Design Standard</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)' }}>BEL-STD-MIL-810G</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Station Assignment</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)' }}>STATION-{activeSubStage.isAte ? 'ATE-04' : 'QA-01'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Env. Ambient Logger</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)' }}>23.4 °C / 46.2% RH / ESD OK</span>
                  </div>
                  {activeSubStage.isAte && hasDocs && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>OCR Engine Integrity</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-tertiary)', fontFamily: 'var(--font-mono)' }}>99.2% CONFIDENCE</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── SECTION 2: Upload form ─────────────────────── */}
              {uploadMode && (
                <div style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-primary)',
                  borderLeft: '3px solid var(--color-primary)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px 20px',
                  display: 'flex', flexDirection: 'column', gap: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Upload style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.07em' }}>
                      Upload Work Report
                    </span>
                  </div>

                  {/* File picker */}
                  {!fileName ? (
                    <div
                      onClick={() => setFileName(activeSubStage.isAte ? `ATE_Report_${selectedSerial}.pdf` : `Quality_Sheet_${selectedSerial}.pdf`)}
                      style={{
                        border: '1px dashed var(--color-outline-variant)', borderRadius: 'var(--radius-sm)',
                        padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        cursor: 'pointer', backgroundColor: 'var(--color-surface-container)'
                      }}
                    >
                      <Upload style={{ width: 22, height: 22, color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)' }}>Click to attach document</span>
                      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>PDF, DOCX, Excel up to 10MB</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
                      <FileText style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{fileName}</span>
                      <button onClick={() => setFileName('')} style={{ background: 'transparent', border: 'none', color: 'var(--color-status-critical-txt)', cursor: 'pointer', fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)' }}>Remove</button>
                    </div>
                  )}

                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Received Qty</label>
                      <input type="number" value={totalItems} onChange={e => setTotalItems(Number(e.target.value))} className="input-field font-mono" style={{ height: 32, fontSize: 12 }} min={1} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Accepted Qty</label>
                      <input type="number" value={approvedCount} onChange={e => setApprovedCount(Number(e.target.value))} className="input-field font-mono" style={{ height: 32, fontSize: 12 }} min={0} max={totalItems} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Rejected Qty</label>
                      <input type="number" value={rejectedCount} disabled className="input-field font-mono" style={{ height: 32, fontSize: 12, opacity: 0.6 }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Start Time</label>
                      <input type="text" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field font-mono" style={{ height: 32, fontSize: 12 }} placeholder="HH:MM" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>End Time</label>
                      <input type="text" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field font-mono" style={{ height: 32, fontSize: 12 }} placeholder="HH:MM" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <label style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Duration</label>
                      <div className="input-field font-mono" style={{ height: 32, fontSize: 12, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                        {duration} min
                      </div>
                    </div>
                  </div>

                  {/* ATE simulate failure */}
                  {activeSubStage.isAte && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={simFail} onChange={e => setSimFail(e.target.checked)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-status-critical-txt)' }}>⚠ Simulate OCR Measurement Failure</span>
                    </label>
                  )}

                  <button
                    onClick={handleUploadSubmit}
                    disabled={!fileName || uploading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', height: 38,
                      backgroundColor: (!fileName || uploading) ? 'var(--color-surface-container)' : 'var(--color-primary)',
                      color: (!fileName || uploading) ? 'var(--color-on-surface-variant)' : 'var(--color-on-primary)',
                      border: 'none', borderRadius: 'var(--radius-sm)', cursor: !fileName ? 'not-allowed' : 'pointer',
                      fontSize: 11, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Send style={{ width: 13, height: 13 }} />
                    {uploading ? 'Processing & Submitting...' : 'Submit for QA Review'}
                  </button>
                </div>
              )}

              {/* ── SECTION 3: Metrics Row ────────────────────── */}
              <div style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}>
                {/* Section label */}
                <div style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container)',
                  fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: 'var(--color-on-surface-variant)'
                }}>
                  Quality Gate Overview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, padding: '14px 16px' }}>
                  {/* Doc No */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 14px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <FileText style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
                      <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Doc No.</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', lineHeight: 1 }}>
                      {lastDoc ? lastDoc.id.replace('DOC-', '') : '—'}
                    </span>
                  </div>
                  {/* Received */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 14px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Inbox style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
                      <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Received Qty</span>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', lineHeight: 1 }}>
                      {hasDocs ? receivedQty : '—'}
                    </span>
                  </div>
                  {/* Accepted */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 14px', border: '1px solid rgba(16,185,129,0.22)', backgroundColor: 'rgba(16,185,129,0.07)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ThumbsUp style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
                      <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Accepted Qty</span>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: hasDocs ? 'var(--color-tertiary)' : 'var(--color-surface-bright)', lineHeight: 1 }}>
                      {hasDocs ? acceptedQty : '—'}
                    </span>
                  </div>
                  {/* Rejected */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 14px', border: rejectedQty > 0 ? '1px solid rgba(239,68,68,0.28)' : '1px solid var(--color-outline-variant)', backgroundColor: rejectedQty > 0 ? 'rgba(239,68,68,0.07)' : 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ThumbsDown style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
                      <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Rejected Qty</span>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: hasDocs && rejectedQty > 0 ? 'var(--color-status-critical-txt)' : 'var(--color-surface-bright)', lineHeight: 1 }}>
                      {hasDocs ? rejectedQty : '—'}
                    </span>
                  </div>
                  {/* Pass % with visual circular ring */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '12px 14px', border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Percent style={{ width: 10, height: 10, color: 'var(--color-on-surface-variant)' }} />
                      <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Yield Rate</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                      {hasDocs ? (
                        <>
                          <div style={{ position: 'relative', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="28" height="28" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                              <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-surface-container)" strokeWidth="3" />
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                fill="none"
                                stroke={passPercent === 100 ? 'var(--color-tertiary)' : passPercent >= 80 ? 'var(--color-status-pending-txt)' : 'var(--color-status-critical-txt)'}
                                strokeWidth="3.5"
                                strokeDasharray="94.2"
                                strokeDashoffset={94.2 - (94.2 * passPercent) / 100}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                              />
                            </svg>
                          </div>
                          <span style={{
                            fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', lineHeight: 1,
                            color: passPercent === 100 ? 'var(--color-tertiary)' : passPercent >= 80 ? 'var(--color-status-pending-txt)' : 'var(--color-status-critical-txt)'
                          }}>
                            {passPercent}%
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', lineHeight: 1 }}>
                          —
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 4: QA Reports + FQA Review (two-col card) ── */}
              <div style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                {/* Card header bar */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container)'
                }}>
                  <div style={{
                    flex: 1, padding: '8px 16px',
                    fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'var(--color-on-surface-variant)'
                  }}>
                    {activeSubStage.isAte ? 'ATE Evidence Package' : 'QA Evidence Package'}
                  </div>
                  <div style={{
                    width: 280, padding: '8px 16px',
                    borderLeft: '1px solid var(--color-outline-variant)',
                    fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'var(--color-on-surface-variant)'
                  }}>
                    Final QA Decision
                  </div>
                </div>

                {/* Card body: split left docs + right FQA */}
                <div style={{ display: 'flex' }}>
                  {/* Left: Documents */}
                  <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {!hasDocs ? (
                      <div style={{
                        padding: '28px 16px', borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-outline-variant)',
                        backgroundColor: 'var(--color-surface-container-low)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center'
                      }}>
                        <FileBarChart2 style={{ width: 24, height: 24, color: 'var(--color-on-surface-variant)' }} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-surface-bright)' }}>No report uploaded yet</span>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                          {canUpload ? 'Click Upload Report to attach a document.' : 'This stage is not yet active.'}
                        </span>
                      </div>
                    ) : (
                      activeSubStage.documentHistory.map(doc => (
                        <DocRow key={doc.id} doc={doc} onPreview={() => setPreviewDoc(doc)} />
                      ))
                    )}
                  </div>

                  {/* Right: FQA review */}
                  <div style={{ width: 320, borderLeft: '1px solid var(--color-outline-variant)', padding: '16px', flexShrink: 0, backgroundColor: 'var(--color-surface-container-low)' }}>
                    {lastDoc ? (
                      <FQAReviewCard doc={lastDoc} subStage={activeSubStage} />
                    ) : (
                      <div style={{
                        height: '100%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center',
                        padding: '16px'
                      }}>
                        <ClipboardCheck style={{ width: 22, height: 22, color: 'var(--color-on-surface-variant)' }} />
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                          Awaiting document upload
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 5: ATE OCR + Checklist card ───────── */}
              {activeSubStage.isAte && hasDocs && lastDoc?.ocrMeasurements && (
                <div style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}>
                  {/* Header bar */}
                  <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container)'
                  }}>
                    <div style={{ flex: 1, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>
                        OCR Extracted Measurements
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)',
                        padding: '2px 7px', borderRadius: 2,
                        color: lastDoc.ocrResult === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                        backgroundColor: lastDoc.ocrResult === 'PASS' ? 'rgba(16,185,129,0.10)' : 'rgba(248,113,113,0.10)'
                      }}>
                        {lastDoc.ocrResult}
                      </span>
                    </div>
                    {lastDoc.checklist && (
                      <div style={{ width: 300, padding: '8px 16px', borderLeft: '1px solid var(--color-outline-variant)', fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)' }}>
                        Validation Checklist
                      </div>
                    )}
                  </div>

                  {/* Body: OCR table left, checklist right */}
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-surface-container)' }}>
                            {['Parameter', 'Observed', 'Limits', 'Result'].map(h => (
                              <th key={h} style={{ padding: '7px 14px', textAlign: 'left', fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.06em', borderBottom: '1px solid var(--color-outline-variant)' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lastDoc.ocrMeasurements.map((m, i) => (
                            <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--color-outline-variant)' : 'none', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--color-surface-container-low)' }}>
                              <td style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{m.parameter}</td>
                              <td style={{ padding: '9px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)' }}>{m.observed} {m.unit}</td>
                              <td style={{ padding: '9px 14px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>{m.minLimit}–{m.maxLimit}</td>
                              <td style={{ padding: '9px 14px' }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)',
                                  padding: '2px 6px', borderRadius: 2,
                                  color: m.status === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                                  backgroundColor: m.status === 'PASS' ? 'rgba(16,185,129,0.10)' : 'rgba(248,113,113,0.10)'
                                }}>
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {lastDoc.checklist && (
                      <div style={{ width: 300, borderLeft: '1px solid var(--color-outline-variant)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {lastDoc.checklist.map(item => (
                          <CheckItem key={item.id} label={item.label} checked={item.checked} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SECTION 6: Cycle time footer card ───────── */}
              {hasDocs && lastDoc && (
                <div style={{
                  backgroundColor: 'var(--color-surface-container-lowest)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '8px 16px',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    backgroundColor: 'var(--color-surface-container)',
                    fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'var(--color-on-surface-variant)'
                  }}>
                    Cycle Time & Attribution
                  </div>
                  <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 20px', borderRight: '1px solid var(--color-outline-variant)', minWidth: '220px' }}>
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Start → End</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Clock style={{ width: 13, height: 13, color: 'var(--color-primary)' }} />
                        <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)' }}>
                          {lastDoc.startTime} → {lastDoc.endTime}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 800 }}>({lastDoc.durationMinutes} min)</span>
                      </div>
                    </div>
                    
                    {/* Visual Cycle Time Gauge Track */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, padding: '12px 20px', flex: 1, minWidth: '240px', borderRight: '1px solid var(--color-outline-variant)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Cycle efficiency vs Target</span>
                        <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: lastDoc.durationMinutes > 90 ? 'var(--color-status-pending-txt)' : 'var(--color-tertiary)', fontWeight: 800 }}>
                          {lastDoc.durationMinutes <= 90 ? 'EFFICIENT' : 'OVER TARGET'}
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--color-surface-container)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        {/* Target line at 75% */}
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: '2px', backgroundColor: 'var(--color-outline-variant)', zIndex: 2 }} title="Target threshold" />
                        {/* Current run duration fill */}
                        <div style={{
                          position: 'absolute', top: 0, bottom: 0, left: 0,
                          width: `${Math.min(100, (lastDoc.durationMinutes / 120) * 100)}%`,
                          backgroundColor: lastDoc.durationMinutes > 90 ? 'var(--color-status-pending-txt)' : 'var(--color-tertiary)',
                          transition: 'width 0.5s ease',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 20px', minWidth: '280px' }}>
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>Verified operator signature</span>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: 'var(--color-surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: 'var(--color-primary)' }}>
                          {lastDoc.uploadedBy.charAt(0)}
                        </div>
                        {lastDoc.uploadedBy}
                        <span style={{ fontWeight: 400, color: 'var(--color-on-surface-variant)', fontSize: 10 }}>({lastDoc.uploadedRole}) · {lastDoc.timestamp}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Document Preview Modal ────────────────────────────────── */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 560, maxHeight: '80vh', overflowY: 'auto',
              backgroundColor: 'var(--color-surface-container)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              padding: 24, display: 'flex', flexDirection: 'column', gap: 14
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 900, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-surface-bright)', letterSpacing: '0.05em' }}>
                Document Preview
              </span>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)' }}>
              <FileText style={{ width: 32, height: 32, color: 'var(--color-primary)' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{previewDoc.fileName}</div>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                  {previewDoc.fileSize} · {previewDoc.timestamp} · {previewDoc.uploadedBy}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
              <MetricCell label="Received" value={previewDoc.totalItems} />
              <MetricCell label="Accepted" value={previewDoc.approvedCount} color="var(--color-tertiary)" />
              <MetricCell label="Rejected" value={previewDoc.rejectedCount} color={previewDoc.rejectedCount > 0 ? 'var(--color-status-critical-txt)' : undefined} />
              <MetricCell
                label="Pass %"
                value={previewDoc.totalItems > 0 ? `${Math.round((previewDoc.approvedCount / previewDoc.totalItems) * 100)}%` : '—'}
                color={previewDoc.totalItems > 0 && previewDoc.approvedCount === previewDoc.totalItems ? 'var(--color-tertiary)' : 'var(--color-status-pending-txt)'}
              />
            </div>

            {previewDoc.ocrMeasurements && previewDoc.ocrMeasurements.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>OCR Measurements</div>
                <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--color-outline-variant)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-container-highest)' }}>
                        {['Parameter', 'Observed', 'Range', 'Result'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontSize: 8, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewDoc.ocrMeasurements.map((m, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--color-outline-variant)' }}>
                          <td style={{ padding: '7px 10px', fontSize: 11, color: 'var(--color-surface-bright)', fontWeight: 700 }}>{m.parameter}</td>
                          <td style={{ padding: '7px 10px', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{m.observed} {m.unit}</td>
                          <td style={{ padding: '7px 10px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>{m.minLimit}–{m.maxLimit}</td>
                          <td style={{ padding: '7px 10px' }}>
                            <span style={{ fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)', padding: '2px 5px', borderRadius: 2, color: m.status === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)', backgroundColor: m.status === 'PASS' ? 'rgba(16,185,129,0.10)' : 'rgba(248,113,113,0.10)' }}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {previewDoc.checklist && previewDoc.checklist.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>Validation Checklist</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {previewDoc.checklist.map(item => <CheckItem key={item.id} label={item.label} checked={item.checked} />)}
                </div>
              </>
            )}

            <button
              onClick={() => setPreviewDoc(null)}
              style={{ width: '100%', height: 36, border: '1px solid var(--color-outline-variant)', background: 'transparent', color: 'var(--color-on-surface-variant)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 10, fontWeight: 900, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
