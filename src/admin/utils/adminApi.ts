import axios from 'axios';

const adminApi = axios.create({   
  baseURL: import.meta.env.VITE_API_URL,
 });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('hg360_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hg360_admin_token');
      localStorage.removeItem('hg360_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default adminApi;
