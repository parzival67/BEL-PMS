import React from 'react';
import { useApp } from '../context/AppContext';
import { ProgressPieChart, RejectionBarChart, TimelineGantt } from '../components/CustomCharts';
import { BarChart3, FileSpreadsheet, FileText, Printer, Filter, Calendar } from 'lucide-react';

export const Reports: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    selectedSerial,
    setSelectedSerial
  } = useApp();

  // Find active product detail
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeSerials = activeProduct?.services.map(s => s.serialNumber) || [];
  const activeService = activeProduct?.services.find(s => s.serialNumber === selectedSerial) || activeProduct?.services[0];
  const modules = activeService?.modules || [];

  // Calculate metrics
  let totalApproved = 0;
  let totalRejected = 0;
  let totalPending = 0;
  let totalDuration = 0;
  let subStageCount = 0;

  modules.forEach(mod => {
    mod.stages.forEach(st => {
      st.subStages.forEach(sst => {
        subStageCount++;
        if (sst.status === 'completed') totalApproved++;
        if (sst.status === 'rejected') totalRejected++;
        if (sst.status === 'pending_review') totalPending++;
        
        sst.documentHistory.forEach(doc => {
          totalDuration += doc.durationMinutes || 0;
        });
      });
    });
  });

  const yieldRate = subStageCount > 0 ? Math.round((totalApproved / subStageCount) * 100) : 0;
  const avgCycleTime = totalApproved > 0 ? Math.round(totalDuration / totalApproved) : 0;

  // Compile Bar Chart Data
  const barChartData = modules.map(m => {
    let approved = 0;
    let rejected = 0;
    m.stages.forEach(st => {
      st.subStages.forEach(sst => {
        if (sst.status === 'completed') approved++;
        if (sst.status === 'rejected') rejected++;
      });
    });
    return {
      label: m.name,
      approved,
      rejected
    };
  });

  // Compile Gantt Timeline Data (aggregated duration per stage)
  const ganttStages = [
    { name: 'IGQA Stage', duration: 0, status: 'inactive' },
    { name: 'Assembly Stage', duration: 0, status: 'inactive' },
    { name: 'Testing Stage', duration: 0, status: 'inactive' },
    { name: 'Final QA Stage', duration: 0, status: 'inactive' }
  ];

  modules.forEach(mod => {
    mod.stages.forEach(st => {
      let durationSum = 0;
      let stageStatus = 'inactive';
      
      st.subStages.forEach(sst => {
        if (sst.status === 'completed') stageStatus = 'completed';
        else if (sst.status === 'running') stageStatus = 'running';
        else if (sst.status === 'pending_review') stageStatus = 'pending_review';
        else if (sst.status === 'rejected') stageStatus = 'rejected';

        sst.documentHistory.forEach(doc => {
          durationSum += doc.durationMinutes || 0;
        });
      });

      if (st.id === 'igqa') {
        ganttStages[0].duration += durationSum;
        if (stageStatus !== 'inactive') ganttStages[0].status = stageStatus;
      } else if (st.id === 'assembly') {
        ganttStages[1].duration += durationSum;
        if (stageStatus !== 'inactive') ganttStages[1].status = stageStatus;
      } else if (st.id === 'testing') {
        ganttStages[2].duration += durationSum;
        if (stageStatus !== 'inactive') ganttStages[2].status = stageStatus;
      } else if (st.id === 'qa-review') {
        ganttStages[3].duration += durationSum;
        if (stageStatus !== 'inactive') ganttStages[3].status = stageStatus;
      }
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert("Exporting Quality Audit Log database to Microsoft Excel format...");
  };

  const handleExportPdf = () => {
    alert("Compiling manufacturing compliance file. Exporting as PDF...");
  };

  return (
    <div className="page-container printable-area">
      {/* Header Info */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 style={{ width: 28, height: 28, color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider">Quality Audit Logs</h2>
            <span className="text-xs">Statistical yield evaluation and cycle times</span>
          </div>
        </div>

        {/* Action buttons (hidden during print) */}
        <div style={{ display: 'flex', gap: '8px' }} className="no-print">
          <button onClick={handleExportExcel} className="btn btn-ghost" style={{ fontSize: '11px', padding: '8px 12px', height: '32px' }}>
            <FileSpreadsheet style={{ width: 14, height: 14 }} />
            EXCEL
          </button>
          <button onClick={handleExportPdf} className="btn btn-ghost" style={{ fontSize: '11px', padding: '8px 12px', height: '32px' }}>
            <FileText style={{ width: 14, height: 14 }} />
            PDF REPORT
          </button>
          <button onClick={handlePrint} className="btn btn-primary" style={{ fontSize: '11px', padding: '8px 12px', height: '32px' }}>
            <Printer style={{ width: 14, height: 14 }} />
            PRINT
          </button>
        </div>
      </div>

      {/* Filter Row (hidden during print) */}
      <div 
        className="pms-card no-print" 
        style={{ 
          padding: '12px 20px', 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface-container-low)',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
          <span className="text-xs font-black uppercase tracking-wider text-bright">Filter Logs</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
          {/* Product Filter */}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="select-field text-xs font-bold uppercase tracking-wider"
            style={{ height: '32px', padding: '0 8px', width: '220px' }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Serial Filter */}
          <select
            value={selectedSerial}
            onChange={(e) => setSelectedSerial(e.target.value)}
            className="select-field text-xs font-mono"
            style={{ height: '32px', padding: '0 8px', width: '100px' }}
          >
            {activeSerials.map(serial => (
              <option key={serial} value={serial}>{serial}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats widgets grid */}
      <div className="grid-4">
        
        {/* KPI 1 */}
        <div className="pms-card" style={{ gap: '4px' }}>
          <span className="text-nano font-mono uppercase">System Completion</span>
          <span className="text-2xl font-bold text-bright font-mono">{activeService?.progress}%</span>
          <span className="text-nano" style={{ color: 'var(--color-tertiary)' }}>{totalApproved} sub-stages approved</span>
        </div>

        {/* KPI 2 */}
        <div className="pms-card" style={{ gap: '4px' }}>
          <span className="text-nano font-mono uppercase">Verification Yield</span>
          <span className="text-2xl font-bold text-bright font-mono" style={{ color: 'var(--color-tertiary)' }}>{yieldRate}%</span>
          <span className="text-nano">Passed incoming components</span>
        </div>

        {/* KPI 3 */}
        <div className="pms-card" style={{ gap: '4px' }}>
          <span className="text-nano font-mono uppercase">Avg Cycle Duration</span>
          <span className="text-2xl font-bold text-bright font-mono">{avgCycleTime} <span className="text-xs">min</span></span>
          <span className="text-nano">Average per stage completion</span>
        </div>

        {/* KPI 4 */}
        <div className="pms-card" style={{ gap: '4px' }}>
          <span className="text-nano font-mono uppercase">Open QA Audits</span>
          <span className="text-2xl font-bold text-bright font-mono" style={{ color: totalPending > 0 ? 'var(--color-status-pending-txt)' : 'inherit' }}>
            {totalPending} <span className="text-xs">docs</span>
          </span>
          <span className="text-nano">Awaiting QA Lead sign-off</span>
        </div>

      </div>

      {/* Main Charts & Timeline Layout */}
      <div className="grid-2-1">
        {/* Left column: Gantt timeline & Bar charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Gantt Timeline */}
          <div className="pms-card">
            <div className="flex-between">
              <span className="text-xs font-black uppercase tracking-wider text-bright">
                Aggregate Cycle Schedule (Gantt)
              </span>
              <span className="text-micro font-mono">
                Log reference: {selectedSerial}
              </span>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <TimelineGantt stages={ganttStages} />
            </div>
          </div>

          {/* Bar Chart yield */}
          <div className="pms-card">
            <span className="text-xs font-black uppercase tracking-wider text-bright" style={{ marginBottom: '8px' }}>
              Sub-system Pass / Fail Distribution
            </span>
            <RejectionBarChart data={barChartData} height={160} />
          </div>
        </div>

        {/* Right column: Donut charts & Calendar log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Donut Chart */}
          <div className="pms-card" style={{ alignItems: 'center' }}>
            <span className="text-xs font-black uppercase tracking-wider text-bright w-full" style={{ marginBottom: '8px' }}>
              Progress Distribution
            </span>
            <ProgressPieChart progress={activeService?.progress || 0} size={130} />
          </div>

          {/* Compliance Statement */}
          <div className="pms-card" style={{ borderLeft: '4px solid var(--color-outline-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: 14, height: 14, color: 'var(--color-primary)' }} />
              <span className="text-xs font-bold text-bright uppercase">Compliance statement</span>
            </div>
            <span className="text-xs" style={{ lineHeight: '1.4' }}>
              This audit log compiles data extracted from physical laser calibration tests, automatic ATE logs, and Incoming Quality Assurance inspections conducted on intranet servers.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
