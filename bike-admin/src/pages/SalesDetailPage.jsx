import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Edit2, Save, X, Eye, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi, bikesApi } from '../api/services';
import { fmtINR, STATIC_BASE } from '../utils/constants';
import { Button, Modal, Select, Field } from '../components/ui';

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

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  useEffect(() => {
    if (assigningBike) {
      fetchAvailableBikes(assigningBike.modelId, assigningBike.color);
    }
  }, [assigningBike]);

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
      const resp = await bikesApi.getAll();
      const all = resp.data || resp;
      setAvailableBikes(all.filter(b => b.status === 'AVAILABLE' && b.modelId === modelId ));
    } catch (err) {
      toast.error('Failed to fetch available bikes');
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
  };

  const statusTextColor = {
    PDI: '#0369a1',
    PENDING: 'var(--warning-fg)',
    PAID: 'var(--success-fg)',
    CONFIRMED: 'var(--success-fg)',
    CANCELLED: 'var(--danger-fg)',
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
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
          {sale.status === 'PDI' && (
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
          )}
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

      {/* Sale Info Cards */}
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

      {/* Customer Information */}
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

      {/* Conditional Vehicle Exchange Module Data Card */}
      {sale.exchange && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border-secondary)', paddingBottom: 10 }}>
            <RefreshCw size={18} style={{ color: 'var(--brand-dark)' }} />
            <h2 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', margin: 0 }}>
              Linked Vehicle Exchange Information
            </h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Identity</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {sale.exchange.oldBikeBrand} {sale.exchange.oldBikeName}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Model Variant: {sale.exchange.oldBikeModel}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Mfg Year & Color</p>
              <p style={{ fontSize: 13, fontWeight: 500 }}>Year: {sale.exchange.oldBikeYear}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Color: {sale.exchange.oldBikeColor}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Engine / Chassis Numbers</p>
              <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>Eng: {sale.exchange.oldBikeEngineNumber || '—'}</p>
              <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' }}>Chas: {sale.exchange.oldBikeChassisNumber || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Valuation Credit</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale.exchange.exchangeValue || 0)}</p>
            </div>
          </div>

          {sale.exchange.notes && (
            <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: 6, fontSize: 12, marginBottom: 20, border: '0.5px solid var(--border-secondary)' }}>
              <strong>Evaluation Team Remarks:</strong> {sale.exchange.notes}
            </div>
          )}

          {/* Verification Status List mapping */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, border: '0.5px solid var(--border-secondary)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={12} /> Legal Document Verification Checklist
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: sale.exchange.isOldRCAvailable ? 'var(--success-fg)' : 'var(--text-tertiary)' }}>
                <CheckCircle size={14} fill={sale.exchange.isOldRCAvailable ? '#10b981' : 'none'} stroke={sale.exchange.isOldRCAvailable ? '#fff' : 'currentColor'} />
                Original RC Book Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: sale.exchange.isNocAvailable ? 'var(--success-fg)' : 'var(--text-tertiary)' }}>
                <CheckCircle size={14} fill={sale.exchange.isNocAvailable ? '#10b981' : 'none'} stroke={sale.exchange.isNocAvailable ? '#fff' : 'currentColor'} />
                RTO NOC Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: sale.exchange.isOwnerDocumentAvailable ? 'var(--success-fg)' : 'var(--text-tertiary)' }}>
                <CheckCircle size={14} fill={sale.exchange.isOwnerDocumentAvailable ? '#10b981' : 'none'} stroke={sale.exchange.isOwnerDocumentAvailable ? '#fff' : 'currentColor'} />
                Owner Identity Docs Copy
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: sale.exchange.isChallanAvailable ? 'var(--success-fg)' : 'var(--text-tertiary)' }}>
                <CheckCircle size={14} fill={sale.exchange.isChallanAvailable ? '#10b981' : 'none'} stroke={sale.exchange.isChallanAvailable ? '#fff' : 'currentColor'} />
                Traffic Challan Clear Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: sale.exchange.isStatmentAvailable ? 'var(--success-fg)' : 'var(--text-tertiary)' }}>
                <CheckCircle size={14} fill={sale.exchange.isStatmentAvailable ? '#10b981' : 'none'} stroke={sale.exchange.isStatmentAvailable ? '#fff' : 'currentColor'} />
                Hypothecation NOC Statement
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Items */}
      {sale?.items && sale.items.length > 0 && (
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Sale Items</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Item</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Ex-Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Exchange Deduction Credit</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>GST</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Net Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => {
                  const modelName = item.model?.name || item.bike?.model?.name || 'Unknown Model';
                  const color = item.color || item.bike?.color || '—';
                  const isBike = item.itemType === 'BIKE';
                  const needsBike = isBike && !item.bikeId;

                  return (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                      <td style={{ padding: '12px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{item.itemType === 'BIKE' ? modelName : item.accessory?.name}</div>
                        {isBike && (
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            Color: {color} {item.bikeId ? `| Chassis: ${item.bike.chassisNumber} | Engine: ${item.bike.engineNumber}` : '(Not yet assigned)'}
                          </div>
                        )}
                        {needsBike && (
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
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{fmtINR(item.unitPrice || 0)}</td>
                      
                      {/* Interactive breakdown display of trade-in deduction values per ledger row */}
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, color: item.discountAmount > 0 ? 'var(--brand-dark)' : 'var(--text-tertiary)' }}>
                        {item.discountAmount > 0 ? `- ${fmtINR(item.discountAmount)}` : '—'}
                      </td>
                      
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>
                        {item.cgstRate + item.sgstRate + item.igstRate + item.cessRate}%
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600 }}>{fmtINR(item.lineTotal || 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Payment Summary</h2>

        {/* Amount Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Grand Total (After Trade-In Deductions)</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale?.totalAmount || 0)}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Amount Paid</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>{fmtINR(sale?.paidAmount || 0)}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Balance Due</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--warning-fg)' }}>{fmtINR(sale?.pendingAmount || 0)}</p>
            </div>
          </div>
        </div>

        {/* Pending Amount Section */}
        <div style={{ background: 'var(--brand-light)', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pending Amount</p>
              {editingPending ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="number"
                    value={pendingAmount}
                    onChange={(e) => setPendingAmount(parseFloat(e.target.value) || 0)}
                    style={{ width: 120, padding: '8px 10px', border: '1px solid var(--border-secondary)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-sans)' }}
                    min="0"
                    step="0.01"
                  />
                  <button
                    onClick={handleUpdatePendingAmount}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--success-bg)', color: 'var(--success-fg)', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)' }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => { setEditingPending(false); setPendingAmount(sale?.pendingAmount || 0); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--text-tertiary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)' }}
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale?.pendingAmount || 0)}</p>
                  <button
                    onClick={() => setEditingPending(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--brand-dark)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-sans)' }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Status Badge */}
        {sale.isPaid ? (
          <div style={{ marginTop: 16, background: 'var(--success-bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border-secondary)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success-fg)', margin: 0 }}>✓ Fully Paid</p>
          </div>
        ) : (
          <div style={{ marginTop: 16, background: 'var(--warning-bg)', padding: 12, borderRadius: 8, border: '1px solid var(--border-secondary)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--warning-fg)', margin: 0 }}>⏳ Pending Payment</p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
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
            {sale.invoiceUrl && (
              <a
                href={`${STATIC_BASE}/${sale.invoiceUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: 'var(--brand-dark)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}
              >
                <Download size={14} /> Download Challan
              </a>
            )}
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
            {pdiUrl && (
              <a
                href={`${STATIC_BASE}/${pdiUrl}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#0ea5e9', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)' }}
              >
                <Download size={14} /> Download PDI Slip
              </a>
            )}
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
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-secondary)',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  marginBottom: 12
                }}
              />
            </Field>

            <div style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--border-secondary)', borderRadius: 8, background: 'var(--bg-primary)' }}>
              {filteredBikes.length > 0 ? (
                filteredBikes.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBikeId(b.id)}
                    style={{
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-secondary)',
                      backgroundColor: selectedBikeId === b.id ? 'var(--brand-light)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.chassisNumber}</span>
                      <span style={{ fontSize: 11, color: 'var(--brand-dark)', background: 'var(--brand-light)', padding: '2px 6px', borderRadius: 4 }}>In Stock</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Engine: {b.engineNumber}</div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                  {availableBikes.length === 0 ? 'No stock available for this model/color' : 'No matching results'}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border-secondary)' }}>
            <Button onClick={() => { setAssigningBike(null); setBikeSearch(''); setSelectedBikeId(''); }} variant="secondary">Cancel</Button>
            <Button onClick={handleAssignBike} disabled={!selectedBikeId}>Finalize Challan</Button>
          </div>
        </Modal>
      )}
    </div>
  );
} 