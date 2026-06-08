import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, customersApi, bikesApi, accessoriesApi, bikeModelsApi, discountsApi } from '../api/services';
import { PAYMENT_TYPES, PAYMENT_METHODS, fmtINR, COLORS } from '../utils/constants';
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
  // Exchange parameters initialization
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

  // Sync exchange value to BIKE items as modern "Exchange Discount" automatically
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

  // useEffect(() => {
  //   setForm(f => {
  //     const newPaid = f.paidAmount > total ? total : f.paidAmount;
  //     return {
  //       ...f,
  //       paidAmount: newPaid,
  //       pendingAmount: Math.max(0, total - newPaid)
  //     };
  //   });
  // }, [total]);

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
    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (form.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // New Frontend Checklist Validation
    if (form.hasExchange) {
      const ex = form.exchangeDetails;

      // 1. First ensure mandatory strings are filled
      if (!ex.oldBikeName || !ex.oldBikeModel || !ex.oldBikeBrand || !ex.oldBikeColor || !ex.oldBikeYear) {
        toast.error('Please fill all mandatory fields for the exchange bike');
        return;
      }

      // 2. Enforce that EVERY checkbox in the evaluation checklist must be checked (true)
      const isChecklistComplete =
        ex.isOldRCAvailable &&
        ex.isNocAvailable &&
        ex.isOwnerDocumentAvailable &&
        ex.isChallanAvailable &&
        ex.isStatmentAvailable;

      if (!isChecklistComplete) {
        toast.error('Cannot proceed. All items in the Document Evaluation Checklist must be physically verified and checked.');
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

      <PageHeader icon={ShoppingCart} title="Create Sale" subtitle="Select customer, add items, configure exchange, and generate the challan" />

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

                <Field label="Address Line 1 *" style={{ gridColumn: '1/-1' }}>
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
                  {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </Select>
              </Field>
              {(form.paymentType.includes('FINANCE') || form.paymentMethod === 'FINANCE') && (
                <>
                  <Field label="Finance Company *">
                    <Input
                      placeholder="e.g. TATA CAPITAL LIMITED"
                      value={form.financeCompany}
                      onChange={e => setF('financeCompany', e.target.value)}
                    />
                  </Field>
                  <Field label="Executive Name">
                    <Input
                      placeholder="Finance Executive Name"
                      value={form.financeExecutiveName}
                      onChange={e => setF('financeExecutiveName', e.target.value)}
                    />
                  </Field>
                  <Field label="Executive Phone">
                    <Input
                      placeholder="Finance Executive Phone"
                      value={form.financeExecutivePhone}
                      onChange={e => setF('financeExecutivePhone', e.target.value)}
                    />

                  </Field>

                  <Field label="Disbursement Amount">
                    <Input
                      type="number"
                      placeholder="Disbursement Amount"
                      value={form.disbursementAmount}
                      onChange={e => setF('disbursementAmount', parseFloat(e.target.value) || 0)}
                    />
                  </Field>
                </>
              )}
            <Field label="Payment Method *">
              <Select value={form.paymentMethod} onChange={e => setF('paymentMethod', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
            </Field>
            <Field label="Offer / Global Discount">
              <Select value={form.discountId || ''} onChange={e => setF('discountId', e.target.value)}>
                <option value="">No Discount</option>
                {discounts.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.type === 'PERCENTAGE' ? `${d.value}%` : `Flat ${fmtINR(d.value)}`})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Paid Amount">
              <Input
                type="number"
                value={form.paidAmount}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setForm(f => ({ ...f, paidAmount: val}));
                }}
              />
            </Field>
            <Field label="Pending Amount">
              <Input
                type="number"
                value={form.pendingAmount}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setForm(f => ({ ...f, pendingAmount: val}));
                }}
              />
            </Field>

            <div style={{ gridColumn: '1/-1', borderTop: '0.5px solid var(--border-secondary)', marginTop: 8, paddingTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Insurance / Goodlife / Nominee</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <Field label="Nominee Name">
                  <Input value={form.nomineeName || ''} onChange={e => setF('nomineeName', e.target.value)} placeholder="e.g. John Doe" />
                </Field>
                <Field label="Nominee Age">
                  <Input type="number" value={form.nomineeAge || ''} onChange={e => setF('nomineeAge', e.target.value)} placeholder="e.g. 25" />
                </Field>
                <Field label="Relation">
                  <Input value={form.nomineeRelation || ''} onChange={e => setF('nomineeRelation', e.target.value)} placeholder="e.g. Father" />
                </Field>
              </div>
            </div>

            <Field label="Notes" style={{ gridColumn: '1/-1' }}>
              <Input value={form.notes || ''} onChange={e => setF('notes', e.target.value)} />
            </Field>
          </FormGrid>
        </div>
    </div>
      </Card >

    {/* Bike Exchange Module */ }
    < Card style = {{ marginTop: '1rem' }
}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: form.hasExchange ? 12 : 0 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <RefreshCw size={18} style={{ color: form.hasExchange ? 'var(--brand-dark)' : 'var(--text-tertiary)' }} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>Old Bike Exchange Module</span>
    </div>
    <Button
      variant={form.hasExchange ? 'danger' : 'secondary'}
      size="sm"
      onClick={() => setForm(f => ({ ...f, hasExchange: !f.hasExchange }))}
    >
      {form.hasExchange ? 'Remove Exchange' : '+ Add Exchange Bike'}
    </Button>
  </div>

{
  form.hasExchange && (
    <div style={{ borderTop: '0.5px solid var(--border-secondary)', paddingTop: 14 }}>
      <FormGrid>
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
        <Field label="Old Bike Mfg Year *">
          <Input type="number" placeholder="e.g. 2018" value={form.exchangeDetails.oldBikeYear} onChange={e => setExchangeField('oldBikeYear', e.target.value)} />
        </Field>
        <Field label="Exchange Evaluation Value *">
          <Input type="number" placeholder="Value offered to customer" value={form.exchangeDetails.exchangeValue || ''} onChange={e => setExchangeField('exchangeValue', parseFloat(e.target.value) || 0)} />
        </Field>
        <Field label="Engine Number (Optional)">
          <Input placeholder="Engine String" value={form.exchangeDetails.oldBikeEngineNumber} onChange={e => setExchangeField('oldBikeEngineNumber', e.target.value)} />
        </Field>
        <Field label="Chassis Number (Optional)">
          <Input placeholder="Chassis String" value={form.exchangeDetails.oldBikeChassisNumber} onChange={e => setExchangeField('oldBikeChassisNumber', e.target.value)} />
        </Field>
        <Field label="Condition Notes" style={{ gridColumn: '1/-1' }}>
          <Input placeholder="Scratches, overall tire life, engine noise remarks..." value={form.exchangeDetails.notes} onChange={e => setExchangeField('notes', e.target.value)} />
        </Field>

        {/* Checklist Segment */}
        <div style={{ gridColumn: '1/-1', marginTop: 8, background: 'var(--bg-secondary)', padding: 12, borderRadius: 8, border: '0.5px solid var(--border-secondary)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Document Evaluation Checklist</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.exchangeDetails.isOldRCAvailable} onChange={e => setExchangeField('isOldRCAvailable', e.target.checked)} />
              Original RC Book Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.exchangeDetails.isNocAvailable} onChange={e => setExchangeField('isNocAvailable', e.target.checked)} />
              Bank NOC Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.exchangeDetails.isOwnerDocumentAvailable} onChange={e => setExchangeField('isOwnerDocumentAvailable', e.target.checked)} />
              Owner Identity Copy Available
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.exchangeDetails.isChallanAvailable} onChange={e => setExchangeField('isChallanAvailable', e.target.checked)} />
              Traffic Challan Cleared
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.exchangeDetails.isStatmentAvailable} onChange={e => setExchangeField('isStatmentAvailable', e.target.checked)} />
              Bank Hypothecation Statement Clear
            </label>
          </div>
        </div>
      </FormGrid>
    </div>
  )
}
      </Card >

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 4 }}>
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
                  <Input
                    placeholder="e.g. Red, Black"
                    value={item.color}
                    onChange={e => updateItem(i, 'color', e.target.value)}
                    disabled={isPrefilledBikeItem}
                  />
                </Field>
                <Field label="Specific Bike (Optional)">
                  <Select value={item.bikeId} onChange={e => updateItem(i, 'bikeId', e.target.value)} disabled={isPrefilledBikeItem}>
                    <option value="">Reserve later (PDI)</option>
                    {bikes
                      .filter(b => (!item.modelId || b.modelId === item.modelId) && (!item.color || b.color?.toLowerCase().includes(item.color?.toLowerCase())))
                      .map(b => <option key={b.id} value={b.id}>{b.chassisNumber} ({b.engineNumber})</option>)
                    }
                  </Select>
                </Field>
              </>
            ) : (
              <Field label="Accessory *">
                <Select value={item.accessoryId} onChange={e => updateItem(i, 'accessoryId', e.target.value)}>
                  <option value="">Select accessory</option>
                  {accessories.map(a => <option key={a.id} value={a.id}>{a.name} (Stock: {a.quantityInStock})</option>)}
                </Select>
              </Field>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Field label="Qty"><Input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
            <Field label="Unit Price"><Input type="number" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} /></Field>

            {/* Made Read Only & Automatically linked up with the Exchange Evaluation field */}
            <Field label="Exchange Discount">
              <Input type="number" value={item.discountAmount} readOnly style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
            </Field>

            <Field label="Tax %"><Input type="number" value={item.taxRate} onChange={e => updateItem(i, 'taxRate', e.target.value)} disabled={item.itemType === 'BIKE'} /></Field>
          </div>

          {/* Breakdown Section */}
          {(item.modelId || item.accessoryId) && (
            <div style={{ padding: 10, background: 'var(--bg-primary)', borderRadius: 8, fontSize: 11, border: '0.5px dashed var(--border-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Line Item Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 10px' }}>
                {(() => {
                  const price = parseFloat(item.unitPrice) || 0;
                  const disc = parseFloat(item.discountAmount) || 0;
                  const qty = parseInt(item.quantity) || 1;
                  const totalInclusive = Math.max(0, (price - disc) * qty);

                  return (
                    <>
                      <span>Standard Price (x{qty}):</span> <span>{fmtINR(price * qty)}</span>
                      {disc > 0 && <span style={{ color: 'var(--brand-dark)' }}>Exchange Deduction Applied:</span>}
                      {disc > 0 && <span style={{ color: 'var(--brand-dark)' }}>- {fmtINR(disc * qty)}</span>}
                      <div style={{ gridColumn: '1/-1', borderTop: '0.5px solid var(--border-secondary)', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>Line Total:</span>
                        <span style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(totalInclusive)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </Card>

{/* Pricing Breakdown Card */ }
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '16px', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Gross Subtotal (incl. tax)</span>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {fmtINR((form.items || []).reduce((sum, it) => sum + ((parseFloat(it.unitPrice) || 0) * (parseInt(it.quantity) || 1)), 0))}
          </span>
        </div>

        {form.hasExchange && parseFloat(form.exchangeDetails.exchangeValue) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--brand-dark)' }}>
            <span style={{ fontSize: 13 }}>Total Exchange Value Credit Deduction</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>- {fmtINR(parseFloat(form.exchangeDetails.exchangeValue))}</span>
          </div>
        )}

        {globalDiscountApplied > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--success-fg)' }}>
            <span style={{ fontSize: 13 }}>Global Scheme Discount Applied</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>- {fmtINR(globalDiscountApplied)}</span>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Final Estimated Payable Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(total)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '1rem', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => navigate('/sales')}>Cancel</Button>
        <Button onClick={save} disabled={saving || form.items.length === 0}>{saving ? 'Creating…' : 'Create Sale'}</Button>
      </div>
    </div >
  );
}