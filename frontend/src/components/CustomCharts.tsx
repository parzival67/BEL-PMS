import React from 'react';

// ==========================================
// 1. DONUT PROGRESS CHART
// ==========================================
interface DonutChartProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressPieChart: React.FC<DonutChartProps> = ({
  progress,
  size = 140,
  strokeWidth = 14
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-outline-variant)"
          strokeWidth={strokeWidth}
        />
        {/* Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="square"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      {/* Inner Label */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          inset: 0
        }}
      >
        <span className="text-2xl font-black text-bright" style={{ fontFamily: 'var(--font-display)' }}>
          {progress}%
        </span>
        <span className="text-nano font-mono uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>
          Complete
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 2. YIELD & REJECTION BAR CHART
// ==========================================
interface BarChartProps {
  data: { label: string; approved: number; rejected: number }[];
  height?: number;
}

export const RejectionBarChart: React.FC<BarChartProps> = ({ data, height = 150 }) => {
  const maxValue = Math.max(...data.map(d => d.approved + d.rejected), 10);

  return (
    <div style={{ width: '100%', height: height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
      <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end', justifyContent: 'space-around', gap: '16px', padding: '0 8px' }}>
        {data.map((item, idx) => {
          const total = item.approved + item.rejected;
          const appHeight = total > 0 ? (item.approved / maxValue) * 100 : 0;
          const rejHeight = total > 0 ? (item.rejected / maxValue) * 100 : 0;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
              <div
                style={{
                  width: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  backgroundColor: 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Approved Bar Section (Green) */}
                <div
                  style={{
                    height: `${appHeight}%`,
                    backgroundColor: 'var(--color-tertiary)',
                    width: '100%',
                    transition: 'height 0.3s ease'
                  }}
                  title={`Approved: ${item.approved}`}
                />
                {/* Rejected Bar Section (Red) */}
                <div
                  style={{
                    height: `${rejHeight}%`,
                    backgroundColor: 'var(--color-status-critical-txt)',
                    width: '100%',
                    transition: 'height 0.3s ease'
                  }}
                  title={`Rejected: ${item.rejected}`}
                />
              </div>
              <span
                className="text-nano font-mono text-center"
                style={{
                  width: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'var(--color-on-surface-variant)'
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-tertiary)', borderRadius: 'var(--radius-sm)' }} />
          <span className="text-nano font-mono uppercase">Approved</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-status-critical-txt)', borderRadius: 'var(--radius-sm)' }} />
          <span className="text-nano font-mono uppercase">Rejected</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. PROGRESS TREND LINE CHART
// ==========================================
interface LineChartProps {
  data: { date: string; value: number }[];
  height?: number;
}

export const TrendLineChart: React.FC<LineChartProps> = ({ data, height = 150 }) => {
  const padding = 20;
  const chartHeight = height - padding * 2;

  // Create coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * (260 - padding * 2);
    const y = padding + chartHeight - (d.value / 100) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ width: '100%', height: height, display: 'flex', flexDirection: 'column' }}>
      <svg width="100%" height={chartHeight + padding} viewBox="0 0 260 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        <line x1="20" y1="20" x2="240" y2="20" stroke="var(--color-outline-variant)" strokeWidth="0.5" />
        <line x1="20" y1="60" x2="240" y2="60" stroke="var(--color-outline-variant)" strokeWidth="0.5" />
        <line x1="20" y1="100" x2="240" y2="100" stroke="var(--color-outline-variant)" strokeWidth="0.5" />

        {/* Trend Line */}
        {data.length > 0 && (
          <>
            <polyline
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              points={points}
              style={{ transition: 'all 0.5s ease' }}
            />
            {/* Draw Dot Nodes */}
            {data.map((d, index) => {
              const x = padding + (index / (data.length - 1)) * (260 - padding * 2);
              const y = padding + chartHeight - (d.value / 100) * chartHeight;
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="var(--color-surface-container-lowest)"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fill="var(--color-surface-bright)"
                    className="text-nano font-mono"
                    style={{ fontSize: '8px' }}
                  >
                    {d.value}%
                  </text>
                </g>
              );
            })}
          </>
        )}
      </svg>
      {/* Date labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: '4px' }}>
        {data.map((d, idx) => (
          <span key={idx} className="text-nano font-mono" style={{ color: 'var(--color-on-surface-variant)' }}>
            {d.date}
          </span>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. TIMELINE GANTT / DURATION CHART
// ==========================================
interface GanttProps {
  stages: { name: string; duration: number; status: string }[];
}

export const TimelineGantt: React.FC<GanttProps> = ({ stages }) => {
  const maxDuration = Math.max(...stages.map(s => s.duration), 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {stages.map((stage, idx) => {
        const barWidth = (stage.duration / maxDuration) * 100;

        let statusColor = 'var(--color-surface-container-highest)';
        if (stage.status === 'completed') statusColor = 'var(--color-tertiary)';
        if (stage.status === 'running') statusColor = 'var(--color-primary)';
        if (stage.status === 'rejected') statusColor = 'var(--color-status-critical-txt)';
        if (stage.status === 'pending_review') statusColor = 'var(--color-status-pending-txt)';

        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Stage Name */}
            <span
              className="text-xs font-bold uppercase text-bright"
              style={{ width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {stage.name}
            </span>
            {/* Bar Track */}
            <div
              style={{
                flex: 1,
                backgroundColor: 'var(--color-surface-container-low)',
                height: '14px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Gantt Bar */}
              <div
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: statusColor,
                  height: '100%',
                  transition: 'width 0.3s ease',
                  opacity: stage.status === 'inactive' ? 0.3 : 1
                }}
              />
            </div>
            {/* Duration label */}
            <span className="text-xs font-mono text-bright" style={{ width: '60px', textAlign: 'right' }}>
              {stage.duration > 0 ? `${stage.duration} min` : '--'}
            </span>
          </div>
        );
      })}
    </div>
  );
};




// ==========================================
// 5. HELPER FOR CLEAN CHART LABELS
// ==========================================
const cleanModuleName = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes('POWER SUPPLY')) return 'Power Supply';
  if (upper.includes('SYSTEM CONTROLLER')) return 'Sys Controller';
  if (upper.includes('CABLE')) return 'Cable Assy';
  if (upper.includes('SERVO')) return 'Servo Drive';
  if (upper.includes('FEEDBACK')) return 'Feedback Gear';
  if (upper.includes('MANUAL')) return 'Manual Drive';
  return name;
};

// ==========================================
// 6. MODULE-WISE COMPLETION DONUT GRID (3x2 Grid of Progress Rings)
// ==========================================
interface ModuleCompletionProps {
  modules: { label: string; progress: number }[];
}

export const ModuleCompletionDonutGrid: React.FC<ModuleCompletionProps> = ({ modules }) => {
  const colors = [
    '#10b981', // green (PSU)
    '#0ea5e9', // blue (System Controller)
    '#eab308', // yellow (Cable)
    '#a855f7', // purple (Servo)
    '#f97316', // orange (Feedback)
    '#ec4899', // pink (Manual)
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px 8px', width: '100%', padding: '4px 0' }}>
      {modules.map((mod, idx) => {
        const color = colors[idx % colors.length];
        const size = 52;
        const strokeWidth = 5;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (mod.progress / 100) * circumference;

        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            {/* Donut Chart */}
            <div style={{ position: 'relative', width: size, height: size }}>
              <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-surface-container-high)"
                  strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
              </svg>
              {/* Center percentage text */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-surface-bright)' }}>
                  {mod.progress}%
                </span>
              </div>
            </div>
            {/* Label */}
            <span
              className="text-nano text-bright"
              style={{
                fontSize: '9px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%',
                opacity: 0.9
              }}
              title={mod.label}
            >
              {cleanModuleName(mod.label)}
            </span>
          </div>
        );
      })}
    </div>
  );
};


// ==========================================
// 7. MODULE-WISE TIME INVESTED BAR CHART
// ==========================================
interface DurationChartProps {
  data: { label: string; duration: number }[];
}

export const ModuleTimeBarChart: React.FC<DurationChartProps> = ({ data }) => {
  const chartHeight = 170;
  const chartWidth = 340;
  const maxVal = Math.max(...data.map(d => d.duration), 30);

  const colors = [
    '#10b981', // green
    '#0ea5e9', // blue
    '#eab308', // yellow
    '#a855f7', // purple
    '#f97316', // orange
    '#ec4899', // pink
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '10px' }}>
      {/* SVG Bar Chart */}
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
        {data.map((item, idx) => {
          const barWidth = 30;
          const spacing = (chartWidth - barWidth * 6) / 5;
          const x = idx * (barWidth + spacing);
          const barHeight = maxVal > 0 ? (item.duration / maxVal) * (chartHeight - 40) : 0;
          const y = chartHeight - 25 - barHeight;
          const color = colors[idx % colors.length];
          const cleanName = cleanModuleName(item.label);
          const nameCode = cleanName.includes(' ') ? cleanName.split(' ').map(w => w[0]).join('') : cleanName.substring(0, 3);

          return (
            <g key={idx}>
              {/* Value Label on top of Bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="var(--color-surface-bright)"
                style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              >
                {item.duration}m
              </text>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
                style={{ transition: 'height 0.3s ease, y 0.3s ease' }}
              />
              {/* X-Axis Label (e.g. PS, SC, CA) */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - 8}
                textAnchor="middle"
                fill="var(--color-on-surface-variant)"
                style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
              >
                {nameCode.toUpperCase()}
              </text>
            </g>
          );
        })}
        {/* Baseline */}
        <line
          x1={0}
          y1={chartHeight - 25}
          x2={chartWidth}
          y2={chartHeight - 25}
          stroke="var(--color-outline-variant)"
          strokeWidth={1.5}
          opacity={0.5}
        />
      </svg>

      {/* Small horizontal legend grid mapping codes to full clean names */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 12px', width: '100%', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '12px', marginTop: '8px' }}>
        {data.map((item, idx) => {
          const color = colors[idx % colors.length];
          const cleanName = cleanModuleName(item.label);
          const nameCode = cleanName.includes(' ') ? cleanName.split(' ').map(w => w[0]).join('') : cleanName.substring(0, 3);

          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'uppercase' }}>
                {nameCode.toUpperCase()}: <span style={{ textTransform: 'none', color: 'var(--color-surface-bright)', fontWeight: 500 }}>{cleanName}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};





