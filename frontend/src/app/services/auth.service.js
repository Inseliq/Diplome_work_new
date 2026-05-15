import {
  login as loginRequest,
  register as registerRequest,
  logout as logoutRequest,
  getCurrentUser as getCurrentUserRequest
} from '../../api/endpoints';

export const authService = {
  async login(email, password) {
    return await loginRequest({
      email,
      password,
    });
  },

  async register(nickname, email, password, confirmPassword) {
    return await registerRequest({
      nickname,
      email,
      password,
      confirmPassword,
    });
  },

  async logout() {
    return await logoutRequest();
  },

  async getCurrentUser() {
    return await getCurrentUserRequest();
  },
};