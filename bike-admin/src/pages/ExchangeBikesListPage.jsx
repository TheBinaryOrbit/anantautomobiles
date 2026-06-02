import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Eye, Search, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { exchangeBikesApi } from '../api/services'; // Ensure this is mapped to your router path
import { fmtINR } from '../utils/constants';
import { PageHeader, SearchBar, Card, Button } from '../components/ui';

export default function ExchangeBikesListPage() {
  const navigate = useNavigate();
  const [exchangeBikes, setExchangeBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExchangeBikes();
  }, []);

  const fetchExchangeBikes = async () => {
    try {
      setLoading(true);
      // Calls GET / (mapped to exchangeBikeController.getAllExchangeBikes)
      const response = await exchangeBikesApi.getAll();
      setExchangeBikes(response.data || response);
    } catch (error) {
      console.error('Error fetching exchange bikes:', error);
      toast.error('Failed to load exchange bike records');
    } finally {
      setLoading(false);
    }
  };

  const filteredBikes = exchangeBikes.filter(b => 
    b.oldBikeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.oldBikeBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.oldBikeEngineNumber && b.oldBikeEngineNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.oldBikeChassisNumber && b.oldBikeChassisNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading trade-in records...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader 
        icon={RefreshCw} 
        title="Exchange Vehicles Ledger" 
        subtitle="Manage customer trade-ins, values credited, and legal documentation checklists" 
      />

      <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Search by brand, model, engine or chassis number..." 
        />
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-secondary)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Vehicle Particulars</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Identifiers</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Mfg Year</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Valuation Value</th>
                <th style={{ textAlign: 'center', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Doc Checklist</th>
                <th style={{ textAlign: 'right', padding: '12px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBikes.length > 0 ? (
                filteredBikes.map((bike) => {
                  // Count total validated legal papers out of 5
                  const docsCount = [
                    bike.isOldRCAvailable,
                    bike.isNocAvailable,
                    bike.isOwnerDocumentAvailable,
                    bike.isChallanAvailable,
                    bike.isStatmentAvailable
                  ].filter(Boolean).length;

                  return (
                    <tr key={bike.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                      <td style={{ padding: '12px', fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{bike.oldBikeBrand} {bike.oldBikeName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Variant: {bike.oldBikeModel} | Color: {bike.oldBikeColor}</div>
                      </td>
                      <td style={{ padding: '12px', fontSize: 12, fontFamily: 'monospace' }}>
                        <div>E: {bike.oldBikeEngineNumber || '—'}</div>
                        <div>C: {bike.oldBikeChassisNumber || '—'}</div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px', fontSize: 13 }}>{bike.oldBikeYear}</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontSize: 13, fontWeight: 600, color: 'var(--brand-dark)' }}>
                        {fmtINR(bike.exchangeValue || 0)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '12px' }}>
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 600, 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          background: docsCount === 5 ? 'var(--success-bg)' : 'var(--warning-bg)',
                          color: docsCount === 5 ? 'var(--success-fg)' : 'var(--warning-fg)'
                        }}>
                          {docsCount}/5 Verified
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => navigate(`/exchange-bikes/${bike.id}`)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'var(--brand-light)', color: 'var(--brand-dark)',
                              border: 'none', padding: '6px 10px', borderRadius: 6,
                              fontSize: 12, fontWeight: 500, cursor: 'pointer'
                            }}
                            title="View Trade-In Details"
                          >
                            <Eye size={14} /> View
                          </button>
                          <button
                            onClick={() => navigate(`/sales/${bike.saleId}`)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                              border: '0.5px solid var(--border-secondary)', padding: '6px 10px', borderRadius: 6,
                              fontSize: 12, fontWeight: 500, cursor: 'pointer'
                            }}
                            title="Go to Associated Invoice File"
                          >
                            <FileText size={14} /> Sale Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                    No exchange bike entries match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}