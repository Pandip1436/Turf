import axios from 'axios';

const adminApi = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Direct EC2 instance for file uploads (bypasses CloudFront which blocks large POST bodies)
export const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL,
});

// ── Attach token from localStorage on every request
const attachToken = (config: import('axios').InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('hg360_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
adminApi.interceptors.request.use(attachToken);
uploadApi.interceptors.request.use(attachToken);

// ── Handle 401 responses — only redirect if a token actually existed
//    This prevents redirect loops when the page first loads with no token
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const hadToken = !!localStorage.getItem('hg360_admin_token');

      // Clear stale credentials
      localStorage.removeItem('hg360_admin_token');
      localStorage.removeItem('hg360_admin_user');

      // Only redirect if session actually existed (token expired / revoked)
      // Don't redirect if we never had a token (unauthenticated page load)
      if (hadToken && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login?reason=session_expired';
      }
    }
    return Promise.reject(err);
  }
);

export default adminApi;