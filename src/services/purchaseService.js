import axios from "axios";

const API_URL = "http://localhost:5000"; // ajusta si usas otra

export const createPurchase = (data, token) => {
  return axios.post(`${API_URL}/purchases`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};