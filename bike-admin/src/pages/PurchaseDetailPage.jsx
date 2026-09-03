import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';
import { purchasesApi } from '../api/services';
import { fmtINR } from '../utils/constants';
import { Badge, Table } from '../components/ui';
import useWindowSize from '../hooks/useWindowSize';

const DOMAIN = 'https://api.anantautomobiles.com';

// ---- design tokens for this page -----------------------------------------
const ink = 'var(--text-primary)';
const muted = 'var(--text-secondary)';
const line = 'var(--border-color, rgba(100, 116, 139, 0.18))';
const accent = '#1F3A52';
const priceAccent = '#B5561D';
const mono = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

const Field = ({ label, children }) => (
  <div>
    <div style={{ fontSize: 12, color: muted, marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: ink }}>{children}</div>
  </div>
);

const SectionHeading = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: accent,
      marginBottom: 14,
      paddingBottom: 8,
      borderBottom: `1px solid ${line}`,
    }}
  >
    {children}
  </div>
);

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowSize();
  const isMobile = width < 768;

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
        <div style={{ color: muted, fontSize: 14 }}>Loading purchase details…</div>
      </div>
    );
  }

  if (!purchase) return null;

  const groupedBikes = (purchase.bikes || []).reduce((acc, bike) => {
    const modelId = bike.modelId || 'unknown';
    if (!acc[modelId]) {
      acc[modelId] = { model: bike.model, items: [] };
    }
    acc[modelId].items.push(bike);
    return acc;
  }, {});

  const bikeCols = [
    { key: 'engineNumber', label: 'Engine No', render: r => <span style={{ fontFamily: mono, fontSize: 13 }}>{r.engineNumber}</span> },
    { key: 'chassisNumber', label: 'Chassis No', render: r => <span style={{ fontFamily: mono, fontSize: 13 }}>{r.chassisNumber}</span> },
    { key: 'color', label: 'Color' },
    { key: 'manufactureYear', label: 'Mfg Year' },
    { key: 'manufactureMonth', label: 'Mfg Month' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} /> },
  ];

  const purchaseDate = new Date(purchase.purchaseDate).toLocaleDateString(undefined, { dateStyle: 'long' });
  const unitCount = purchase.bikes?.length || 0;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 20px 64px' }}>
      <button
        onClick={() => navigate('/purchases')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
          color: muted, cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit', fontSize: 13, padding: 0,
        }}
      >
        <ArrowLeft size={15} /> Back to Purchases
      </button>

      {/* Document header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <h1
            style={{
              margin: 0, fontFamily: mono, fontSize: 26, fontWeight: 700, color: ink, letterSpacing: '-0.01em',
            }}
          >
            Purchase No - {purchase.purchaseNumber}
          </h1>
          <Badge label={purchase.status} variant={purchase.status === 'COMPLETED' ? 'success' : 'warning'} />
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: muted }}>
          {unitCount} {unitCount === 1 ? 'unit' : 'units'} acquired from {purchase.supplier?.name || 'unknown supplier'} · {purchaseDate}
        </p>
      </div>

      {/* Supplier + Purchase info as a two-column ledger block */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32,
          paddingBottom: 28, marginBottom: 28, borderBottom: `1px solid ${line}`,
        }}
      >
        <div>
          <SectionHeading>Supplier</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Name">{purchase.supplier?.name}</Field>
            <Field label="Type">{purchase.supplier?.supplierType}</Field>
            <Field label="Company">{purchase.supplier?.companyName || '—'}</Field>
            <Field label="Contact">{purchase.supplier?.phone}</Field>
          </div>
        </div>

        <div>
          <SectionHeading>Purchase</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Date">{purchaseDate}</Field>
            <Field label="Total Units">{unitCount} Bikes</Field>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: `1px solid ${line}` }}>
        <SectionHeading>Notes</SectionHeading>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: purchase.notes ? ink : muted, fontStyle: purchase.notes ? 'normal' : 'italic' }}>
          {purchase.notes || 'No additional notes provided for this purchase.'}
        </p>
      </div>

      {/* Units, grouped by model */}
      <div>
        <SectionHeading>Units</SectionHeading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.values(groupedBikes).map((group, idx) => {
            const model = group.model;
            const imageUrl = model?.imageUrl ? `${DOMAIN}${model.imageUrl}` : null;

            return (
              <div key={idx} style={{ border: `1px solid ${line}`, borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 14px' : '14px 18px', borderBottom: `1px solid ${line}`, flexWrap: 'wrap'}}>
                  <ShoppingCart size={16} color={accent} />
                  <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: ink }}>
                    {model?.modelName || model?.name || 'Bike'}
                  </span>
                  <span style={{ fontSize: 12, color: muted }}>· {group.items.length} units</span>
                </div>

                {model && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile
                        ? '1fr'
                        : imageUrl
                          ? 'auto 1fr 1fr'
                          : '1fr 1fr',
                      gap: isMobile ? 14 : 20,
                      padding: isMobile ? '14px' : '18px',
                      borderBottom: `1px solid ${line}`,
                      alignItems: 'start',
                    }}
                  >
                    {imageUrl && (
                      <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-start' }}>
                        <img
                          src={imageUrl}
                          alt={model.name}
                          style={{ width: isMobile ? 80 : 96, height: isMobile ? 80 : 96, objectFit: 'contain' }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, fontSize: isMobile ? 12 : 13 }}>
                      <Field label="Brand / Name">{model.brand} — {model.name}</Field>
                      <Field label="Category">{model.category}</Field>
                      <Field label="Engine / Fuel">{model.engineCapacity} cc ({model.fuelType})</Field>
                      <Field label="Mileage / Weight">{model.mileage} kmpl / {model.weight} kg</Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14, fontSize: isMobile ? 12 : 13 }}>
                      <Field label="Ex-Showroom Price">
                        {fmtINR ? fmtINR(model.exShowroomPrice) : `₹${model.exShowroomPrice}`}
                      </Field>
                      <Field label="Purchase Price">
                        <span style={{ color: priceAccent }}>
                          {fmtINR ? fmtINR(model.purchasePrice) : `₹${model.purchasePrice}`}
                        </span>
                      </Field>
                      <Field label="HSN Code">
                        <span style={{ fontFamily: mono }}>{model.hsnCode || '—'}</span>
                      </Field>
                      <Field label="Remark">{model.remark || '—'}</Field>
                    </div>
                  </div>
                )}

                <div style={{ padding: isMobile ? '8px 8px 10px' : '4px 4px 12px', overflowX: 'auto' }}>
                  <Table cols={bikeCols} rows={group.items} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ marginTop: 28, fontSize: 12.5, color: muted, lineHeight: 1.6 }}>
        Tax rates and specifications above are pulled directly from the configured master bike model record.
      </p>
    </div>
  );
}