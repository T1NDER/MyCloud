import api from "./api";

export const fileService = {
  async getFiles(userId = null) {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get("/files/", { params });
    return response.data;
  },

  async uploadFile(file, comment = "") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("comment", comment);

    const response = await api.post("/files/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  async downloadFile(fileId) {
    const response = await api.get(`/files/${fileId}/download/`, {
      responseType: "blob",
    });
    return response;
  },

  async deleteFile(fileId) {
    const response = await api.delete(`/files/${fileId}/delete/`);
    return response.data;
  },

  async renameFile(fileId, newName) {
    const response = await api.put(`/files/${fileId}/rename/`, {
      new_name: newName,
    });
    return response.data;
  },

  async updateComment(fileId, comment) {
    const response = await api.patch(`/files/${fileId}/comment/`, { comment });
    return response.data;
  },

  getSharedDownloadUrl(specialLink) {
    return `${api.defaults.baseURL}/files/shared/${specialLink}/download/`;
  },
};
