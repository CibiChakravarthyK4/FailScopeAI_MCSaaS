import axios from 'axios';

// Platform Owner sessions are a separate identity from tenant users (see
// backend app/models/platform_owner.py) with their own token, stored under
// its own localStorage key so an owner session and a tenant session can never
// be confused with one another.
const ownerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
});

ownerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('owner_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ownerApi.interceptors.response.use(
  (res) => res,
  (error) => {
    // No refresh token for owner sessions (app/auth/jwt.py create_owner_access_token) -
    // an expired or invalid token just signs the session out.
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('owner_access_token');
      if (window.location.pathname !== '/owner/login') {
        window.location.href = '/owner/login';
      }
    }
    return Promise.reject(error);
  }
);

export default ownerApi;
