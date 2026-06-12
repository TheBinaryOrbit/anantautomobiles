import { useState, useEffect, useCallback } from 'react';
import { Bike, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { bikesApi, bikeModelsApi, suppliersApi } from '../api/services';
import { BIKE_STATUSES, MONTHS, STATUS_COLORS, STOCK_TYPES, fmtINR, VIN_YEAR_MAP } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Badge, Modal, FormGrid,
  Field, Input, Select, Button, Card, StatCard, ConfirmDialog, StockBadge 
} from '../components/ui';

const EMPTY = { status: 'AVAILABLE', stockType: 'IN_STOCK', manufactureMonth: '' };

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
      const [b, m] = await Promise.all([
        bikesApi.getAll(),
        bikeModelsApi.getAll(),
      ]);
      setBikes(b.data || []);
      setFiltered(b.data || []);
      setModels(m.data || []);
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

    if (name === 'engineNumber' && (!value || value.trim() === '')) {
      error = 'Engine Number is required.';
    }
    if (name === 'chassisNumber') {
      if (!value || value.trim() === '') {
        error = 'Chassis Number is required.';
      } else if (value.length !== 17) {
        error = 'Chassis Number must be 17 characters.';
      }
    }
    if (name === 'manufactureYear' && (!value || String(value).trim() === '')) {
      error = 'Manufacture Year is required.';
    }
    if (name === 'manufactureMonth' && (!value || String(value).trim() === '')) {
      error = 'Manufacture Month is required.';
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
    const nextErrors = {};

    if (!values.modelId || String(values.modelId).trim() === '') nextErrors.modelId = 'Model is required.';
    if (!values.color || String(values.color).trim() === '') nextErrors.color = 'Color is required.';

    if (!values.engineNumber || String(values.engineNumber).trim() === '') nextErrors.engineNumber = 'Engine Number is required.';
    if (!values.chassisNumber || String(values.chassisNumber).trim() === '') nextErrors.chassisNumber = 'Chassis Number is required.';
    else if (String(values.chassisNumber).length !== 17) nextErrors.chassisNumber = 'Chassis Number must be 17 characters.';
    if (!values.manufactureYear || Number(values.manufactureYear) < 1900) nextErrors.manufactureYear = 'Manufacture Year is required.';
    if (!values.manufactureMonth || String(values.manufactureMonth).trim() === '') nextErrors.manufactureMonth = 'Manufacture Month is required.';

    return nextErrors;
  };

  const set = (key, val) => {
    setForm(f => {
      const newForm = { ...f, [key]: val };

      // Auto-fill year from chassis number
      if (key === 'chassisNumber' && val.length === 17) {
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

    validateField(key, val);
  };

  const save = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error('Please fix the errors before saving.');
      return;
    }
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
      };
      if (modal.id) await bikesApi.update(modal.id, payload);
      toast.success('Bike updated');
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

  const openCreate = () => { navigate('/purchases/new'); };
  const openEdit   = (row) => { setForm({ ...row, modelId: row.modelId }); setErrors({}); setModal({ id: row.id, title: 'Edit Bike' }); };

  // Group filtered results by model
  const grouped = filtered.reduce((acc, b) => {
    const mName = b.model?.name || 'Unknown Model';
    if (!acc[mName]) acc[mName] = [];
    acc[mName].push(b);
    return acc;
  }, {});

  const cols = [
    { key: 'engineNumber',  label: 'Engine No' },
    { key: 'chassisNumber', label: 'Chassis No' },
    { key: 'color',         label: 'Color' },
    { key: 'status',        label: 'Status', render: r => <Badge label={r.status} /> },
    { key: 'manufactureYear', label: 'Year' },
  ];

  return (
    <div>
      <PageHeader icon={Bike} title="Bikes" subtitle="Manage bike inventory" onAdd={openCreate} addLabel="New Purchase" />

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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 16 }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              No bikes found matching your search.
            </div>
          ) : (
            Object.entries(grouped).map(([modelName, items]) => (
              <div key={modelName}>
                <div style={{ 
                  padding: '8px 12px', 
                  background: '#f1f5f9', 
                  borderRadius: '6px 6px 0 0', 
                  border: '1px solid #e2e8f0',
                  borderBottom: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{modelName}</span>
                  <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text-secondary)' }}>
                    {items.length} Units
                  </span>
                </div>
                <Table
                  cols={cols}
                  rows={items}
                  onEdit={openEdit}
                  onDelete={row => setConfirm(row)}
                  style={{ borderRadius: '0 0 6px 6px' }}
                  extraActions={row => (
                    <>
                      <button 
                        onClick={() => navigate(`/bikes/${row.id}`)}
                        style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', marginRight: 6 }}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      
                    </>
                  )}
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Create / Edit Modal */}
      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
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
            <Field label="Engine Number *" error={errors.engineNumber}><Input value={form.engineNumber || ''} onChange={e => set('engineNumber', e.target.value)} /></Field>
            <Field label="Chassis Number *" error={errors.chassisNumber}><Input value={form.chassisNumber || ''} onChange={e => set('chassisNumber', e.target.value)} maxLength={17} /></Field>
            <Field label="Manufacture Year *"><Input type="number" value={form.manufactureYear || ''} onChange={e => set('manufactureYear', e.target.value)} readOnly /></Field>
            <Field label="Manufacture Month *">
              <Select value={form.manufactureMonth || ''} onChange={e => set('manufactureMonth', e.target.value)}>
                <option value="">Select month</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Registration No"><Input value={form.registrationNumber || ''} onChange={e => set('registrationNumber', e.target.value)} /></Field>
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
