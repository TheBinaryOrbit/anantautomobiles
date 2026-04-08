import { useState, useEffect, useCallback } from 'react';
import { UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { usersApi, rolesApi } from '../api/services';
import {
  PageHeader, Table, Modal, Field,
  Input, Button, Card, ConfirmDialog,
} from '../components/ui';

export default function UsersPage() {
  const [users, setUsers]           = useState([]);
  const [roles, setRoles]           = useState([]);
  const [modal, setModal]           = useState(null);
  const [form, setForm]             = useState({});
  const [roleModal, setRoleModal]   = useState(null);
  const [selRoles, setSelRoles]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const [confirm, setConfirm]       = useState(null);

  const load = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([usersApi.getAll(), rolesApi.getAll()]);
      setUsers(u.data || []);
      setRoles(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      if (!form.email || !form.phone) {
        toast.error('Email and phone are required');
        setLoading(false);
        return;
      }

      if (modal.id) {
        await usersApi.update(modal.id, form);
        toast.success('User updated');
      } else {
        if (!form.password) {
          toast.error('Password is required for new users');
          setLoading(false);
          return;
        }
        await usersApi.create(form);
        toast.success('User created');
      }
      load();
      setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = (user) => {
    setConfirm({
      title: `Delete User: ${user.email}?`,
      message: 'This action cannot be undone.',
      onConfirm: async () => {
        try {
          await usersApi.remove(user.id);
          toast.success('User deleted');
          load();
        } catch (err) { toast.error(err.message); }
        setConfirm(null);
      },
    });
  };

  const assignRoles = async () => {
    setRoleLoading(true);
    try {
      await usersApi.assignRoles(roleModal.id, selRoles);
      toast.success('Roles updated');
      load(); setRoleModal(null);
    } catch (err) { toast.error(err.message); }
    setRoleLoading(false);
  };

  const cols = [
    { key: 'email',  label: 'Email' },
    { key: 'phone',  label: 'Phone' },
    { key: 'name',   label: 'Name' },
    { key: 'roles',  label: 'Roles', render: u =>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {(u.roles || []).length > 0 ? u.roles.map(r => r.name).join(', ') : 'No roles'}
        </span>
    },
  ];

  return (
    <div>
      <PageHeader
        icon={UserCheck}
        title="Users"
        subtitle="Manage system users and access"
        onAdd={() => { setForm({}); setModal({ title: 'Create User' }); }}
        addLabel="Add User"
      />
      <Card>
        <Table
          cols={cols}
          rows={users}
          onEdit={u => {
            setForm({ email: u.email, phone: u.phone, name: u.name });
            setModal({ id: u.id, title: 'Edit User' });
          }}
          onDelete={handleDelete}
          extraActions={row => (
            <button
              onClick={() => {
                setRoleModal(row);
                setSelRoles((row.roles || []).map(r => r.id).filter(Boolean));
              }}
              style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}
            >
              Roles
            </button>
          )}
        />
      </Card>

      {/* Create / Edit User */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)} width={420}>
          <Field label="Email *">
            <Input value={form.email || ''} onChange={e => set('email', e.target.value)} placeholder="user@example.com" />
          </Field>
          <Field label="Phone *">
            <Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
          </Field>
          <Field label="Name">
            <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Full Name" />
          </Field>
          {!modal.id && (
            <Field label="Password *">
              <Input type="password" value={form.password || ''} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
            </Field>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {/* Assign Roles */}
      {roleModal && (
        <Modal title={`Assign Roles — ${roleModal.email}`} onClose={() => setRoleModal(null)}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
            Select roles to assign to this user:
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto', border: '0.5px solid var(--border-secondary)', borderRadius: 8 }}>
            {roles.map(r => (
              <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '0.5px solid var(--border-secondary)' }}>
                <input
                  type="checkbox"
                  checked={selRoles.includes(r.id)}
                  onChange={e => setSelRoles(prev => e.target.checked ? [...prev, r.id] : prev.filter(id => id !== r.id))}
                />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{r.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto' }}>{r.permissions?.length || 0} permissions</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="secondary" onClick={() => setRoleModal(null)}>Cancel</Button>
            <Button onClick={assignRoles} disabled={roleLoading}>{roleLoading ? 'Updating…' : `Update (${selRoles.length})`}</Button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      {confirm && <ConfirmDialog {...confirm} />}
    </div>
  );
}
