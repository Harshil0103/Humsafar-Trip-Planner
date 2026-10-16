import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 0, height: '320px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: '180px', background: 'var(--bg-subtle)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ height: '20px', width: '70%', background: 'var(--bg-subtle)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '14px', width: '90%', background: 'var(--bg-subtle)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: '14px', width: '50%', background: 'var(--bg-subtle)', borderRadius: '4px', marginTop: 'auto', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ height: '48px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );
}

export default CardSkeleton;
