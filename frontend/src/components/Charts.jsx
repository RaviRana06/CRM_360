import React from 'react';

// Modern Interactive Bar Chart (Vector SVG with Tooltip & Gradients)
export function BarChart({ data, title, height = 260 }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(60, Math.floor(400 / data.length));

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {title && <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>{title}</h4>}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: `${height}px`, gap: '12px', paddingBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {data.map((item, idx) => {
          const pct = Math.round((item.value / maxValue) * 100);
          const color = item.color || '#6366f1';
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '6px' }}>
                {typeof item.value === 'number' && item.isCurrency ? `$${item.value.toLocaleString()}` : item.value}
              </span>
              <div
                style={{
                  width: `${barWidth}px`,
                  height: `${Math.max(pct, 4)}%`,
                  background: `linear-gradient(180deg, ${color}, rgba(99, 102, 241, 0.2))`,
                  borderRadius: '8px 8px 2px 2px',
                  boxShadow: `0 4px 15px ${color}44`,
                  transition: 'height 0.5s ease-out'
                }}
              />
              <span style={{ position: 'absolute', bottom: '-22px', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Modern Interactive Donut Chart (SVG Doughnut with Centered Metrics)
export function DonutChart({ data, title, centerLabel, centerValue }) {
  if (!data || data.length === 0) {
    return <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '20px' }}>No data available</div>;
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativeAngle = 0;

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#38bdf8', '#8b5cf6'];

  return (
    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {title && <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>{title}</h4>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {data.map((item, idx) => {
              const pct = total > 0 ? item.value / total : 0;
              const strokeDasharray = `${pct * 283} ${283 - pct * 283}`;
              const strokeDashoffset = -cumulativeAngle * 283;
              cumulativeAngle += pct;
              const color = item.color || colors[idx % colors.length];

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'all 0.6s ease' }}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>{centerValue !== undefined ? centerValue : total}</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>{centerLabel || 'Total'}</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, idx) => {
            const color = item.color || colors[idx % colors.length];
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                  <span style={{ color: '#cbd5e1' }}>{item.label}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <strong style={{ color: '#fff' }}>{item.value}</strong>
                  <span style={{ color: '#94a3b8', width: '35px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
