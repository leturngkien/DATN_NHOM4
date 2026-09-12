import api from "./axios";

const contactApi = {
  send: async (data) => {
    const response = await api.post("/v1/contacts", data);
    return response.data;
  },
};

export default contactApi;