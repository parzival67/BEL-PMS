import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Upload, FileText, CheckCircle2, AlertOctagon, HelpCircle, FileCheck } from 'lucide-react';

export const StageDetail: React.FC = () => {
  const {
    products,
    selectedProductId,
    selectedSerial,
    selectedModuleId,
    selectedStageId,
    selectedSubStageId,
    uploadSubStageDocument,
    setCurrentScreen
  } = useApp();

  // Active contexts
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeService = activeProduct?.services.find(s => s.serialNumber === selectedSerial);
  const activeModule = activeService?.modules.find(m => m.id === selectedModuleId);
  const activeStage = activeModule?.stages.find(s => s.id === selectedStageId);
  const activeSubStage = activeStage?.subStages.find(ss => ss.id === selectedSubStageId);

  // Read-only check
  const isReadOnly = activeSubStage?.status === 'completed' || activeSubStage?.status === 'pending_review';
  const lastRecord = activeSubStage?.documentHistory[0];

  // Form states
  const [fileName, setFileName] = useState('');
  const [totalItems, setTotalItems] = useState<number>(50);
  const [approvedCount, setApprovedCount] = useState<number>(48);
  const [rejectedCount, setRejectedCount] = useState<number>(2);
  const [startTime, setStartTime] = useState('09:15');
  const [endTime, setEndTime] = useState('09:37');
  const [duration, setDuration] = useState<number>(22);
  
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  // Sync approved + rejected automatically
  useEffect(() => {
    setRejectedCount(Math.max(0, totalItems - approvedCount));
  }, [totalItems, approvedCount]);

  // Calculate duration automatically
  useEffect(() => {
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      let diff = (endH * 60 + endM) - (startH * 60 + startM);
      if (diff < 0) diff += 24 * 60; // Next day wrap
      setDuration(diff);
    } catch (e) {
      setDuration(0);
    }
  }, [startTime, endTime]);

  // Load existing details if read-only
  useEffect(() => {
    if (isReadOnly && lastRecord) {
      setFileName(lastRecord.fileName);
      setTotalItems(lastRecord.totalItems);
      setApprovedCount(lastRecord.approvedCount);
      setRejectedCount(lastRecord.rejectedCount);
      setStartTime(lastRecord.startTime);
      setEndTime(lastRecord.endTime);
      setDuration(lastRecord.durationMinutes);
    }
  }, [isReadOnly, lastRecord]);

  const triggerMockUpload = () => {
    setFileName(activeSubStage?.isAte ? 'ATE_Report_Run_' + selectedSerial + '.pdf' : 'Quality_Sheet_' + selectedSerial + '.pdf');
    setUploaded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setUploading(true);
    // Simulate short loader for OCR / Processing
    setTimeout(() => {
      uploadSubStageDocument(
        selectedModuleId,
        selectedStageId,
        selectedSubStageId,
        {
          fileName,
          fileSize: '1.2 MB',
          isAte: activeSubStage?.isAte || false,
          totalItems,
          approvedCount,
          rejectedCount,
          startTime,
          endTime,
          durationMinutes: duration
        },
        simulateFailure
      );
      setUploading(false);
      setCurrentScreen('workspace');
    }, 1200);
  };

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '16px' }}>
        <button
          onClick={() => setCurrentScreen('workspace')}
          className="btn btn-ghost"
          style={{ padding: '8px' }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </button>
        <div>
          <span className="text-micro font-mono uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
            Stage Detail · {activeModule?.name} · {selectedSerial}
          </span>
          <h2 className="text-2xl font-black uppercase text-bright" style={{ margin: 0 }}>
            {activeSubStage?.name}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Layout: Form on Left, OCR/Checklist details on Right */}
        <div className="grid-1-2">
          
          {/* Left panel: Upload & Metadata */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* File Dropzone Card */}
            <div className="pms-card">
              <span className="text-xs font-black uppercase tracking-wider text-bright">Document Attachment</span>
              
              {!fileName ? (
                <div 
                  onClick={triggerMockUpload}
                  style={{
                    border: '1px dashed var(--color-outline-variant)',
                    borderRadius: 'var(--radius-md)',
                    padding: '30px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--color-surface-container-low)'
                  }}
                  className="interactive"
                >
                  <Upload style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span className="text-xs font-bold text-bright">Click to upload report document</span>
                    <span className="text-nano font-mono">PDF, DOCX, or Excel files up to 10MB</span>
                  </div>
                </div>
              ) : (
                <div 
                  style={{
                    backgroundColor: 'var(--color-surface-container-low)',
                    padding: '16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-outline-variant)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <FileText style={{ width: 24, height: 24, color: 'var(--color-primary)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                    <span className="text-xs font-bold text-bright" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fileName}
                    </span>
                    <span className="text-nano font-mono">1.2 MB · Uploaded</span>
                  </div>
                  {!isReadOnly && (
                    <button 
                      type="button" 
                      onClick={() => { setFileName(''); setUploaded(false); }} 
                      className="text-nano font-mono uppercase"
                      style={{ background: 'transparent', border: 'none', color: 'var(--color-status-critical-txt)', cursor: 'pointer', fontWeight: 900 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {/* Simulation options */}
              {!isReadOnly && activeSubStage?.isAte && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-status-critical-txt)', fontWeight: 700 }}>
                    ⚠️ Simulate OCR Measurement Failure
                  </span>
                </label>
              )}
            </div>

            {/* Production Stats Card */}
            <div className="pms-card">
              <span className="text-xs font-black uppercase tracking-wider text-bright">Manufacturing Metrics</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Quantities */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                    <label className="text-nano uppercase font-black">Total Qty</label>
                    <input
                      type="number"
                      value={totalItems}
                      onChange={(e) => setTotalItems(Number(e.target.value))}
                      disabled={isReadOnly}
                      className="input-field font-mono"
                      min={1}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                    <label className="text-nano uppercase font-black">Approved Qty</label>
                    <input
                      type="number"
                      value={approvedCount}
                      onChange={(e) => setApprovedCount(Number(e.target.value))}
                      disabled={isReadOnly}
                      className="input-field font-mono"
                      min={0}
                      max={totalItems}
                    />
                  </div>
                </div>

                {/* Timing */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                    <label className="text-nano uppercase font-black">Start Time</label>
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={isReadOnly}
                      className="input-field font-mono"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>
                    <label className="text-nano uppercase font-black">End Time</label>
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      disabled={isReadOnly}
                      className="input-field font-mono"
                    />
                  </div>
                </div>

                {/* Calculated Duration */}
                <div 
                  className="flex-between"
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-outline-variant)'
                  }}
                >
                  <span className="text-nano uppercase font-black">Calculated Cycle Time</span>
                  <span className="text-xs font-mono font-bold text-bright">{duration} minutes</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isReadOnly && (
              <button
                type="submit"
                disabled={!fileName || uploading}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px' }}
              >
                {uploading ? 'PROCESSING OCR / SAVING...' : 'SUBMIT WORKPACK FOR REVIEW'}
              </button>
            )}
          </div>

          {/* Right panel: ATE / OCR Results View */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* If ATE - Render Spec Measurements */}
            {activeSubStage?.isAte && (uploaded || isReadOnly) ? (
              <>
                {/* OCR results table */}
                <div className="pms-card">
                  <div className="flex-between">
                    <span className="text-xs font-black uppercase tracking-wider text-bright">
                      OCR Extracted ATE Test Values
                    </span>
                    <span 
                      className={`status-badge ${
                        (isReadOnly ? lastRecord?.ocrResult : (simulateFailure ? 'FAIL' : 'PASS')) === 'PASS' ? 'active' : 'critical'
                      }`}
                      style={{ fontSize: '9px', padding: '3px 6px' }}
                    >
                      {(isReadOnly ? lastRecord?.ocrResult : (simulateFailure ? 'FAIL' : 'PASS')) || 'PASS'}
                    </span>
                  </div>

                  <div className="table-container">
                    <table className="custom-table" style={{ fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Measurement Parameter</th>
                          <th>Observed</th>
                          <th>Limits</th>
                          <th style={{ textAlign: 'center' }}>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(isReadOnly ? lastRecord?.ocrMeasurements : [
                          { parameter: 'ADC Voltage Ref', observed: simulateFailure ? '5.62' : '5.02', minLimit: '4.80', maxLimit: '5.20', unit: 'V', status: simulateFailure ? 'FAIL' : 'PASS' },
                          { parameter: 'DAC Output Linearity', observed: '0.015', minLimit: '0.000', maxLimit: '0.025', unit: '%', status: 'PASS' },
                          { parameter: 'DDR4 RAM Read Speed', observed: '2133', minLimit: '1600', maxLimit: '2400', unit: 'MHz', status: 'PASS' },
                          { parameter: 'BIT (Built-In Test)', observed: simulateFailure ? '80' : '100', minLimit: '100', maxLimit: '100', unit: '%', status: simulateFailure ? 'FAIL' : 'PASS' }
                        ])?.map((meas: any, index: number) => (
                          <tr key={index}>
                            <td className="font-bold text-bright">{meas.parameter}</td>
                            <td className="font-mono">{meas.observed} {meas.unit}</td>
                            <td className="font-mono text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
                              {meas.minLimit}-{meas.maxLimit} {meas.unit}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span 
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 900,
                                  color: meas.status === 'PASS' ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)',
                                  backgroundColor: meas.status === 'PASS' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                  padding: '2px 6px',
                                  borderRadius: '2px'
                                }}
                              >
                                {meas.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Checklist cards */}
                <div className="pms-card">
                  <span className="text-xs font-black uppercase tracking-wider text-bright">Automatic Validation Checks</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(isReadOnly ? lastRecord?.checklist : [
                      { id: 'ch-adc', label: 'ADC reference voltage is within spec', checked: !simulateFailure },
                      { id: 'ch-dac', label: 'DAC output linearity matches design constraints', checked: true },
                      { id: 'ch-ram', label: 'DDR4 RAM full write/read cycle validation', checked: true },
                      { id: 'ch-bit', label: 'Power-on self-test (POST) / Built-In Test passed', checked: !simulateFailure }
                    ])?.map((item: any) => (
                      <div 
                        key={item.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          padding: '10px 12px',
                          backgroundColor: 'var(--color-surface-container-low)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: `3px solid ${item.checked ? 'var(--color-tertiary)' : 'var(--color-status-critical-txt)'}`
                        }}
                      >
                        {item.checked ? (
                          <CheckCircle2 style={{ width: 14, height: 14, color: 'var(--color-tertiary)' }} />
                        ) : (
                          <AlertOctagon style={{ width: 14, height: 14, color: 'var(--color-status-critical-txt)' }} />
                        )}
                        <span className="text-xs" style={{ color: 'var(--color-surface-bright)' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : !activeSubStage?.isAte && (uploaded || isReadOnly) ? (
              // Non-ATE details view
              <div className="pms-card" style={{ height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px' }}>
                <FileCheck style={{ width: 48, height: 48, color: 'var(--color-tertiary)', marginBottom: '12px' }} />
                <h4 className="text-base font-bold text-bright">Standard Stage Report File</h4>
                <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                  This stage uses standard document templates. Quality assurance audits will review the checklist items on the PDF upload for compliance verification.
                </span>
              </div>
            ) : (
              // Empty Upload helper
              <div className="pms-card" style={{ height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '30px', border: '1px dashed var(--color-outline-variant)' }}>
                <HelpCircle style={{ width: 40, height: 40, color: 'var(--color-on-surface-variant)', marginBottom: '12px' }} />
                <h4 className="text-sm font-bold text-bright">Awaiting Report Upload</h4>
                <span className="text-xs" style={{ color: 'var(--color-on-surface-variant)', marginTop: '4px' }}>
                  Provide the report document file attachment on the left panel to trigger OCR extraction validation checks.
                </span>
              </div>
            )}

            {/* Read only metadata remarks */}
            {isReadOnly && lastRecord && (
              <div 
                className="pms-card" 
                style={{ 
                  borderLeft: `4px solid ${
                    lastRecord.status === 'APPROVED' 
                      ? 'var(--color-tertiary)' 
                      : lastRecord.status === 'REJECTED' 
                        ? 'var(--color-status-critical-txt)' 
                        : 'var(--color-status-pending-txt)'
                  }` 
                }}
              >
                <div className="flex-between">
                  <span className="text-xs font-black uppercase tracking-wider text-bright">QA Review History</span>
                  <span 
                    className={`status-badge ${
                      lastRecord.status === 'APPROVED' 
                        ? 'active' 
                        : lastRecord.status === 'REJECTED' 
                          ? 'critical' 
                          : 'pending'
                    }`}
                    style={{ fontSize: '9px', padding: '2px 6px' }}
                  >
                    {lastRecord.status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div className="text-nano font-mono">
                    AUDITED BY: {lastRecord.status === 'PENDING' ? 'Awaiting Final QA Agent' : 'QA Lead'}
                  </div>
                  {lastRecord.remarks && (
                    <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: '10px', borderRadius: '2px', border: '1px solid var(--color-outline-variant)', marginTop: '4px' }}>
                      <span className="text-xs font-mono text-bright">"{lastRecord.remarks}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </form>
    </div>
  );
};
