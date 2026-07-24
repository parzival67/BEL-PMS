import React from 'react';
import { useApp } from '../context/AppContext';
import { ModuleTimeBarChart } from '../components/CustomCharts';
import { ChevronDown, ChevronRight } from 'lucide-react';

export const ProductDashboard: React.FC = () => {
  const {
    products,
    selectedProductId,
    selectedSerial,
    setSelectedModuleId,
    setCurrentScreen
  } = useApp();

  // Collapsible section states (expanded by default)
  const [sec1Expanded, setSec1Expanded] = React.useState(true);
  const [sec2Expanded, setSec2Expanded] = React.useState(true);
  const [sec3Expanded, setSec3Expanded] = React.useState(true);

  // Find active product and serial service context
  const activeProduct = products.find(p => p.id === selectedProductId);
  const activeService = activeProduct?.services.find(s => s.serialNumber === selectedSerial) || activeProduct?.services[0];
  const modules = activeService?.modules || [];

  const overallProgress = activeService?.progress || 0;

  // Safe mapping of database modules to dashboard submodules
  const sysControllerModule = modules.find(m => m.id.includes('controller') || m.id.includes('sys-controller')) || modules[0];
  const powerSupplyModule = modules.find(m => m.id.includes('supply') || m.id.includes('power-supply')) || modules[1] || modules[0];
  const cableAssyModule = modules.find(m => m.id.includes('cable') || m.id.includes('harness')) || modules[2] || modules[0];
  const servoDriveModule = modules.find(m => m.id.includes('servo')) || modules[3] || modules[0];

  // Helper to extract stage progress dynamically from database
  const getStageProgress = (moduleObj: any, stageId: string) => {
    if (!moduleObj) return { percent: 0, checked: false };
    const stage = moduleObj.stages.find((s: any) => s.id === stageId);
    if (!stage) return { percent: 0, checked: false };
    
    const total = stage.subStages.length;
    const completed = stage.subStages.filter((ss: any) => ss.status === 'completed').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      percent,
      checked: percent === 100
    };
  };

  const handleViewModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setCurrentScreen('workspace');
  };

  // Status computation for submodules
  const isPsuComplete = powerSupplyModule ? powerSupplyModule.progress === 100 : false;
  const isControllerComplete = sysControllerModule ? sysControllerModule.progress === 100 : false;
  const isCableComplete = cableAssyModule ? cableAssyModule.progress === 100 : false;
  const isServoComplete = getStageProgress(servoDriveModule, 'igqa').checked;

  // Helper to determine border-top highlight color based on progress
  const getCardBorderColor = (progress: number, active: boolean) => {
    if (progress === 100) return 'var(--color-tertiary)'; // Completed (green)
    if (active || (progress > 0 && progress < 100)) return 'var(--color-primary)'; // Active (blue)
    return 'var(--color-outline-variant)'; // Inactive (gray)
  };

  // Helper to render submodule card with clean layout, pulsing dot badge, and stage table list
  const renderSubmoduleCard = (
    moduleObj: any,
    title: string,
    isComplete: boolean,
    stages: { id: string; label: string }[],
    isActive: boolean = true
  ) => {
    if (!moduleObj) return null;
    const progressVal = moduleObj.progress || 0;

    return (
      <div 
        className="pms-card interactive" 
        onClick={() => handleViewModule(moduleObj.id)}
        style={{ 
          padding: '12px 14px', 
          gap: '8px', 
          minHeight: 'auto',
          borderTop: '3px solid ' + getCardBorderColor(progressVal, isActive)
        }}
      >
        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(128,128,128,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }} className="text-bright">
            {title}
          </span>
          
          {/* Pulsing Status Badge */}
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: isComplete ? 'var(--color-tertiary)' : 'var(--color-primary)', 
            fontWeight: 800, 
            fontSize: '9px',
            backgroundColor: isComplete ? 'rgba(16,185,129,0.08)' : 'rgba(2,132,199,0.08)',
            padding: '2px 6px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <span style={{ 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: isComplete ? 'var(--color-tertiary)' : 'var(--color-primary)', 
              display: 'inline-block',
              animation: 'pulse 1.8s infinite ease-in-out'
            }} />
            {isComplete ? 'DONE' : 'WIP'}
          </span>
        </div>

        {/* Stages list in clean Table format */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <tbody>
            {stages.map((stg) => {
              const stageProgress = getStageProgress(moduleObj, stg.id);
              // Determine status indicator color: green (completed), yellow (in progress), grey (not started)
              let statusColor = '#9ca3af'; // default grey
              if (stageProgress.checked) {
                statusColor = '#10b981'; // green
              } else if (stageProgress.percent > 0) {
                statusColor = '#eab308'; // yellow
              }

              return (
                <tr key={stg.id} style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                  <td style={{ padding: '6px 0', fontWeight: 500, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                    {stg.label}
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                    {stageProgress.percent}%
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'right', width: '20px' }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: statusColor,
                      boxShadow: `0 0 4px ${statusColor}`,
                      verticalAlign: 'middle'
                    }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Section 2 Progress values for the active serial
  const getIntProgress = () => {
    if (overallProgress >= 80) return 100;
    if (overallProgress >= 52) return Math.round((overallProgress - 50) * 3.3);
    return 0;
  };
  const intProgress = getIntProgress();
  let intStatusColor = '#9ca3af';
  if (intProgress === 100) {
    intStatusColor = '#10b981';
  } else if (intProgress > 0) {
    intStatusColor = '#eab308';
  }

  // Section 3 Progress values for the active serial
  const qaProgress = overallProgress === 100 ? 100 : 0;
  let qaStatusColor = qaProgress === 100 ? '#10b981' : '#9ca3af';

  // Calculate module-wise progress for Completion Analysis chart
  /*
  const moduleCompletionData = [
    { label: 'POWER SUPPLY UNIT', progress: powerSupplyModule?.progress || 0 },
    { label: 'SYSTEM CONTROLLER', progress: sysControllerModule?.progress || 0 },
    { label: 'CABLE ASSY - 14 TYPES', progress: cableAssyModule?.progress || 0 },
    { label: 'SERVO DRIVE GEAR BOX', progress: getStageProgress(servoDriveModule, 'igqa').percent },
    { label: 'FEEDBACK GEAR BOX', progress: 100 },
    { label: 'MANUAL DRIVE GEAR BOX', progress: 100 }
  ];
  */

  // Helper to compute actual logged duration for each module
  const getModuleDuration = (modObj: any) => {
    if (!modObj) return 0;
    let duration = 0;
    modObj.stages.forEach((st: any) => {
      st.subStages.forEach((sst: any) => {
        sst.documentHistory.forEach((doc: any) => {
          duration += doc.durationMinutes || 0;
        });
      });
    });
    return duration;
  };

  const chartTimeData = [
    { label: 'POWER SUPPLY UNIT', duration: getModuleDuration(powerSupplyModule) },
    { label: 'SYSTEM CONTROLLER', duration: getModuleDuration(sysControllerModule) },
    { label: 'CABLE ASSY - 14 TYPES', duration: getModuleDuration(cableAssyModule) },
    { label: 'SERVO DRIVE GEAR BOX', duration: getModuleDuration(servoDriveModule) },
    { label: 'FEEDBACK GEAR BOX', duration: 45 },
    { label: 'MANUAL DRIVE GEAR BOX', duration: 30 }
  ];

  return (
    <div className="page-container" style={{ gap: '16px' }}>
      
      {/* 1. Header Progress Card (Compact & Highly Distinct Row) */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: '12px 24px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-outline-variant)',
          borderLeft: '5px solid ' + (overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-primary)'),
          gap: '24px'
        }}
      >
        {/* Left Section: Product Identity & Progress Pill Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'var(--font-mono)' }}>
            Active System Unit
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.02em', color: 'var(--color-surface-bright)', margin: 0, textTransform: 'uppercase' }}>
              {activeProduct?.name}
            </h2>
            <span style={{
              fontSize: '9px',
              fontWeight: 900,
              backgroundColor: overallProgress === 100 ? 'rgba(16,185,129,0.1)' : 'rgba(2,132,199,0.1)',
              color: overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-primary)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontFamily: 'var(--font-mono)',
              border: `1px solid ${overallProgress === 100 ? 'rgba(16,185,129,0.2)' : 'rgba(2,132,199,0.2)'}`,
              letterSpacing: '0.05em'
            }}>
              {overallProgress}% COMPLETE
            </span>
          </div>
        </div>

        {/* Right Section: Compact Inline Sequential Timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Node 1: Module Testing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: overallProgress >= 50 ? 'var(--color-tertiary)' : 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              ✓
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-surface-bright)', letterSpacing: '0.03em', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
              Module Testing
            </span>
          </div>

          {/* Line 1 */}
          <div style={{ width: '30px', height: '2px', backgroundColor: overallProgress >= 80 ? 'var(--color-tertiary)' : 'var(--color-outline-variant)' }} />

          {/* Node 2: Integrated System Testing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: overallProgress >= 80 ? 'var(--color-tertiary)' : overallProgress >= 50 ? 'var(--color-primary)' : 'var(--color-surface-container-highest)',
              color: overallProgress >= 50 ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              {overallProgress >= 80 ? '✓' : '2'}
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: overallProgress >= 50 ? 'var(--color-surface-bright)' : 'var(--color-on-surface-variant)', 
              letterSpacing: '0.03em', 
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)'
            }}>
              Integrated System
            </span>
          </div>

          {/* Line 2 */}
          <div style={{ width: '30px', height: '2px', backgroundColor: overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-outline-variant)' }} />

          {/* Node 3: Final QA Release */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: overallProgress === 100 ? 'var(--color-tertiary)' : overallProgress >= 80 ? 'var(--color-primary)' : 'var(--color-surface-container-highest)',
              color: overallProgress >= 80 ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              {overallProgress === 100 ? '✓' : '3'}
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 800, 
              color: overallProgress >= 80 ? 'var(--color-surface-bright)' : 'var(--color-on-surface-variant)', 
              letterSpacing: '0.03em', 
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)'
            }}>
              Final QA Release
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column (2/3 width) Tree, Right Column (1/3 width) Charts */}
      <div className="grid-2-1" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Column (Dense Tree/Grid Structure) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* SECTION A: MODULE LEVEL TESTING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              className="section-heading-container" 
              onClick={() => setSec1Expanded(!sec1Expanded)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="section-heading-bar" style={{ backgroundColor: 'var(--color-primary)' }} />
              <span className="section-heading-text">01. Module Level Testing</span>
              <span className="section-heading-sub">Submodule Verifications</span>
              {sec1Expanded ? (
                <ChevronDown style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              ) : (
                <ChevronRight style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              )}
            </div>
            
            {sec1Expanded && (
              <div className="grid-3" style={{ gap: '12px' }}>
                
                {/* PSU Box */}
                {renderSubmoduleCard(
                  powerSupplyModule,
                  'POWER SUPPLY UNIT',
                  isPsuComplete,
                  [
                    { id: 'igqa', label: 'IGQA' },
                    { id: 'assembly', label: 'ASSEMBLY' },
                    { id: 'testing', label: 'FUNCTIONAL TESTING' }
                  ],
                  true
                )}

                {/* System Controller Box */}
                {renderSubmoduleCard(
                  sysControllerModule,
                  'SYSTEM CONTROLLER',
                  isControllerComplete,
                  [
                    { id: 'igqa', label: 'IGQA' },
                    { id: 'assembly', label: 'ASSEMBLY' },
                    { id: 'testing', label: 'FUNCTIONAL TESTING' }
                  ],
                  true
                )}

                {/* Cable Assembly Box */}
                {renderSubmoduleCard(
                  cableAssyModule,
                  'CABLE ASSY - 14 TYPES',
                  isCableComplete,
                  [
                    { id: 'igqa', label: 'IGQA' },
                    { id: 'assembly', label: 'ASSEMBLY' },
                    { id: 'testing', label: 'FUNCTIONAL TESTING' }
                  ],
                  true
                )}

                {/* Servo Drive Gear Box */}
                {renderSubmoduleCard(
                  servoDriveModule,
                  'SERVO DRIVE GEAR BOX',
                  isServoComplete,
                  [
                    { id: 'igqa', label: 'IGQA' }
                  ],
                  false
                )}

                {/* Feedback Gear Box (Mocked) */}
                <div 
                  className="pms-card" 
                  style={{ 
                    padding: '12px 14px', 
                    gap: '8px', 
                    minHeight: 'auto',
                    borderTop: '3px solid var(--color-tertiary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(128,128,128,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }} className="text-bright">
                      FEEDBACK GEAR BOX
                    </span>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--color-tertiary)', 
                      fontWeight: 800, 
                      fontSize: '9px',
                      backgroundColor: 'rgba(16,185,129,0.08)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--color-tertiary)', 
                        display: 'inline-block',
                        animation: 'pulse 1.8s infinite ease-in-out'
                      }} />
                      DONE
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                        <td style={{ padding: '6px 0', fontWeight: 500, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                          IGQA
                        </td>
                        <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                          100%
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', width: '20px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 4px #10b981',
                            verticalAlign: 'middle'
                          }} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Manual Drive Gear Box (Mocked) */}
                <div 
                  className="pms-card" 
                  style={{ 
                    padding: '12px 14px', 
                    gap: '8px', 
                    minHeight: 'auto',
                    borderTop: '3px solid var(--color-tertiary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(128,128,128,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }} className="text-bright">
                      MANUAL DRIVE GEAR BOX
                    </span>
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: 'var(--color-tertiary)', 
                      fontWeight: 800, 
                      fontSize: '9px',
                      backgroundColor: 'rgba(16,185,129,0.08)',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span style={{ 
                        width: '5px', 
                        height: '5px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--color-tertiary)', 
                        display: 'inline-block',
                        animation: 'pulse 1.8s infinite ease-in-out'
                      }} />
                      DONE
                    </span>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                        <td style={{ padding: '6px 0', fontWeight: 500, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                          IGQA
                        </td>
                        <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                          100%
                        </td>
                        <td style={{ padding: '6px 0', textAlign: 'right', width: '20px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            boxShadow: '0 0 4px #10b981',
                            verticalAlign: 'middle'
                          }} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>

          {/* SECTION B: INTEGRATED SYSTEM TESTING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              className="section-heading-container" 
              onClick={() => setSec2Expanded(!sec2Expanded)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="section-heading-bar" style={{ backgroundColor: overallProgress >= 80 ? 'var(--color-tertiary)' : 'var(--color-primary)' }} />
              <span className="section-heading-text">02. Integrated System Testing</span>
              <span className="section-heading-sub">System Validation Status</span>
              {sec2Expanded ? (
                <ChevronDown style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              ) : (
                <ChevronRight style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              )}
            </div>
            
            {sec2Expanded && (
              <div 
                className="pms-card" 
                style={{ 
                  padding: '12px 14px', 
                  gap: '8px', 
                  width: '450px', 
                  borderTop: '3px solid ' + (overallProgress >= 80 ? 'var(--color-tertiary)' : 'var(--color-primary)') 
                }}
              >
                {/* Card Header for uniformity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(128,128,128,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }} className="text-bright">
                    SYSTEM INTEGRATION AUDIT
                  </span>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: overallProgress >= 80 ? 'var(--color-tertiary)' : 'var(--color-primary)', 
                    fontWeight: 800, 
                    fontSize: '9px',
                    backgroundColor: overallProgress >= 80 ? 'rgba(16,185,129,0.08)' : 'rgba(2,132,199,0.08)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <span style={{ 
                      width: '5px', 
                      height: '5px', 
                      borderRadius: '50%', 
                      backgroundColor: overallProgress >= 80 ? 'var(--color-tertiary)' : 'var(--color-primary)', 
                      display: 'inline-block',
                      animation: 'pulse 1.8s infinite ease-in-out'
                    }} />
                    {overallProgress >= 80 ? 'DONE' : 'WIP'}
                  </span>
                </div>

                {/* Table of 3 units with headers */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.12)' }}>
                      <th style={{ padding: '4px 0', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'left', fontFamily: 'var(--font-display)' }}>Unit</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Comp</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Acc</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Rej</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>%</th>
                      <th style={{ padding: '4px 0', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '35px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {intProgress === 100 ? 1 : 0}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {intProgress === 100 ? 1 : 0}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {intProgress}%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: intStatusColor,
                          boxShadow: `0 0 4px ${intStatusColor}`,
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial === 'SN002' ? 'SN001' : 'SN002'}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        1
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        1
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        100%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 4px #10b981',
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial === 'SN003' ? 'SN001' : 'SN003'}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#9ca3af',
                          boxShadow: '0 0 4px #9ca3af',
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION C: FINAL QA ACCEPTANCE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              className="section-heading-container" 
              onClick={() => setSec3Expanded(!sec3Expanded)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div className="section-heading-bar" style={{ backgroundColor: overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-outline-variant)' }} />
              <span className="section-heading-text">03. Final QA Acceptance</span>
              <span className="section-heading-sub">Lead Sign-Off & Release</span>
              {sec3Expanded ? (
                <ChevronDown style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              ) : (
                <ChevronRight style={{ width: 14, height: 14, marginLeft: '8px', color: 'var(--color-on-surface-variant)' }} />
              )}
            </div>
            
            {sec3Expanded && (
              <div 
                className="pms-card" 
                style={{ 
                  padding: '12px 14px', 
                  gap: '8px', 
                  width: '450px', 
                  borderTop: '3px solid ' + (overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-outline-variant)') 
                }}
              >
                {/* Card Header for uniformity */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(128,128,128,0.06)', paddingBottom: '6px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.03em' }} className="text-bright">
                    FINAL QA RELEASE SIGN-OFF
                  </span>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    color: overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)', 
                    fontWeight: 800, 
                    fontSize: '9px',
                    backgroundColor: overallProgress === 100 ? 'rgba(16,185,129,0.08)' : 'rgba(107,114,128,0.08)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    <span style={{ 
                      width: '5px', 
                      height: '5px', 
                      borderRadius: '50%', 
                      backgroundColor: overallProgress === 100 ? 'var(--color-tertiary)' : 'var(--color-on-surface-variant)', 
                      display: 'inline-block',
                      animation: overallProgress === 100 ? 'pulse 1.8s infinite ease-in-out' : 'none'
                    }} />
                    {overallProgress === 100 ? 'DONE' : 'PENDING'}
                  </span>
                </div>

                {/* Table of 3 units with headers */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.12)' }}>
                      <th style={{ padding: '4px 0', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'left', fontFamily: 'var(--font-display)' }}>Unit</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Comp</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Acc</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>Rej</th>
                      <th style={{ padding: '4px 8px', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '45px' }}>%</th>
                      <th style={{ padding: '4px 0', fontSize: '9px', fontWeight: 800, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', textAlign: 'right', fontFamily: 'var(--font-display)', width: '35px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-surface-bright)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {qaProgress === 100 ? 1 : 0}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {qaProgress === 100 ? 1 : 0}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        {qaProgress}%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: qaStatusColor,
                          boxShadow: `0 0 4px ${qaStatusColor}`,
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial === 'SN002' ? 'SN001' : 'SN002'}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        1
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        1
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        100%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          boxShadow: '0 0 4px #10b981',
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.06)' }}>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-mono)', textAlign: 'left' }}>
                        {selectedSerial === 'SN003' ? 'SN001' : 'SN003'}
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-status-critical-txt)', textAlign: 'right', width: '45px' }}>
                        0
                      </td>
                      <td style={{ padding: '6px 8px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-on-surface-variant)', textAlign: 'right', width: '45px' }}>
                        0%
                      </td>
                      <td style={{ padding: '6px 0', textAlign: 'right', width: '35px' }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#9ca3af',
                          boxShadow: '0 0 4px #9ca3af',
                          verticalAlign: 'middle'
                        }} />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Charts Panel) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Time Taken Completion Panel */}
          <div className="pms-card" style={{ padding: '20px', gap: '12px' }}>
            <span className="text-xs font-black uppercase tracking-wider text-bright w-full text-left" style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '6px', letterSpacing: '0.05em' }}>
              Time Invested per Module
            </span>
            <ModuleTimeBarChart data={chartTimeData} />
          </div>

        </div>

      </div>

    </div>
  );
};
