import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { suppliersApi } from '../api/services';
import { SUPPLIER_TYPES } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Badge, Modal, FormGrid,
  Field, Input, Select, Button, Card, ConfirmDialog,
} from '../components/ui';

const EMPTY = { supplierType: 'DEALER' };

export default function SuppliersPage() {
  const [items, setItems]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await suppliersApi.getAll();
      setItems(r.data || []); setFiltered(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.companyName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    ));
  }, [search, items]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      const { name, email, phone, companyName, supplierType, addressLine1, city, state, postalCode, country } = form;
      const payload = { name, email, phone, companyName, supplierType, addressLine1, city, state, postalCode, country};
      if (modal.id) await suppliersApi.update(modal.id, payload);
      else           await suppliersApi.create(payload);
      toast.success(modal.id ? 'Supplier updated' : 'Supplier added');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await suppliersApi.remove(confirm.id);
      toast.success('Supplier deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const openEdit = (r) => {
    setForm({ name: r.name, email: r.email, phone: r.phone, companyName: r.companyName, supplierType: r.supplierType, ...r.address });
    setModal({ id: r.id, title: 'Edit Supplier' });
  };

  const cols = [
    { key: 'name',         label: 'Contact Name' },
    { key: 'companyName',  label: 'Company' },
    { key: 'supplierType', label: 'Type',  render: r => <Badge label={r.supplierType} /> },
    { key: 'email',        label: 'Email' },
    { key: 'phone',        label: 'Phone' },
    { key: 'address',      label: 'City',  render: r => r.address?.city || '—' },
  ];

  return (
    <div>
      <PageHeader icon={Building2} title="Suppliers" subtitle="Manage supplier records" onAdd={() => { setForm(EMPTY); setModal({ title: 'Add Supplier' }); }} addLabel="Add Supplier" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, company, email…" />
        <Table cols={cols} rows={filtered} onEdit={openEdit} onDelete={r => setConfirm(r)} />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
            <Field label="Contact Name"><Input value={form.name || ''} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Company Name"><Input value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Phone"><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Field>
            <Field label="Supplier Type" style={{ gridColumn: '1/-1' }}>
              <Select value={form.supplierType || ''} onChange={e => set('supplierType', e.target.value)}>
                {SUPPLIER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>

            <div style={{ gridColumn: '1/-1', borderTop: '0.5px solid var(--border-secondary)', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Address</div>
              <FormGrid>
                <Field label="Address Line 1" style={{ gridColumn: '1/-1' }}><Input value={form.addressLine1 || ''} onChange={e => set('addressLine1', e.target.value)} /></Field>
                <Field label="City"><Input value={form.city || ''} onChange={e => set('city', e.target.value)} /></Field>
                <Field label="State"><Input value={form.state || ''} onChange={e => set('state', e.target.value)} /></Field>
                <Field label="Postal Code"><Input value={form.postalCode || ''} onChange={e => set('postalCode', e.target.value)} /></Field>
                <Field label="Country"><Input value={form.country || ''} onChange={e => set('country', e.target.value)} /></Field>
              </FormGrid>
            </div>
          </FormGrid>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete supplier "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
