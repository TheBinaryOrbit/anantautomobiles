import { useState, useEffect } from 'react';
import { ShoppingBag, FileSpreadsheet, Phone, CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { inquiriesApi } from '../api/services';
import { PageHeader, Card, Button, Modal, Field, Input } from '../components/ui';

export default function SalesInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState({ open: false, id: null });
  const [viewRemarkModal, setViewRemarkModal] = useState({ open: false, remark: '' });
  const [remarks, setRemarks] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => { fetchInquiries(); }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiriesApi.getSalesInquiries();
      setInquiries(res.data || res);
    } catch (err) {
      toast.error('Failed to load sales pipeline tracking data');
    } finally {
      setLoading(false);
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
      await inquiriesApi.resolveSalesInquiry(resolveModal.id, { remarks: remarks.trim() });
      toast.success('Sales inquiry resolved successfully!');
      setResolveModal({ open: false, id: null });
      setRemarks('');
      fetchInquiries();
    } catch (err) {
      toast.error(err.message || 'Failed to resolve inquiry');
    } finally {
      setResolving(false);
    }
  };

  const exportToExcel = () => {
    if (inquiries.length === 0) { toast.error('No data available to export'); return; }
    const headers = ['S.No', 'Customer Name', 'Phone', 'City', 'State', 'Pincode', 'Model', 'Logged Date'];
    const rows = inquiries.map((inq, index) => [
      index + 1,
      '"' + inq.fullName.replace(/"/g, '""') + '"',
      '"' + inq.phone + '"',
      '"' + inq.city.replace(/"/g, '""') + '"',
      '"' + inq.state.replace(/"/g, '""') + '"',
      '"' + inq.pincode + '"',
      '"' + inq.model.replace(/"/g, '""') + '"',
      '"' + new Date(inq.createdAt).toLocaleDateString('en-IN') + '"'
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Sales_Inquiries_' + new Date().toISOString().split('T')[0] + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Excel-compatible sheet downloaded successfully!');
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--text-secondary)' }}>Loading pipeline prospects...</div>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <PageHeader icon={ShoppingBag} title="Sales Pipeline Tracker" subtitle="Review incoming hot prospects and variant purchase inquiries" />
        <Button onClick={exportToExcel} variant="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileSpreadsheet size={16} /> Export to Excel
        </Button>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)', width: 52 }}>S.No</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Customer Profile</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Region</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Model</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Date & Time</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Location</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length > 0 ? (
                inquiries.map((inq, index) => {
                  const createdDate = new Date(inq.createdAt);
                  const formattedDateTime = createdDate.toLocaleDateString('en-IN') + ' ' + createdDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr key={inq.id} style={{ borderBottom: '1px solid var(--border-secondary)', opacity: inq.isResolved ? 0.6 : 1 }}>

                      {/* S.No */}
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{index + 1}</td>

                      {/* Customer Profile */}
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 600 }}>
                        <div>{inq.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 400 }}>{inq.phone}</div>
                      </td>

                      {/* Region */}
                      <td style={{ padding: '12px', fontSize: 13 }}>
                        <div>{inq.city}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{inq.state} - {inq.pincode}</div>
                      </td>

                      {/* Model */}
                      <td style={{ padding: '12px', fontSize: 13, fontWeight: 500, color: 'var(--brand-dark)' }}>{inq.model}</td>

                      {/* Date & Time */}
                      <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-primary)' }}>{formattedDateTime}</td>

                      {/* Location */}
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        {inq.latitude && inq.longitude ? (
                          <a
                            href={'https://www.google.com/maps?q=' + inq.latitude + ',' + inq.longitude}
                            target="_blank"
                            rel="noreferrer"
                            style={{ textDecoration: 'none' }}
                          >
                            <Button variant="secondary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <MapPin size={13} style={{ color: 'var(--brand-dark)' }} /> Visit
                            </Button>
                          </a>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right', padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <a href={'tel:' + inq.phone} style={{ textDecoration: 'none' }}>
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
                    No purchase prospects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {
        resolveModal.open && (
          <Modal title="Resolve Sales Inquiry" onClose={() => setResolveModal({ open: false, id: null })}>
            <div style={{ paddingTop: 8 }}>
              <Field label="Resolution Remark *">
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Customer visited showroom and booked the vehicle"
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
        )
      }
      {
        viewRemarkModal.open && (
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
        )
      }
    </div>
  );
}