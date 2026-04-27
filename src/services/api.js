import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

export const authService = {
  login:         credentials => api.post('/auth/login', credentials),
  register:      userData    => api.post('/auth/register', userData),
  getProfile:    ()          => api.get('/auth/me'),
  updateProfile: data        => api.put('/auth/profile', data),
}

export const adminService = {
  getDashboardStats: ()           => api.get('/admin/stats'),
  getIssuers:        ()           => api.get('/admin/issuers'),
  addIssuer:         issuerData   => api.post('/admin/issuers', issuerData),
  removeIssuer:      issuerId     => api.delete(`/admin/issuers/${issuerId}`),
  getCertificates:   params       => api.get('/admin/certificates', { params }),
  getActivityLogs:   params       => api.get('/admin/logs', { params }),
}

export const issuerService = {
  getDashboardStats:  ()       => api.get('/issuer/stats'),
  uploadCertificate:  formData => api.post('/issuer/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  issueCertificate:  data      => api.post('/issuer/issue', data),
  getCertificates:   params    => api.get('/issuer/certificates', { params }),
  revokeCertificate: certId    => api.post(`/issuer/revoke/${certId}`),
  resendClaim:       certId    => api.post(`/issuer/resend-claim/${certId}`),
  // Certificate request management
  getCertificateRequests:      params => api.get('/issuer/certificate-requests', { params }),
  getCertificateRequestStats:  ()     => api.get('/issuer/certificate-requests/stats'),
  updateRequestStatus:         (id, data) => api.patch(`/issuer/certificate-requests/${id}/status`, data),
}

export const publicService = {
  verifyCertificate:     certId => api.get(`/public/verify/${certId}`),
  getCertificateDetails: certId => api.get(`/public/certificate/${certId}`),
  // ✅ Used by StudentDashboard to manually link a certificate by ID
  linkCertificate:       certId => api.post('/public/link-certificate', { certId }),
}

export const claimService = {
  validateToken: token => api.get(`/claim/validate?token=${token}`),
  claimCert:     token => api.post('/claim', { token }),
}

// ── Student Portal API (separate auth flow: registerNumber + dob) ──────────
export const studentPortalService = {
  login: (data) =>
    api.post('/student/login', data),

  requestCertificate: (data, token) =>
    api.post('/student/request-certificate', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getRequestStatus: (requestId, token) =>
    api.get(`/student/request-status/${requestId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
}

export default api