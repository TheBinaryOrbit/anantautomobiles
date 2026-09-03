import { useState, useEffect, useCallback } from 'react';
import { Layers } from 'lucide-react';
import { toast } from 'react-toastify';
import { bikeModelsApi } from '../api/services';
import { STATIC_BASE, fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Modal, FormGrid, Field,
  Input, Textarea, Button, Card, ConfirmDialog,
} from '../components/ui';

const EMPTY = {};

export default function BikeModelsPage() {
  const [models, setModels]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [file, setFile]         = useState(null);
  const [brochure, setBrochure] = useState(null);
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await bikeModelsApi.getAll();
      setModels(r.data || []); setFiltered(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(models.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.modelName?.toLowerCase().includes(q) ||
      m.brand?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q)
    ));
  }, [search, models]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // imageUrl / brochureUrl are server-managed paths - only send them as files
  const SERVER_MANAGED = ['imageUrl', 'brochureUrl'];

  const buildFD = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (SERVER_MANAGED.includes(k)) return;
      if (v !== undefined && v !== '') fd.append(k, v);
    });
    if (file) fd.append('imageUrl', file);
    if (brochure) fd.append('brochureUrl', brochure);
    return fd;
  };

  const save = async () => {
    // Validate tax rates
    const rates = ['cgstRate', 'sgstRate', 'igstRate', 'cessRate'];
    for (const r of rates) {
      if (parseFloat(form[r]) > 100) {
        toast.error(`${r.replace('Rate', '').toUpperCase()} cannot exceed 100%`);
        return;
      }
    }

    if (!modal.id && !file) {
      toast.error('Please upload an image for the model');
      return;
    }

    if (brochure && brochure.type !== 'application/pdf') {
      toast.error('Brochure must be a PDF file');
      return;
    }

    setLoading(true);
    try {
      const fd = buildFD();
      if (modal.id) await bikeModelsApi.update(modal.id, fd);
      else           await bikeModelsApi.create(fd);
      toast.success(modal.id ? 'Model updated' : 'Model added');
      load(); setModal(null); setFile(null); setBrochure(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      await bikeModelsApi.remove(confirm.id);
      toast.success('Model deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const openCreate = () => { setForm(EMPTY); setFile(null); setBrochure(null); setModal({ title: 'Add Bike Model' }); };
  const openEdit   = (row) => { setForm({ ...row }); setFile(null); setBrochure(null); setModal({ id: row.id, title: 'Edit Bike Model' }); };

  const cols = [
    { key: 'imageUrl', label: 'Image', render: r => r.imageUrl
        ? <img src={`${STATIC_BASE}${r.imageUrl}`} alt={r.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', background: '#f0f0f0' }} onError={e => { e.target.style.display = 'none'; }} />
        : <div style={{ width: 36, height: 36, background: 'var(--brand-light)', borderRadius: 6 }} /> },
    { key: 'name',          label: 'Name' },
    { key: 'modelName',     label: 'Model Name (Nickname)' },
    { key: 'brand',         label: 'Brand' },
    { key: 'category',      label: 'Category' },
    { key: 'engineCapacity',label: 'Engine', render: r => r.engineCapacity ? `${r.engineCapacity}cc` : '—' },
    { key: 'purchasePrice',  label: 'Purchase Price', render: r => fmtINR(r.purchasePrice) },
    { key: 'brochureUrl',   label: 'Brochure', render: r => r.brochureUrl
        ? <a href={`${STATIC_BASE}${r.brochureUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-dark)', fontWeight: 600, fontSize: 12 }}>View PDF</a>
        : <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span> },
    { key: 'cgstRate',      label: 'CGST%', render: r => r.cgstRate ? `${r.cgstRate}%` : '0%' },
    { key: 'sgstRate',      label: 'SGST%', render: r => r.sgstRate ? `${r.sgstRate}%` : '0%' },
  ];

  return (
    <div>
      <PageHeader icon={Layers} title="Bike Models" subtitle="Manage bike model catalogue" onAdd={openCreate} addLabel="Add Model" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, brand, category…" />
        <Table cols={cols} rows={filtered} onEdit={openEdit} onDelete={row => setConfirm(row)} />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)} width={680}>
          <FormGrid>
            <Field label="Name *"><Input value={form.name || ''} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Model Name (Nickname) *"><Input value={form.modelName || ''} onChange={e => set('modelName', e.target.value)} /></Field>
            <Field label="Brand *"><Input value={form.brand || ''} onChange={e => set('brand', e.target.value)} /></Field>
            <Field label="Category *"><Input value={form.category || ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Commuter, Sports" /></Field>
            <Field label="Fuel Type *"><Input value={form.fuelType || ''} onChange={e => set('fuelType', e.target.value)} /></Field>
            <Field label="Remark" style={{ gridColumn: '1/-1' }}>
              <Textarea value={form.remark || form.description || ''} onChange={e => set('remark', e.target.value)} rows={2} />
            </Field>
            <Field label="Image *" style={{ gridColumn: '1/-1' }}>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }} />
              {modal.id && !file && form.imageUrl && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Current: {form.imageUrl} — upload new to replace</div>
              )}
            </Field>
            <Field label="Brochure (PDF, optional)" style={{ gridColumn: '1/-1' }}>
              <input type="file" accept="application/pdf" onChange={e => setBrochure(e.target.files[0] || null)} style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }} />
              {brochure ? (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Selected: {brochure.name}</div>
              ) : form.brochureUrl ? (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Current:{' '}
                  <a href={`${STATIC_BASE}${form.brochureUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-dark)' }}>view brochure</a>
                  {' '}— upload new to replace
                </div>
              ) : null}
            </Field>
            <Field label="Engine Capacity (cc) *"><Input type="number" value={form.engineCapacity || ''} onChange={e => set('engineCapacity', e.target.value)} /></Field>
            <Field label="Launch Year *"><Input type="number" value={form.launchYear || ''} onChange={e => set('launchYear', e.target.value)} /></Field>
            <Field label="Mileage (kmpl) *"><Input type="number" value={form.mileage || ''} onChange={e => set('mileage', e.target.value)} /></Field>
            <Field label="Weight (kg)"><Input type="number" value={form.weight || ''} onChange={e => set('weight', e.target.value)} /></Field>
            <Field label="Ex-Showroom Price *"><Input type="number" value={form.exShowroomPrice || ''} onChange={e => set('exShowroomPrice', e.target.value)} /></Field>
            <Field label="RTO Charges (%) *"><Input type="number" value={form.rtoCharges || ''} onChange={e => set('rtoCharges', e.target.value)} /></Field>
            <Field label="Insurance Charges *"><Input type="number" value={form.insuranceCharges || ''} onChange={e => set('insuranceCharges', e.target.value)} /></Field>
            <Field label="Other Charges *"><Input type="number" value={form.otherCharges || ''} onChange={e => set('otherCharges', e.target.value)} /></Field>
            <Field label="Purchase Price *"><Input type="number" value={form.purchasePrice || ''} onChange={e => set('purchasePrice', e.target.value)} /></Field>
            <Field label="CGST Rate (%) *"><Input type="number" value={form.cgstRate || ''} onChange={e => set('cgstRate', e.target.value)} /></Field>
            <Field label="SGST Rate (%) *"><Input type="number" value={form.sgstRate || ''} onChange={e => set('sgstRate', e.target.value)} /></Field>
            <Field label="IGST Rate (%) *"><Input type="number" value={form.igstRate || ''} onChange={e => set('igstRate', e.target.value)} /></Field>
            <Field label="Cess Rate (%) *"><Input type="number" value={form.cessRate || ''} onChange={e => set('cessRate', e.target.value)} /></Field>
            <Field label="HSN Code *"><Input value={form.hsnCode || ''} onChange={e => set('hsnCode', e.target.value)} /></Field>
          </FormGrid>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete model "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
