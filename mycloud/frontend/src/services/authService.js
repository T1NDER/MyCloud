import api from "./api";

export const authService = {
  async register(userData) {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login/", credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout/");
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me/");
    return response.data;
  },

  async getUsers() {
    const response = await api.get("/auth/list/");
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/auth/${userId}/delete/`);
    return response.data;
  },

  async toggleAdmin(userId) {
    const response = await api.patch(`/auth/${userId}/toggle-admin/`);
    return response.data;
  },
};
