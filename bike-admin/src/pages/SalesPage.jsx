import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, customersApi, bikesApi, accessoriesApi } from '../api/services';
import { SALE_STATUSES, PAYMENT_TYPES, PAYMENT_METHODS, STATUS_COLORS, fmtINR, STATIC_BASE } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Badge, Modal, FormGrid,
  Field, Input, Select, Button, Card, StatCard,
} from '../components/ui';

const EMPTY_FORM = { 
  items: [], 
  paymentType: 'FULL_PAYMENT', 
  paymentMethod: 'CASH', 
  pendingAmount: 0, 
  notes: '', 
  financeCompany: '',
  financeExecutiveName: '',
  financeExecutivePhone: ''
};

export default function SalesPage() {
  const navigate = useNavigate();
  const [sales, setSales]         = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [customers, setCustomers] = useState([]);
  const [bikes, setBikes]         = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [custModal, setCustModal] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [custResults, setCustResults] = useState([]);
  const [newCust, setNewCust] = useState({});
  const [custLoading, setCustLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, c, b, a] = await Promise.all([
        salesApi.getAll(),
        customersApi.getAll(),
        bikesApi.getAll(),
        accessoriesApi.getAll(),
      ]);
      setSales(s.data || []);
      setFiltered(s.data || []);
      setCustomers(c.data || []);
      setBikes((b.data || []).filter(x => x.status === 'AVAILABLE'));
      setAccessories(a.data || []);
    } catch (err) { toast.error(err.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let f = sales;
    if (statusFilter !== 'ALL') f = f.filter(s => s.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(s =>
        s.customer?.name?.toLowerCase().includes(q) ||
        s.saleNumber?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
      );
    }
    setFiltered(f);
  }, [search, statusFilter, sales]);

  const searchCustomers = async (q) => {
    if (!q.trim()) {
      setCustResults([]);
      return;
    }
    try {
      const res = await customersApi.search(q);
      setCustResults(res.data || []);
    } catch (err) { toast.error(err.message); }
  };

  const selectCustomer = (cust) => {
    setF('customerId', cust.id);
    setCustModal(false);
    setCustSearch('');
    setCustResults([]);
  };

  const createNewCustomer = async () => {
    if (!newCust.name || !newCust.email || !newCust.phone || !newCust.addressLine1 || !newCust.city || !newCust.state || !newCust.postalCode || !newCust.dob) {
      toast.error('All required fields (*) must be filled');
      return;
    }
    if (!newCust.aadhaarNumber && !newCust.panNumber) {
      toast.error('At least one identity document (Aadhaar or PAN) is required');
      return;
    }

    setCustLoading(true);
    try {
      const res = await customersApi.create({
        ...newCust,
        country: 'India',
      });
      const createdCust = res.data;
      setF('customerId', createdCust.id);
      toast.success('Customer created and selected');
      setCustModal(false);
      setCustSearch('');
      setCustResults([]);
      setNewCust({});
    } catch (err) { toast.error(err.message); }
    setCustLoading(false);
  };

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const addItem = () => setForm(f => ({
    ...f, items: [...f.items, { itemType: 'BIKE', bikeId: '', accessoryId: '', quantity: 1, unitPrice: 0, discountAmount: 0, taxRate: 18 }]
  }));

  const updateItem = (i, key, val) => setForm(f => {
    const items = [...f.items];
    const currentItem = { ...items[i], [key]: val };

    if (key === 'bikeId' && val) {
      const selectedBike = bikes.find(b => b.id === val);
      if (selectedBike) {
        currentItem.unitPrice = selectedBike.exShowroomPrice || 0;
      }
    }

    if (key === 'accessoryId' && val) {
      const selectedAccessory = accessories.find(a => a.id === val);
      if (selectedAccessory) {
        currentItem.unitPrice = selectedAccessory.price || 0;
      }
    }

    items[i] = currentItem;
    return { ...f, items };
  });

  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const total = (form.items || []).reduce((sum, it) => {
    const price = (parseFloat(it.unitPrice) || 0) - (parseFloat(it.discountAmount) || 0);
    const qty   = parseInt(it.quantity) || 1;
    // Price is already inclusive of tax and no extras are added.
    return sum + price * qty;
  }, 0);

  const save = async () => {
    if (!form.customerId) { toast.error('Please select a customer'); return; }
    if (form.items.length === 0) { toast.error('Please add at least one item'); return; }
    setLoading(true);
    try {
      const payload = {
        customerId: form.customerId,
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        pendingAmount: parseFloat(form.pendingAmount) || 0,
        notes: form.notes || '',
        financeCompany: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeCompany : null,
        financeExecutiveName: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeExecutiveName : null,
        financeExecutivePhone: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeExecutivePhone : null,
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
      load(); setModal(null);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  const openViewModal = (sale) => {
    navigate(`/sales/${sale.id}`);
  };

  const handleDeleteSale = async () => {
    try {
      await salesApi.delete(confirmDelete.id);
      toast.success('Sale deleted successfully');
      load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete sale');
    }
    setConfirmDelete(null);
  };

  const cols = [
    { key: 'saleNumber',    label: 'Sale No.', render: r => <code style={{ fontSize: 11, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '2px 6px', borderRadius: 4 }}>{r.saleNumber}</code> },
    { key: 'customer',      label: 'Customer', render: r => r.customer?.name || '—' },
    { key: 'totalAmount',   label: 'Total',    render: r => fmtINR(r.totalAmount) },
    { key: 'status',        label: 'Status',   render: r => <Badge label={r.status} /> },
    { key: 'paymentMethod', label: 'Payment' },
    { key: 'isPaid',        label: 'Paid',     render: r => r.isPaid ? <span style={{ color: '#27500A', fontSize: 12, fontWeight: 600 }}>✓ Paid</span> : <span style={{ color: '#A32D2D', fontSize: 12, fontWeight: 600 }}>Pending</span> },
    { key: 'saleDate',      label: 'Date',     render: r => r.saleDate ? new Date(r.saleDate).toLocaleDateString('en-IN') : '—' },
    { key: 'invoiceUrl',    label: 'Challan',  render: r => r.invoiceUrl ? <button onClick={() => setInvoiceModal(r)} style={{ background: '#E8F4F8', color: '#0066CC', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.target.style.background = '#D0E8F2'; e.target.style.color = '#0052A3'; }} onMouseLeave={(e) => { e.target.style.background = '#E8F4F8'; e.target.style.color = '#0066CC'; }}>View Challan</button> : <span style={{ color: '#999', fontSize: 12 }}>—</span> },
  ];

  return (
    <div>
      <PageHeader icon={ShoppingCart} title="Sales" subtitle="Manage sales orders and challans" onAdd={() => navigate('/sales/new')} addLabel="New Sale" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 10, marginBottom: '1.25rem' }}>
        {SALE_STATUSES.map(s => (
          <StatCard key={s} label={s} value={sales.filter(x => x.status === s).length} accent={STATUS_COLORS[s]?.bg || '#F1EFE8'} />
        ))}
      </div>

      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer, ID…">
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
            <option value="ALL">All Status</option>
            {SALE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {filtered.length} / {sales.length}
          </span>
        </SearchBar>
        <Table
          cols={cols}
          rows={filtered}
          extraActions={row => (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => openViewModal(row)}
                style={{
                  background: '#0066CC',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#0052A3')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#0066CC')}
              >
                View
              </button>
              <button
                onClick={() => setConfirmDelete(row)}
                style={{
                  background: '#DC3545',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#BB2D2D')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#DC3545')}
              >
                Delete
              </button>
            </div>
          )}
        />
      </Card>

      {modal && (
        <Modal title={modal.title} onClose={() => setModal(null)} width={720}>
          <FormGrid>
            <Field label="Customer *">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input value={form.customerId ? customers.find(c => c.id === form.customerId)?.name : 'Select customer'} readOnly style={{ flex: 1, cursor: 'pointer', background: 'var(--bg-secondary)' }} />
                <Button onClick={() => setCustModal(true)} variant="secondary">Select</Button>
              </div>
            </Field>
            <Field label="Payment Type *">
              <Select value={form.paymentType} onChange={e => setF('paymentType', e.target.value)}>
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </Select>
            </Field>
            {(form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') && (
              <>
                <Field label="Finance Company">
                  <Input value={form.financeCompany || ''} onChange={e => setF('financeCompany', e.target.value)} placeholder="e.g. TATA CAPITAL" />
                </Field>
                <Field label="Executive Name">
                  <Input value={form.financeExecutiveName || ''} onChange={e => setF('financeExecutiveName', e.target.value)} placeholder="Executive Name" />
                </Field>
                <Field label="Executive Phone">
                  <Input value={form.financeExecutivePhone || ''} onChange={e => setF('financeExecutivePhone', e.target.value)} placeholder="Executive Phone" />
                </Field>
              </>
            )}
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

          {/* Items */}
          <div style={{ borderTop: '0.5px solid var(--border-secondary)', paddingTop: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Items</span>
              <Button variant="secondary" size="sm" onClick={addItem}>+ Add Item</Button>
            </div>

            {form.items.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, padding: '1rem 0' }}>No items added yet</div>
            )}

            {form.items.map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px', marginBottom: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, marginBottom: 8 }}>
                  <Field label="Type">
                    <Select value={item.itemType} onChange={e => updateItem(i, 'itemType', e.target.value)}>
                      <option value="BIKE">BIKE</option>
                      <option value="ACCESSORY">ACCESSORY</option>
                    </Select>
                  </Field>
                  <Field label={item.itemType === 'BIKE' ? 'Bike *' : 'Accessory *'}>
                    {item.itemType === 'BIKE' ? (
                      <Select value={item.bikeId} onChange={e => updateItem(i, 'bikeId', e.target.value)}>
                        <option value="">Select bike</option>
                        {bikes.map(b => <option key={b.id} value={b.id}>{b.model?.name} — {b.engineNumber} — {b.color}</option>)}
                      </Select>
                    ) : (
                      <Select value={item.accessoryId} onChange={e => updateItem(i, 'accessoryId', e.target.value)}>
                        <option value="">Select accessory</option>
                        {accessories.map(a => <option key={a.id} value={a.id}>{a.name} (Stock: {a.quantityInStock})</option>)}
                      </Select>
                    )}
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                  <Field label="Qty"><Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
                  <Field label="Unit Price"><Input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} /></Field>
                  <Field label="Discount"><Input type="number" value={item.discountAmount} onChange={e => updateItem(i, 'discountAmount', e.target.value)} /></Field>
                  <Field label="Tax %"><Input type="number" value={item.taxRate} onChange={e => updateItem(i, 'taxRate', e.target.value)} /></Field>
                  <button onClick={() => removeItem(i)} style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)', border: 'none', width: 30, height: 30, borderRadius: 6, cursor: 'pointer', fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Estimated Total (incl. tax)</span>
            <span style={{ fontSize: 17, fontWeight: 600 }}>{fmtINR(total)}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button onClick={save} disabled={loading || form.items.length === 0}>
              {loading ? 'Creating…' : 'Create Sale'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}
        >
          <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '0.5px solid var(--border-primary)', width: `min(420px, 100%)`, padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px 0' }}>Delete Sale</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Are you sure you want to delete sale <code style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '2px 6px', borderRadius: 4 }}>{confirmDelete.id?.slice(0, 8)}</code>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSale}
                style={{ background: '#E24B4A', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500 }}
              >
                Delete Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Search & Create Modal */}
      {custModal && (
        <Modal title="Select or Create Customer" onClose={() => setCustModal(false)} width={600}>
          <div style={{ marginBottom: 14 }}>
            <Input
              placeholder="Search by name, phone, or email…"
              value={custSearch}
              onChange={e => {
                setCustSearch(e.target.value);
                searchCustomers(e.target.value);
              }}
              autoFocus
            />
          </div>

          {custResults.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Found Customers:</div>
              <div style={{ border: '0.5px solid var(--border-secondary)', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
                {custResults.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      border: 'none',
                      background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                      cursor: 'pointer',
                      borderBottom: i < custResults.length - 1 ? '0.5px solid var(--border-secondary)' : 'none',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{c.email} • {c.phone}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ borderTop: '0.5px solid var(--border-secondary)', paddingTop: 12, marginTop: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-dark)', marginBottom: 16 }}>Or Create New Customer:</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
              <Field label="Full Name *">
                <Input placeholder="Full Name" value={newCust.name || ''} onChange={e => setNewCust(n => ({ ...n, name: e.target.value }))} />
              </Field>
              <Field label="Email *">
                <Input placeholder="email@example.com" value={newCust.email || ''} onChange={e => setNewCust(n => ({ ...n, email: e.target.value }))} />
              </Field>
              <Field label="Phone *">
                <Input maxLength={10} placeholder="Phone Number" value={newCust.phone || ''} onChange={e => setNewCust(n => ({ ...n, phone: e.target.value }))} />
              </Field>
              <Field label="Date of Birth *">
                <Input type="date" value={newCust.dob || ''} onChange={e => setNewCust(n => ({ ...n, dob: e.target.value }))} />
              </Field>
              
              <div style={{ gridColumn: '1/-1' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Address Details</p>
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <Field label="Address Line 1 *">
                  <Input placeholder="Street, Sector, Area" value={newCust.addressLine1 || ''} onChange={e => setNewCust(n => ({ ...n, addressLine1: e.target.value }))} />
                </Field>
              </div>

              <Field label="City *">
                <Input placeholder="City" value={newCust.city || ''} onChange={e => setNewCust(n => ({ ...n, city: e.target.value }))} />
              </Field>
              <Field label="State *">
                <Input placeholder="State" value={newCust.state || ''} onChange={e => setNewCust(n => ({ ...n, state: e.target.value }))} />
              </Field>
              <Field label="Postal Code *">
                <Input placeholder="6-digit ZIP" value={newCust.postalCode || ''} onChange={e => setNewCust(n => ({ ...n, postalCode: e.target.value }))} />
              </Field>
              
              <div style={{ gridColumn: '1/-1' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8, marginBottom: 8, textTransform: 'uppercase' }}>Documents (At least one required)</p>
              </div>

              <Field label="Aadhaar Number">
                <Input placeholder="12-digit Aadhaar" value={newCust.aadhaarNumber || ''} onChange={e => setNewCust(n => ({ ...n, aadhaarNumber: e.target.value }))} />
              </Field>
              <Field label="PAN Number">
                <Input placeholder="10-digit PAN" value={newCust.panNumber || ''} onChange={e => setNewCust(n => ({ ...n, panNumber: e.target.value }))} />
              </Field>

              <div style={{ gridColumn: '1/-1' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 8, marginBottom: 8, textTransform: 'uppercase' }}>Life Events (Optional)</p>
              </div>

              <Field label="Marriage Anniversary">
                <Input type="date" value={newCust.marriageAnniversary || ''} onChange={e => setNewCust(n => ({ ...n, marriageAnniversary: e.target.value }))} />
              </Field>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '0.5px solid var(--border-secondary)' }}>
              <Button variant="secondary" onClick={() => setCustModal(false)}>Cancel</Button>
              <Button onClick={createNewCustomer} disabled={custLoading}>{custLoading ? 'Saving…' : 'Create & Select'}</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Invoice View Modal */}
      {invoiceModal && (
        <Modal title={`Challan #${invoiceModal.saleNumber || invoiceModal.id?.slice(0, 8)}`} onClose={() => setInvoiceModal(null)} width={600}>
          <div style={{ marginBottom: 20 }}>
            {/* Invoice Header Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sale No.</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{invoiceModal.saleNumber || invoiceModal.id?.slice(0, 8)}…</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sale Date</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{invoiceModal.saleDate ? new Date(invoiceModal.saleDate).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</p>
                <Badge label={invoiceModal.status} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment</p>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{invoiceModal.paymentMethod}</p>
              </div>
            </div>

            {/* Customer Info */}
            {invoiceModal.customer && (
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Name</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.customer.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Email</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.customer.email}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Phone</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.customer.phone}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Type</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.customer.type}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Finance Info */}
            {invoiceModal.financeCompany && (
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Finance Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Company</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.financeCompany}</p>
                  </div>
                  {invoiceModal.financeExecutiveName && (
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Executive Name</p>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.financeExecutiveName}</p>
                    </div>
                  )}
                  {invoiceModal.financeExecutivePhone && (
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Executive Phone</p>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.financeExecutivePhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nominee Info */}
            {invoiceModal.nomineeName && (
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nominee Details</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Nominee Name</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.nomineeName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Relation (Age)</p>
                    <p style={{ fontSize: 13, fontWeight: 500 }}>{invoiceModal.nomineeRelation} {invoiceModal.nomineeAge ? `(${invoiceModal.nomineeAge}y)` : ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Summary */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Grand Total (Incl. Taxes)</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(invoiceModal.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div style={{ marginTop: 16, padding: 12, backgroundColor: invoiceModal.isPaid ? '#E8F5E9' : '#FFF3E0', borderRadius: 8, border: `1px solid ${invoiceModal.isPaid ? '#C8E6C9' : '#FFE0B2'}` }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: invoiceModal.isPaid ? '#2E7D32' : '#F57F17', margin: 0 }}>
                {invoiceModal.isPaid ? '✓ Fully Paid' : `Pending: ${fmtINR(invoiceModal.pendingAmount)}`}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            {invoiceModal.invoiceUrl && (
              <a
                href={`${STATIC_BASE}/${invoiceModal.invoiceUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: '#0066CC',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 8,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Download Challan
              </a>
            )}
            <Button variant="secondary" onClick={() => setInvoiceModal(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
