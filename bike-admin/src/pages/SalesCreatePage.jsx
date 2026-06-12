import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, X, RefreshCw, User, Package, CreditCard, Receipt } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, customersApi, bikesApi, accessoriesApi, bikeModelsApi, discountsApi } from '../api/services';
import { PAYMENT_TYPES, PAYMENT_METHODS, fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, FormGrid,
  Field, Input, Select, Button, Card,
} from '../components/ui';

const EMPTY_FORM = {
  items: [],
  paymentType: 'FULL_PAYMENT',
  paymentMethod: 'CASH',
  pendingAmount: 0,
  paidAmount: 0,
  notes: '',
  financeCompany: '',
  financeExecutiveName: '',
  financeExecutivePhone: '',
  nomineeName: '',
  nomineeAge: '',
  nomineeRelation: '',
  disbursementAmount : 0,
  hasExchange: false,
  exchangeDetails: {
    oldBikeName: '',
    oldBikeModel: '',
    oldBikeBrand: '',
    oldBikeColor: '',
    oldBikeYear: '',
    oldBikeEngineNumber: '',
    oldBikeChassisNumber: '',
    exchangeValue: 0,
    notes: '',
    isOldRCAvailable: false,
    isNocAvailable: false,
    isOwnerDocumentAvailable: false,
    isChallanAvailable: false,
    isStatmentAvailable: false
  }
};

export default function SalesCreatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledRef = useRef(false);
  const prefillBikeId = location.state?.prefillBikeId || null;
  const [customers, setCustomers] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [models, setModels] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [prefilledBike, setPrefilledBike] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM, financeCompany: '', paidAmount: 0, disbursementAmount: 0 });
  const [custSearch, setCustSearch] = useState('');
  const [custResults, setCustResults] = useState([]);
  const [newCust, setNewCust] = useState({});
  const [custLoading, setCustLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [c, b, a, m, d] = await Promise.all([
        customersApi.getAll(),
        bikesApi.getAll(),
        accessoriesApi.getAll(),
        bikeModelsApi.getAll(),
        discountsApi.getActive(),
      ]);
      const allBikes = b.data || [];
      setCustomers(c.data || []);
      setBikes(allBikes.filter(x => x.status === 'AVAILABLE'));
      setModels(m.data || []);
      setDiscounts(d.data || []);
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
            discountAmount: f.hasExchange ? parseFloat(f.exchangeDetails.exchangeValue || 0) : 0,
            taxRate: 18,
          },
        ],
      };
    });

    prefilledRef.current = true;
    toast.success('Reserved bike added to sale items');
  }, [prefillBikeId, prefilledBike]);

  useEffect(() => {
    setForm(f => {
      const currentExchangeValue = f.hasExchange ? parseFloat(f.exchangeDetails.exchangeValue || 0) : 0;
      const updatedItems = (f.items || []).map(it => {
        if (it.itemType === 'BIKE') {
          return { ...it, discountAmount: currentExchangeValue };
        }
        return it;
      });
      return { ...f, items: updatedItems };
    });
  }, [form.hasExchange, form.exchangeDetails.exchangeValue]);

  const setF = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const setExchangeField = (key, val) => setForm(f => ({
    ...f,
    exchangeDetails: { ...f.exchangeDetails, [key]: val }
  }));

  const selectedCustomer = customers.find(c => c.id === form.customerId) || null;

  const subtotalForDiscount = (form.items || []).reduce((sum, it) => {
    return sum + ((parseFloat(it.unitPrice) || 0) * (parseInt(it.quantity) || 1));
  }, 0);

  const totalBeforeGlobalDiscount = (form.items || []).reduce((sum, it) => {
    const price = (parseFloat(it.unitPrice) || 0);
    const disc = (parseFloat(it.discountAmount) || 0);
    const qty = parseInt(it.quantity) || 1;

    const lineTotal = (price - disc) * qty;
    return sum + lineTotal;
  }, 0);

  let globalDiscountApplied = 0;
  if (form.discountId) {
    const d = discounts.find(x => x.id === form.discountId);
    if (d) {
      if (d.type === 'FLAT') {
        globalDiscountApplied = d.value;
      } else {
        globalDiscountApplied = (subtotalForDiscount * d.value) / 100;
        if (d.upToLimit && globalDiscountApplied > d.upToLimit) {
          globalDiscountApplied = d.upToLimit;
        }
      }
    }
  }

  const total = Math.max(0, totalBeforeGlobalDiscount - globalDiscountApplied);

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
    if (
      !newCust.name || !newCust.phone ||
      !newCust.dob || !newCust.addressLine1 || !newCust.city ||
      !newCust.state || !newCust.postalCode
    ) {
      toast.error('Please fill all required customer fields');
      return;
    }

    if (!newCust.aadhaarNumber && !newCust.panNumber) {
      toast.error('Enter either Aadhaar number or PAN number');
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
      setCustSearch('');
      setCustResults([]);
      setNewCust({});
      await load();
    } catch (err) {
      toast.error(err.message);
    }
    setCustLoading(false);
  };

  const addItem = () => setForm(f => {
    const currentExchangeValue = f.hasExchange ? parseFloat(f.exchangeDetails.exchangeValue || 0) : 0;
    return {
      ...f,
      items: [...f.items, {
        itemType: 'BIKE',
        bikeId: '',
        modelId: '',
        color: '',
        accessoryId: '',
        quantity: 1,
        unitPrice: 0,
        discountAmount: currentExchangeValue,
        taxRate: 18
      }],
    };
  });

  const updateItem = (i, key, val) => setForm(f => {
    const items = [...f.items];
    const currentItem = { ...items[i], [key]: val };

    if (key === 'bikeId' && val) {
      const selectedBike = [...bikes, ...(prefilledBike ? [prefilledBike] : [])].find(b => b.id === val);
      if (selectedBike) {
        currentItem.unitPrice = selectedBike.model?.exShowroomPrice || 0;
        currentItem.modelId = selectedBike.modelId;
        currentItem.color = selectedBike.color;
        currentItem.taxRate = (selectedBike.model?.cgstRate || 0) + (selectedBike.model?.sgstRate || 0) + (selectedBike.model?.igstRate || 0) + (selectedBike.model?.cessRate || 0);
      }
    }

    if (key === 'modelId' && val) {
      const selectedModel = models.find(m => m.id === val);
      if (selectedModel) {
        currentItem.unitPrice = selectedModel.exShowroomPrice || 0;
        currentItem.taxRate = (selectedModel.cgstRate || 0) + (selectedModel.sgstRate || 0) + (selectedModel.igstRate || 0) + (selectedModel.cessRate || 0);
      }
    }

    if (key === 'accessoryId' && val) {
      const selectedAccessory = accessories.find(a => a.id === val);
      if (selectedAccessory) currentItem.unitPrice = selectedAccessory.price || 0;
    }

    items[i] = currentItem;
    return { ...f, items };
  });

  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const save = async () => {
    if (!form.customerId) { toast.error('Please select a customer'); return; }
    if (form.items.length === 0) { toast.error('Please add at least one item'); return; }

    if (form.hasExchange) {
      const ex = form.exchangeDetails;
      if (!ex.oldBikeName || !ex.oldBikeModel || !ex.oldBikeBrand || !ex.oldBikeColor || !ex.oldBikeYear) {
        toast.error('Please fill all mandatory fields for the exchange bike');
        return;
      }
      const isChecklistComplete = ex.isOldRCAvailable && ex.isNocAvailable && ex.isOwnerDocumentAvailable && ex.isChallanAvailable && ex.isStatmentAvailable;
      if (!isChecklistComplete) {
        toast.error('Cannot proceed. All items in the Document Evaluation Checklist must be checked.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        customerId: form.customerId,
        discountId: form.discountId || null,
        paymentType: form.paymentType,
        paymentMethod: form.paymentMethod,
        pendingAmount: parseFloat(form.pendingAmount) || 0,
        paidAmount: parseFloat(form.paidAmount) || 0,
        financeCompany: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeCompany : null,
        financeExecutiveName: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeExecutiveName : null,
        financeExecutivePhone: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? form.financeExecutivePhone : null,
        disbursementAmount: (form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') ? parseFloat(form.disbursementAmount) || 10 : null,
        nomineeName: form.nomineeName || null,
        nomineeAge: form.nomineeAge ? parseInt(form.nomineeAge) : null,
        nomineeRelation: form.nomineeRelation || null,
        notes: form.notes || '',
        
        exchangeData: form.hasExchange ? {
          oldBikeName: form.exchangeDetails.oldBikeName,
          oldBikeBrand: form.exchangeDetails.oldBikeBrand,
          oldBikeModel: form.exchangeDetails.oldBikeModel,
          oldBikeColor: form.exchangeDetails.oldBikeColor,
          oldBikeYear: parseInt(form.exchangeDetails.oldBikeYear),
          oldBikeEngineNumber: form.exchangeDetails.oldBikeEngineNumber || null,
          oldBikeChassisNumber: form.exchangeDetails.oldBikeChassisNumber || null,
          exchangeValue: parseFloat(form.exchangeDetails.exchangeValue) || 0,
          notes: form.exchangeDetails.notes || null,
          isOldRCAvailable: form.exchangeDetails.isOldRCAvailable,
          isNocAvailable: form.exchangeDetails.isNocAvailable,
          isOwnerDocumentAvailable: form.exchangeDetails.isOwnerDocumentAvailable,
          isChallanAvailable: form.exchangeDetails.isChallanAvailable,
          isStatmentAvailable: form.exchangeDetails.isStatmentAvailable,
        } : null,

        items: form.items.map(it => {
          const model = models.find(m => m.id === it.modelId);
          return {
            itemType: it.itemType,
            bikeId: it.itemType === 'BIKE' ? (it.bikeId || null) : null,
            modelId: it.itemType === 'BIKE' ? it.modelId : null,
            color: it.itemType === 'BIKE' ? it.color : null,
            accessoryId: it.itemType === 'ACCESSORY' ? it.accessoryId : null,
            quantity: parseInt(it.quantity),
            unitPrice: parseFloat(it.unitPrice),
            discountAmount: parseFloat(it.discountAmount) || 0,
            exShowroomPrice: it.itemType === 'BIKE' ? (parseFloat(it.unitPrice) || 0) : 0,
            cgstRate: it.itemType === 'BIKE' ? (model?.cgstRate || 0) : (parseFloat(it.taxRate) / 2 || 0),
            sgstRate: it.itemType === 'BIKE' ? (model?.sgstRate || 0) : (parseFloat(it.taxRate) / 2 || 0),
            igstRate: it.itemType === 'BIKE' ? (model?.igstRate || 0) : 0,
            cessRate: it.itemType === 'BIKE' ? (model?.cessRate || 0) : 0,
            rtoCharges: 0,
            insuranceCharges: 0,
            otherCharges: 0,
            taxRate: it.itemType === 'BIKE' ? (model?.cgstRate + model?.sgstRate + model?.igstRate + model?.cessRate) : (parseFloat(it.taxRate) || 0),
          };
        }),
      };

      await salesApi.create(payload);
      toast.success('Sale & Exchange created successfully!');
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

  // --- Section Header Helper Component ---
  const SectionHeader = ({ icon: Icon, title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border-secondary)', paddingBottom: 12, marginBottom: 20 }}>
      <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, color: 'var(--brand-dark)' }}>
        <Icon size={20} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/sales')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--brand-dark)', fontWeight: 600,
            fontFamily: 'var(--font-sans)', padding: 0,
          }}
        >
          <ArrowLeft size={18} /> Back to Sales
        </button>
      </div>

      <PageHeader icon={ShoppingCart} title="Create New Sale" subtitle="Follow the sections below to complete the transaction" />

      {/* =========================================
          SECTION 1: CUSTOMER DETAILS (FULL WIDTH) 
      ========================================== */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <SectionHeader icon={User} title="1. Customer Information" />
        
        <div style={{ maxWidth: 600, marginBottom: 24 }}>
          <SearchBar value={custSearch} onChange={value => { setCustSearch(value); searchCustomers(value); }} placeholder="Search existing customer by name, phone, or email…" />
          
          {custResults.length > 0 && (
            <div style={{ border: '1px solid var(--border-secondary)', borderRadius: 10, maxHeight: 220, overflowY: 'auto', marginTop: 8, background: 'var(--bg-primary)', position: 'absolute', zIndex: 10, width: '100%', maxWidth: 600, boxShadow: 'var(--shadow-md)' }}>
              {custResults.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                  style={{
                    width: '100%', padding: '12px 16px', textAlign: 'left', border: 'none',
                    background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer',
                    borderBottom: i < custResults.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.email} • {c.phone}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer ? (
          <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--brand-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-dark)', fontWeight: 700, marginBottom: 4 }}>Selected Customer</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedCustomer.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedCustomer.phone} • {selectedCustomer.email || 'No email provided'}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setF('customerId', '')}>Change</Button>
          </div>
        ) : (
          <div style={{ border: '1px dashed var(--border-secondary)', padding: '1.5rem', borderRadius: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Or Create New Customer</div>
            <FormGrid cols={3}>
              <Field label="Name *">
                <Input placeholder="Full Name" value={newCust.name || ''} onChange={e => setNewCust(n => ({ ...n, name: e.target.value }))} />
              </Field>
              <Field label="Phone *">
                <Input placeholder="Phone Number" value={newCust.phone || ''} onChange={e => setNewCust(n => ({ ...n, phone: e.target.value }))} />
              </Field>
              <Field label="Date of Birth *">
                <Input type="date" value={newCust.dob || ''} onChange={e => setNewCust(n => ({ ...n, dob: e.target.value }))} />
              </Field>
              <Field label="Aadhaar Number">
                <Input placeholder="12-digit Aadhaar" value={newCust.aadhaarNumber || ''} onChange={e => setNewCust(n => ({ ...n, aadhaarNumber: e.target.value }))} />
              </Field>
              <Field label="PAN Number">
                <Input placeholder="10-character PAN" value={newCust.panNumber || ''} onChange={e => setNewCust(n => ({ ...n, panNumber: e.target.value }))} />
              </Field>
              <Field label="Marriage Anniversary">
                <Input type="date" value={newCust.marriageAnniversary || ''} onChange={e => setNewCust(n => ({ ...n, marriageAnniversary: e.target.value }))} />
              </Field>
              <Field label="Address Line 1 *" style={{ gridColumn: '1 / -1' }}>
                <Input placeholder="Street, area, landmark" value={newCust.addressLine1 || ''} onChange={e => setNewCust(n => ({ ...n, addressLine1: e.target.value }))} />
              </Field>
              <Field label="City *">
                <Input placeholder="City" value={newCust.city || ''} onChange={e => setNewCust(n => ({ ...n, city: e.target.value }))} />
              </Field>
              <Field label="State *">
                <Input placeholder="State" value={newCust.state || ''} onChange={e => setNewCust(n => ({ ...n, state: e.target.value }))} />
              </Field>
              <Field label="Postal Code *">
                <Input placeholder="Postal Code" value={newCust.postalCode || ''} onChange={e => setNewCust(n => ({ ...n, postalCode: e.target.value }))} />
              </Field>
            </FormGrid>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Button onClick={createNewCustomer} disabled={custLoading}>{custLoading ? 'Creating…' : 'Create & Select Customer'}</Button>
            </div>
          </div>
        )}
      </Card>


      {/* =========================================
          SECTION 2: ITEMS (FULL WIDTH) 
      ========================================== */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-secondary)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 8, borderRadius: 8, color: 'var(--brand-dark)' }}>
              <Package size={20} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>2. Select Items</h2>
          </div>
          <Button onClick={addItem}>+ Add Item</Button>
        </div>

        {form.items.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '2rem 0', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px dashed var(--border-secondary)' }}>
            No items in cart. Click "Add Item" to begin.
          </div>
        )}

        {form.items.map((item, i) => {
          const isPrefilledBikeItem = Boolean(prefillBikeId && item.itemType === 'BIKE' && item.bikeId === prefillBikeId);

          return (
            <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid var(--border-secondary)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Line Item {i + 1}
                </div>
                <button
                  onClick={() => removeItem(i)}
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger-fg)', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove item"
                >
                  <X size={16} />
                </button>
              </div>

              <FormGrid cols={4}>
                <Field label="Type">
                  <Select value={item.itemType} onChange={e => updateItem(i, 'itemType', e.target.value)} disabled={isPrefilledBikeItem}>
                    <option value="BIKE">BIKE</option>
                    <option value="ACCESSORY">ACCESSORY</option>
                  </Select>
                </Field>

                {item.itemType === 'BIKE' ? (
                  <>
                    <Field label="Model *">
                      <Select value={item.modelId} onChange={e => updateItem(i, 'modelId', e.target.value)} disabled={isPrefilledBikeItem}>
                        <option value="">Select model</option>
                        {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </Select>
                    </Field>
                    <Field label="Color *">
                      <Input placeholder="e.g. Red, Black" value={item.color} onChange={e => updateItem(i, 'color', e.target.value)} disabled={isPrefilledBikeItem} />
                    </Field>
                    <Field label="Specific Chassis (Optional)">
                      <Select value={item.bikeId} onChange={e => updateItem(i, 'bikeId', e.target.value)} disabled={isPrefilledBikeItem}>
                        <option value="">Reserve later (PDI)</option>
                        {bikes.filter(b => (!item.modelId || b.modelId === item.modelId) && (!item.color || b.color?.toLowerCase().includes(item.color?.toLowerCase()))).map(b => (
                          <option key={b.id} value={b.id}>{b.chassisNumber} ({b.engineNumber})</option>
                        ))}
                      </Select>
                    </Field>
                  </>
                ) : (
                  <Field label="Accessory *" style={{ gridColumn: 'span 3' }}>
                    <Select value={item.accessoryId} onChange={e => updateItem(i, 'accessoryId', e.target.value)}>
                      <option value="">Select accessory</option>
                      {accessories.map(a => <option key={a.id} value={a.id}>{a.name} (Stock: {a.quantityInStock})</option>)}
                    </Select>
                  </Field>
                )}

                <Field label="Qty"><Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
                <Field label="Unit Price"><Input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} /></Field>
                <Field label="Exchange Discount">
                  <Input type="number" value={item.discountAmount} readOnly style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
                </Field>
                <Field label="Tax %"><Input type="number" value={item.taxRate} onChange={e => updateItem(i, 'taxRate', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
              </FormGrid>

              {/* Line Item Breakdown */}
              {(item.modelId || item.accessoryId) && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 24, color: 'var(--text-secondary)' }}>
                    {(() => {
                      const price = parseFloat(item.unitPrice) || 0;
                      const disc = parseFloat(item.discountAmount) || 0;
                      const qty = parseInt(item.quantity) || 1;
                      return (
                        <>
                          <span>Price: {fmtINR(price * qty)}</span>
                          {disc > 0 && <span style={{ color: 'var(--brand-dark)' }}>Deduction: -{fmtINR(disc * qty)}</span>}
                        </>
                      )
                    })()}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    Line Total: <span style={{ color: 'var(--brand-dark)' }}>{fmtINR(Math.max(0, ((parseFloat(item.unitPrice) || 0) - (parseFloat(item.discountAmount) || 0)) * (parseInt(item.quantity) || 1)))}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>


      {/* =========================================
          SECTION 3: EXCHANGE MODULE (FULL WIDTH) 
      ========================================== */}
      <Card style={{ marginBottom: '1.5rem', borderColor: form.hasExchange ? 'var(--brand-dark)' : 'var(--border-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: form.hasExchange ? 20 : 0, borderBottom: form.hasExchange ? '1px solid var(--border-secondary)' : 'none', paddingBottom: form.hasExchange ? 12 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: form.hasExchange ? 'rgba(227, 24, 55, 0.1)' : 'var(--bg-secondary)', padding: 8, borderRadius: 8, color: form.hasExchange ? 'var(--brand-dark)' : 'var(--text-tertiary)' }}>
              <RefreshCw size={20} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>3. Old Bike Exchange</h2>
          </div>
          <Button variant={form.hasExchange ? 'danger' : 'secondary'} onClick={() => setForm(f => ({ ...f, hasExchange: !f.hasExchange }))}>
            {form.hasExchange ? 'Remove Exchange' : '+ Add Exchange'}
          </Button>
        </div>

        {form.hasExchange && (
          <div>
            <FormGrid cols={3}>
              <Field label="Old Bike Name *">
                <Input placeholder="e.g. Splendor Plus" value={form.exchangeDetails.oldBikeName} onChange={e => setExchangeField('oldBikeName', e.target.value)} />
              </Field>
              <Field label="Old Bike Brand *">
                <Input placeholder="e.g. Hero" value={form.exchangeDetails.oldBikeBrand} onChange={e => setExchangeField('oldBikeBrand', e.target.value)} />
              </Field>
              <Field label="Old Bike Model *">
                <Input placeholder="e.g. Self Start Drum Brake" value={form.exchangeDetails.oldBikeModel} onChange={e => setExchangeField('oldBikeModel', e.target.value)} />
              </Field>
              <Field label="Old Bike Color *">
                <Input placeholder="e.g. Black with Silver" value={form.exchangeDetails.oldBikeColor} onChange={e => setExchangeField('oldBikeColor', e.target.value)} />
              </Field>
              <Field label="Mfg Year *">
                <Input type="number" placeholder="e.g. 2018" value={form.exchangeDetails.oldBikeYear} onChange={e => setExchangeField('oldBikeYear', e.target.value)} />
              </Field>
              <Field label="Exchange Evaluation Value *">
                <Input type="number" placeholder="Value offered" value={form.exchangeDetails.exchangeValue || ''} onChange={e => setExchangeField('exchangeValue', parseFloat(e.target.value) || 0)} style={{ borderColor: 'var(--brand-dark)' }} />
              </Field>
              <Field label="Engine Number (Optional)">
                <Input placeholder="Engine String" value={form.exchangeDetails.oldBikeEngineNumber} onChange={e => setExchangeField('oldBikeEngineNumber', e.target.value)} />
              </Field>
              <Field label="Chassis Number (Optional)">
                <Input placeholder="Chassis String" value={form.exchangeDetails.oldBikeChassisNumber} onChange={e => setExchangeField('oldBikeChassisNumber', e.target.value)} />
              </Field>
              <Field label="Condition Notes" style={{ gridColumn: '1 / -1' }}>
                <Input placeholder="Scratches, tire life, engine noise remarks..." value={form.exchangeDetails.notes} onChange={e => setExchangeField('notes', e.target.value)} />
              </Field>
            </FormGrid>

            {/* Document Checklist */}
            <div style={{ marginTop: 24, background: 'var(--bg-secondary)', padding: 16, borderRadius: 12, border: '1px solid var(--border-secondary)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Document Evaluation Checklist (All Mandatory)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { key: 'isOldRCAvailable', label: 'Original RC Book Available' },
                  { key: 'isNocAvailable', label: 'Bank NOC Available' },
                  { key: 'isOwnerDocumentAvailable', label: 'Owner Identity Copy Available' },
                  { key: 'isChallanAvailable', label: 'Traffic Challan Cleared' },
                  { key: 'isStatmentAvailable', label: 'Bank Hypothecation Clear' }
                ].map(check => (
                  <label key={check.key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer', background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-secondary)' }}>
                    <input type="checkbox" style={{ width: 18, height: 18, accentColor: 'var(--brand-dark)' }} checked={form.exchangeDetails[check.key]} onChange={e => setExchangeField(check.key, e.target.checked)} />
                    {check.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>


      {/* =========================================
          SECTION 4: SALES DETAILS & PRICING (FULL WIDTH) 
      ========================================== */}
      <Card>
        <SectionHeader icon={CreditCard} title="4. Payment & Documentation" />
        
        <FormGrid cols={3}>
          <Field label="Payment Type *">
            <Select value={form.paymentType} onChange={e => setF('paymentType', e.target.value)}>
              {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </Select>
          </Field>
          <Field label="Payment Method *">
            <Select value={form.paymentMethod} onChange={e => setF('paymentMethod', e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </Select>
          </Field>
          <Field label="Global Discount Offer">
            <Select value={form.discountId || ''} onChange={e => setF('discountId', e.target.value)}>
              <option value="">No Discount</option>
              {discounts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type === 'PERCENTAGE' ? `${d.value}%` : `Flat ${fmtINR(d.value)}`})
                </option>
              ))}
            </Select>
          </Field>

          {(form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') && (
            <>
              <Field label="Finance Company *">
                <Input placeholder="e.g. TATA CAPITAL" value={form.financeCompany} onChange={e => setF('financeCompany', e.target.value)} />
              </Field>
              <Field label="Executive Name">
                <Input placeholder="Name" value={form.financeExecutiveName} onChange={e => setF('financeExecutiveName', e.target.value)} />
              </Field>
              <Field label="Executive Phone">
                <Input placeholder="Phone" value={form.financeExecutivePhone} onChange={e => setF('financeExecutivePhone', e.target.value)} />
              </Field>
              <Field label="Disbursement Amount">
                <Input type="number" placeholder="Amount" value={form.disbursementAmount} onChange={e => setF('disbursementAmount', parseFloat(e.target.value) || 0)} />
              </Field>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-secondary)', marginTop: 8, paddingTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Nominee Information</div>
            <FormGrid cols={3}>
              <Field label="Nominee Name"><Input value={form.nomineeName || ''} onChange={e => setF('nomineeName', e.target.value)} placeholder="Full Name" /></Field>
              <Field label="Nominee Age"><Input type="number" value={form.nomineeAge || ''} onChange={e => setF('nomineeAge', e.target.value)} placeholder="Age" /></Field>
              <Field label="Relation"><Input value={form.nomineeRelation || ''} onChange={e => setF('nomineeRelation', e.target.value)} placeholder="e.g. Father, Spouse" /></Field>
            </FormGrid>
          </div>

          <Field label="General Notes" style={{ gridColumn: '1 / -1' }}>
            <Input value={form.notes || ''} onChange={e => setF('notes', e.target.value)} placeholder="Any special instructions or commitments..." />
          </Field>
        </FormGrid>

        {/* --- Final Pricing Breakdown Section inside the Details Card --- */}
        <div style={{ marginTop: 32, background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)', borderRadius: 16, padding: 24, border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, color: 'var(--text-primary)' }}>
            <Receipt size={20} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Order Summary</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Gross Subtotal (incl. tax)</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>
                {fmtINR((form.items || []).reduce((sum, it) => sum + ((parseFloat(it.unitPrice) || 0) * (parseInt(it.quantity) || 1)), 0))}
              </span>
            </div>

            {form.hasExchange && parseFloat(form.exchangeDetails.exchangeValue) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--brand-dark)' }}>
                <span style={{ fontSize: 14 }}>Exchange Value Credit</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>- {fmtINR(parseFloat(form.exchangeDetails.exchangeValue))}</span>
              </div>
            )}

            {globalDiscountApplied > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--success-fg)' }}>
                <span style={{ fontSize: 14 }}>Global Scheme Discount</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>- {fmtINR(globalDiscountApplied)}</span>
              </div>
            )}

            <div style={{ borderTop: '2px dashed var(--border-secondary)', paddingTop: 16, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Final Estimated Payable</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--brand-dark)' }}>{fmtINR(total)}</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
              <Field label="Initial Paid Amount">
                <Input type="number" value={form.paidAmount} onChange={e => setF('paidAmount', parseFloat(e.target.value) || 0)} style={{ fontSize: 16, fontWeight: 600 }} />
              </Field>
              <Field label="Pending Balance">
                <Input type="number" value={form.pendingAmount} onChange={e => setF('pendingAmount', parseFloat(e.target.value) || 0)} style={{ fontSize: 16, fontWeight: 600 }} />
              </Field>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: '2rem' }}>
        <Button variant="secondary" size="lg" onClick={() => navigate('/sales')}>Cancel</Button>
        <Button size="lg" onClick={save} disabled={saving || form.items.length === 0} style={{ padding: '0 32px' }}>
          {saving ? 'Processing…' : 'Generate Challan'}
        </Button>
      </div>

    </div>
  );
}