import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { customersApi } from '../api/services';
import {
  PageHeader, SearchBar, Table, Modal, FormGrid,
  Field, Input, Button, Card, ConfirmDialog,
} from '../components/ui';

const EMPTY = {};

export default function CustomersPage() {
  const [items, setItems]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await customersApi.getAll();
      setItems(r.data || []); setFiltered(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    ));
  }, [search, items]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      const { name, email, phone, aadhaarNumber, panNumber, addressLine1, city, state, postalCode, country } = form;
      const payload = { name, email, phone, aadhaarNumber, panNumber, addressLine1, city, state, postalCode, country };
      if (modal.id) await customersApi.update(modal.id, payload);
      else           await customersApi.create(payload);
      toast.success(modal.id ? 'Customer updated' : 'Customer added');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await customersApi.remove(confirm.id);
      toast.success('Customer deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const openEdit = (r) => {
    setForm({ ...r, ...r.address });
    setModal({ id: r.id, title: 'Edit Customer' });
  };

  const cols = [
    { key: 'name',         label: 'Name' },
    { key: 'email',        label: 'Email' },
    { key: 'phone',        label: 'Phone' },
    { key: 'aadhaarNumber',label: 'Aadhaar' },
    { key: 'panNumber',    label: 'PAN' },
    { key: 'address',      label: 'City', render: r => r.address?.city || '—' },
  ];

  return (
    <div>
      <PageHeader icon={Users} title="Customers" subtitle="Manage customer records" onAdd={() => { setForm(EMPTY); setModal({ title: 'Add Customer' }); }} addLabel="Add Customer" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, phone…" />
        <Table cols={cols} rows={filtered} onEdit={openEdit} onDelete={r => setConfirm(r)} />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
            <Field label="Full Name *"><Input value={form.name || ''} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Phone *"><Input value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Aadhaar Number"><Input value={form.aadhaarNumber || ''} onChange={e => set('aadhaarNumber', e.target.value)} /></Field>
            <Field label="PAN Number"><Input value={form.panNumber || ''} onChange={e => set('panNumber', e.target.value)} /></Field>

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
          message={`Delete customer "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
