import { X } from 'lucide-react';
import { STATUS_COLORS, STOCK_TYPE } from '../../utils/constants';

/* ──────────────────────────────────────────────
   Badge
────────────────────────────────────────────── */
export function Badge({ label }) {
  const c = STATUS_COLORS[label] || { bg: '#F1EFE8', fg: '#444441' };
  return (
    <span style={{
      background: c.bg, color: c.fg,
      fontSize: 11, fontWeight: 500,
      padding: '3px 10px', borderRadius: 20,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

export function StockBadge({ label }) {
  const c = STOCK_TYPE[label] || { bg: '#F1EFE8', fg: '#444441' };
  return (
    <span style={{
      background: c.bg, color: c.fg,
      fontSize: 11, fontWeight: 500,
      padding: '3px 10px', borderRadius: 20,
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
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 8, fontFamily: 'var(--font-sans)',
    fontWeight: 500, cursor: 'pointer', border: 'none',
    transition: 'opacity 0.15s, transform 0.1s',
    opacity: props.disabled ? 0.5 : 1,
    fontSize: size === 'sm' ? 12 : 13,
    padding: size === 'sm' ? '5px 12px' : size === 'lg' ? '11px 22px' : '8px 18px',
  };
  const variants = {
    primary:   { background: '#EE2326', color: '#fff' },
    danger:    { background: '#E24B4A', color: '#fff' },
    secondary: { background: 'var(--bg-tertiary)', color: 'var(--text-primary)' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)', border: '0.5px solid var(--border-primary)' },
  };
  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant], ...props.style }}
      onMouseEnter={e => { if (!props.disabled) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = props.disabled ? '0.5' : '1'; }}
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
        width: '100%', padding: '8px 11px', borderRadius: 8,
        border: '0.5px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        fontSize: 13, color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        outline: 'none', transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = '#EE2326'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--border-primary)'; }}
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
        width: '100%', padding: '8px 11px', borderRadius: 8,
        border: '0.5px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        fontSize: 13, color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)', resize: 'vertical',
        outline: 'none', transition: 'border-color 0.15s',
        boxSizing: 'border-box',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = '#EE2326'; }}
      onBlur={e => { e.target.style.borderColor = 'var(--border-primary)'; }}
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
        width: '100%', padding: '8px 11px', borderRadius: 8,
        border: '0.5px solid var(--border-primary)',
        background: 'var(--bg-secondary)',
        fontSize: 13, color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)', cursor: 'pointer',
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
    <div style={{ marginBottom: 14, ...style }}>
      {label && (
        <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <div style={{ fontSize: 11, color: '#E24B4A', marginTop: 4 }}>{error}</div>
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
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '0.5px solid var(--border-primary)', width: `min(${width}px, calc(100% - 2rem))`, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'clamp(1rem, 2vw, 1.5rem)', borderBottom: '0.5px solid var(--border-secondary)', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}>
            <X size={16} />
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
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            {cols.map(c => (
              <th key={c.key} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 11, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete || extraActions) && (
              <th style={{ textAlign: 'right', padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={cols.length + 1} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                No records found
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr
              key={row.id || i}
              style={{ borderBottom: '0.5px solid var(--border-secondary)', transition: 'background 0.1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {cols.map(c => (
                <td key={c.key} style={{ padding: '11px 14px', verticalAlign: 'middle', whiteSpace: c.wrap ? 'normal' : 'nowrap', maxWidth: c.maxWidth || 'none' }}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
              {(onEdit || onDelete || extraActions) && (
                <td style={{ padding: '11px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {extraActions && extraActions(row)}
                  {onEdit && (
                    <button onClick={() => onEdit(row)} style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)', border: 'none', padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, background: 'var(--brand-light)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-dark)', flexShrink: 0 }}>
          {Icon && <Icon size={20} />}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, marginTop: 2 }}>{subtitle}</p>
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
    <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        style={{ flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 8, border: '0.5px solid var(--border-primary)', background: 'var(--bg-secondary)', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)', outline: 'none' }}
        onFocus={e => { e.target.style.borderColor = '#EE2326'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border-primary)'; }}
      />
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   StatCard
────────────────────────────────────────────── */
export function StatCard({ label, value, icon: Icon, accent = 'var(--brand-light)' }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '0.5px solid var(--border-secondary)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
      </div>
      {Icon && (
        <div style={{ width: 42, height: 42, borderRadius: 11, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-dark)', flexShrink: 0 }}>
          <Icon size={20} />
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
    <div style={{ background: 'var(--bg-primary)', border: '0.5px solid var(--border-secondary)', borderRadius: 14, padding: '1.25rem', ...style }}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Spinner
────────────────────────────────────────────── */
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0', color: 'var(--text-secondary)', fontSize: 13 }}>
      Loading…
    </div>
  );
}

/* ──────────────────────────────────────────────
   Confirm helper (modal-based)
────────────────────────────────────────────── */
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <Modal title="Confirm" onClose={onCancel} width={380}>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
      gap: 12,
    }}>
      {children}
    </div>
  );
}
