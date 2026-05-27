import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Eye, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { purchasesApi } from '../api/services';
import { fmtINR } from '../utils/constants';
import {
  PageHeader, SearchBar, Table, Card, ConfirmDialog, Button, Badge
} from '../components/ui';

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await purchasesApi.getAll();
      setPurchases(resp.data || []);
      setFiltered(resp.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(purchases.filter(p =>
      p.purchaseNumber?.toLowerCase().includes(q) ||
      p.supplier?.name?.toLowerCase().includes(q)
    ));
  }, [search, purchases]);

  const handleDelete = async () => {
    try {
      await purchasesApi.remove(confirm.id);
      toast.success('Purchase record deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
    setConfirm(null);
  };

  const cols = [
    { key: 'purchaseNumber', label: 'Purchase No'},
    { key: 'purchaseDate', label: 'Date', render: r => new Date(r.purchaseDate).toLocaleDateString() },
    { key: 'supplier', label: 'Supplier', render: r => r.supplier?.name || '—' },
    { key: 'bikeCount', label: 'Bikes', render: r => r._count?.bikes || 0 },
  ];

  return (
    <div>
      <PageHeader 
        icon={ShoppingCart} 
        title="Purchases" 
        subtitle="Manage inventory acquisitions" 
        onAdd={() => navigate('/purchases/new')} 
        addLabel="New Purchase" 
      />

      <Card>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by purchase no, supplier…">
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            {filtered.length} / {purchases.length}
          </span>
        </SearchBar>
        <Table
          cols={cols}
          rows={filtered}
          onDelete={row => setConfirm(row)}
          extraActions={row => (
            <button 
              onClick={() => navigate(`/purchases/${row.id}`)}
              style={{ background: '#f3f4f6', color: '#374151', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer', marginRight: 6 }}
              title="View Details"
            >
              <Eye size={16} />
            </button>
          )}
        />
      </Card>

      {confirm && (
        <ConfirmDialog
          message={`Delete purchase ${confirm.purchaseNumber}? This will hide the purchase record (but keep the bikes in system).`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
