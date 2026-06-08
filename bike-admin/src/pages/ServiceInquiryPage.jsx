import { useState, useEffect } from 'react';
import { Wrench, Plus, MapPin, Download, Phone, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { inquiriesApi } from '../api/services';
import { PageHeader, Card, Button, Modal, Field, Input, Select, FormGrid } from '../components/ui';

export default function ServiceInquiryPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [viewRemarkModal, setViewRemarkModal] = useState({ open: false, remark: '' });
  const [remarks, setRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

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

  const openResolveModal = (id) => {
    setResolveModal({ open: true, id });
    setRemarks('');
  };

  const handleResolveInquiry = async () => {
    if (!remarks.trim()) { toast.error('Please enter a remarks before resolving'); return; }
    setResolving(true);
    try {
      await inquiriesApi.resolveServiceInquiry(resolveModal.id, { remarks: remarks.trim() });
      toast.success('Service inquiry resolved successfully!');
      setResolveModal({ open: false, id: null });
      setRemarks('');
      fetchInquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve service inquiry');
    } finally {
      setResolving(false);
    }
  };

  // Excel Export Handler for Service Inquiries
  const exportToExcel = () => {
    if (inquiries.length === 0) {
      toast.warn('No service tickets available to export');
      return;
    }

    const headers = [
      'S.No',
      'Customer Name',
      'Contact Phone',
      'Allocation Service Type',
      'Billing Classification',
      'Free Service ID Reference',
      'Latitude Coordinate',
      'Longitude Coordinate',
      'Google Maps URL Link',
      'Logged Date & Time'
    ];

    const rows = inquiries.map((inq, index) => [
      index + 1,
      `"${inq.name.replace(/"/g, '""')}"`,
      `"${inq.phone}"`,
      `"${inq.serviceType}"`,
      `"${inq.isPaid === 'true' || inq.isPaid === 'paid' ? 'Paid' : 'Free'}"`,
      `"${inq.freeServiceId || '—'}"`,
      `"${inq.latitude}"`,
      `"${inq.longitude}"`,
      `"https://www.google.com/maps?q=${inq.latitude},${inq.longitude}"`,
      `"${new Date(inq.createdAt).toLocaleDateString('en-IN')} ${new Date(inq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}"`
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
          <Button onClick={() => setModalOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Log Service Ticket
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)', width: '60px' }}>S.No</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Customer Profile</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Allocation Type</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Billing Classification</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Date & Time</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Location</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length > 0 ? (
                inquiries.map((inq, index) => {
                  const isPaidBilling = inq.isPaid === 'true' || inq.isPaid === 'paid';
                  const createdDate = new Date(inq.createdAt);
                  const formattedDateTime = `${createdDate.toLocaleDateString('en-IN')} ${createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

                  return (
                    <tr key={inq.id} style={{ borderBottom: '1px solid var(--border-secondary)', opacity: inq.isResolved ? 0.6 : 1 }}>
                      {/* S.No */}
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{index + 1}</td>
                      
                      {/* Customer Profile (Name & Phone) */}
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 600 }}>
                        <div>{inq.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>{inq.phone}</div>
                      </td>
                      
                      {/* Service Type */}
                      <td style={{ padding: '12px', fontSize: 13 }}>{inq.serviceType}</td>
                      
                      {/* Billing Classification */}
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 12,
                          background: isPaidBilling ? 'var(--success-bg)' : 'var(--brand-light)',
                          color: isPaidBilling ? 'var(--success-fg)' : 'var(--brand-dark)'
                        }}>
                          {isPaidBilling ? 'Paid Billing' : 'Free Job Card'}
                        </span>
                      </td>

                      {/* Date and Time */}
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-primary)' }}>
                        {formattedDateTime}
                      </td>

                      {/* Location (Visit Button) */}
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <a 
                          href={`https://www.google.com/maps?q=${inq.latitude},${inq.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Button variant="secondary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} style={{ color: 'var(--brand-dark)' }} /> Visit
                          </Button>
                        </a>
                      </td>

                      {/* Action Buttons (Call and Resolve) */}
                      <td style={{ textAlign: 'right', padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <a href={`tel:${inq.phone}`} style={{ textDecoration: 'none' }}>
                            <Button variant="secondary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success-fg)' }}>
                              <Phone size={13} /> Call
                            </Button>
                          </a>
                          
                          <Button 
                            variant="primary" 
                            size="sm" 
                            disabled={inq.isResolved}
                            onClick={() => openResolveModal(inq.id)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <CheckCircle size={13} /> {inq.isResolved ? 'Resolved' : 'Resolve'}
                          </Button>
                          {inq.isResolved && inq.remarks && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setViewRemarkModal({ open: true, remark: inq.remarks })}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              View Remark
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
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
                  <option value="Accidental Repair">Accidental Repair</option>
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

      {/* Resolve Remark Modal */}
      {resolveModal.open && (
        <Modal title="Resolve Service Inquiry" onClose={() => setResolveModal({ open: false, id: null })}>
          <div style={{ paddingTop: 8 }}>
            <Field label="Resolution Remark *">
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="e.g. Technician completed doorstep service, issue resolved"
                rows={4}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: 13, borderRadius: 6,
                  border: '1px solid var(--border-secondary)', background: 'var(--bg-primary)',
                  color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </Field>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--border-secondary)', paddingTop: 14 }}>
              <Button type="button" variant="secondary" onClick={() => setResolveModal({ open: false, id: null })}>Cancel</Button>
              <Button type="button" onClick={handleResolveInquiry} disabled={resolving}>
                <CheckCircle size={13} style={{ marginRight: 4 }} />{resolving ? 'Resolving...' : 'Confirm Resolve'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {/* View Remark Modal */}
      {viewRemarkModal.open && (
        <Modal title="Resolution Remark" onClose={() => setViewRemarkModal({ open: false, remark: '' })}>
          <div style={{ paddingTop: 8 }}>
            <Field label="Remark">
              <textarea
                readOnly
                value={viewRemarkModal.remark}
                rows={4}
                style={{
                  width: '100%', padding: '8px 10px', fontSize: 13, borderRadius: 6,
                  border: '1px solid var(--border-secondary)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit',
                  outline: 'none', boxSizing: 'border-box', cursor: 'default'
                }}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--border-secondary)', paddingTop: 14 }}>
              <Button type="button" variant="secondary" onClick={() => setViewRemarkModal({ open: false, remark: '' })}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}