import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Edit2, Save, X, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { salesApi } from '../api/services';
import { fmtINR, STATIC_BASE } from '../utils/constants';
import { Button, Modal } from '../components/ui';

export default function SalesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPending, setEditingPending] = useState(false);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

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
    PENDING: 'var(--warning-bg)',
    PAID: 'var(--success-bg)',
    CONFIRMED: 'var(--success-bg)',
    CANCELLED: 'var(--danger-bg)',
  };

  const statusTextColor = {
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
          onMouseEnter={(e) => (e.target.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          <ArrowLeft size={18} />
          Back to Sales
        </button>
        <div style={{ display: 'flex', gap: '10px' }}>
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
              onMouseEnter={(e) => (e.target.style.background = 'var(--brand-dark)', e.target.style.color = '#fff')}
              onMouseLeave={(e) => (e.target.style.background = 'var(--brand-light)', e.target.style.color = 'var(--brand-dark)')}
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
            onMouseEnter={(e) => {
              if (sale.invoiceUrl) e.target.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
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
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>Customer Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.name}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.email}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.phone}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Type</p>
              <p style={{ fontSize: 14, fontWeight: 500 }}>{sale.customer.type}</p>
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
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sale.customer.address.country}</p>
              </div>
            )}
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
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Unit Price</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Discount</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Tax</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => {
                  const itemName = item.itemType === 'BIKE' ? `${item.bike?.model?.brand || ''} ${item.bike?.model?.name || ''} (${item.bike?.color || ''})` : item.accessory?.name || 'Unknown Item';
                  return (
                    <tr
                      key={index}
                      style={{ borderBottom: '1px solid var(--border-secondary)' }}
                      onMouseEnter={(e) => (e.target.parentElement.style.backgroundColor = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.target.parentElement.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '12px', fontSize: 13 }}>{itemName}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>₹{(item.unitPrice || 0).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{(item.discountAmount || 0) > 0 ? `-₹${((item.discountAmount || 0) * item.quantity).toFixed(2)}` : '₹0'}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13 }}>{item.taxRate || 0}%</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600 }}>₹{(item.lineTotal || 0).toFixed(2)}</td>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-secondary)' }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Subtotal</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{fmtINR(sale?.subtotal || 0)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Discount</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--danger-fg)' }}>-{fmtINR(sale?.discountAmount || 0)}</p>
          </div>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Tax</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{fmtINR(sale?.taxAmount || 0)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(sale?.totalAmount || 0)}</p>
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
        <Modal title={`Invoice Preview - ${sale.saleNumber || sale.id?.slice(0, 8)}…`} onClose={() => setInvoiceModal(false)} width={700}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
            <iframe
              src={`${STATIC_BASE}/${sale.invoiceUrl}`}
              title="Invoice"
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
                <Download size={14} /> Download Invoice
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
