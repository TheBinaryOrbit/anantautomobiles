import { useState, useEffect } from 'react';
import { Wrench, Plus, MapPin, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { inquiriesApi } from '../api/services';
import { PageHeader, Card, Button, Modal, Field, Input, Select, FormGrid } from '../components/ui';

export default function ServiceInquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  // Modal Creation Form State
  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceType: 'Doorstep Service',
    isPaid: 'paid',
    freeServiceId: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiriesApi.getServiceInquiries();
      setInquiries(res.data || res);
    } catch (err) {
      toast.error('Failed to load service inquiries ledger data');
    } finally {
      setLoading(false);
    }
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation tracking is not supported by your browser');
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        setLocLoading(false);
        toast.success('Live location coordinates fetched successfully!');
      },
      () => {
        setLocLoading(false);
        toast.error('Could not auto-fetch location. Please input coordinates manually.');
      }
    );
  };

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.latitude || !form.longitude) {
      toast.error('Please complete all mandatory setup fields');
      return;
    }

    setSubmitting(true);
    try {
      await inquiriesApi.submitService(form);
      toast.success('Service inquiry recorded successfully');
      setModalOpen(false);
      setForm({ name: '', phone: '', serviceType: 'Doorstep Service', isPaid: 'paid', freeServiceId: '', latitude: '', longitude: '' });
      fetchInquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to record application ticket');
    } finally {
      setSubmitting(false);
    }
  };

  // Excel Export Handler for Service Inquiries
  const exportToExcel = () => {
    if (inquiries.length === 0) {
      toast.warn('No service tickets available to export');
      return;
    }

    const headers = [
      'Customer Name',
      'Contact Phone',
      'Allocation Service Type',
      'Billing Classification',
      'Free Service ID Reference',
      'Latitude Coordinate',
      'Longitude Coordinate',
      'Google Maps URL Link',
      'Logged Date'
    ];

    const rows = inquiries.map(inq => [
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.phone}"`,
      `"${inq.serviceType}"`,
      `"${inq.isPaid}"`,
      `"${inq.freeServiceId || '—'}"`,
      `"${inq.latitude}"`,
      `"${inq.longitude}"`,
      `"https://www.google.com/maps/search/?api=1&query=${inq.latitude},${inq.longitude}"`,
      `"${new Date(inq.createdAt).toLocaleDateString('en-IN')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `Service_Tickets_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Service tickets ledger exported successfully!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading service tracking ledger...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Container Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <PageHeader icon={Wrench} title="Service Tickets Ledger" subtitle="Manage on-site workshops and doorstep vehicle maintenance requests" />
        
        <div style={{ display: 'flex', gap: 10 }}>
          <Button onClick={exportToExcel} variant="secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Download size={16} /> Export to Excel
          </Button>
          {/* <Button onClick={() => setModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Log Service Ticket
          </Button> */}
        </div>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Customer Profile</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Allocation Type</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Billing Classification</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Coupon/Booklet Reference</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Google Maps Dispatch Navigation</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td style={{ padding: '12px', fontSize: 13, fontWeight: 600 }}>
                      <div>{inq.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>{inq.phone}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13 }}>{inq.serviceType}</td>
                    <td style={{ textAlign: 'center', padding: '12px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12,
                        background: inq.isPaid === 'paid' ? 'var(--success-bg)' : 'var(--brand-light)',
                        color: inq.isPaid === 'paid' ? 'var(--success-fg)' : 'var(--brand-dark)'
                      }}>
                        {inq.isPaid === 'paid' ? 'Paid Billing' : 'Free Job Card'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, color: inq.freeServiceId ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {inq.freeServiceId || '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px' }}>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${inq.latitude},${inq.longitude}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ textDecoration: 'none' }}
                      >
                        <Button variant="secondary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={13} style={{ color: 'var(--brand-dark)' }} /> Launch Route Map
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No service ticket inquiries found in logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inline Ticket Creation Modal Sheet */}
      {modalOpen && (
        <Modal title="Log New Service Ticket" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreateInquiry} style={{ paddingTop: 8 }}>
            <FormGrid>
              <Field label="Customer Full Name *">
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Yaman Saini" />
              </Field>
              <Field label="Contact Phone Number *">
                <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. 8941092513" />
              </Field>
              <Field label="Service Delivery Selection *">
                <Select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}>
                  <option value="Doorstep Service">Doorstep Service Dispatch</option>
                  <option value="Workshop Pickup">Workshop Desk Pickup</option>
                </Select>
              </Field>
              <Field label="Payment Classification *">
                <Select value={form.isPaid} onChange={e => setForm({ ...form, isPaid: e.target.value })}>
                  <option value="paid">Paid Standard Job</option>
                  <option value="free">Free Coupon Book Execution</option>
                </Select>
              </Field>
              {form.isPaid === 'free' && (
                <Field label="Coupon Booklet Reference Identifier" style={{ gridColumn: '1/-1' }}>
                  <Input value={form.freeServiceId} onChange={e => setForm({ ...form, freeServiceId: e.target.value })} placeholder="e.g. FREE-SRV-9018" />
                </Field>
              )}

              <div style={{ gridColumn: '1/-1', border: '1px solid var(--border-secondary)', padding: 12, borderRadius: 8, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Dispatch Geolocation Coordinates *</span>
                  <Button type="button" variant="secondary" size="sm" onClick={getGeoLocation} disabled={locLoading}>
                    {locLoading ? 'Locking GPS...' : 'Fetch Live Coordinates'}
                  </Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input type="number" step="any" placeholder="Latitude Coord" value={form.latitude} onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || '' })} />
                  <Input type="number" step="any" placeholder="Longitude Coord" value={form.longitude} onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || '' })} />
                </div>
              </div>
            </FormGrid>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--border-secondary)', paddingTop: 14 }}>
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Register Ticket'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}