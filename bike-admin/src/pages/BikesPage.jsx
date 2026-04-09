import { useState, useEffect, useCallback } from 'react';
import { Bike } from 'lucide-react';
import { toast } from 'react-toastify';
import { bikesApi, bikeModelsApi, suppliersApi } from '../api/services';
import { BIKE_STATUSES, MONTHS, STATUS_COLORS, fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Badge, Modal,
  Field, Input, Select, Button, Card, StatCard, ConfirmDialog,
} from '../components/ui';

const EMPTY = { status: 'AVAILABLE', manufactureMonth: 'JANUARY' };

export default function BikesPage() {
  const [bikes, setBikes]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [models, setModels]     = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [modal, setModal]       = useState(null);   // null | { id?, title }
  const [form, setForm]         = useState(EMPTY);
  const [confirm, setConfirm]   = useState(null);   // row to delete
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, m, s] = await Promise.all([
        bikesApi.getAll(),
        bikeModelsApi.getAll(),
        suppliersApi.getAll(),
      ]);
      setBikes(b.data || []);
      setFiltered(b.data || []);
      setModels(m.data || []);
      setSuppliers(s.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(bikes.filter(b =>
      b.engineNumber?.toLowerCase().includes(q) ||
      b.chassisNumber?.toLowerCase().includes(q) ||
      b.color?.toLowerCase().includes(q) ||
      b.model?.name?.toLowerCase().includes(q)
    ));
  }, [search, bikes]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      const payload = {
        engineNumber: form.engineNumber,
        chassisNumber: form.chassisNumber,
        modelId: form.modelId,
        color: form.color,
        status: form.status,
        manufactureYear: parseInt(form.manufactureYear),
        manufactureMonth: form.manufactureMonth,
        registrationNumber: form.registrationNumber,
        purchasePrice: form.purchasePrice ? parseInt(form.purchasePrice) : null,
        salePrice: form.salePrice ? parseInt(form.salePrice) : null,
        supplierId: form.supplierId || null,
      };
      if (modal.id) await bikesApi.update(modal.id, payload);
      else           await bikesApi.create(payload);
      toast.success(modal.id ? 'Bike updated' : 'Bike added');
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await bikesApi.remove(confirm.id);
      toast.success('Bike deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const handleBook = async (row) => {
    try {
      await bikesApi.book(row.id);
      toast.success('Bike booked');
      load();
    } catch (err) { toast.error(err.message); }
  };

  const openCreate = () => { setForm(EMPTY); setModal({ title: 'Add Bike' }); };
  const openEdit   = (row) => { setForm({ ...row, modelId: row.modelId }); setModal({ id: row.id, title: 'Edit Bike' }); };

  const cols = [
    { key: 'engineNumber',  label: 'Engine No' },
    { key: 'chassisNumber', label: 'Chassis No' },
    { key: 'model',         label: 'Model',  render: r => r.model?.name || '—' },
    { key: 'color',         label: 'Color' },
    { key: 'status',        label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'manufactureYear', label: 'Year' },
    { key: 'salePrice',     label: 'Sale Price', render: r => fmtINR(r.salePrice) },
  ];

  return (
    <div>
      <PageHeader icon={Bike} title="Bikes" subtitle="Manage bike inventory" onAdd={openCreate} addLabel="Add Bike" />

      {/* Status summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {BIKE_STATUSES.map(s => (
          <StatCard key={s} label={s} value={bikes.filter(b => b.status === s).length} accent={STATUS_COLORS[s]?.bg || '#F1EFE8'} />
        ))}
      </div>

      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by engine no, chassis, color, model…">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {filtered.length} / {bikes.length}
          </span>
        </SearchBar>
        <Table
          cols={cols}
          rows={filtered}
          onEdit={openEdit}
          onDelete={row => setConfirm(row)}
          extraActions={row =>
            row.status === 'AVAILABLE' ? (
              <button onClick={() => handleBook(row)} style={{ background: '#FAEEDA', color: '#633806', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}>
                Book
              </button>
            ) : null
          }
        />
      </Card>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Engine Number *"><Input value={form.engineNumber || ''} onChange={e => set('engineNumber', e.target.value)} /></Field>
            <Field label="Chassis Number *"><Input value={form.chassisNumber || ''} onChange={e => set('chassisNumber', e.target.value)} /></Field>
            <Field label="Model *">
              <Select value={form.modelId || ''} onChange={e => set('modelId', e.target.value)}>
                <option value="">Select model</option>
                {models.map(m => <option key={m.id} value={m.id}>{m.name} — {m.brand}</option>)}
              </Select>
            </Field>
            <Field label="Color *"><Input value={form.color || ''} onChange={e => set('color', e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status || 'AVAILABLE'} onChange={e => set('status', e.target.value)}>
                {BIKE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Manufacture Year *"><Input type="number" value={form.manufactureYear || ''} onChange={e => set('manufactureYear', e.target.value)} /></Field>
            <Field label="Manufacture Month *">
              <Select value={form.manufactureMonth || ''} onChange={e => set('manufactureMonth', e.target.value)}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Registration No"><Input value={form.registrationNumber || ''} onChange={e => set('registrationNumber', e.target.value)} /></Field>
            <Field label="Purchase Price"><Input type="number" value={form.purchasePrice || ''} onChange={e => set('purchasePrice', e.target.value)} /></Field>
            <Field label="Sale Price"><Input type="number" value={form.salePrice || ''} onChange={e => set('salePrice', e.target.value)} /></Field>
            <Field label="Supplier" style={{ gridColumn: '1/-1' }}>
              <Select value={form.supplierId || ''} onChange={e => set('supplierId', e.target.value)}>
                <option value="">None</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} — {s.companyName}</option>)}
              </Select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete bike ${confirm.engineNumber}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
