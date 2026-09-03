import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Edit2, Save, X, Eye, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, bikesApi, bikeModelsApi, accessoriesApi } from '../api/services';
import { fmtINR, STATIC_BASE, PAYMENT_TYPES, PAYMENT_METHODS } from '../utils/constants';
import { Button, Modal, Field, FormGrid, Input, Select } from '../components/ui';

export default function SalesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPending, setEditingPending] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [pdiModal, setPdiModal] = useState(false);
  const [pdiUrl, setPdiUrl] = useState(null);
  const [availableBikes, setAvailableBikes] = useState([]);
  const [assigningBike, setAssigningBike] = useState(null); // { itemId, modelId, color }
  const [selectedBikeId, setSelectedBikeId] = useState('');
  const [bikeSearch, setBikeSearch] = useState('');

  // ── SALE EDIT (amounts, customer, nominee, finance, payment mode) ──
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // ── NEW SYSTEM STATES FOR EXCHANGE DIALOGUE ──
  const [exchangingItem, setExchangingItem] = useState(null); // SaleItem instance data object
  const [exchangeType, setExchangeType] = useState('BIKE');
  const [catalogList, setCatalogList] = useState([]); // Models or Accessories variants pool
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [exchQty, setExchQty] = useState(1);
  const [exchColor, setExchColor] = useState('');
  const [exchUnitPrice, setExchUnitPrice] = useState('');
  const [exchDiscount, setExchDiscount] = useState(0);
  const [exchNotes, setExchNotes] = useState('');
  const [processingExchange, setProcessingExchange] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  useEffect(() => {
    if (assigningBike) {
      fetchAvailableBikes(assigningBike.modelId, assigningBike.color);
    }
  }, [assigningBike]);

  // Load selection pool items when switching product types in the exchange modal
  useEffect(() => {
    if (exchangingItem) {
      loadCatalogPool(exchangeType);
    }
  }, [exchangeType, exchangingItem]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      const response = await salesApi.getSale(id);
      const saleData = response.data || response;
      setSale(saleData);
      setPendingAmount(saleData?.pendingAmount || 0);
    } catch (error) {
      console.error('Error fetching sale:', error);
      toast.error('Failed to load sale details');
      navigate('/sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBikes = async (modelId, color) => {
    try {
      const resp = await bikesApi.getAll({ status: 'AVAILABLE', modelId });
      const all = resp.data || resp;
      setAvailableBikes(all.filter(b => (b.status === 'AVAILABLE' || b.status === 'EXCHANGED') && b.modelId === modelId));
    } catch (err) {
      toast.error('Failed to fetch available bikes');
    }
  };

  const loadCatalogPool = async (type) => {
    try {
      setSelectedTargetId('');
      if (type === 'BIKE') {
        const resp = await bikeModelsApi.getAll();
        setCatalogList(resp.data || resp);
      } else {
        const resp = await accessoriesApi.getAll();
        setCatalogList(resp.data || resp);
      }
    } catch (err) {
      toast.error('Failed to populate stock catalog pool selection data framework');
    }
  };

  const handleProcessExchange = async () => {
    if (!selectedTargetId) {
      toast.error('Please choose a valid replacement item from catalog.');
      return;
    }
    try {
      setProcessingExchange(true);
      const payload = {
        newItemType: exchangeType,
        newItemId: selectedTargetId,
        quantity: exchangeType === 'BIKE' ? 1 : Number(exchQty),
        newColor: exchangeType === 'BIKE' ? exchColor : undefined,
        newUnitPrice: exchUnitPrice ? Number(exchUnitPrice) : undefined,
        newDiscountAmount: Number(exchDiscount),
        newNotes: exchNotes
      };

      const resp = await salesApi.exchangeItem(exchangingItem.id, payload);
      toast.success('Item replacement processed successfully! Ledger invoice updated.');
      
      // Clear modal variables out smoothly
      setExchangingItem(null);
      setExchColor('');
      setExchUnitPrice('');
      setExchDiscount(0);
      setExchNotes('');
      
      // Update local state structure safely with refreshed payload details
      const freshSale = resp.data || resp;
      setSale(freshSale);
      setPendingAmount(freshSale?.pendingAmount || 0);
    } catch (err) {
      toast.error(err.message || 'Failed to finish exchange pipeline routine loop parameters.');
    } finally {
      setProcessingExchange(false);
    }
  };

  const filteredBikes = availableBikes.filter(b =>
    b.chassisNumber.toLowerCase().includes(bikeSearch.toLowerCase()) ||
    b.engineNumber.toLowerCase().includes(bikeSearch.toLowerCase())
  );

  const handleAssignBike = async () => {
    if (!selectedBikeId) return;
    try {
      await salesApi.assignBike(assigningBike.itemId, selectedBikeId);
      toast.success('Bike assigned and Challan updated');
      setAssigningBike(null);
      setSelectedBikeId('');
      fetchSaleDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to assign bike');
    }
  };

  const handleUpdatePendingAmount = async () => {
    if (pendingAmount < 0) {
      toast.error('Pending amount cannot be negative');
      return;
    }
    if (pendingAmount > (sale?.totalAmount || 0)) {
      toast.error('Pending amount cannot exceed total amount');
      return;
    }
    try {
      await salesApi.updatePendingAmount(id, pendingAmount);
      setSale({
        ...sale,
        pendingAmount,
        isPaid: pendingAmount === 0,
        status: pendingAmount === 0 ? 'CONFIRMED' : 'PENDING',
      });
      setEditingPending(false);
      toast.success('Pending amount updated successfully');
    } catch (error) {
      console.error('Error updating pending amount:', error);
      toast.error('Failed to update pending amount');
    }
  };

  // Sale items are deliberately absent here: a booked sale can be corrected,
  // not restructured.
  const openEditSale = () => {
    const addr = sale?.customer?.address || {};
    setEditForm({
      customer: {
        name: sale?.customer?.name || '',
        phone: sale?.customer?.phone || '',
        aadhaarNumber: sale?.customer?.aadhaarNumber || '',
        panNumber: sale?.customer?.panNumber || '',
        address: {
          addressLine1: addr.addressLine1 || '',
          addressLine2: addr.addressLine2 || '',
          city: addr.city || '',
          state: addr.state || '',
          postalCode: addr.postalCode || '',
        },
      },
      nomineeName: sale?.nomineeName || '',
      nomineeAge: sale?.nomineeAge ?? '',
      nomineeRelation: sale?.nomineeRelation || '',
      financeCompany: sale?.financeCompany || '',
      financeExecutiveName: sale?.financeExecutiveName || '',
      financeExecutivePhone: sale?.financeExecutivePhone || '',
      disbursementAmount: sale?.disbursementAmount ?? '',
      paymentType: sale?.paymentType || 'FULL_PAYMENT',
      paymentMethod: sale?.paymentMethod || 'CASH',
      paidAmount: sale?.paidAmount ?? 0,
      pendingAmount: sale?.pendingAmount ?? 0,
      notes: sale?.notes || '',
    });
    setEditModal(true);
  };

  const setEditField = (key, value) => setEditForm(f => ({ ...f, [key]: value }));
  const setEditCustomer = (key, value) => setEditForm(f => ({ ...f, customer: { ...f.customer, [key]: value } }));
  const setEditAddress = (key, value) => setEditForm(f => ({
    ...f,
    customer: { ...f.customer, address: { ...f.customer.address, [key]: value } },
  }));

  const handleSaveSaleEdit = async () => {
    if (!editForm) return;

    if (!editForm.customer.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (editForm.customer.phone.replace(/\D/g, '').length < 10) {
      toast.error('Customer phone must be at least 10 digits');
      return;
    }

    const paidAmount = Number(editForm.paidAmount) || 0;
    const pendingAmount = Number(editForm.pendingAmount) || 0;

    if (paidAmount < 0 || pendingAmount < 0) {
      toast.error('Amounts cannot be negative');
      return;
    }
    if (pendingAmount > (sale?.totalAmount || 0)) {
      toast.error('Pending amount cannot exceed the sale total');
      return;
    }

    try {
      setSavingEdit(true);
      const response = await salesApi.update(id, {
        customer: editForm.customer,
        nomineeName: editForm.nomineeName,
        nomineeAge: editForm.nomineeAge,
        nomineeRelation: editForm.nomineeRelation,
        financeCompany: editForm.financeCompany,
        financeExecutiveName: editForm.financeExecutiveName,
        financeExecutivePhone: editForm.financeExecutivePhone,
        disbursementAmount: editForm.disbursementAmount,
        paymentType: editForm.paymentType,
        paymentMethod: editForm.paymentMethod,
        paidAmount,
        pendingAmount,
        notes: editForm.notes,
      });

      const freshSale = response.data || response;
      setSale(freshSale);
      setPendingAmount(freshSale?.pendingAmount || 0);
      setEditModal(false);
      toast.success('Sale updated and challan regenerated');
    } catch (error) {
      toast.error(error.message || 'Failed to update the sale');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!sale.invoiceUrl) {
      toast.error('Invoice is not available');
      return;
    }
    try {
      setGenerating(true);
      const response = await fetch(`${STATIC_BASE}/${sale.invoiceUrl}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${sale.saleNumber || sale.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setGenerating(false);
    }
  };

  const handleGeneratePDISlip = async () => {
    try {
      setGenerating(true);
      const resp = await salesApi.generatePDISlip(id);
      setPdiUrl(resp.data?.url || resp.url);
      setPdiModal(true);
      toast.success('PDI Slip generated');
    } catch (err) {
      toast.error('Failed to generate PDI slip');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading sale details...</div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Sale not found</div>
      </div>
    );
  }

  const statusBgColor = {
    PDI: '#e0f2fe',
    PENDING: 'var(--warning-bg)',
    PAID: 'var(--success-bg)',
    CONFIRMED: 'var(--success-bg)',
    CANCELLED: 'var(--danger-bg)',
    EXCHANGED: '#fef2f2', // Expanded theme color background
  };

  const statusTextColor = {
    PDI: '#0369a1',
    PENDING: 'var(--warning-fg)',
    PAID: 'var(--success-fg)',
    CONFIRMED: 'var(--success-fg)',
    CANCELLED: 'var(--danger-fg)',
    EXCHANGED: '#b91c1c', // Expanded theme color tracking text font
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/sales')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--brand-dark)',
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={18} />
          Back to Sales
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={openEditSale}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Edit2 size={16} />
              Edit Sale
            </button>

            <button
              onClick={handleGeneratePDISlip}
              disabled={generating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Download size={16} />
              {generating ? 'Generating...' : 'PDI Slip'}
            </button>
          
          {sale.invoiceUrl && (
            <button
              onClick={() => setInvoiceModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--brand-light)',
                color: 'var(--brand-dark)',
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <Eye size={16} />
              View Invoice
            </button>
          )}
          <button
            onClick={handleDownloadInvoice}
            disabled={generating || !sale.invoiceUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: sale.invoiceUrl ? 'var(--brand-dark)' : 'var(--text-tertiary)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              cursor: sale.invoiceUrl ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <Download size={16} />
            {generating ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>

      {/* Sale Informative Widgets layout cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, border: '0.5px solid var(--border-secondary)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sale No.</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{sale.saleNumber || sale.id?.slice(0, 12)}…</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, border: '0.5px solid var(--border-secondary)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sale Date</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{sale.saleDate ? new Date(sale.saleDate).toLocaleDateString('en-IN') : '—'}</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, border: '0.5px solid var(--border-secondary)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</p>
          <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, backgroundColor: statusBgColor[sale.status], color: statusTextColor[sale.status] }}>
            {sale.status}
          </span>
        </div>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16, border: '0.5px solid var(--border-secondary)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment</p>
          <p style={{ fontSize: 15, fontWeight: 600 }}>{sale.paymentMethod}</p>
        </div>
      </div>

      {/* Customer profiles details rendering rows */}
      {sale.customer && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Customer Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 16 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.name}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.email || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Payment Opt</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.paymentType} {sale.financeCompany ? `(${sale.financeCompany})` : ''}</p>
              </div>
              {sale.customer.address && (
                <div style={{ gridColumn: '1/-1' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Address</p>
                  <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                    {sale.customer.address.addressLine1}
                    {sale.customer.address.addressLine2 && `, ${sale.customer.address.addressLine2}`}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {sale.customer.address.city}, {sale.customer.address.state} {sale.customer.address.postalCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Nominee & Finance</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nominee Name</p>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{sale.nomineeName || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Relation / Age</p>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{sale.nomineeRelation || '—'} {sale.nomineeAge ? `(${sale.nomineeAge}y)` : ''}</p>
                </div>
              </div>
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Finance Executive</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Executive Name</p>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{sale.financeExecutiveName || '—'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Contact Phone</p>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{sale.financeExecutivePhone || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Ledger Items Data Grid Table Mapping */}
      {sale?.items && sale.items.length > 0 && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Sale Items Matrix</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Item Definition</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Item Status</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Ex-Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Tax Rate</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Net Total</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Exchange Action</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => {
                  const modelName = item.model?.name || item.bike?.model?.name || 'Unknown Item';
                  const color = item.color || item.bike?.color || '—';
                  const isBike = item.itemType === 'BIKE';
                  const needsBike = isBike && !item.bikeId;
                  const itemStatus = item.SaleItemStatus || 'SOLD';

                  return (
                    <tr 
                      key={index} 
                      style={{ 
                        borderBottom: '1px solid var(--border-secondary)',
                        backgroundColor: itemStatus === 'EXCHANGED' ? 'rgba(239, 68, 68, 0.05)' : 'transparent' 
                      }}
                    >
                      <td style={{ padding: '12px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: itemStatus === 'EXCHANGED' ? '#b91c1c' : 'inherit' }}>
                          {item.itemType === 'BIKE' ? modelName : item.accessory?.name}
                        </div>
                        {isBike && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Color: {color} {item.bikeId ? `| Chassis: ${item.bike.chassisNumber} | Engine: ${item.bike.engineNumber}` : '(Not yet assigned)'}
                          </div>
                        )}
                        {needsBike && itemStatus !== 'EXCHANGED' && (
                          <button
                            onClick={() => setAssigningBike({ itemId: item.id, modelId: item.modelId, color: item.color })}
                            style={{
                              marginTop: 8, padding: '4px 8px', borderRadius: 4, background: 'var(--brand-dark)',
                              color: 'white', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                            }}
                          >
                            <Edit2 size={10} /> Finalize Challan (Select Bike)
                          </button>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px', fontSize: 12 }}>
                        <span style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          backgroundColor: itemStatus === 'EXCHANGED' ? '#fef2f2' : '#e6f4ea',
                          color: itemStatus === 'EXCHANGED' ? '#b91c1c' : '#137333'
                        }}>
                          {itemStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{fmtINR(item.unitPrice || 0)}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>
                        {item.cgstRate + item.sgstRate + item.igstRate + item.cessRate}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600 }}>{fmtINR(item.lineTotal || 0)}</td>
                      
                      {/* Action Cell Trigger */}
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        {itemStatus !== 'EXCHANGED' ? (
                          <button
                            onClick={() => {
                              setExchangingItem(item);
                              setExchangeType(item.itemType);
                            }}
                            style={{
                              padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db',
                              backgroundColor: '#fff', color: '#374151', fontSize: 12, fontWeight: 500,
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--brand-dark)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                          >
                            <RefreshCw size={12} /> Exchange
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Replaced</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Summary Component view block */}
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Payment Ledger Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Grand Total (Active Items Ledger)</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale?.totalAmount || 0)}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Amount Paid</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>{fmtINR(sale?.paidAmount || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Balance Due</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--warning-fg)' }}>{fmtINR(sale?.pendingAmount || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Disbursement</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--brand-dark)' }}>{fmtINR(sale.disbursementAmount || 0)}</p>
            </div>
          </div>
        </div>

        {/* Edit Pending layout display code */}
        <div style={{ background: 'var(--brand-light)', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Amount Adjustment</p>
              {editingPending ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={pendingAmount}
                    onChange={(e) => setPendingAmount(parseFloat(e.target.value) || 0)}
                    style={{ width: 120, padding: '8px 10px', border: '1px solid var(--border-secondary)', borderRadius: 6, fontSize: 13 }}
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={handleUpdatePendingAmount}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--success-bg)', color: 'var(--success-fg)', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => { setEditingPending(false); setPendingAmount(sale?.pendingAmount || 0); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--text-tertiary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '40px' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale?.pendingAmount || 0)}</p>
                  <button
                    onClick={() => setEditingPending(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--brand-dark)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Challan Preview Modal */}
      {invoiceModal && (
        <Modal title={`Challan Preview - ${sale.saleNumber || sale.id?.slice(0, 8)}…`} onClose={() => setInvoiceModal(false)} width={700}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
            <iframe
              src={`${STATIC_BASE}/${sale.invoiceUrl}`}
              title="Challan"
              style={{ width: '100%', height: '600px', border: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button onClick={() => setInvoiceModal(false)} variant="secondary">Close</Button>
            <a
              href={`${STATIC_BASE}/${sale.invoiceUrl}`}
              target="_blank"
              rel="noreferrer"
              style={{ background: 'var(--brand-dark)', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download Challan
            </a>
          </div>
        </Modal>
      )}

      {/* PDI Slip Modal */}
      {pdiModal && (
        <Modal title={`PDI Slip - ${sale.saleNumber || sale.id?.slice(0, 8)}…`} onClose={() => setPdiModal(false)} width={700}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
            <iframe
              src={`${STATIC_BASE}/${pdiUrl}`}
              title="PDI Slip"
              style={{ width: '100%', height: '600px', border: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button onClick={() => setPdiModal(false)} variant="secondary">Close</Button>
            <a
              href={`${STATIC_BASE}/${pdiUrl}`}
              target="_blank"
              rel="noreferrer"
              style={{ background: '#0ea5e9', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={14} /> Download PDI Slip
            </a>
          </div>
        </Modal>
      )}

      {/* Assign Bike Modal */}
      {assigningBike && (
        <Modal title="Finalize Challan - Select Specific Vehicle" onClose={() => setAssigningBike(null)}>
          <div style={{ padding: '4px 0 16px 0' }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Select a specific bike from available stock for this model and color.
            </p>
            <Field label="Search by Chassis / Engine No">
              <input
                type="text"
                placeholder="Type to search..."
                value={bikeSearch}
                onChange={(e) => setBikeSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13, outline: 'none', marginBottom: 12 }}
              />
            </Field>
            <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--border-secondary)', borderRadius: 8, background: 'var(--bg-primary)' }}>
              {filteredBikes.length > 0 ? (
                filteredBikes.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBikeId(b.id)}
                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid var(--border-secondary)', backgroundColor: selectedBikeId === b.id ? 'var(--brand-light)' : 'transparent' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{b.chassisNumber}</span>
                      <span style={{ fontSize: 11, color: 'var(--brand-dark)', background: 'var(--brand-light)', padding: '2px 6px', borderRadius: 4 }}>In Stock</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Engine: {b.engineNumber}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No stock units available</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button onClick={() => { setAssigningBike(null); setBikeSearch(''); setSelectedBikeId(''); }} variant="secondary">Cancel</Button>
            <Button onClick={handleAssignBike} disabled={!selectedBikeId}>Finalize Challan</Button>
          </div>
        </Modal>
      )}

      {/* ── EDIT SALE MODAL (no sale items - those are locked once booked) ── */}
      {editModal && editForm && (
        <Modal title={`Edit Sale - ${sale.saleNumber || sale.id?.slice(0, 8)}\u2026`} onClose={() => setEditModal(false)} width={780}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 12, borderRadius: 8, fontSize: 12, color: '#1e3a8a', marginBottom: 18 }}>
            Sale items cannot be changed after a sale is booked. Use <strong>Exchange</strong> on a line item for that. Saving here regenerates the challan.
          </div>

          <div style={{ maxHeight: '58vh', overflowY: 'auto', paddingRight: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: 12 }}>Customer Information</div>
            <FormGrid cols={3}>
              <Field label="Name *"><Input value={editForm.customer.name} onChange={e => setEditCustomer('name', e.target.value)} /></Field>
              <Field label="Phone *"><Input value={editForm.customer.phone} onChange={e => setEditCustomer('phone', e.target.value)} /></Field>
              <Field label="Aadhaar Number"><Input value={editForm.customer.aadhaarNumber} onChange={e => setEditCustomer('aadhaarNumber', e.target.value)} /></Field>
              <Field label="PAN Number"><Input value={editForm.customer.panNumber} onChange={e => setEditCustomer('panNumber', e.target.value)} /></Field>
              <Field label="Address Line 1" style={{ gridColumn: 'span 2' }}><Input value={editForm.customer.address.addressLine1} onChange={e => setEditAddress('addressLine1', e.target.value)} /></Field>
              <Field label="Address Line 2" style={{ gridColumn: 'span 2' }}><Input value={editForm.customer.address.addressLine2} onChange={e => setEditAddress('addressLine2', e.target.value)} /></Field>
              <Field label="City"><Input value={editForm.customer.address.city} onChange={e => setEditAddress('city', e.target.value)} /></Field>
              <Field label="State"><Input value={editForm.customer.address.state} onChange={e => setEditAddress('state', e.target.value)} /></Field>
              <Field label="Postal Code"><Input value={editForm.customer.address.postalCode} onChange={e => setEditAddress('postalCode', e.target.value)} /></Field>
            </FormGrid>

            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '24px 0 12px', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>Nominee</div>
            <FormGrid cols={3}>
              <Field label="Nominee Name"><Input value={editForm.nomineeName} onChange={e => setEditField('nomineeName', e.target.value)} /></Field>
              <Field label="Nominee Age"><Input type="number" value={editForm.nomineeAge} onChange={e => setEditField('nomineeAge', e.target.value)} /></Field>
              <Field label="Relation"><Input value={editForm.nomineeRelation} onChange={e => setEditField('nomineeRelation', e.target.value)} /></Field>
            </FormGrid>

            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '24px 0 12px', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>Finance Details</div>
            <FormGrid cols={2}>
              <Field label="Finance Company"><Input value={editForm.financeCompany} onChange={e => setEditField('financeCompany', e.target.value)} placeholder="e.g. TATA CAPITAL" /></Field>
              <Field label="Disbursement Amount"><Input type="number" value={editForm.disbursementAmount} onChange={e => setEditField('disbursementAmount', e.target.value)} /></Field>
              <Field label="Executive Name"><Input value={editForm.financeExecutiveName} onChange={e => setEditField('financeExecutiveName', e.target.value)} /></Field>
              <Field label="Executive Phone"><Input value={editForm.financeExecutivePhone} onChange={e => setEditField('financeExecutivePhone', e.target.value)} /></Field>
            </FormGrid>

            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: '24px 0 12px', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>Payment Mode & Amounts</div>
            <FormGrid cols={2}>
              <Field label="Payment Type">
                <Select value={editForm.paymentType} onChange={e => setEditField('paymentType', e.target.value)}>
                  {PAYMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </Select>
              </Field>
              <Field label="Payment Method">
                <Select value={editForm.paymentMethod} onChange={e => setEditField('paymentMethod', e.target.value)}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
              </Field>
              <Field label={`Amount Paid (total ${fmtINR(sale?.totalAmount || 0)})`}>
                <Input type="number" value={editForm.paidAmount} onChange={e => setEditField('paidAmount', e.target.value)} />
              </Field>
              <Field label="Pending Balance">
                <Input type="number" value={editForm.pendingAmount} onChange={e => setEditField('pendingAmount', e.target.value)} />
              </Field>
              <Field label="Notes" style={{ gridColumn: '1 / -1' }}>
                <Input value={editForm.notes} onChange={e => setEditField('notes', e.target.value)} placeholder="Any special instructions or commitments..." />
              </Field>
            </FormGrid>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, marginTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button variant="secondary" onClick={() => setEditModal(false)} disabled={savingEdit}>Cancel</Button>
            <Button onClick={handleSaveSaleEdit} disabled={savingEdit}>{savingEdit ? 'Saving\u2026' : 'Save Changes'}</Button>
          </div>
        </Modal>
      )}

      {/* ── INTERACTIVE OPERATIONAL ITEM EXCHANGE MODAL ── */}
      {exchangingItem && (
        <Modal 
          title={`Exchange Item - ${exchangingItem.itemType === 'BIKE' ? 'Vehicle Allocation' : 'Accessory Unit'}`} 
          onClose={() => setExchangingItem(null)}
        >
          <div style={{ padding: '4px 0 12px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 8, fontSize: 12, color: '#78350f' }}>
              <strong>Original Item Ledger Value:</strong> {exchangingItem.quantity}x unit(s) at {fmtINR(exchangingItem.unitPrice)} each. Net value was: <strong>{fmtINR(exchangingItem.lineTotal)}</strong>.
            </div>

            {/* <Field label="Replacement Category Type">
              <select
                value={exchangeType}
                onChange={(e) => setExchangeType(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
              >
                <option value="BIKE">BIKE MODEL</option>
                <option value="ACCESSORY">ACCESSORY STOCK VARIANT</option>
              </select>
            </Field> */}

            <Field label="Choose Replacement Catalog Choice">
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
              >
                <option value="">-- Select Active Variant --</option>
                {catalogList.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} {asset.brand ? `[${asset.brand}]` : ''} {asset.price || asset.exShowroomPrice ? `(MSRP: ₹${asset.price || asset.exShowroomPrice})` : ''}
                  </option>
                ))}
              </select>
            </Field>

            {exchangeType === 'BIKE' ? (
              <Field label="Color">
                <input 
                  type="text" 
                  placeholder="e.g. Techno Blue / Sports Red"
                  value={exchColor}
                  onChange={(e) => setExchColor(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
                />
              </Field>
            ) : (
              <Field label="Quantity">
                <input 
                  type="number" 
                  min="1"
                  value={exchQty}
                  onChange={(e) => setExchQty(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
                />
              </Field>
            )}

            <Field label="Custom Price Override">
                <input 
                  type="number" 
                  placeholder="Leave blank for showroom default"
                  value={exchUnitPrice}
                  onChange={(e) => setExchUnitPrice(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
                />
              </Field>

            {/* <div s/tyle={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}> */}
              
              {/* <Field label="Deduction / Discount Amount">
                <input 
                  type="number" 
                  min="0"
                  value={exchDiscount}
                  onChange={(e) => setExchDiscount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13 }}
                />
              </Field> */}
            {/* </div> */}

            <Field label="Operational Audit Notes">
              <textarea 
                rows="2"
                placeholder="State the reason for this item exchange transaction..."
                value={exchNotes}
                onChange={(e) => setExchNotes(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-secondary)', fontSize: 13, resize: 'none' }}
              />
            </Field>
          </div>
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button onClick={() => setExchangingItem(null)} variant="secondary" disabled={processingExchange}>Cancel</Button>
            <Button onClick={handleProcessExchange} disabled={processingExchange || !selectedTargetId}>
              {processingExchange ? 'Processing...' : 'Execute Replacement'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}