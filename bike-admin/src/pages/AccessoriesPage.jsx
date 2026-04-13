import { useState, useEffect, useCallback } from 'react';
import { Wrench } from 'lucide-react';
import { toast } from 'react-toastify';
import { accessoriesApi } from '../api/services';
import { STATIC_BASE, fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Modal, FormGrid, Field,
  Input, Textarea, Button, Card, ConfirmDialog,
} from '../components/ui';

const EMPTY = {};

export default function AccessoriesPage() {
  const [items, setItems]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null);
  const [qtyModal, setQtyModal] = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [file, setFile]         = useState(null);
  const [qty, setQty]           = useState('');
  const [confirm, setConfirm]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await accessoriesApi.getAll();
      setItems(r.data || []); setFiltered(r.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(items.filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.unit?.toLowerCase().includes(q)
    ));
  }, [search, items]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== '') fd.append(k, v); });
      if (file) fd.append('imageUrl', file);
      if (modal.id) await accessoriesApi.update(modal.id, fd);
      else           await accessoriesApi.create(fd);
      toast.success(modal.id ? 'Accessory updated' : 'Accessory added');
      load(); setModal(null); setFile(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const saveQty = async () => {
    try {
      await accessoriesApi.updateStock(qtyModal.id, parseInt(qty));
      toast.success('Stock updated');
      load();
    } catch (err) { toast.error(err.message); }
    setQtyModal(null);
  };

  const handleDelete = async () => {
    try {
      await accessoriesApi.remove(confirm.id);
      toast.success('Accessory deleted');
      load();
    } catch (err) { toast.error(err.message); }
    setConfirm(null);
  };

  const cols = [
    { key: 'imageUrl', label: 'Image', render: r => r.imageUrl
        ? <img src={`${STATIC_BASE}${r.imageUrl}`} alt={r.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        : <div style={{ width: 36, height: 36, background: '#FBEAF0', borderRadius: 6 }} /> },
    { key: 'name',            label: 'Name' },
    { key: 'description',     label: 'Description', wrap: true, maxWidth: 200, render: r => <span style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</span> },
    { key: 'price',           label: 'Price', render: r => fmtINR(r.price) },
    { key: 'unit',            label: 'Unit' },
    { key: 'quantityInStock', label: 'Stock', render: r => <span style={{ fontWeight: 600, color: r.quantityInStock <= 5 ? '#E24B4A' : 'var(--text-primary)' }}>{r.quantityInStock}</span> },
  ];

  return (
    <div>
      <PageHeader icon={Wrench} title="Accessories" subtitle="Manage accessories inventory" onAdd={() => { setForm(EMPTY); setFile(null); setModal({ title: 'Add Accessory' }); }} addLabel="Add Accessory" />
      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search accessories…" />
        <Table
          cols={cols}
          rows={filtered}
          onEdit={r => { setForm({ ...r }); setFile(null); setModal({ id: r.id, title: 'Edit Accessory' }); }}
          onDelete={r => setConfirm(r)}
          extraActions={row => (
            <button onClick={() => { setQtyModal(row); setQty(row.quantityInStock); }} style={{ background: '#E1F5EE', color: '#085041', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', marginRight: 6, fontFamily: 'var(--font-sans)' }}>
              Stock
            </button>
          )}
        />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)}>
          <FormGrid>
            <Field label="Name *"><Input value={form.name || ''} onChange={e => set('name', e.target.value)} /></Field>
            <Field label="Unit *"><Input value={form.unit || ''} onChange={e => set('unit', e.target.value)} placeholder="PIECE, SET, BOX" /></Field>
            <Field label="Price *"><Input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} /></Field>
            <Field label="Quantity in Stock *"><Input type="number" value={form.quantityInStock || ''} onChange={e => set('quantityInStock', e.target.value)} /></Field>
            <Field label="Description *" style={{ gridColumn: '1/-1' }}>
              <Textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={2} />
            </Field>
            <Field label="Image" style={{ gridColumn: '1/-1' }}>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, fontFamily: 'var(--font-sans)' }} />
            </Field>
          </FormGrid>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          </div>
        </Modal>
      )}

      {qtyModal && (
        <Modal title={`Update stock — ${qtyModal.name}`} onClose={() => setQtyModal(null)} width={380}>
          <Field label="New quantity in stock">
            <Input type="number" value={qty} onChange={e => setQty(e.target.value)} />
          </Field>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" onClick={() => setQtyModal(null)}>Cancel</Button>
            <Button onClick={saveQty}>Update Stock</Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete "${confirm.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
