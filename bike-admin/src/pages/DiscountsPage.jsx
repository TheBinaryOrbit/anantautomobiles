import { useState, useEffect, useCallback } from 'react';
import { Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { discountsApi } from '../api/services';
import {
  PageHeader,
  SearchBar,
  Table,
  Badge,
  Modal,
  FormGrid,
  Field,
  Input,
  Select,
  Button,
  Card,
  ConfirmDialog,
} from '../components/ui';

const EMPTY = {
  name: '',
  description: '',
  terms: [],
  type: 'PERCENTAGE',
  value: 0,
  upToLimit: '',
  isActive: true,
};

export default function DiscountsPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [termInput, setTermInput] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await discountsApi.getAll();
      const data = response.data || [];

      setItems(data);
      setFiltered(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load discounts');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      items.filter(
        item =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.terms?.toLowerCase().includes(q)
      )
    );
  }, [search, items]);

  const set = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const addTerm = () => {
    const value = termInput.trim();

    if (!value) return;

    if (form.terms.includes(value)) {
      toast.warning('Term already exists');
      return;
    }

    setForm(prev => ({
      ...prev,
      terms: [...prev.terms, value],
    }));

    setTermInput('');
  };

  const removeTerm = index => {
    setForm(prev => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        terms: form.terms.join(','),
        value: Number(form.value),
        upToLimit:
          form.type === 'PERCENTAGE' && form.upToLimit
            ? Number(form.upToLimit)
            : null,
      };

      if (modal?.id) {
        await discountsApi.update(modal.id, payload);
        toast.success('Discount updated successfully');
      } else {
        await discountsApi.create(payload);
        toast.success('Discount created successfully');
      }

      await load();

      setModal(null);
      setForm(EMPTY);
      setTermInput('');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await discountsApi.remove(confirm.id);

      toast.success('Discount deleted successfully');

      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete discount');
    } finally {
      setConfirm(null);
    }
  };

  const openEdit = row => {
    setForm({
      ...row,
      description: row.description || '',
      terms: row.terms
        ? row.terms.split(',').map(term => term.trim())
        : [],
      upToLimit: row.upToLimit || '',
    });

    setTermInput('');

    setModal({
      id: row.id,
      title: 'Edit Discount',
    });
  };

  const columns = [
    {
      key: 'name',
      label: 'Offer Name',
    },
    {
      key: 'description',
      label: 'Description',
      render: row =>
        row.description?.length > 50
          ? `${row.description.slice(0, 50)}...`
          : row.description || '—',
    },
    {
      key: 'terms',
      label: 'Terms',
      render: row => {
        if (!row.terms) return '—';

        const terms = row.terms.split(',');

        return (
          <span>
            {terms.slice(0, 2).join(', ')}
            {terms.length > 2
              ? ` +${terms.length - 2} more`
              : ''}
          </span>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: row => (
        <Badge
          label={row.type}
          color={
            row.type === 'PERCENTAGE'
              ? '#3b82f6'
              : '#8b5cf6'
          }
        />
      ),
    },
    {
      key: 'value',
      label: 'Value',
      render: row =>
        row.type === 'PERCENTAGE'
          ? `${row.value}%`
          : `₹${row.value}`,
    },
    {
      key: 'upToLimit',
      label: 'Limit',
      render: row =>
        row.upToLimit
          ? `Up to ₹${row.upToLimit}`
          : '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: row => (
        <Badge
          label={row.isActive ? 'Active' : 'Inactive'}
          color={
            row.isActive
              ? '#10b981'
              : '#f59e0b'
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        icon={Tag}
        title="Discounts & Offers"
        subtitle="Manage sale discounts and promotional schemes"
        addLabel="Add Offer"
        onAdd={() => {
          setForm(EMPTY);
          setTermInput('');
          setModal({
            title: 'Add Discount',
          });
        }}
      />

      <Card>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search offers..."
        />

        <Table
          cols={columns}
          rows={filtered}
          onEdit={openEdit}
          onDelete={row => setConfirm(row)}
        />
      </Card>

      {modal && (
        <Modal
          title={modal.title}
          onClose={() => setModal(null)}
        >
          <FormGrid>
            <Field
              label="Offer Name"
              style={{ gridColumn: '1 / -1' }}
            >
              <Input
                value={form.name}
                onChange={e =>
                  set('name', e.target.value)
                }
                placeholder="Festival Offer"
              />
            </Field>

            <Field
              label="Description"
              style={{ gridColumn: '1 / -1' }}
            >
              <Input
                value={form.description}
                onChange={e =>
                  set('description', e.target.value)
                }
                placeholder="20% discount on selected products"
              />
            </Field>

            <Field
              label="Terms & Conditions"
              style={{ gridColumn: '1 / -1' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Input
                  value={termInput}
                  onChange={e =>
                    setTermInput(e.target.value)
                  }
                  placeholder="Enter a term"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTerm();
                    }
                  }}
                />

                <Button
                  type="button"
                  onClick={addTerm}
                >
                  Add
                </Button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {form.terms.map((term, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <span>{term}</span>

                    <button
                      type="button"
                      onClick={() =>
                        removeTerm(index)
                      }
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontWeight: 'bold',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Field>

            <Field label="Type">
              <Select
                value={form.type}
                onChange={e =>
                  set('type', e.target.value)
                }
              >
                <option value="PERCENTAGE">
                  Percentage (%)
                </option>
                <option value="FLAT">
                  Flat Amount (₹)
                </option>
              </Select>
            </Field>

            <Field
              label={
                form.type === 'PERCENTAGE'
                  ? 'Percentage'
                  : 'Amount'
              }
            >
              <Input
                type="number"
                value={form.value}
                onChange={e =>
                  set('value', e.target.value)
                }
              />
            </Field>

            {form.type === 'PERCENTAGE' && (
              <Field label="Up To Limit (₹)">
                <Input
                  type="number"
                  value={form.upToLimit}
                  onChange={e =>
                    set(
                      'upToLimit',
                      e.target.value
                    )
                  }
                  placeholder="Leave blank for no limit"
                />
              </Field>
            )}

            <Field label="Status">
              <Select
                value={
                  form.isActive
                    ? 'true'
                    : 'false'
                }
                onChange={e =>
                  set(
                    'isActive',
                    e.target.value === 'true'
                  )
                }
              >
                <option value="true">
                  Active
                </option>
                <option value="false">
                  Inactive
                </option>
              </Select>
            </Field>
          </FormGrid>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              marginTop: 20,
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setModal(null)}
            >
              Cancel
            </Button>

            <Button
              onClick={save}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message={`Delete offer "${confirm.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}