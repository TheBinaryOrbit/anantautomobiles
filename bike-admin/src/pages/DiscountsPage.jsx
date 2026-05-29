import { useState, useEffect, useCallback } from 'react';
import { Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { discountsApi } from '../api/services';
import {
  PageHeader, SearchBar, Table, Badge, Modal, FormGrid,
  Field, Input, Select, Button, Card, ConfirmDialog,
} from '../components/ui';

const EMPTY = { type: 'PERCENTAGE', value: 0, isActive: true };

export default function DiscountsPage() {
  const [items, setItems]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await discountsApi.getAll();
      setItems(r.data || []); setFiltered(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(s =>
      s.name?.toLowerCase().includes(q)
    ));
  }, [search, items]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      if (modal.id) await discountsApi.update(modal.id, form);
      else           await discountsApi.create(form);
      toast.success(modal.id ? 'Discount updated' : 'Discount added');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await discountsApi.remove(confirm.id);
      toast.success('Discount deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const openEdit = (r) => {
    setForm(r);
    setModal({ id: r.id, title: 'Edit Discount / Offer' });
  };

  const cols = [
    { key: 'name',  label: 'Offer Name' },
    { key: 'type',  label: 'Type', render: r => <Badge label={r.type} color={r.type === 'PERCENTAGE' ? '#3b82f6' : '#8b5cf6'} /> },
    { key: 'value', label: 'Value', render: r => r.type === 'PERCENTAGE' ? `${r.value}%` : `₹${r.value}` },
    { key: 'upToLimit', label: 'Limit', render: r => r.upToLimit ? `Up to ₹${r.upToLimit}` : '—' },
    { key: 'isActive', label: 'Status', render: r => <Badge label={r.isActive ? 'Active' : 'Inactive'} color={r.isActive ? '#10b981' : '#f59e0b'} /> },
  ];

  return (
    <div>
      <PageHeader icon={Tag} title="Discounts & Offers" subtitle="Manage sale discounts and promotional schemes" onAdd={() => { setForm(EMPTY); setModal({ title: 'Add Discount' }); }} addLabel="Add Offer" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by offer name…" />
        <Table cols={cols} rows={filtered} onEdit={openEdit} onDelete={r => setConfirm(r)} />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
            <Field label="Offer Name" style={{ gridColumn: '1/-1' }}>
              <Input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Festival Dhamaka, Employee Discount" />
            </Field>
            <Field label="Type">
              <Select value={form.type || ''} onChange={e => set('type', e.target.value)}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </Select>
            </Field>
            <Field label={form.type === 'PERCENTAGE' ? 'Percentage' : 'Amount'}>
              <Input type="number" value={form.value} onChange={e => set('value', e.target.value)} />
            </Field>
            {form.type === 'PERCENTAGE' && (
              <Field label="Up to Limit (₹)">
                <Input type="number" value={form.upToLimit || ''} onChange={e => set('upToLimit', e.target.value)} placeholder="Wait, keep empty for no limit" />
              </Field>
            )}
            <Field label="Status">
              <Select value={form.isActive ? 'true' : 'false'} onChange={e => set('isActive', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </Field>
          </FormGrid>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete offer "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
