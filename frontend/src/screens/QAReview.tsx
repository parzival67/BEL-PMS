import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DocumentRecord } from '../context/AppContext';
import { ClipboardCheck, FileText, Check, X, ShieldAlert, FileSearch, Eye } from 'lucide-react';

interface PendingReviewItem {
  productId: string;
  productName: string;
  serialNumber: string;
  moduleId: string;
  moduleName: string;
  stageId: string;
  subStageId: string;
  subStageName: string;
  document: DocumentRecord;
}

export const QAReview: React.FC = () => {
  const { products, reviewDocument, currentRole } = useApp();
  const [remarks, setRemarks] = useState('');
  const [selectedReviewKey, setSelectedReviewKey] = useState<string | null>(null);

  // Compile all pending review items across all products, serials, modules, and sub-stages
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

  // Select the first pending review by default if nothing selected yet
  const activeReviewIndex = pendingReviews.findIndex(
    r => `${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}` === selectedReviewKey
  );
  
  const activeReview = activeReviewIndex !== -1 ? pendingReviews[activeReviewIndex] : pendingReviews[0];
  const activeKey = activeReview 
    ? `${activeReview.serialNumber}-${activeReview.moduleId}-${activeReview.subStageId}-${activeReview.document.id}` 
    : null;

  const handleSelectReview = (r: PendingReviewItem) => {
    setSelectedReviewKey(`${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}`);
  };

  const handleReviewAction = (status: 'APPROVED' | 'REJECTED') => {
    if (!activeReview) return;
    
    reviewDocument(
      activeReview.moduleId,
      activeReview.stageId,
      activeReview.subStageId,
      activeReview.document.id,
      status,
      remarks || (status === 'APPROVED' ? 'Approved, specifications meet standard guidelines.' : 'Rejected, check OCR errors or values out of spec.')
    );
    
    // Reset remarks
    setRemarks('');
    setSelectedReviewKey(null);
  };

  const isFinalQARole = currentRole === 'Final QA' || currentRole === 'Admin';

  return (
    <div className="page-container" style={{ overflow: 'hidden' }}>
      
      {/* Header Info */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ClipboardCheck style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider">QA Review Desk</h2>
            <span className="text-xs">Incoming documents and calibration tests awaiting sign-off</span>
          </div>
        </div>
        
        {!isFinalQARole && (
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              backgroundColor: 'rgba(239,68,68,0.1)', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239,68,68,0.2)'
            }}
          >
            <ShieldAlert style={{ width: 16, height: 16, color: 'var(--color-status-critical-txt)' }} />
            <span className="text-xs font-bold text-bright" style={{ color: 'var(--color-status-critical-txt)' }}>
              VIEW ONLY (Switch role to [Final QA] or [Admin] to Approve/Reject)
            </span>
          </div>
        )}
      </div>

      {pendingReviews.length === 0 ? (
        <div 
          className="pms-card" 
          style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            textAlign: 'center',
            borderStyle: 'dashed',
            padding: '80px 0'
          }}
        >
          <FileSearch style={{ width: 56, height: 56, color: 'var(--color-outline-variant)' }} />
          <h3 className="text-base font-bold text-bright" style={{ marginTop: '16px' }}>
            Zero Pending Reviews
          </h3>
          <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
            All incoming documents have been audited. Workflows are operating normally.
          </span>
        </div>
      ) : (
        <div className="grid-1-2" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          
          {/* Left panel: List Table */}
          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span className="text-xs font-black uppercase tracking-wider text-bright">
              Pending Queue ({pendingReviews.length} records)
            </span>

            <div className="table-container" style={{ borderBottom: 'none' }}>
              <table className="custom-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Module / Serial</th>
                    <th>Sub-Stage</th>
                    <th style={{ textAlign: 'center' }}>PDF</th>
                    <th style={{ textAlign: 'center' }}>Inspect</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((r) => {
                    const rowKey = `${r.serialNumber}-${r.moduleId}-${r.subStageId}-${r.document.id}`;
                    const isRowActive = activeKey === rowKey;

                    return (
                      <tr 
                        key={rowKey}
                        onClick={() => handleSelectReview(r)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: isRowActive ? 'var(--color-surface-container)' : 'transparent'
                        }}
                      >
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="font-bold text-bright">{r.moduleName}</span>
                            <span className="text-nano font-mono" style={{ color: 'var(--color-primary)' }}>
                              {r.productName.split(' ')[0]} · {r.serialNumber}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span>{r.subStageName}</span>
                            <span className="text-nano font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>
                              BY: {r.document.uploadedRole.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <FileText style={{ width: 16, height: 16, color: 'var(--color-on-surface-variant)' }} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '6px', minHeight: 'auto', border: 'none', background: 'transparent' }}
                          >
                            <Eye style={{ width: 14, height: 14, color: isRowActive ? 'var(--color-primary)' : 'inherit' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel: High-Fidelity PDF Viewer Mock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <span className="text-xs font-black uppercase tracking-wider text-bright">
              Document Preview (Extracted Data Audit)
            </span>

            {/* Document sheet container */}
            {activeReview && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                
                {/* Visual PDF page */}
                <div
                  style={{
                    backgroundColor: '#ffffff', // Render white paper document
                    color: '#000000',
                    padding: '24px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-surface-container-highest)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    minHeight: '440px',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  {/* Document Header */}
                  <div className="flex-between" style={{ borderBottom: '2px solid #000000', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ border: '2px solid #000000', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        <span className="text-xs font-black" style={{ letterSpacing: '1px' }}>BEL</span>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <div className="text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Bharat Electronics Limited
                        </div>
                        <div className="text-nano font-mono" style={{ fontSize: '8px', color: '#6b7280' }}>
                          Chennai Quality Assurance Lab
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-nano font-mono" style={{ fontSize: '9px', fontWeight: 700 }}>
                        REPORT REF: {activeReview.document.id}
                      </div>
                      <div className="text-nano font-mono" style={{ fontSize: '8px', color: '#6b7280' }}>
                        DATE: {activeReview.document.timestamp}
                      </div>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center">
                    <h3 className="text-base font-bold uppercase" style={{ margin: 0, textDecoration: 'underline' }}>
                      {activeReview.subStageName} Report
                    </h3>
                  </div>

                  {/* Metadatas */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '8px', 
                      fontSize: '11px',
                      backgroundColor: '#f3f4f6',
                      padding: '10px 12px',
                      borderRadius: '2px'
                    }}
                  >
                    <div>
                      <strong>PRODUCT NAME:</strong> {activeReview.productName}
                    </div>
                    <div>
                      <strong>MODULE NAME:</strong> {activeReview.moduleName}
                    </div>
                    <div>
                      <strong>SERIAL NUMBER:</strong> {activeReview.serialNumber}
                    </div>
                    <div>
                      <strong>OPERATOR SIGN:</strong> {activeReview.document.uploadedBy}
                    </div>
                  </div>

                  {/* Production Stats */}
                  <div style={{ fontSize: '11px' }}>
                    <strong>Production Run Audit:</strong>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '4px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                      <span><strong>Total Inspected:</strong> {activeReview.document.totalItems} qty</span>
                      <span><strong>Approved:</strong> {activeReview.document.approvedCount} qty</span>
                      <span><strong>Rejected:</strong> {activeReview.document.rejectedCount} qty</span>
                      <span><strong>Cycle Time:</strong> {activeReview.document.durationMinutes} min</span>
                    </div>
                  </div>

                  {/* OCR extracted specs */}
                  {activeReview.document.isAte && activeReview.document.ocrMeasurements && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Extracted Calibration Results:</span>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '2px' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid #000000', backgroundColor: '#e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '4px 6px' }}>Parameter Name</th>
                            <th style={{ padding: '4px 6px' }}>Observed</th>
                            <th style={{ padding: '4px 6px' }}>Limit Bounds</th>
                            <th style={{ padding: '4px 6px', textAlign: 'center' }}>Verdict</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeReview.document.ocrMeasurements.map((m, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                              <td style={{ padding: '4px 6px', fontWeight: 'bold' }}>{m.parameter}</td>
                              <td style={{ padding: '4px 6px', fontFamily: 'monospace' }}>{m.observed} {m.unit}</td>
                              <td style={{ padding: '4px 6px', fontFamily: 'monospace', color: '#6b7280' }}>
                                {m.minLimit}-{m.maxLimit} {m.unit}
                              </td>
                              <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: 'bold', color: m.status === 'PASS' ? '#059669' : '#dc2626' }}>
                                {m.status}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ATE Checklist verification */}
                  {activeReview.document.isAte && activeReview.document.checklist && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '10px' }}>
                      <span style={{ fontWeight: 'bold' }}>Safety/Integrity Auto Checksums:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {activeReview.document.checklist.map((item) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: item.checked ? '#059669' : '#dc2626', display: 'inline-flex', alignItems: 'center' }}>
                              {item.checked ? (
                                <Check style={{ width: 12, height: 12, strokeWidth: 3 }} />
                              ) : (
                                <X style={{ width: 12, height: 12, strokeWidth: 3 }} />
                              )}
                            </span>
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Footer seal */}
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '8px', color: '#9ca3af', fontFamily: 'monospace' }}>
                      DIGITAL WATERMARK · CLASSIFIED INTERNAL USE
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '9px' }}>
                      <div style={{ borderBottom: '1px solid #000000', width: '100px', height: '20px' }} />
                      <span style={{ marginTop: '4px', color: '#6b7280' }}>Quality Inspector Stamp</span>
                    </div>
                  </div>
                </div>

                {/* Approvals Control Dock */}
                <div className="pms-card" style={{ gap: '12px' }}>
                  <span className="text-xs font-black uppercase tracking-wider text-bright">
                    QA Decision Console
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="text-nano uppercase font-black">Audit Remarks</label>
                    <textarea
                      placeholder="Specify findings, compliance checks, or reasons for rejection..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      disabled={!isFinalQARole}
                      className="input-field text-xs"
                      style={{ height: '70px', padding: '10px', resize: 'none', fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleReviewAction('REJECTED')}
                      disabled={!isFinalQARole}
                      className="btn btn-danger"
                      style={{ flex: 1, height: '38px', gap: '6px' }}
                    >
                      <X style={{ width: 14, height: 14 }} />
                      REJECT REPORT
                    </button>
                    <button
                      onClick={() => handleReviewAction('APPROVED')}
                      disabled={!isFinalQARole}
                      className="btn btn-primary"
                      style={{ flex: 1, height: '38px', gap: '6px', backgroundColor: 'var(--color-tertiary)', color: '#000000' }}
                    >
                      <Check style={{ width: 14, height: 14 }} />
                      APPROVE & SIGN
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
