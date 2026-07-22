import api from './axiosInstance';

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getFeatured: () => api.get('/products/featured'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const blogApi = {
  getAll: (params) => api.get('/blogs', { params }),
  getBySlug: (slug) => api.get(`/blogs/${slug}`),
  getRelated: (slug) => api.get(`/blogs/${slug}/related`),
  getTags: () => api.get('/blogs/tags'),
  getCategories: () => api.get('/blogs/categories'),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

export const faqApi = {
  getAll: (params) => api.get('/faqs', { params }),
  create: (data) => api.post('/faqs', data),
  update: (id, data) => api.put(`/faqs/${id}`, data),
  delete: (id) => api.delete(`/faqs/${id}`),
  reorder: (items) => api.put('/faqs/reorder', { items }),
};

export const testimonialApi = {
  getAll: (params) => api.get('/testimonials', { params }),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

export const contactApi = {
  submit: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  getById: (id) => api.get(`/contact/${id}`),
  reply: (id, data) => api.put(`/contact/${id}/reply`, data),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const newsletterApi = {
  subscribe: (data) => api.post('/newsletter', data),
  getAll: (params) => api.get('/newsletter', { params }),
  export: () => api.get('/newsletter/export', { responseType: 'blob' }),
  delete: (id) => api.delete(`/newsletter/${id}`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getCharts: () => api.get('/dashboard/charts'),
};

export const mediaApi = {
  upload: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/media', { params }),
  delete: (id) => api.delete(`/media/${id}`),
  getFolders: () => api.get('/media/folders'),
  createFolder: (data) => api.post('/media/folders', data),
};

export const seoApi = {
  getByPage: (page) => api.get(`/seo/${page}`),
  getAll: () => api.get('/seo'),
  update: (page, data) => api.put(`/seo/${page}`, data),
  delete: (page) => api.delete(`/seo/${page}`),
};

// Admin auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  getAdmins: () => api.get('/auth/admins'),
  deleteAdmin: (id) => api.delete(`/auth/admins/${id}`),
};

// ========== E-COMMERCE APIs ==========

// User authentication (customers)
export const userAuthApi = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  forgotPassword: (data) => api.post('/users/forgot-password', data),
  resetPassword: (data) => api.post('/users/reset-password', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// Orders
export const orderApi = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/my-orders/${id}`),
  cancel: (id, data) => api.put(`/orders/my-orders/${id}/cancel`, data),
  // Admin
  getAll: (params) => api.get('/orders/admin', { params }),
  getAdminById: (id) => api.get(`/orders/admin/${id}`),
  updateStatus: (id, data) => api.put(`/orders/admin/${id}`, data),
};

// Payments
export const paymentApi = {
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data),
  getHistory: (params) => api.get('/payments/history', { params }),
};

// Coupons
export const couponApi = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// Wishlist
export const wishlistApi = {
  get: () => api.get('/wishlist'),
  add: (data) => api.post('/wishlist', data),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

// Reviews
export const reviewApi = {
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (data) => api.post('/reviews', data),
  getAll: (params) => api.get('/reviews', { params }),
  updateStatus: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const recipeApi = {
  getAll: () => Promise.resolve({ data: [] }),
};

