import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bike, Calendar, Hash, Palette, CheckCircle, XCircle, Edit3, Settings, User, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { bikesApi } from '../api/services';
import { STATUS_COLORS, fmtINR } from '../utils/constants';
import { Card, Badge, Button, Field, Input, FormGrid } from '../components/ui';

export default function BikeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBikeDetails();
  }, [id]);

  const fetchBikeDetails = async () => {
    try {
      setLoading(true);
      const resp = await bikesApi.getById(id);
      const data = resp.data || resp;
      setBike(data);
      setForm({
        registrationNumber: data.registrationNumber || '',
        isRcArrived: !!data.isRcArrived,
        isNumberPlateReady: !!data.isNumberPlateReady,
        isInsuranceRecived: !!data.isInsuranceRecived,
      });
    } catch (err) {
      toast.error('Failed to load bike details');
      navigate('/bikes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await bikesApi.update(id, form);
      toast.success('Bike details updated');
      setEditing(false);
      fetchBikeDetails();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!bike) return null;

  const isSold = bike.status === 'SOLD';
  const isAvailable = bike.status === 'AVAILABLE';

  // Find sale info from either direct relation or via saleItems (for older data)
  const saleInfo = bike.sale || (bike.saleItems?.[0]?.sale);

  return (
    <div style={{ width: '100%', padding: '0 24px' }}>
      <button 
        onClick={() => navigate('/bikes')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, width: '100%' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{bike.model?.name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{bike.chassisNumber}</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Badge label={bike.status} variant={bike.status === 'AVAILABLE' ? 'success' : 'warning'} />
          {!isAvailable && (
            <Button icon={Edit3} onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel Edit' : 'Update Registration'}
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, width: '100%' }}>
        {/* Core Specs */}
        <Card title="Bike Specifications" icon={Bike}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <DetailRow label="Model" value={bike.model?.name} />
            <DetailRow label="Engine No" value={bike.engineNumber} />
            <DetailRow label="Chassis No" value={bike.chassisNumber} />
            <DetailRow label="Color" value={bike.color} />
            <DetailRow label="Mfg Year" value={bike.manufactureYear} />
            <DetailRow label="Category" value={bike.model?.category} />
          </div>
        </Card>

        {/* Registration Details */}
        <Card title="Registration & RC" icon={CheckCircle}>
          {isAvailable ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0, fontSize: 14 }}>Registration details can only be updated after the bike is reserved or sold.</p>
            </div>
          ) : !editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                  Number Plate
                </label>
                <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>
                  {bike.registrationNumber || 'N/A'}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>RC Document Arrived</span>
                {bike.isRcArrived ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Number Plate Ready</span>
                {bike.isNumberPlateReady ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              </div>

              

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14 }}>Insurance Received</span>
                {bike.isInsuranceRecived ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Number Plate">
                <Input 
                  value={form.registrationNumber} 
                  onChange={e => setForm({...form, registrationNumber: e.target.value})}
                  placeholder="e.g. MH-12-AB-1234"
                />
              </Field>

              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="checkbox" 
                  id="isRcArrived"
                  checked={form.isRcArrived} 
                  onChange={e => setForm({...form, isRcArrived: e.target.checked})} 
                />
                <label htmlFor="isRcArrived" style={{ fontSize: 14 }}>RC Arrived</label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="checkbox" 
                  id="isNumberPlateReady"
                  checked={form.isNumberPlateReady} 
                  onChange={e => setForm({...form, isNumberPlateReady: e.target.checked})} 
                />
                <label htmlFor="isNumberPlateReady" style={{ fontSize: 14 }}>Number Plate Ready</label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="checkbox"
                  id="isInsuranceRecived"
                  checked={form.isInsuranceRecived}
                  onChange={e => setForm({ ...form, isInsuranceRecived: e.target.checked })}
                />
                <label htmlFor="isInsuranceRecived" style={{ fontSize: 14 }}>Insurance Received</label>
              </div>

              <Button onClick={handleSave} disabled={saving} style={{ marginTop: 8 }}>
                {saving ? 'Saving...' : 'Save Updates'}
              </Button>
            </div>
          )}
        </Card>

        {/* Sale & Customer Info */}
        <div style={{ gridColumn: '1 / -1' }}>
          {isSold && saleInfo ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <Card title="Sales Details" icon={ShoppingBag}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <DetailRow label="Sale Number" value={
                    <span style={{ fontWeight: 600, color: 'var(--brand-primary)', cursor: 'pointer' }} onClick={() => navigate(`/sales/${saleInfo.id}`)}>
                      #{saleInfo.saleNumber}
                    </span>
                  } />
                  <DetailRow label="Sale Date" value={new Date(saleInfo.saleDate).toLocaleDateString()} />
                  <DetailRow label="Total Amount" value={fmtINR(saleInfo.totalAmount)} />
                  <DetailRow label="Payment Status" value={saleInfo.isPaid ? 'Paid' : 'Pending'} />
                  <DetailRow label="Payment Type" value={saleInfo.paymentType?.replace(/_/g, ' ')} />
                </div>
                <div style={{ marginTop: 16, borderTop: '0.5px solid var(--border-primary)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/sales/${saleInfo.id}`)}>
                    See Full Sale Details
                  </Button>
                </div>
              </Card>

              <Card title="Customer Details" icon={User}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <DetailRow label="Name" value={saleInfo.customer?.name} />
                  <DetailRow label="Phone" value={saleInfo.customer?.phone} />
                  <DetailRow label="Email" value={saleInfo.customer?.email} />
                  <DetailRow label="Address" value={`${saleInfo.customer?.address?.addressLine1}, ${saleInfo.customer?.address?.city}`} />
                </div>
              </Card>
            </div>
          ) : (
            <Card title="Sales Information" icon={ShoppingBag}>
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>
                  This bike is yet to be sold.
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Purchase Info if exists */}
        {bike.purchase && (
          <Card title="Purchase Reference" icon={Calendar} style={{ gridColumn: '1 / -1' }}>
             <p style={{ margin: 0, fontSize: 14 }}>
               Part of Purchase <span style={{ fontWeight: 600, color: 'var(--brand-primary)', cursor: 'pointer' }} onClick={() => navigate(`/purchases/${bike.purchaseId}`)}>#{bike.purchase.purchaseNumber}</span> 
               {' '}dated {new Date(bike.purchase.purchaseDate).toLocaleDateString()}
             </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 8 }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{value || '—'}</span>
    </div>
  );
}
