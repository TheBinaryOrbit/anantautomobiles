import React, { useState, useEffect } from 'react';
import { Bike, Users, Building2, ShoppingCart, Wrench, IndianRupee, TrendingUp, Package, ChevronRight } from 'lucide-react';
import { dashboardApi } from '../api/services';
import { PageHeader, StatCard, Card, Avatar, Sparkline } from '../components/ui';
import { fmtINR } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { hasModulePermission } = useAuth();
  const [data, setData] = useState({ bikes: [], customers: [], suppliers: [], sales: [], accessories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.fetchAll()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenue = data.sales.reduce((s, x) => s + (x.totalAmount || 0), 0);

  // Layout Metric Definitions with inline relative performance multipliers 
  const stats = [];
  if (hasModulePermission('bike', 'view')) {
    stats.push({ label: 'Total Bikes', value: data.bikes.length, icon: Bike, accent: '#ffedd5', trend: '+12.4%' });
  }
  if (hasModulePermission('customer', 'view')) {
    stats.push({ label: 'Active Customers', value: data.customers.length, icon: Users, accent: '#e0f2fe', trend: '+8.2%' });
  }
  if (hasModulePermission('supplier', 'view')) {
    stats.push({ label: 'Suppliers', value: data.suppliers.length, icon: Building2, accent: '#fef3c7', trend: '0.0%' });
  }
  if (hasModulePermission('sales', 'view')) {
    stats.push({ label: 'Total Sales', value: data.sales.length, icon: ShoppingCart, accent: '#dcfce7', trend: '+23.1%' });
  }
  if (hasModulePermission('accessories', 'view')) {
    stats.push({ label: 'Accessories', value: data.accessories.length, icon: Wrench, accent: '#f3e8ff', trend: '-2.4%' });
  }
  if (hasModulePermission('reports', 'view') || hasModulePermission('analytics', 'view')) {
    stats.push({ label: 'Gross Revenue', value: fmtINR(revenue), icon: IndianRupee, accent: '#e2f9ec', trend: '+18.7%' });
  }

  const bikeByStatus = [
    { status: 'AVAILABLE', count: data.bikes.filter(b => b.status === 'AVAILABLE').length, chart: [12, 19, 14, 22, 28, 32], color: '#10b981' },
    { status: 'RESERVED', count: data.bikes.filter(b => b.status === 'RESERVED').length, chart: [5, 8, 4, 9, 7, 11], color: '#f59e0b' },
    { status: 'SOLD', count: data.bikes.filter(b => b.status === 'SOLD').length, chart: [20, 34, 45, 60, 78, 95], color: '#4f46e5' },
    { status: 'IN_SERVICE', count: data.bikes.filter(b => b.status === 'IN_SERVICE').length, chart: [8, 4, 7, 5, 9, 6], color: '#ef4444' },
  ];

  const recentSales = [...data.sales]
    .sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0))
    .slice(0, 5);

  return (
    <div style={{ background: 'var(--bg-secondary)' , minHeight: '100vh', padding: '12px' }}>
      <PageHeader icon={TrendingUp} title="Dashboard" subtitle="Overview of your bike shop operations" />

      {/* Modernized Macro Metrics Row */}
      {stats.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: '2rem' }}>
          {stats.map(s => (
            <StatCard key={s.label} label={s.label} value={loading ? '…' : s.value} icon={s.icon} accent={s.accent} trend={s.trend} />
          ))}
        </div>
      ) : (
        <Card style={{ marginBottom: '2rem', color: '#64748b', fontSize: 14 }}>
          Welcome! No dashboard analytics are currently assigned to your profile role layout.
        </Card>
      )}

      {/* Main Analytical Section Panels */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: (hasModulePermission('bike', 'view') && hasModulePermission('sales', 'view')) ? '1.2fr 1fr' : '1fr', 
        gap: 24,
        alignItems: 'start'
      }}>
        
        {/* Inventory Status with Live Sparklines */}
        {hasModulePermission('bike', 'view') && (
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b' }}>
              <Bike size={18} style={{ color: '#4f46e5' }} /> Bike Inventory Trends
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {bikeByStatus.map(({ status, count, chart, color }) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: '120px' }}>
                    <div style={{ fontSize: 14, color: '#475569', fontWeight: 600, marginBottom: 2 }}>{status}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{count}</div>
                  </div>
                  
                  {/* Inline visual graphical presentation matching the image's layout feel */}
                  

                  <ChevronRight size={18} style={{ color: '#94a3b8' }} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Clean Activity Feed with Identity Avatars */}
        {hasModulePermission('sales', 'view') && (
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: '#1e293b' }}>
              <ShoppingCart size={18} style={{ color: '#4f46e5' }} /> Recent Sales Activity
            </div>
            {recentSales.length === 0 && (
              <p style={{ fontSize: 14, color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>No transactions recorded</p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentSales.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={s.customer?.name || 'Walk In'} size={38} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{s.customer?.name || 'Walk-in Customer'}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{fmtINR(s.totalAmount)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Low Stock Alerts Strip */}
      {hasModulePermission('accessories', 'view') && data.accessories.some(a => a.quantityInStock <= 5) && (
        <Card style={{ marginTop: 24, borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: '#991b1b' }}>
            <Package size={18} style={{ color: '#ef4444' }} /> Attention Required: Low Stock Items
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {data.accessories.filter(a => a.quantityInStock <= 5).map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fef2f2', borderRadius: 10, fontSize: 14 }}>
                <span style={{ color: '#991b1b', fontWeight: 600 }}>{a.name}</span>
                <span style={{ fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>{a.quantityInStock} units left</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}