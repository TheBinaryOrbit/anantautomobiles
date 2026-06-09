import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { STATUS_COLORS, STOCK_TYPE } from '../../utils/constants';

// Anant Automobiles - Premium Light Theme System Tokens
const TOKENS = {
  colors: {
    brand: '#E31837',         // Anant Red
    brandDark: '#C4122C',     // Deep Crimson for gradients
    brandLight: '#fce8eb',    // Soft Red Accent
    success: '#10b981',       // Emerald Green
    danger: '#ef4444',        // Crisp Red (Standard error)
    dangerBg: '#fef2f2',
    bgPrimary: '#ffffff',     // Card Surface
    bgSecondary: '#f9fafb',   // Alternating Rows / Input Surfaces
    textPrimary: '#111827',   // Deep Slate Body
    textSecondary: '#6b7280', // Medium Slate
    textMuted: '#9ca3af',     // Subtext
    border: '#e5e7eb',        // Soft Borders
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 10px -4px rgba(0, 0, 0, 0.04)',
  }
};

/* ──────────────────────────────────────────────
   Badge
────────────────────────────────────────────── */
export function Badge({ label }) {
  const c = STATUS_COLORS[label] || { bg: '#f1f5f9', fg: '#334155' };
  return (
    <span style={{
      background: c.bg, color: c.fg,
      fontSize: 12, fontWeight: 600,
      padding: '4px 10px', borderRadius: 20,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

export function StockBadge({ label }) {
  const c = STOCK_TYPE[label] || { bg: '#f1f5f9', fg: '#334155' };
  return (
    <span style={{
      background: c.bg, color: c.fg,
      fontSize: 12, fontWeight: 600,
      padding: '4px 10px', borderRadius: 20,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Button
────────────────────────────────────────────── */
export function Button({ children, variant = 'primary', size = 'md', ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
    borderRadius: 8, fontFamily: 'var(--font-sans, "Inter", sans-serif)',
    fontWeight: 600, cursor: props.disabled ? 'not-allowed' : 'pointer', border: '1px solid transparent',
    transition: 'all 0.2s ease',
    opacity: props.disabled ? 0.6 : 1,
    fontSize: size === 'sm' ? 12 : 14,
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '12px 24px' : '9px 18px',
    boxShadow: variant === 'ghost' ? 'none' : TOKENS.shadows.sm,
  };
  const variants = {
    primary:   { background: `linear-gradient(90deg, ${TOKENS.colors.brand} 0%, ${TOKENS.colors.brandDark} 100%)`, color: '#fff', boxShadow: '0 4px 12px rgba(227, 24, 55, 0.2)' },
    danger:    { background: TOKENS.colors.danger, color: '#fff' },
    secondary: { background: TOKENS.colors.bgPrimary, color: TOKENS.colors.textPrimary, border: `1px solid ${TOKENS.colors.border}` },
    ghost:     { background: 'transparent', color: TOKENS.colors.textSecondary, border: `1px solid ${TOKENS.colors.border}` },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...props.style }}
      onMouseEnter={e => { if (!props.disabled) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.05)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none'; }}
    >
      {children}
    </button>
  );
}

/* ──────────────────────────────────────────────
   Input
────────────────────────────────────────────── */
export function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        border: `1px solid ${TOKENS.colors.border}`,
        background: TOKENS.colors.bgPrimary,
        fontSize: 14, color: TOKENS.colors.textPrimary,
        fontFamily: 'var(--font-sans, "Inter", sans-serif)',
        outline: 'none', transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { 
        e.target.style.borderColor = TOKENS.colors.brand; 
        e.target.style.boxShadow = `0 0 0 3px rgba(227, 24, 55, 0.15)`;
      }}
      onBlur={e => { 
        e.target.style.borderColor = TOKENS.colors.border; 
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   Textarea
────────────────────────────────────────────── */
export function Textarea({ style, ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        border: `1px solid ${TOKENS.colors.border}`,
        background: TOKENS.colors.bgPrimary,
        fontSize: 14, color: TOKENS.colors.textPrimary,
        fontFamily: 'var(--font-sans, "Inter", sans-serif)', resize: 'vertical',
        outline: 'none', transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { 
        e.target.style.borderColor = TOKENS.colors.brand; 
        e.target.style.boxShadow = `0 0 0 3px rgba(227, 24, 55, 0.15)`;
      }}
      onBlur={e => { 
        e.target.style.borderColor = TOKENS.colors.border; 
        e.target.style.boxShadow = 'none';
      }}
    />
  );
}

/* ──────────────────────────────────────────────
   Select
────────────────────────────────────────────── */
export function Select({ children, style, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '10px 14px', borderRadius: 8,
        border: `1px solid ${TOKENS.colors.border}`,
        background: TOKENS.colors.bgPrimary,
        fontSize: 14, color: TOKENS.colors.textPrimary,
        fontFamily: 'var(--font-sans, "Inter", sans-serif)', cursor: 'pointer',
        outline: 'none', boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

/* ──────────────────────────────────────────────
   Field
────────────────────────────────────────────── */
export function Field({ label, children, style, error, fullWidth }) {
  return (
    <div style={{ marginBottom: 16, ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 12, color: TOKENS.colors.textSecondary, marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <div style={{ fontSize: 12, color: TOKENS.colors.danger, marginTop: 6, fontWeight: 500 }}>{error}</div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Modal
────────────────────────────────────────────── */
export function Modal({ title, onClose, children, width = 600 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: TOKENS.colors.bgPrimary, borderRadius: 16, border: `1px solid ${TOKENS.colors.border}`, width: `min(${width}px, calc(100% - 2rem))`, maxHeight: '90vh', overflowY: 'auto', boxShadow: TOKENS.shadows.lg, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(1rem, 2vw, 1.5rem)', borderBottom: `1px solid ${TOKENS.colors.border}`, flexShrink: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: TOKENS.colors.textPrimary }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.colors.textMuted, display: 'flex', alignItems: 'center', padding: 6, borderRadius: 6, transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.color = TOKENS.colors.brand; e.currentTarget.style.background = TOKENS.colors.brandLight; }} onMouseLeave={e => { e.currentTarget.style.color = TOKENS.colors.textMuted; e.currentTarget.style.background = 'none'; }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Table
────────────────────────────────────────────── */
export function Table({ cols, rows, onEdit, onDelete, extraActions }) {
  return (
    <div style={{ overflowX: 'auto', background: TOKENS.colors.bgPrimary, borderRadius: 12, border: `1px solid ${TOKENS.colors.border}`, boxShadow: TOKENS.shadows.sm }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: TOKENS.colors.bgSecondary, borderBottom: `1px solid ${TOKENS.colors.border}` }}>
            {cols.map(c => (
              <th key={c.key} style={{ textAlign: 'left', padding: '12px 16px', color: TOKENS.colors.textSecondary, fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete || extraActions) && (
              <th style={{ textAlign: 'right', padding: '12px 16px', color: TOKENS.colors.textSecondary, fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length + 1} style={{ padding: '3rem', textAlign: 'center', color: TOKENS.colors.textMuted, fontSize: 14 }}>
                No records found
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              style={{ borderBottom: `1px solid ${TOKENS.colors.border}`, transition: 'background 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = TOKENS.colors.bgSecondary; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {cols.map(c => (
                <td key={c.key} style={{ padding: '14px 16px', verticalAlign: 'middle', color: TOKENS.colors.textPrimary, whiteSpace: c.wrap ? 'normal' : 'nowrap', maxWidth: c.maxWidth || 'none' }}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete || extraActions) && (
                <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {extraActions && extraActions(row)}
                  {onEdit && (
                    <button onClick={() => onEdit(row)} style={{ background: 'transparent', color: TOKENS.colors.brand, border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans, "Inter", sans-serif)' }}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} style={{ background: 'transparent', color: TOKENS.colors.danger, border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans, "Inter", sans-serif)' }}>
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PageHeader
────────────────────────────────────────────── */
export function PageHeader({ icon: Icon, title, subtitle, onAdd, addLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {Icon && (
          <div style={{ width: 50, height: 50, background: `linear-gradient(135deg, ${TOKENS.colors.brand} 0%, ${TOKENS.colors.brandDark} 100%)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 8px 16px -4px rgba(227, 24, 55, 0.3)' }}>
            <Icon size={24} />
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: TOKENS.colors.textPrimary, letterSpacing: '-0.02em' }}>{title}</h1>
          <p style={{ fontSize: 14, color: TOKENS.colors.textSecondary, margin: 0, marginTop: 4 }}>{subtitle}</p>
        </div>
      </div>
      {onAdd && <Button onClick={onAdd}>+ {addLabel || 'Add New'}</Button>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SearchBar
────────────────────────────────────────────── */
export function SearchBar({ value, onChange, placeholder, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{ flex: 1, minWidth: 200, padding: '10px 16px', borderRadius: 8, border: `1px solid ${TOKENS.colors.border}`, background: TOKENS.colors.bgPrimary, fontSize: 14, color: TOKENS.colors.textPrimary, fontFamily: 'var(--font-sans, "Inter", sans-serif)', outline: 'none', transition: 'all 0.2s ease' }}
        onFocus={e => { e.target.style.borderColor = TOKENS.colors.brand; e.target.style.boxShadow = `0 0 0 3px rgba(227, 24, 55, 0.15)`; }}
        onBlur={e => { e.target.style.borderColor = TOKENS.colors.border; e.target.style.boxShadow = 'none'; }}
      />
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   StatCard
────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, accent = TOKENS.colors.brandLight, trend }) {
  const isPositive = trend ? !trend.startsWith('-') : true;
  return (
    <div style={{ background: TOKENS.colors.bgPrimary, border: `1px solid ${TOKENS.colors.border}`, borderRadius: 16, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: TOKENS.shadows.md }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: TOKENS.colors.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: TOKENS.colors.textPrimary, letterSpacing: '-0.03em', marginBottom: 6 }}>{value}</div>
      </div>
      {Icon && (
        <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${accent} 0%, #ffffff 100%)`, border: `1px solid rgba(227, 24, 55, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.colors.brand, flexShrink: 0, boxShadow: '0 4px 10px -2px rgba(227,24,55,0.05)' }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Card (generic wrapper)
────────────────────────────────────────────── */
export function Card({ children, style }) {
  return (
    <div style={{ background: TOKENS.colors.bgPrimary, border: `1px solid ${TOKENS.colors.border}`, borderRadius: 16, padding: '24px', boxShadow: TOKENS.shadows.md, ...style }}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Spinner
────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: 12, color: TOKENS.colors.textSecondary, fontSize: 14 }}>
      <div className="spinner-circle" style={{ width: 28, height: 28, border: `3px solid ${TOKENS.colors.border}`, borderTopColor: TOKENS.colors.brand, borderRadius: '50%' }}></div>
      <style>{`.spinner-circle { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span>Loading...</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Confirm helper (modal-based)
────────────────────────────────────────────── */
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm" onClose={onCancel} width={400}>
      <p style={{ fontSize: 15, color: TOKENS.colors.textSecondary, marginBottom: 24, lineHeight: 1.5 }}>{message}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────────────────────
   FormGrid (Responsive form layout)
────────────────────────────────────────────── */
export function FormGrid({ children, cols = 2 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
      gap: 16,
    }}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Dashboard Components (Avatar & Sparkline)
────────────────────────────────────────────── */
export function Avatar({ name, size = 32 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AA';
  const colors = ['#fce8eb', '#e0f2fe', '#dcfce7', '#fef9c3', '#f3e8ff'];
  const textColors = ['#E31837', '#0369a1', '#15803d', '#a16207', '#6b21a8'];
  const charCodeSum = name ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const colorIndex = charCodeSum % colors.length;

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: colors[colorIndex], color: textColors[colorIndex],
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, fontFamily: 'var(--font-sans, "Inter", sans-serif)',
      userSelect: 'none', flexShrink: 0
    }}>
      {initials}
    </div>
  );
}

export function Sparkline({ data = [10, 15, 8, 22, 14, 25], width = 120, height = 40, color = TOKENS.colors.brand }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}