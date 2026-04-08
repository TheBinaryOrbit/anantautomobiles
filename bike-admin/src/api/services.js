import api from './axiosInstance';

/* ── Auth ── */
export const authApi = {
  login: (email, password) =>
    api.post('/users/login', { email, password }).then(r => r.data),
};

/* ── Bikes ── */
export const bikesApi = {
  getAll:  ()          => api.get('/bikes').then(r => r.data),
  create:  (body)      => api.post('/bikes/create', body).then(r => r.data),
  update:  (id, body)  => api.put(`/bikes/${id}`, body).then(r => r.data),
  remove:  (id)        => api.delete(`/bikes/${id}`).then(r => r.data),
  book:    (id)        => api.patch(`/bikes/${id}/book`, {}).then(r => r.data),
};

/* ── Bike Models ── */
export const bikeModelsApi = {
  getAll:  ()          => api.get('/bike-models').then(r => r.data),
  create:  (fd)        => api.post('/bike-models/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update:  (id, fd)    => api.put(`/bike-models/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  remove:  (id)        => api.delete(`/bike-models/${id}`).then(r => r.data),
};

/* ── Accessories ── */
export const accessoriesApi = {
  getAll:       ()           => api.get('/accessories').then(r => r.data),
  create:       (fd)         => api.post('/accessories/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  update:       (id, fd)     => api.put(`/accessories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  remove:       (id)         => api.delete(`/accessories/${id}`).then(r => r.data),
  updateStock:  (id, qty)    => api.patch(`/accessories/${id}/quantity`, { quantityInStock: qty }).then(r => r.data),
};

/* ── Customers ── */
export const customersApi = {
  getAll:   ()          => api.get('/customers').then(r => r.data),
  create:   (body)      => api.post('/customers/create', body).then(r => r.data),
  update:   (id, body)  => api.put(`/customers/${id}`, body).then(r => r.data),
  remove:   (id)        => api.delete(`/customers/${id}`).then(r => r.data),
  search:   (q)         => api.get('/customers/search', { params: { q } }).then(r => r.data),
};

/* ── Suppliers ── */
export const suppliersApi = {
  getAll:  ()          => api.get('/suppliers').then(r => r.data),
  create:  (body)      => api.post('/suppliers/create', body).then(r => r.data),
  update:  (id, body)  => api.put(`/suppliers/${id}`, body).then(r => r.data),
  remove:  (id)        => api.delete(`/suppliers/${id}`).then(r => r.data),
};

/* ── Sales ── */
export const salesApi = {
  getAll:            ()                    => api.get('/sales').then(r => r.data),
  getSale:           (id)                  => api.get(`/sales/${id}`).then(r => r.data),
  create:            (body)                => api.post('/sales/create', body).then(r => r.data),
  updateStatus:      (id, status)          => api.patch(`/sales/${id}/status`, { status }).then(r => r.data),
  updatePendingAmount: (id, pendingAmount) => api.patch(`/sales/${id}/pending`, { pendingAmount }).then(r => r.data),
  delete:            (id)                  => api.delete(`/sales/${id}`).then(r => r.data),
};

/* ── Roles ── */
export const rolesApi = {
  getAll:           ()                    => api.get('/roles').then(r => r.data),
  create:           (body)                => api.post('/roles/create', body).then(r => r.data),
  update:           (id, body)            => api.put(`/roles/${id}`, body).then(r => r.data),
  assignPermissions:(id, permissionIds)   => api.post(`/roles/${id}/assign-permissions`, { permissionIds }).then(r => r.data),
};

/* ── Users ── */
export const usersApi = {
  getAll:       ()          => api.get('/users').then(r => r.data),
  create:       (body)      => api.post('/users/create', body).then(r => r.data),
  update:       (id, body)  => api.put(`/users/${id}`, body).then(r => r.data),
  remove:       (id)        => api.delete(`/users/${id}`).then(r => r.data),
  assignRoles:  (id, roleIds) => api.post(`/users/${id}/assign-roles`, { roleIds }).then(r => r.data),
};

/* ── Permissions ── */
export const permissionsApi = {
  getAll: () => api.get('/permissions').then(r => r.data),
};

/* ── Dashboard ── */
export const dashboardApi = {
  fetchAll: () =>
    Promise.all([
      api.get('/bikes'),
      api.get('/customers'),
      api.get('/suppliers'),
      api.get('/sales'),
      api.get('/accessories'),
    ]).then(([b, c, s, sa, a]) => ({
      bikes:       b.data?.data  || [],
      customers:   c.data?.data  || [],
      suppliers:   s.data?.data  || [],
      sales:       sa.data?.data || [],
      accessories: a.data?.data  || [],
    })),
};
