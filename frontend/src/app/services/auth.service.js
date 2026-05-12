import { authApi } from '../../api/endpoints/auth.api';

export const authService = {
  async login(email, password) {
    return await authApi.login({
      email,
      password,
    });
  },

  async register(email, password, confirmPassword) {
    return await authApi.register({
      email,
      password,
      confirmPassword,
    });
  },

  async logout() {
    return await authApi.logout();
  },

  async getCurrentUser() {
    return await authApi.me();
  },
};