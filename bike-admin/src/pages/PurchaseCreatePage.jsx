import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { purchasesApi, bikeModelsApi, suppliersApi } from '../api/services';
import { MONTHS, VIN_YEAR_MAP } from '../utils/constants';
import {
  PageHeader, Card, FormGrid, Field, Input, Select, Button, Table
} from '../components/ui';

export default function PurchaseCreatePage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  const [header, setHeader] = useState({
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [bikes, setBikes] = useState([
    { id: Date.now(), modelId: '', engineNumber: '', chassisNumber: '', manufactureYear: '', manufactureMonth: 'JANUARY', color: '' }
  ]);

  useEffect(() => {
    Promise.all([
      suppliersApi.getAll(),
      bikeModelsApi.getAll(),
    ]).then(([s, m]) => {
      setSuppliers(s.data || []);
      setModels(m.data || []);
    }).catch(err => toast.error(err.message));
  }, []);

  const addBikeRow = () => {
    setBikes([...bikes, { id: Date.now(), modelId: '', engineNumber: '', chassisNumber: '', manufactureYear: '', manufactureMonth: 'JANUARY', color: '' }]);
  };

  const removeBikeRow = (id) => {
    if (bikes.length === 1) return;
    setBikes(bikes.filter(b => b.id !== id));
  };

  const updateBike = (id, key, val) => {
    setBikes(bikes.map(b => {
      if (b.id === id) {
        const updated = { ...b, [key]: val };
        // Auto-year logic
        if (key === 'chassisNumber' && val.length === 17) {
          const year = VIN_YEAR_MAP[val.charAt(9).toUpperCase()];
          if (year) updated.manufactureYear = year;
        }
        return updated;
      }
      return b;
    }));
  };

  const save = async () => {
    if (!header.supplierId) return toast.error('Supplier is mandatory');
    if (bikes.some(b => !b.modelId || !b.engineNumber || !b.chassisNumber)) {
      return toast.error('Please fill all mandatory fields for each bike');
    }

    setLoading(true);
    try {
      await purchasesApi.create({
        ...header,
        bikes: bikes
      });
      toast.success('Purchase recorded successfully');
      navigate('/purchases');
    } catch (err) {
      toast.error(err.message || 'Failed to save purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/purchases')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Back to Purchases
      </button>
      
      <PageHeader icon={ShoppingCart} title="New Purchase" subtitle="Add multiple bikes to inventory" />

      <Card title="Purchase Details" style={{ marginBottom: 24 }}>
        <FormGrid>
          <Field label="Supplier *">
            <Select value={header.supplierId} onChange={e => setHeader({...header, supplierId: e.target.value})}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>)}
            </Select>
          </Field>
          <Field label="Purchase Date">
            <Input type="date" value={header.purchaseDate} onChange={e => setHeader({...header, purchaseDate: e.target.value})} />
          </Field>
          <Field label="Notes" style={{ gridColumn: '1 / -1' }}>
            <Input value={header.notes} onChange={e => setHeader({...header, notes: e.target.value})} placeholder="Internal notes..." />
          </Field>
        </FormGrid>
      </Card>

      <Card title="Bikes Entry">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 8px', fontSize: 13 }}>Model *</th>
                <th style={{ padding: '12px 8px', fontSize: 13 }}>Engine No *</th>
                <th style={{ padding: '12px 8px', fontSize: 13 }}>Chassis No *</th>
                <th style={{ padding: '12px 8px', fontSize: 13 }}>Year *</th>
                <th style={{ padding: '12px 8px', fontSize: 13 }}>Color *</th>
                <th style={{ padding: '12px 8px', fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {bikes.map((bike, idx) => (
                <tr key={bike.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 4px' }}>
                    <select 
                      value={bike.modelId} 
                      onChange={e => updateBike(bike.id, 'modelId', e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                    >
                      <option value="">Select Model</option>
                      {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <input 
                      value={bike.engineNumber} 
                      onChange={e => updateBike(bike.id, 'engineNumber', e.target.value)}
                      placeholder="Engine #"
                      style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <input 
                      value={bike.chassisNumber} 
                      onChange={e => updateBike(bike.id, 'chassisNumber', e.target.value)}
                      placeholder="Chassis #"
                      maxLength={17}
                      style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <input 
                      type="number"
                      value={bike.manufactureYear} 
                      onChange={e => updateBike(bike.id, 'manufactureYear', e.target.value)}
                      placeholder="YYYY"
                      style={{ width: '80px', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <input 
                      value={bike.color} 
                      onChange={e => updateBike(bike.id, 'color', e.target.value)}
                      placeholder="Color"
                      style={{ width: '100%', padding: '8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                    />
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                    <button 
                      onClick={() => removeBikeRow(bike.id)}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <Button variant="secondary" onClick={addBikeRow} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Add Another Bike
        </Button>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
          <Button variant="secondary" onClick={() => navigate('/purchases')}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Purchase'}</Button>
        </div>
      </Card>
    </div>
  );
}
