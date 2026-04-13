import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { permissionsApi } from '../api/services';
import {
  PageHeader, SearchBar, Table, Modal, FormGrid,
  Field, Input, Select, Button, Card, ConfirmDialog,
} from '../components/ui';

export default function PermissionsPage() {
  const [perms, setPerms]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modFilter, setModFilter] = useState('ALL');
  const [modules, setModules]   = useState([]);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, m] = await Promise.all([permissionsApi.getAll(), permissionsApi.getModules()]);
      setPerms(p.data || []); setFiltered(p.data || []);
      setModules(m.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let f = perms;
    if (modFilter !== 'ALL') f = f.filter(p => p.module === modFilter);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(p => p.key?.toLowerCase().includes(q) || p.action?.toLowerCase().includes(q));
    }
    setFiltered(f);
  }, [search, modFilter, perms]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      if (modal.id) await permissionsApi.update(modal.id, form);
      else           await permissionsApi.create(form);
      toast.success(modal.id ? 'Permission updated' : 'Permission created');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await permissionsApi.remove(confirm.id);
      toast.success('Permission deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const cols = [
    { key: 'key',         label: 'Permission Key', render: r => <code style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '2px 6px', borderRadius: 4 }}>{r.key}</code> },
    { key: 'module',      label: 'Module' },
    { key: 'action',      label: 'Action' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div>
      <PageHeader icon={ShieldCheck} title="Permissions" subtitle="Define system permissions" onAdd={() => { setForm({}); setModal({ title: 'Create Permission' }); }} addLabel="Create Permission" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by key or action…">
          <Select value={modFilter} onChange={e => setModFilter(e.target.value)} style={{ width: 'auto', minWidth: 150 }}>
            <option value="ALL">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
        </SearchBar>
        <Table
          cols={cols}
          rows={filtered}
          onEdit={r => { setForm({ key: r.key, module: r.module, action: r.action, description: r.description }); setModal({ id: r.id, title: 'Edit Permission' }); }}
          onDelete={r => setConfirm(r)}
        />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)} width={480}>
          <FormGrid>
            <Field label="Permission Key *"><Input value={form.key || ''} onChange={e => set('key', e.target.value)} placeholder="e.g. bikes.create" /></Field>
            <Field label="Module *"><Input value={form.module || ''} onChange={e => set('module', e.target.value)} placeholder="e.g. BIKES" /></Field>
            <Field label="Action *"><Input value={form.action || ''} onChange={e => set('action', e.target.value)} placeholder="e.g. CREATE" /></Field>
            <Field label="Description"><Input value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          </FormGrid>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete permission "${confirm.key}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
