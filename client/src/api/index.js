import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  refresh: (refreshToken) => client.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => client.post('/auth/logout', { refreshToken }),
};

export const verificationApi = {
  sendPhoneCode: (phone, purpose = 'register') => client.post('/verification/phone/send', { phone, purpose }),
  verifyPhoneCode: (phone, code, purpose = 'register') => client.post('/verification/phone/verify', { phone, code, purpose }),
  sendEmailCode: (email, purpose = 'register') => client.post('/verification/email/send', { email, purpose }),
  verifyEmailCode: (email, code, purpose = 'register') => client.post('/verification/email/verify', { email, code, purpose }),
  sendPhoneUpdate: (phone) => client.post('/verification/phone/send-update', { phone }),
  confirmPhoneUpdate: (phone, code) => client.post('/verification/phone/confirm-update', { phone, code }),
  sendEmailUpdate: (email) => client.post('/verification/email/send-update', { email }),
  confirmEmailUpdate: (email, code) => client.post('/verification/email/confirm-update', { email, code }),
};

export const giftcardApi = {
  getAll: () => client.get('/giftcards'),
  getBySlug: (slug) => client.get(`/giftcards/${slug}`),
};

export const orderApi = {
  create: (data) => client.post('/orders', data),
  getAll: (params) => client.get('/orders', { params }),
  getById: (id) => client.get(`/orders/${id}`),
  cancel: (id) => client.post(`/orders/${id}/cancel`),
};

export const paymentApi = {
  getUSDTPayment: (orderId) => client.get(`/payment/${orderId}/usdt`),
  confirmPayment: (orderId) => client.post(`/payment/${orderId}/confirm`),
  getPaymentStatus: (orderId) => client.get(`/payment/${orderId}/status`),
};

export const walletApi = {
  getWallet: () => client.get('/wallet'),
  depositRequest: (data) => client.post('/wallet/deposit-request', data),
  withdrawRequest: (data) => client.post('/wallet/withdraw-request', data),
  getTransactions: (params) => client.get('/wallet/transactions', { params }),
  getRequests: () => client.get('/wallet/requests'),
};

export const notificationApi = {
  getAll: (params) => client.get('/notifications', { params }),
  markRead: (id) => client.put(`/notifications/${id}/read`),
  markAllRead: () => client.put('/notifications/read-all'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
};

export const userApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.put('/users/me', data),
  changePassword: (data) => client.put('/users/password', data),
};

export const recoveryApi = {
  submit: (data) => client.post('/recovery', data),
  list: (params) => client.get('/recovery', { params }),
};

export const adminApi = {
  getDashboard: () => client.get('/admin/dashboard'),
  getUsers: (params) => client.get('/admin/users', { params }),
  updateUser: (id, data) => client.put(`/admin/users/${id}`, data),
  getOrders: (params) => client.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => client.put(`/admin/orders/${id}/status`, data),
  sendCash: (data) => client.post('/admin/cash/send', data),
  getUSDTSettings: () => client.get('/admin/usdt/settings'),
  updateUSDTSettings: (data) => client.put('/admin/usdt/settings', data),
  getPins: (params) => client.get('/admin/pins', { params }),
  batchPins: (data) => client.post('/admin/pins/batch', data),
  pushPin: (data) => client.post('/admin/pins/push', data),
  getWalletRequests: () => client.get('/admin/wallet/requests'),
  reviewWalletRequest: (id, data) => client.put(`/admin/wallet/requests/${id}`, data),
  broadcast: (data) => client.post('/admin/notifications/broadcast', data),
  getNotifications: (params) => client.get('/admin/notifications', { params }),
  deleteNotification: (id) => client.delete(`/admin/notifications/${id}`),
  getTransactions: (params) => client.get('/admin/transactions', { params }),
  getGiftcards: () => client.get('/admin/giftcards'),
  createGiftcard: (data) => client.post('/admin/giftcards', data),
  updateGiftcard: (id, data) => client.put(`/admin/giftcards/${id}`, data),
  deleteGiftcard: (id) => client.delete(`/admin/giftcards/${id}`),
  createVariant: (giftcardId, data) => client.post(`/admin/giftcards/${giftcardId}/variants`, data),
  updateVariant: (id, data) => client.put(`/admin/giftcards/variants/${id}`, data),
  deleteVariant: (id) => client.delete(`/admin/giftcards/variants/${id}`),
  getEvents: () => client.get('/admin/events'),
  createEvent: (data) => client.post('/admin/events', data),
  updateEvent: (id, data) => client.put(`/admin/events/${id}`, data),
  deleteEvent: (id) => client.delete(`/admin/events/${id}`),
  getEventParticipants: (id) => client.get(`/admin/events/${id}/participants`),
  grantEventReward: (eventId, data) => client.post(`/admin/events/${eventId}/reward`, data),
  getTemplates: () => client.get('/admin/templates'),
  createTemplate: (data) => client.post('/admin/templates', data),
  updateTemplate: (id, data) => client.put(`/admin/templates/${id}`, data),
  deleteTemplate: (id) => client.delete(`/admin/templates/${id}`),
  getRecoveries: (params) => client.get('/admin/recovery', { params }),
  approveRecovery: (id, data) => client.post(`/admin/recovery/${id}/approve`, data),
  rejectRecovery: (id, data) => client.post(`/admin/recovery/${id}/reject`, data),
};
