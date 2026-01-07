import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

export const authService = {
  async register(data: { name: string; email: string; password: string; phone: string }) {
    const response = await authApi.post('/api/auth/register', {
      nama: data.name,
      email: data.email,
      password: data.password
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await authApi.post('/api/auth/login', { email, password });
    if (response.data.success) {
      Cookies.set('token', response.data.data.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.data.user), { expires: 7 });
    }
    return response.data;
  },

  async logout() {
    Cookies.remove('token');
    Cookies.remove('user');
  },

  async getProfile() {
    const response = await authApi.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(data: { name?: string; phone?: string }) {
    const response = await authApi.put('/api/auth/profile', data);
    return response.data;
  },

  getUser() {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!Cookies.get('token');
  },

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  }
};
