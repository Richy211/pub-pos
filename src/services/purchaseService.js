import axios from "axios";

const API_URL = "http://localhost:5000";

export const createPurchase = (data, token) => {
  // Cambiamos a /purchases para que coincida con el backend
  return axios.post(`${API_URL}/purchases`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getSuppliers = async () => {
  // Usamos la ruta corregida
  const res = await fetch(`${API_URL}/suppliers`);
  return res.json();
};