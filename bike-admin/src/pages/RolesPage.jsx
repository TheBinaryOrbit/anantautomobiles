import { useState, useEffect, useCallback } from 'react';
import { KeyRound } from 'lucide-react';
import { toast } from 'react-toastify';
import { rolesApi, permissionsApi } from '../api/services';
import {
  PageHeader, Table, Modal, Field,
  Input, Button, Card,
} from '../components/ui';

export default function RolesPage() {
  const [roles, setRoles]           = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState({});
  const [permModal, setPermModal]   = useState(null);
  const [selPerms, setSelPerms]     = useState([]);
  const [permLoading, setPermLoading] = useState(false);
  const [loading, setLoading]       = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, p] = await Promise.all([rolesApi.getAll(), permissionsApi.getAll()]);
      setRoles(r.data || []);
      setPermissions(p.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      if (modal.id) await rolesApi.update(modal.id, form);
      else           await rolesApi.create(form);
      toast.success(modal.id ? 'Role updated' : 'Role created');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const assignPerms = async () => {
    setPermLoading(true);
    try {
      await rolesApi.assignPermissions(permModal.id, selPerms);
      toast.success('Permissions updated');
      load(); setPermModal(null);
    } catch (err) { toast.error(err.message); }
    setPermLoading(false);
  };

  const cols = [
    { key: 'name',        label: 'Role Name' },
    { key: 'description', label: 'Description' },
    { key: 'isActive',    label: 'Active', render: r => r.isActive
        ? <span style={{ color: '#27500A', fontSize: 12 }}>✓ Active</span>
        : <span style={{ color: '#A32D2D', fontSize: 12 }}>Inactive</span> },
    { key: 'permissions', label: 'Permissions', render: r =>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(r.permissions || []).length} assigned</span> },
  ];

  return (
    <div>
      <PageHeader icon={KeyRound} title="Roles" subtitle="Manage roles and permissions" onAdd={() => { setForm({}); setModal({ title: 'Create Role' }); }} addLabel="Create Role" />
      <Card>
        <Table
          cols={cols}
          rows={roles}
          onEdit={r => { setForm({ name: r.name, description: r.description }); setModal({ id: r.id, title: 'Edit Role' }); }}
          extraActions={row => (
            <button
              onClick={() => {
                setPermModal(row);
                setSelPerms((row.permissions || []).map(p => p.id).filter(Boolean));
              }}
              style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}
            >
              Permissions
            </button>
          )}
        />
      </Card>

      {/* Create / Edit Role */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)} width={420}>
          <Field label="Role Name *">
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} />
          </Field>
          <Field label="Description">
            <Input value={form.description || ''} onChange={e => set('description', e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {/* Assign permissions */}
      {permModal && (
        <Modal title={`Assign Permissions — ${permModal.name}`} onClose={() => setPermModal(null)}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Select permissions to assign to this role:
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', border: '0.5px solid var(--border-secondary)', borderRadius: 8 }}>
            {permissions.map(p => (
              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '0.5px solid var(--border-secondary)' }}>
                <input
                  type="checkbox"
                  checked={selPerms.includes(p.id)}
                  onChange={e => setSelPerms(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))}
                />
                <code style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '1px 5px', borderRadius: 4 }}>{p.key}</code>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>{p.module} · {p.action}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="secondary" onClick={() => setPermModal(null)}>Cancel</Button>
            <Button onClick={assignPerms} disabled={permLoading}>{permLoading ? 'Updating…' : `Update (${selPerms.length})`}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
