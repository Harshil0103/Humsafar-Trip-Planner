import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Plus, Search } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Compass,
  title = 'No items found',
  description = 'Get started by creating your first entry.',
  actionText,
  actionLink,
  onAction
}) {
  return (
    <div className="card" style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'var(--bg-subtle)',
      border: '1px dashed #cbd5e1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        {title}
      </h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionText && (
        actionLink ? (
          <Link to={actionLink} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            <span>{actionText}</span>
          </Link>
        ) : (
          <button onClick={onAction} className="btn btn-primary" style={{ gap: '0.5rem' }}>
            <Plus size={18} />
            <span>{actionText}</span>
          </button>
        )
      )}
    </div>
  );
}
