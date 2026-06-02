import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShoppingCart, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { exchangeBikesApi } from '../api/services';
import { fmtINR } from '../utils/constants';
import { Card, PageHeader } from '../components/ui';

export default function ExchangeBikeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // Calls GET /:id (mapped to exchangeBikeController.getExchangeBike)
      const response = await exchangeBikesApi.getById(id);
      setBike(response.data || response);
    } catch (error) {
      console.error('Error loading trade-in asset details:', error);
      toast.error('Failed to fetch detailed records');
      navigate('/exchange-bikes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Fetching trade-in asset details...</div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Record asset data profile link broken or not found</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Navigation Headers Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/exchange-bikes')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: 'var(--brand-dark)', cursor: 'pointer',
            border: 'none', background: 'none', fontSize: '14px', fontWeight: 500,
          }}
        >
          <ArrowLeft size={18} /> Back to Trade-Ins Ledger
        </button>

        <button
          onClick={() => navigate(`/sales/${bike.saleId}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--brand-dark)', color: 'white',
            padding: '8px 16px', borderRadius: 8, border: 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 500,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <ShoppingCart size={16} /> View Linked Sale Order Profile
        </button>
      </div>

      <PageHeader 
        icon={RefreshCw} 
        title={`${bike.oldBikeBrand} ${bike.oldBikeName}`} 
        subtitle={`Trade-In Profile Assessment Matrix for Registry Entry Code: ${bike.id}`} 
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column - Core Specifications hardware info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
              Trade-In Specifications Matrix
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Brand Make</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{bike.oldBikeBrand}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Model Descriptor Name</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{bike.oldBikeName}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Trim/Variant Spec</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{bike.oldBikeModel}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Body Finish Paint Color</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{bike.oldBikeColor}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Manufacturing Calendar Year</p>
                <p style={{ fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} /> {bike.oldBikeYear}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Financial Valuation Credit</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-dark)' }}>{fmtINR(bike.exchangeValue || 0)}</p>
              </div>
            </div>
          </Card>

          {/* Engine & Block Markings */}
          <Card>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
              Regulatory Block Identifiers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Engine Serial Number</p>
                <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: 6 }}>
                  {bike.oldBikeEngineNumber || 'NOT RECORDED'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Chassis Structural Frame Number</p>
                <p style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 600, background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: 6 }}>
                  {bike.oldBikeChassisNumber || 'NOT RECORDED'}
                </p>
              </div>
            </div>
          </Card>

          {bike.notes && (
            <Card>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Physical Inspection Team Notes</h3>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>{bike.notes}</p>
            </Card>
          )}
        </div>

        {/* Right Column - Checklist status summary tracker */}
        <div>
          <Card>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
              Legal Paper Verification
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '0.5px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Original RC Booklet</span>
                {bike.isOldRCAvailable ? 
                  <span style={{ fontSize: 11, color: 'var(--success-fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} fill="#10b981" stroke="#fff" /> Passed</span> : 
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> Missing</span>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '0.5px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>RTO NOC clearance Certificate</span>
                {bike.isNocAvailable ? 
                  <span style={{ fontSize: 11, color: 'var(--success-fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} fill="#10b981" stroke="#fff" /> Passed</span> : 
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> Missing</span>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '0.5px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Owner Identity Copy Documentation</span>
                {bike.isOwnerDocumentAvailable ? 
                  <span style={{ fontSize: 11, color: 'var(--success-fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} fill="#10b981" stroke="#fff" /> Passed</span> : 
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> Missing</span>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '0.5px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Traffic Challan Clearance Check</span>
                {bike.isChallanAvailable ? 
                  <span style={{ fontSize: 11, color: 'var(--success-fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} fill="#10b981" stroke="#fff" /> Passed</span> : 
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> Missing</span>
                }
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Bank Hypothecation Clear Status</span>
                {bike.isStatmentAvailable ? 
                  <span style={{ fontSize: 11, color: 'var(--success-fg)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} fill="#10b981" stroke="#fff" /> Passed</span> : 
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14} /> Missing</span>
                }
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}