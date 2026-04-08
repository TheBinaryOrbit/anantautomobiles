import { useState, useEffect } from 'react';
import { Bike, Users, Building2, ShoppingCart, Wrench, IndianRupee, TrendingUp, Package } from 'lucide-react';
import { dashboardApi } from '../api/services';
import { PageHeader, StatCard, Card } from '../components/ui';
import { fmtINR } from '../utils/constants';

export default function DashboardPage() {
  const [data, setData]     = useState({ bikes: [], customers: [], suppliers: [], sales: [], accessories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.fetchAll()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenue = data.sales.reduce((s, x) => s + (x.totalAmount || 0), 0);

  const stats = [
    { label: 'Total Bikes',  value: data.bikes.length,       icon: Bike,         accent: '#EEEDFE' },
    { label: 'Customers',    value: data.customers.length,   icon: Users,        accent: '#E1F5EE' },
    { label: 'Suppliers',    value: data.suppliers.length,   icon: Building2,    accent: '#FAEEDA' },
    { label: 'Total Sales',  value: data.sales.length,       icon: ShoppingCart, accent: '#E6F1FB' },
    { label: 'Accessories',  value: data.accessories.length, icon: Wrench,       accent: '#FBEAF0' },
    { label: 'Revenue',      value: fmtINR(revenue),         icon: IndianRupee,  accent: '#EAF3DE' },
  ];

  const bikeByStatus = ['AVAILABLE','RESERVED','SOLD','IN_SERVICE'].map(s => ({
    status: s,
    count: data.bikes.filter(b => b.status === s).length,
  }));

  const recentSales = [...data.sales]
    .sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0))
    .slice(0, 5);

  return (
    <div>
      <PageHeader icon={TrendingUp} title="Dashboard" subtitle="Overview of your bike shop operations" />

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
        {stats.map(s => <StatCard key={s.label} label={s.label} value={loading ? '…' : s.value} icon={s.icon} accent={s.accent} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Bike Status */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bike size={14} /> Bike Inventory Status
          </div>
          {bikeByStatus.map(({ status, count }) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border-secondary)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{status}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </Card>

        {/* Recent Sales */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={14} /> Recent Sales
          </div>
          {recentSales.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>No sales yet</p>}
          {recentSales.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border-secondary)' }}>
              <div>
                <div style={{ fontSize: 13 }}>{s.customer?.name || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN') : '—'}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtINR(s.totalAmount)}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Low stock */}
      {data.accessories.some(a => a.quantityInStock <= 5) && (
        <Card style={{ marginTop: 14, borderColor: '#FAEEDA' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#633806' }}>
            <Package size={14} /> Low Stock Accessories
          </div>
          {data.accessories.filter(a => a.quantityInStock <= 5).map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid var(--border-secondary)', fontSize: 13 }}>
              <span>{a.name}</span>
              <span style={{ fontWeight: 600, color: '#E24B4A' }}>{a.quantityInStock} left</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
