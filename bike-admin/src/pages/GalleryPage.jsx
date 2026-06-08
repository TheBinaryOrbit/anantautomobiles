import { useState, useEffect, useCallback } from 'react';
import { Image } from 'lucide-react';
import { toast } from 'react-toastify';
import { galleryApi } from '../api/services'; // Ensure galleryApi is declared here
import { STATIC_BASE } from '../utils/constants';
import {
  PageHeader,
  SearchBar,
  Modal,
  FormGrid,
  Field,
  Input,
  Button,
  Card,
  ConfirmDialog,
} from '../components/ui';

const EMPTY = {
  title: '',
  description: '',
};

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await galleryApi.getAll();
      const data = response.data.data || [];
      console.log('Loaded gallery items:', data);

      setItems(data);
      setFiltered(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load gallery items');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();

    if(items.length > 0) {
      setFiltered(
        items.filter(
          item =>
            item.title?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, items]);

  const set = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const save = async () => {
    try {
      if (!imageFile) {
        toast.error('Image file is required');
        return;
      }

      setLoading(true);

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('image', imageFile);

      await galleryApi.create(fd);
      toast.success('Gallery item added successfully');

      await load();

      setModal(null);
      setForm(EMPTY);
      setImageFile(null);
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await galleryApi.remove(confirm.id);
      toast.success('Gallery item deleted successfully');
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete item');
    } finally {
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader
        icon={Image}
        title="Photo Gallery"
        subtitle="Manage gallery collections and media uploads"
        addLabel="Add Photo"
        onAdd={() => {
          setForm(EMPTY);
          setImageFile(null);
          setModal({
            title: 'Add Photo to Gallery',
          });
        }}
      />

      <Card style={{ marginBottom: 20 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search photos..."
        />
      </Card>

      {/* Responsive Grid Layout for Photos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {filtered.length > 0 && filtered.map(item => (
          <div
            key={item.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ position: 'relative', paddingTop: '75%', width: '100%' }}>
              <img
                src={`${STATIC_BASE}${item.imageUrl}`}
                alt={item.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>

            <div style={{ padding: 16, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600, color: '#111827' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.4 }}>
                  {item.description || '—'}
                </p>
              </div>

              <Button
                variant="danger"
                style={{ width: '100%', padding: '6px 0', fontSize: 13 }}
                onClick={() => setConfirm(item)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          No gallery items found.
        </div>
      )}

      {/* Add Modal */}
      {modal && (
        <Modal
          title={modal.title}
          onClose={() => setModal(null)}
        >
          <FormGrid>
            <Field label="Photo Title" style={{ gridColumn: '1 / -1' }}>
              <Input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Event Cover Picture"
              />
            </Field>

            <Field label="Description" style={{ gridColumn: '1 / -1' }}>
              <Input
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Brief summary regarding this upload"
              />
            </Field>

            <Field label="Upload Image" style={{ gridColumn: '1 / -1' }}>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files[0] || null;
                  setImageFile(file);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 0',
                  fontSize: 14,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              />
              {imageFile && (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  style={{
                    marginTop: 10,
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                  }}
                />
              )}
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
            <Button variant="secondary" onClick={() => setModal(null)}>
              Cancel
            </Button>

            <Button onClick={save} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {confirm && (
        <ConfirmDialog
          message={`Delete image "${confirm.title}" from the gallery? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}