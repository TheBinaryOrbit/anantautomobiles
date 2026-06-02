import { useState, useEffect } from 'react';
import { ShoppingBag, Eye, Calendar, User, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet icon
import { toast } from 'react-toastify';
import { inquiriesApi } from '../api/services';
import { PageHeader, Card, Button } from '../components/ui'; // Imported Button component

export default function SalesInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

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

  // Natively build CSV structured data for Excel
  const exportToExcel = () => {
    if (inquiries.length === 0) {
      toast.error('No data available to export');
      return;
    }

    const headers = ['Prospect Name', 'Contact Phone', 'Target Vehicle Variant', 'City', 'State', 'Pincode', 'Logged Date'];
    
    const rows = inquiries.map(inq => [
      `"${inq.fullName.replace(/"/g, '""')}"`,
      `"${inq.phone}"`,
      `"${inq.model.replace(/"/g, '""')}"`,
      `"${inq.city.replace(/"/g, '""')}"`,
      `"${inq.state.replace(/"/g, '""')}"`,
      `"${inq.pincode}"`,
      `"${new Date(inq.createdAt).toLocaleDateString('en-IN')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sales_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel-compatible sheet downloaded successfully!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading pipeline prospects...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Top action row positioning layout */}
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
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Prospect Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Contact Phone</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Target Vehicle Variant Make</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Region Location</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Pincode</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>Logged Date</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length > 0 ? (
                inquiries.map((inq) => (
                  <tr key={inq.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td style={{ padding: '12px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} style={{ color: 'var(--text-tertiary)' }} /> {inq.fullName}
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: 13, fontFamily: 'monospace' }}>{inq.phone}</td>
                    <td style={{ padding: '12px', fontSize: 13, fontWeight: 500, color: 'var(--brand-dark)' }}>{inq.model}</td>
                    <td style={{ padding: '12px', fontSize: 13 }}>{inq.city}, {inq.state}</td>
                    <td style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontFamily: 'monospace' }}>{inq.pincode}</td>
                    <td style={{ textAlign: 'right', padding: '12px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>No purchase prospects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}