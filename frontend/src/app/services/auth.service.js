import { authApi } from '../../api/endpoints/auth.api';

export const authService = {
  async login(email, password) {
    return await authApi.login({
      email,
      password,
    });
  },

  async register(nickname, email, password, confirmPassword) {
    return await authApi.register({
      nickname,
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