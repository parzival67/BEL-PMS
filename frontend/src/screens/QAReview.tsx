import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DocumentRecord } from '../context/AppContext';
import {
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Percent,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  User,
  CalendarClock,
  Activity,
  Hash
} from 'lucide-react';

interface PendingReviewItem {
  productId: string;
  productName: string;
  serialNumber: string;
  moduleId: string;
  moduleName: string;
  stageId: string;
  stageName: string;
  subStageId: string;
  subStageName: string;
  document: DocumentRecord;
}

// ── Helper: yield color ───────────────────────────────────────────
const yieldColor = (pct: number) =>
  pct === 100 ? 'var(--color-tertiary)' : pct >= 80 ? 'var(--color-status-pending-txt)' : 'var(--color-status-critical-txt)';

// ── Small stat chip ───────────────────────────────────────────────
const StatChip: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: 3,
    padding: '10px 14px',
    backgroundColor: 'var(--color-surface-container)',
    border: '1px solid var(--color-outline-variant)',
    borderRadius: 'var(--radius-sm)',
    flex: 1, minWidth: 70
  }}>
    <span style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>
      {label}
    </span>
    <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1.1, color: color ?? 'var(--color-surface-bright)' }}>
      {value}
    </span>
  </div>
);

// ── Queue row item ────────────────────────────────────────────────
const QueueRow: React.FC<{ item: PendingReviewItem; isActive: boolean; onClick: () => void }> = ({ item, isActive, onClick }) => {
  const doc = item.document;
  const yieldPct = doc.totalItems > 0 ? Math.round((doc.approvedCount / doc.totalItems) * 100) : 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'stretch',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
        backgroundColor: isActive ? 'rgba(56,189,248,0.04)' : 'var(--color-surface-container-lowest)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        overflow: 'hidden'
      }}
    >
      {/* Active accent bar */}
      <div style={{ width: 3, flexShrink: 0, backgroundColor: isActive ? 'var(--color-primary)' : 'transparent', transition: 'background 0.15s ease' }} />

      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{item.moduleName}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 700 }}>
                {item.serialNumber}
              </span>
              <ChevronRight style={{ width: 9, height: 9, color: 'var(--color-on-surface-variant)' }} />
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                {item.stageName}
              </span>
              <ChevronRight style={{ width: 9, height: 9, color: 'var(--color-on-surface-variant)' }} />
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>
                {item.subStageName}
              </span>
            </div>
          </div>
          {doc.isAte && (
            <span style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '2px 6px', borderRadius: 2, backgroundColor: 'rgba(56,189,248,0.1)', color: 'var(--color-primary)', border: '1px solid rgba(56,189,248,0.2)', flexShrink: 0 }}>
              ATE
            </span>
          )}
        </div>

        {/* Bottom row: meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)' }}>
              {doc.uploadedBy} · {doc.durationMinutes} min
            </span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: yieldColor(yieldPct) }}>
            {yieldPct}% yield
          </span>
        </div>

        {/* OCR system status if ATE */}
        {doc.isAte && doc.ocrResult && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity style={{ width: 10, height: 10, color: doc.ocrResult === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)' }} />
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, color: doc.ocrResult === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)' }}>
              OCR System: {doc.ocrResult}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
export const QAReview: React.FC = () => {
  const { products, reviewDocument, currentRole } = useApp();
  const [remarks, setRemarks] = useState('');
  const [selectedReviewKey, setSelectedReviewKey] = useState<string | null>(null);

  // Compile all pending review items
  const pendingReviews: PendingReviewItem[] = [];
  products.forEach(p => {
    p.services.forEach(s => {
      s.modules.forEach(m => {
        m.stages.forEach(st => {
          st.subStages.forEach(sst => {
            if (sst.status === 'pending_review') {
              sst.documentHistory.forEach(doc => {
                if (doc.status === 'PENDING') {
                  pendingReviews.push({
                    productId: p.id,
                    productName: p.name,
                    serialNumber: s.serialNumber,
                    moduleId: m.id,
                    moduleName: m.name,
                    stageId: st.id,
                    stageName: st.name,
                    subStageId: sst.id,
                    subStageName: sst.name,
                    document: doc
                  });
                }
              });
            }
          });
        });
      });
    });
  });

  const activeReviewIndex = pendingReviews.findIndex(
    r => `${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}` === selectedReviewKey
  );
  const activeReview = activeReviewIndex !== -1 ? pendingReviews[activeReviewIndex] : pendingReviews[0];
  const activeKey = activeReview
    ? `${activeReview.serialNumber}-${activeReview.moduleId}-${activeReview.subStageId}-${activeReview.document.id}`
    : null;

  const handleSelectReview = (r: PendingReviewItem) => {
    setSelectedReviewKey(`${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}`);
    setRemarks('');
  };

  const handleReviewAction = (status: 'APPROVED' | 'REJECTED') => {
    if (!activeReview) return;
    reviewDocument(
      activeReview.moduleId,
      activeReview.stageId,
      activeReview.subStageId,
      activeReview.document.id,
      status,
      remarks || (status === 'APPROVED' ? 'Approved — specifications meet standard guidelines.' : 'Rejected — check OCR errors or values out of spec.')
    );
    setRemarks('');
    setSelectedReviewKey(null);
  };

  const isFinalQARole = currentRole === 'Final QA' || currentRole === 'Admin';
  const doc = activeReview?.document;
  const yieldPct = doc && doc.totalItems > 0 ? Math.round((doc.approvedCount / doc.totalItems) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: 0 }}>

      {/* ── TOP HEADER STRIP ──────────────────────────────── */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-outline-variant)',
        backgroundColor: 'var(--color-surface-container-lowest)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardCheck style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-surface-bright)', letterSpacing: '0.04em' }}>
              QA Approvals Desk
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
              Incoming documents and calibration tests awaiting sign-off
            </p>
          </div>
        </div>

        {/* Header stats row */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 'var(--radius-sm)' }}>
            <AlertTriangle style={{ width: 12, height: 12, color: 'var(--color-status-pending-txt)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-pending-txt)' }}>
              {pendingReviews.length} PENDING
            </span>
          </div>

          {!isFinalQARole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 'var(--radius-sm)' }}>
              <ShieldAlert style={{ width: 12, height: 12, color: 'var(--color-status-critical-txt)' }} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)' }}>
                VIEW ONLY · Requires Final QA / Admin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────────────────── */}
      {pendingReviews.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' }}>
          <CheckCircle2 style={{ width: 52, height: 52, color: 'var(--color-tertiary)', opacity: 0.5 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-surface-bright)' }}>All Clear — Zero Pending Reviews</div>
            <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>All incoming documents have been audited. Workflows operating normally.</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── LEFT: Queue Panel ─────────────────────── */}
          <div style={{ width: 320, flexShrink: 0, borderRight: '1px solid var(--color-outline-variant)', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface-container-lowest)' }}>

            {/* Queue header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.08em' }}>
                Pending Queue
              </span>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(251,191,36,0.08)', color: 'var(--color-status-pending-txt)', border: '1px solid rgba(251,191,36,0.15)' }}>
                {pendingReviews.length} Record{pendingReviews.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Queue items */}
            <div style={{ padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingReviews.map((r) => {
                const rowKey = `${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}`;
                return (
                  <QueueRow key={rowKey} item={r} isActive={activeKey === rowKey} onClick={() => handleSelectReview(r)} />
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Detail Panel ───────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)' }}>
            {activeReview && doc ? (
              <>
                {/* Sub-header: document title bar */}
                <div style={{
                  padding: '12px 24px',
                  borderBottom: '1px solid var(--color-outline-variant)',
                  backgroundColor: 'var(--color-surface-container-low)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText style={{ width: 16, height: 16, color: 'var(--color-primary)' }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{doc.fileName}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', marginTop: 1 }}>
                        {doc.fileSize} · Submitted {doc.timestamp}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {doc.isAte && doc.ocrResult && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                        color: doc.ocrResult === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                        backgroundColor: doc.ocrResult === 'PASS' ? 'rgba(16,185,129,0.08)' : 'rgba(248,113,113,0.08)',
                        border: `1px solid ${doc.ocrResult === 'PASS' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)'}`
                      }}>
                        OCR: {doc.ocrResult}
                      </span>
                    )}
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--color-status-pending-txt)', backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      PENDING
                    </span>
                  </div>
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── ROW 1: Module / Stage / Operator Info Card ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {/* Identity card */}
                    <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 8 }}>
                        Unit Identity
                      </div>
                      {[
                        { icon: <Layers style={{ width: 11, height: 11 }} />, label: 'Product', val: activeReview.productName },
                        { icon: <Hash style={{ width: 11, height: 11 }} />, label: 'Serial', val: activeReview.serialNumber },
                        { icon: <Layers style={{ width: 11, height: 11 }} />, label: 'Module', val: activeReview.moduleName },
                        { icon: <ChevronRight style={{ width: 11, height: 11 }} />, label: 'Stage', val: `${activeReview.stageName} › ${activeReview.subStageName}` },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--color-on-surface-variant)', marginTop: 1 }}>{row.icon}</span>
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{row.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)', textAlign: 'right' }}>{row.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Operator card */}
                    <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 8 }}>
                        Operator & Timing
                      </div>
                      {[
                        { icon: <User style={{ width: 11, height: 11 }} />, label: 'Submitted By', val: doc.uploadedBy },
                        { icon: <User style={{ width: 11, height: 11 }} />, label: 'Role', val: doc.uploadedRole },
                        { icon: <CalendarClock style={{ width: 11, height: 11 }} />, label: 'Timestamp', val: doc.timestamp },
                        { icon: <Clock style={{ width: 11, height: 11 }} />, label: 'Cycle', val: `${doc.startTime} → ${doc.endTime} (${doc.durationMinutes} min)` },
                      ].map(row => (
                        <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--color-on-surface-variant)', marginTop: 1 }}>{row.icon}</span>
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{row.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{row.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── ROW 2: Production Run Stats ── */}
                  <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
                      Production Run Audit
                    </div>
                    <div style={{ display: 'flex', gap: 10, padding: '14px 16px', flexWrap: 'wrap' }}>
                      <StatChip label="Total Inspected" value={doc.totalItems} />
                      <StatChip label="Accepted Qty" value={doc.approvedCount} color="var(--color-tertiary)" />
                      <StatChip label="Rejected Qty" value={doc.rejectedCount} color={doc.rejectedCount > 0 ? 'var(--color-status-critical-txt)' : 'var(--color-surface-bright)'} />
                      <StatChip label="Cycle Time" value={`${doc.durationMinutes}m`} color="var(--color-primary)" />

                      {/* Yield cell with mini ring */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 14px', backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-sm)', flex: 1, minWidth: 100 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>
                          <Percent style={{ width: 9, height: 9, display: 'inline', marginRight: 3 }} />Yield Rate
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <svg width="28" height="28" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-surface-container-lowest)" strokeWidth="3.5" />
                            <circle cx="18" cy="18" r="15" fill="none"
                              stroke={yieldColor(yieldPct)}
                              strokeWidth="3.5"
                              strokeDasharray="94.2"
                              strokeDashoffset={94.2 - (94.2 * yieldPct) / 100}
                              strokeLinecap="round" />
                          </svg>
                          <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1.1, color: yieldColor(yieldPct) }}>
                            {yieldPct}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Efficiency bar */}
                    <div style={{ padding: '0 16px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>Cycle Efficiency vs Target (90 min)</span>
                        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', color: doc.durationMinutes <= 90 ? 'var(--color-tertiary)' : 'var(--color-status-pending-txt)' }}>
                          {doc.durationMinutes <= 90 ? 'WITHIN LIMIT' : 'OVER TARGET'}
                        </span>
                      </div>
                      <div style={{ height: 6, backgroundColor: 'var(--color-surface-container)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '75%', width: 2, backgroundColor: 'var(--color-on-surface-variant)', opacity: 0.3 }} />
                        <div style={{
                          position: 'absolute', top: 0, bottom: 0, left: 0,
                          width: `${Math.min(100, (doc.durationMinutes / 120) * 100)}%`,
                          backgroundColor: doc.durationMinutes <= 90 ? 'var(--color-tertiary)' : 'var(--color-status-pending-txt)',
                          borderRadius: 3, transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* ── ROW 3: ATE OCR Measurements ── */}
                  {doc.isAte && doc.ocrMeasurements && doc.ocrMeasurements.length > 0 && (
                    <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
                          OCR Telemetry Measurements
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                          color: doc.ocrResult === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                          backgroundColor: doc.ocrResult === 'PASS' ? 'rgba(16,185,129,0.08)' : 'rgba(248,113,113,0.08)',
                          border: `1px solid ${doc.ocrResult === 'PASS' ? 'rgba(16,185,129,0.2)' : 'rgba(248,113,113,0.2)'}`
                        }}>
                          SYSTEM VERDICT: {doc.ocrResult}
                        </span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                            {['Parameter', 'Observed', 'Spec Limits', 'Unit', 'Result'].map(h => (
                              <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.07em', borderBottom: '1px solid var(--color-outline-variant)' }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {doc.ocrMeasurements.map((m, i) => (
                            <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--color-outline-variant)' : 'none', backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              <td style={{ padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--color-surface-bright)' }}>{m.parameter}</td>
                              <td style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: m.status === 'FAIL' ? 'var(--color-status-critical-txt)' : 'var(--color-surface-bright)', fontWeight: m.status === 'FAIL' ? 700 : 500 }}>{m.observed}</td>
                              <td style={{ padding: '10px 14px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>{m.minLimit} – {m.maxLimit}</td>
                              <td style={{ padding: '10px 14px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)' }}>{m.unit}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 'var(--radius-sm)',
                                  color: m.status === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                                  backgroundColor: m.status === 'PASS' ? 'rgba(16,185,129,0.08)' : 'rgba(248,113,113,0.08)',
                                  border: `1px solid ${m.status === 'PASS' ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)'}`
                                }}>{m.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── ROW 4: Checklist ── */}
                  {doc.isAte && doc.checklist && doc.checklist.length > 0 && (
                    <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
                        Safety / Integrity Validation Checklist
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '14px 16px' }}>
                        {doc.checklist.map(item => (
                          <div key={item.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-outline-variant)',
                            borderLeft: `3px solid ${item.checked ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)'}`,
                            backgroundColor: 'var(--color-surface-container-low)'
                          }}>
                            {item.checked
                              ? <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--color-tertiary)', flexShrink: 0 }} />
                              : <XCircle style={{ width: 14, height: 14, color: 'var(--color-status-critical-txt)', flexShrink: 0 }} />
                            }
                            <span style={{ fontSize: 11, color: 'var(--color-surface-bright)', fontWeight: item.checked ? 500 : 600 }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── QA DECISION CONSOLE ── */}
                  <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>
                      QA Decision Console
                    </div>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Remarks box */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', letterSpacing: '0.07em' }}>
                          Audit Remarks
                        </label>
                        <textarea
                          placeholder="Specify findings, compliance checks, or reasons for rejection..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          disabled={!isFinalQARole}
                          className="input-field"
                          style={{ height: 72, padding: '10px 12px', resize: 'none', fontFamily: 'var(--font-body)', fontSize: 12, lineHeight: 1.5 }}
                        />
                      </div>

                      {!isFinalQARole && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 'var(--radius-sm)' }}>
                          <ShieldAlert style={{ width: 13, height: 13, color: 'var(--color-status-critical-txt)' }} />
                          <span style={{ fontSize: 10, color: 'var(--color-status-critical-txt)', fontFamily: 'var(--font-mono)' }}>
                            Access restricted. Switch role to <strong>Final QA</strong> or <strong>Admin</strong> to sign off.
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          onClick={() => handleReviewAction('REJECTED')}
                          disabled={!isFinalQARole}
                          style={{
                            flex: 1, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            backgroundColor: isFinalQARole ? 'rgba(248,113,113,0.08)' : 'var(--color-surface-container)',
                            color: isFinalQARole ? 'var(--color-status-critical-txt)' : 'var(--color-on-surface-variant)',
                            border: `1px solid ${isFinalQARole ? 'rgba(248,113,113,0.3)' : 'var(--color-outline-variant)'}`,
                            borderRadius: 'var(--radius-sm)', cursor: isFinalQARole ? 'pointer' : 'not-allowed',
                            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ThumbsDown style={{ width: 13, height: 13 }} />
                          REJECT REPORT
                        </button>
                        <button
                          onClick={() => handleReviewAction('APPROVED')}
                          disabled={!isFinalQARole}
                          style={{
                            flex: 1, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            backgroundColor: isFinalQARole ? 'var(--color-tertiary)' : 'var(--color-surface-container)',
                            color: isFinalQARole ? '#000' : 'var(--color-on-surface-variant)',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)', cursor: isFinalQARole ? 'pointer' : 'not-allowed',
                            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ThumbsUp style={{ width: 13, height: 13 }} />
                          APPROVE & SIGN
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                Select a pending review from the queue on the left.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
