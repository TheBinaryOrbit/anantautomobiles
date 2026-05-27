import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Calendar, User, FileText, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { purchasesApi } from '../api/services';
import { fmtINR } from '../utils/constants';
import { Card, Badge, Table } from '../components/ui';

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      const response = await purchasesApi.getById(id);
      setPurchase(response.data || response);
    } catch (error) {
      console.error('Error fetching purchase:', error);
      toast.error('Failed to load purchase details');
      navigate('/purchases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading purchase details...</div>
      </div>
    );
  }

  if (!purchase) return null;

  // Group bikes by model
  const groupedBikes = (purchase.bikes || []).reduce((acc, bike) => {
    const modelId = bike.modelId || 'unknown';
    if (!acc[modelId]) {
      acc[modelId] = {
        model: bike.model,
        items: []
      };
    }
    acc[modelId].items.push(bike);
    return acc;
  }, {});

  const bikeCols = [
    { key: 'engineNumber', label: 'Engine No' },
    { key: 'chassisNumber', label: 'Chassis No' },
    { key: 'color', label: 'Color' },
    { key: 'manufactureYear', label: 'Mfg Year' },
    { 
      key: 'status', 
      label: 'Status', 
      render: r => <Badge label={r.status} /> 
    }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/purchases')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}
      >
        <ArrowLeft size={16} /> Back to Purchases
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Purchase #{purchase.purchaseNumber}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Details for inventory acquisition
          </p>
        </div>
        <Badge label={purchase.status} variant={purchase.status === 'COMPLETED' ? 'success' : 'warning'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        <Card title="Supplier Information" icon={User}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Supplier Name</label>
              <span style={{ fontWeight: 500 }}>{purchase.supplier?.name}</span>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Company</label>
              <span style={{ fontWeight: 500 }}>{purchase.supplier?.companyName || '—'}</span>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Contact</label>
              <span style={{ fontWeight: 500 }}>{purchase.supplier?.phone}</span>
            </div>
          </div>
        </Card>

        <Card title="Purchase Info" icon={Calendar}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Purchase Date</label>
              <span style={{ fontWeight: 500 }}>{new Date(purchase.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block' }}>Total Bikes</label>
              <span style={{ fontWeight: 500 }}>{purchase.bikes?.length || 0} Units</span>
            </div>
          </div>
        </Card>

        <Card title="Notes" icon={FileText} style={{ gridColumn: '1 / -1' }}>
          <p style={{ margin: 0, fontStyle: purchase.notes ? 'normal' : 'italic', color: purchase.notes ? 'inherit' : 'var(--text-secondary)' }}>
            {purchase.notes || 'No additional notes provided for this purchase.'}
          </p>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Object.values(groupedBikes).map((group, idx) => (
          <Card 
            key={idx} 
            title={group.model ? `${group.model.name} (${group.items.length} Units)` : `Unknown Model (${group.items.length} Units)`}
            icon={ShoppingCart}
          >
            {group.model && (
              <div style={{ display: 'flex', gap: 24, marginBottom: 16, padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Brand:</span> <span style={{ fontWeight: 500 }}>{group.model.brand}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Category:</span> <span style={{ fontWeight: 500 }}>{group.model.category}</span>
                </div>
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Taxation:</span>{' '}
                  <span style={{ fontWeight: 500 }}>
                    CGST {group.model.cgstRate}% | SGST {group.model.sgstRate}% | IGST {group.model.igstRate}%
                  </span>
                </div>
                {group.model.hsnCode && (
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>HSN:</span> <span style={{ fontWeight: 500 }}>{group.model.hsnCode}</span>
                  </div>
                )}
              </div>
            )}
            <Table
              cols={bikeCols}
              rows={group.items}
            />
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ background: '#3b82f6', color: 'white', padding: 6, borderRadius: 8 }}>
          <Info size={20} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: 14 }}>Model Information</h4>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
            The tax rates and specifications shown above (CGST/SGST/IGST) are based on the current configuration of the linked Bike Model records.
          </p>
        </div>
      </div>
    </div>
  );
}