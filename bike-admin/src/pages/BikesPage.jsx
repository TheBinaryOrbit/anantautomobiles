import { useState, useEffect, useCallback } from 'react';
import { Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bikesApi, bikeModelsApi, suppliersApi } from '../api/services';
import { BIKE_STATUSES, MONTHS, STATUS_COLORS, STOCK_TYPES, fmtINR, VIN_YEAR_MAP } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Badge, Modal, FormGrid,
  Field, Input, Select, Button, Card, StatCard, ConfirmDialog, StockBadge 
} from '../components/ui';

const EMPTY = { status: 'AVAILABLE', stockType: 'IN_STOCK', manufactureMonth: 'JANUARY' };

export default function BikesPage() {
  const navigate = useNavigate();
  const [bikes, setBikes]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [models, setModels]     = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [modal, setModal]       = useState(null);   // null | { id?, title }
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
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

  const validateField = (name, value) => {
    let error = '';
    const stockType = form.stockType || 'IN_STOCK';

    if (name === 'engineNumber' && stockType === 'IN_STOCK' && (!value || value.trim() === '')) {
      error = 'Engine Number is required.';
    }
    if (name === 'chassisNumber' && stockType === 'IN_STOCK') {
      if (!value || value.trim() === '') {
        error = 'Chassis Number is required.';
      } else if (value.length !== 17) {
        error = 'Chassis Number must be 17 characters.';
      }
    }
    if (name === 'manufactureYear' && stockType === 'IN_STOCK' && (!value || String(value).trim() === '')) {
      error = 'Manufacture Year is required.';
    }
    if (name === 'manufactureMonth' && stockType === 'IN_STOCK' && (!value || String(value).trim() === '')) {
      error = 'Manufacture Month is required.';
    }
    if (name === 'purchasePrice' && stockType === 'IN_STOCK' && (!value || Number(value) <= 0)) {
      error = 'Purchase Price is required.';
    }
    if (name === 'exShowroomPrice' && (!value || Number(value) <= 0)) {
      error = 'Ex-Showroom Price is required.';
    }
    if (name === 'color' && (!value || value.trim() === '')) {
      error = 'Color is required.';
    }
    if (name === 'modelId' && (!value || value.trim() === '')) {
      error = 'Model is required.';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = (values) => {
    const stockType = values.stockType || 'IN_STOCK';
    const nextErrors = {};

    if (!values.modelId || String(values.modelId).trim() === '') nextErrors.modelId = 'Model is required.';
    if (!values.color || String(values.color).trim() === '') nextErrors.color = 'Color is required.';
    if (!values.exShowroomPrice || Number(values.exShowroomPrice) <= 0) nextErrors.exShowroomPrice = 'Ex-Showroom Price is required.';

    if (stockType === 'IN_STOCK') {
      if (!values.engineNumber || String(values.engineNumber).trim() === '') nextErrors.engineNumber = 'Engine Number is required.';
      if (!values.chassisNumber || String(values.chassisNumber).trim() === '') nextErrors.chassisNumber = 'Chassis Number is required.';
      else if (String(values.chassisNumber).length !== 17) nextErrors.chassisNumber = 'Chassis Number must be 17 characters.';
      if (!values.manufactureYear || Number(values.manufactureYear) < 1900) nextErrors.manufactureYear = 'Manufacture Year is required.';
      if (!values.manufactureMonth || String(values.manufactureMonth).trim() === '') nextErrors.manufactureMonth = 'Manufacture Month is required.';
      if (!values.purchasePrice || Number(values.purchasePrice) <= 0) nextErrors.purchasePrice = 'Purchase Price is required.';
    }

    return nextErrors;
  };

  const set = (key, val) => {
    setForm(f => {
      const newForm = { ...f, [key]: val };
      const stockType = key === 'stockType' ? val : (newForm.stockType || 'IN_STOCK');

      if (key === 'stockType' && val === 'PRE_ORDER') {
        newForm.engineNumber = '';
        newForm.chassisNumber = '';
        newForm.manufactureYear = '';
        newForm.manufactureMonth = '';
        newForm.purchasePrice = '';
      }

      // Auto-fill year from chassis number
      if (stockType === 'IN_STOCK' && key === 'chassisNumber' && val.length === 17) {
        const yearChar = val.charAt(9).toUpperCase();
        const year = VIN_YEAR_MAP[yearChar];
        if (year) {
          newForm.manufactureYear = year;
        } else {
          toast.warn(`Could not determine year from VIN character: ${yearChar}`);
        }
      }
      return newForm;
    });

    const nextStockType = key === 'stockType' ? val : (form.stockType || 'IN_STOCK');
    if (nextStockType === 'PRE_ORDER' && ['engineNumber', 'chassisNumber', 'manufactureYear', 'manufactureMonth', 'purchasePrice'].includes(key)) {
      setErrors(prev => ({ ...prev, [key]: '' }));
      return;
    }

    validateField(key, val);
  };

  const save = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      console.log('Validation errors:', nextErrors);
      toast.error('Please fix the errors before saving.');
      return;
    }
    setLoading(true);
    try {
      const isPreOrder = (form.stockType || 'IN_STOCK') === 'PRE_ORDER';
      const payload = {
        stockType: form.stockType || 'IN_STOCK',
        engineNumber: isPreOrder ? null : form.engineNumber,
        chassisNumber: isPreOrder ? null : form.chassisNumber,
        modelId: form.modelId,
        color: form.color,
        status: form.status,
        manufactureYear: isPreOrder ? null : parseInt(form.manufactureYear),
        manufactureMonth: isPreOrder ? null : form.manufactureMonth,
        registrationNumber: form.registrationNumber,
        purchasePrice: isPreOrder ? null : (form.purchasePrice ? parseInt(form.purchasePrice) : null),
        exShowroomPrice: form.exShowroomPrice ? parseInt(form.exShowroomPrice) : null,
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

  const handleCreateSale = (row) => {
    navigate('/sales/new', { state: { prefillBikeId: row.id } });
  };

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ title: 'Add Bike' }); };
  const openEdit   = (row) => { setForm({ ...row, modelId: row.modelId }); setErrors({}); setModal({ id: row.id, title: 'Edit Bike' }); };

  const cols = [
    { key: 'stockType',     label: 'Stock Type' , render: r => <StockBadge label={r.stockType} /> },
    { key: 'engineNumber',  label: 'Engine No' },
    { key: 'chassisNumber', label: 'Chassis No' },
    { key: 'model',         label: 'Model',  render: r => r.model?.name || '—' },
    { key: 'color',         label: 'Color' },
    { key: 'status',        label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'manufactureYear', label: 'Year' },
    { key: 'exShowroomPrice',     label: 'Ex-Showroom Price', render: r => fmtINR(r.exShowroomPrice) },
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
          extraActions={row => (
            <>
              {row.status === 'AVAILABLE' && (
                <button onClick={() => handleBook(row)} style={{ background: '#FAEEDA', color: '#633806', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}>
                  Book
                </button>
              )}
              {row.status === 'RESERVED' && (
                <button onClick={() => handleCreateSale(row)} style={{ background: '#E6F1FB', color: '#0C447C', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}>
                  Create Sale
                </button>
              )}
            </>
          )}
        />
      </Card>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
            <Field label="Stock Type *">
              <Select value={form.stockType || 'IN_STOCK'} onChange={e => set('stockType', e.target.value)}>
                {STOCK_TYPES.map(type => <option key={type} value={type}>{type === 'IN_STOCK' ? 'In Stock' : 'Pre Order'}</option>)}
              </Select>
            </Field>
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
            <Field label="Ex-Showroom Price *"><Input type="number" value={form.exShowroomPrice || ''} onChange={e => set('exShowroomPrice', e.target.value)} /></Field>
            {form.stockType !== 'PRE_ORDER' && (
              <>
                <Field label="Engine Number *" error={errors.engineNumber}><Input value={form.engineNumber || ''} onChange={e => set('engineNumber', e.target.value)} /></Field>
                <Field label="Chassis Number *" error={errors.chassisNumber}><Input value={form.chassisNumber || ''} onChange={e => set('chassisNumber', e.target.value)} maxLength={17} /></Field>
                <Field label="Manufacture Year *"><Input type="number" value={form.manufactureYear || ''} onChange={e => set('manufactureYear', e.target.value)} readOnly /></Field>
                <Field label="Manufacture Month *">
                  <Select value={form.manufactureMonth || ''} onChange={e => set('manufactureMonth', e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </Select>
                </Field>
                <Field label="Registration No"><Input value={form.registrationNumber || ''} onChange={e => set('registrationNumber', e.target.value)} /></Field>
                <Field label="Purchase Price *"><Input type="number" value={form.purchasePrice || ''} onChange={e => set('purchasePrice', e.target.value)} /></Field>
                <Field label="Supplier" style={{ gridColumn: '1/-1' }}>
                  <Select value={form.supplierId || ''} onChange={e => set('supplierId', e.target.value)}>
                    <option value="">None</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} — {s.companyName}</option>)}
                  </Select>
                </Field>
              </>
            )}
          </FormGrid>
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
