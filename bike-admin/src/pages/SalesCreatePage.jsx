import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, customersApi, bikesApi, accessoriesApi } from '../api/services';
import { PAYMENT_TYPES, PAYMENT_METHODS, fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, FormGrid,
  Field, Input, Select, Button, Card,
} from '../components/ui';

const EMPTY_FORM = { items: [], paymentType: 'Full', paymentMethod: 'CASH', pendingAmount: 0, notes: '' };

export default function SalesCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledRef = useRef(false);
  const prefillBikeId = location.state?.prefillBikeId || null;
  const [customers, setCustomers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [prefilledBike, setPrefilledBike] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [custSearch, setCustSearch] = useState('');
  const [custResults, setCustResults] = useState([]);
  const [newCust, setNewCust] = useState({});
  const [custLoading, setCustLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [c, b, a] = await Promise.all([
        customersApi.getAll(),
        bikesApi.getAll(),
        accessoriesApi.getAll(),
      ]);
      const allBikes = b.data || [];
      setCustomers(c.data || []);
      setBikes(allBikes.filter(x => x.status === 'AVAILABLE'));
      if (prefillBikeId) {
        setPrefilledBike(allBikes.find(x => x.id === prefillBikeId) || null);
      }
      setAccessories(a.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [prefillBikeId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!prefillBikeId || prefilledRef.current || !prefilledBike) return;

    const selectedBike = prefilledBike;

    setForm(f => {
      const alreadyExists = (f.items || []).some(it => it.itemType === 'BIKE' && it.bikeId === prefillBikeId);
      if (alreadyExists) return f;

      return {
        ...f,
        items: [
          ...f.items,
          {
            itemType: 'BIKE',
            bikeId: selectedBike.id,
            accessoryId: '',
            quantity: 1,
            unitPrice: selectedBike.exShowroomPrice || 0,
            discountAmount: 0,
            taxRate: 18,
          },
        ],
      };
    });

    prefilledRef.current = true;
    toast.success('Reserved bike added to sale items');
  }, [prefillBikeId, prefilledBike]);

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const selectedCustomer = customers.find(c => c.id === form.customerId) || null;

  const searchCustomers = async (q) => {
    if (!q.trim()) {
      setCustResults([]);
      return;
    }
    try {
      const res = await customersApi.search(q);
      setCustResults(res.data || []);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const selectCustomer = (cust) => {
    setF('customerId', cust.id);
    setCustSearch('');
    setCustResults([]);
  };

  const createNewCustomer = async () => {
    if (!newCust.name || !newCust.email || !newCust.phone) {
      toast.error('Name, email, and phone are required');
      return;
    }

    setCustLoading(true);
    try {
      const res = await customersApi.create({
        ...newCust,
        addressLine1: 'N/A',
        city: 'N/A',
        state: 'N/A',
        postalCode: '000000',
        country: 'India',
      });
      const createdCust = res.data;
      setF('customerId', createdCust.id);
      toast.success('Customer created and selected');
      setCustSearch('');
      setCustResults([]);
      setNewCust({});
      await load();
    } catch (err) {
      toast.error(err.message);
    }
    setCustLoading(false);
  };

  const addItem = () => setForm(f => ({
    ...f,
    items: [...f.items, { itemType: 'BIKE', bikeId: '', accessoryId: '', quantity: 1, unitPrice: 0, discountAmount: 0, taxRate: 18 }],
  }));

  const updateItem = (i, key, val) => setForm(f => {
    const items = [...f.items];
    const currentItem = { ...items[i], [key]: val };

    if (key === 'bikeId' && val) {
      const selectedBike = [...bikes, ...(prefilledBike ? [prefilledBike] : [])].find(b => b.id === val);
      if (selectedBike) currentItem.unitPrice = selectedBike.exShowroomPrice || 0;
    }

    if (key === 'accessoryId' && val) {
      const selectedAccessory = accessories.find(a => a.id === val);
      if (selectedAccessory) currentItem.unitPrice = selectedAccessory.price || 0;
    }

    items[i] = currentItem;
    return { ...f, items };
  });

  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const total = (form.items || []).reduce((sum, it) => {
    const price = (parseFloat(it.unitPrice) || 0) - (parseFloat(it.discountAmount) || 0);
    const qty = parseInt(it.quantity) || 1;
    return sum + price * qty * (1 + (parseFloat(it.taxRate) || 0) / 100);
  }, 0);

  const save = async () => {
    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (form.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: form.customerId,
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        pendingAmount: parseFloat(form.pendingAmount) || 0,
        notes: form.notes || '',
        items: form.items.map(it => ({
          itemType: it.itemType,
          bikeId: it.itemType === 'BIKE' ? it.bikeId : null,
          accessoryId: it.itemType === 'ACCESSORY' ? it.accessoryId : null,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice),
          discountAmount: parseFloat(it.discountAmount) || 0,
          taxRate: parseFloat(it.taxRate) || 0,
        })),
      };

      await salesApi.create(payload);
      toast.success('Sale created!');
      navigate('/sales');
    } catch (err) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading create sale form...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/sales')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--brand-dark)', fontWeight: 500,
            fontFamily: 'var(--font-sans)', padding: 0,
          }}
        >
          <ArrowLeft size={18} /> Back to Sales
        </button>
      </div>

      <PageHeader icon={ShoppingCart} title="Create Sale" subtitle="Select customer, add items, and generate the invoice" />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ border: '0.5px solid var(--border-secondary)', borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 14, margin: '0 0 12px 0' }}>Customer</h2>
            <div style={{ marginBottom: 12 }}>
              <SearchBar value={custSearch} onChange={value => { setCustSearch(value); searchCustomers(value); }} placeholder="Search by name, phone, or email…" />
            </div>

            {custResults.length > 0 && (
              <div style={{ border: '0.5px solid var(--border-secondary)', borderRadius: 10, maxHeight: 220, overflowY: 'auto', marginBottom: 12 }}>
                {custResults.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    style={{
                      width: '100%', padding: '10px 12px', textAlign: 'left', border: 'none',
                      background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer',
                      borderBottom: i < custResults.length - 1 ? '0.5px solid var(--border-secondary)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.email} • {c.phone}</div>
                  </button>
                ))}
              </div>
            )}

            {selectedCustomer && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 10, background: 'var(--bg-secondary)', border: '0.5px solid var(--border-secondary)' }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 6 }}>Selected Customer</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedCustomer.email}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedCustomer.phone}</div>
              </div>
            )}

            <div style={{ borderTop: '0.5px solid var(--border-secondary)', paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Create New Customer</div>
              <FormGrid>
                <Field label="Name *">
                  <Input placeholder="Full Name" value={newCust.name || ''} onChange={e => setNewCust(n => ({ ...n, name: e.target.value }))} />
                </Field>
                <Field label="Email *">
                  <Input placeholder="email@example.com" value={newCust.email || ''} onChange={e => setNewCust(n => ({ ...n, email: e.target.value }))} />
                </Field>
                <Field label="Phone *">
                  <Input placeholder="Phone Number" value={newCust.phone || ''} onChange={e => setNewCust(n => ({ ...n, phone: e.target.value }))} />
                </Field>
              </FormGrid>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <Button onClick={createNewCustomer} disabled={custLoading}>{custLoading ? 'Creating…' : 'Create & Select'}</Button>
              </div>
            </div>
          </div>

          <div style={{ border: '0.5px solid var(--border-secondary)', borderRadius: 12, padding: 16 }}>
            <h2 style={{ fontSize: 14, margin: '0 0 12px 0' }}>Sale Details</h2>
            <FormGrid>
              <Field label="Payment Type *">
                <Select value={form.paymentType} onChange={e => setF('paymentType', e.target.value)}>
                  {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Payment Method *">
                <Select value={form.paymentMethod} onChange={e => setF('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label="Pending Amount">
                <Input type="number" value={form.pendingAmount} onChange={e => setF('pendingAmount', e.target.value)} />
              </Field>
              <Field label="Notes" style={{ gridColumn: '1/-1' }}>
                <Input value={form.notes || ''} onChange={e => setF('notes', e.target.value)} />
              </Field>
            </FormGrid>
          </div>
        </div>
      </Card>

      <Card style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Items</span>
          <Button variant="secondary" size="sm" onClick={addItem}>+ Add Item</Button>
        </div>

        {form.items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, padding: '1rem 0' }}>No items added yet</div>
        )}

        {form.items.map((item, i) => {
          const isPrefilledBikeItem = Boolean(prefillBikeId && item.itemType === 'BIKE' && item.bikeId === prefillBikeId);
          const bikeOptions = isPrefilledBikeItem && prefilledBike ? [prefilledBike] : bikes;

          return (
          <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, marginBottom: 12, border: '0.5px solid var(--border-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Item {i + 1}
              </div>
              <button
                onClick={() => removeItem(i)}
                style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger-fg)',
                  border: 'none',
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Remove item"
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 4 }}>
              <Field label="Type">
                <Select value={item.itemType} onChange={e => updateItem(i, 'itemType', e.target.value)} disabled={isPrefilledBikeItem}>
                  <option value="BIKE">BIKE</option>
                  <option value="ACCESSORY">ACCESSORY</option>
                </Select>
              </Field>

              <Field label={item.itemType === 'BIKE' ? 'Bike *' : 'Accessory *'}>
                {item.itemType === 'BIKE' ? (
                  <Select value={item.bikeId} onChange={e => updateItem(i, 'bikeId', e.target.value)} disabled={isPrefilledBikeItem}>
                    <option value="">Select bike</option>
                    {bikeOptions.map(b => <option key={b.id} value={b.id}>{b.model?.name} — {b.engineNumber} — {b.color}</option>)}
                  </Select>
                ) : (
                  <Select value={item.accessoryId} onChange={e => updateItem(i, 'accessoryId', e.target.value)}>
                    <option value="">Select accessory</option>
                    {accessories.map(a => <option key={a.id} value={a.id}>{a.name} (Stock: {a.quantityInStock})</option>)}
                  </Select>
                )}
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
              <Field label="Qty"><Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
              <Field label="Unit Price"><Input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} /></Field>
              <Field label="Discount"><Input type="number" value={item.discountAmount} onChange={e => updateItem(i, 'discountAmount', e.target.value)} /></Field>
              <Field label="Tax %"><Input type="number" value={item.taxRate} onChange={e => updateItem(i, 'taxRate', e.target.value)} /></Field>
            </div>
          </div>
        );})}
      </Card>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Estimated Total (incl. tax)</span>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{fmtINR(total)}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => navigate('/sales')}>Cancel</Button>
        <Button onClick={save} disabled={saving || form.items.length === 0}>{saving ? 'Creating…' : 'Create Sale'}</Button>
      </div>
    </div>
  );
}