import api from "./api";

export const userService = {
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

  async getUserStorageStats(userId) {
    const response = await api.get(`/files/stats/${userId}/`);
    return response.data;
  },
};
