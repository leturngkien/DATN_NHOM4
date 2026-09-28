import api from "./axios";

const contactApi = {
  send: async (data) => {
    const response = await api.post("/v1/contacts", data);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/v1/contacts");
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`/v1/contacts/${id}/status`, { status });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/v1/contacts/${id}`);
    return response.data;
  },
};

export default contactApi;