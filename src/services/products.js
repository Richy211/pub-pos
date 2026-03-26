import axios from "axios";
import api from "./api";

const API_URL = "http://localhost:5000/products";

// 🔹 Obtener productos
/* export const getProducts = async () => {
  return await axios.get(API_URL);
}; */
export const getProducts = () => api.get("/products");

// 🔹 Crear producto
export const createProduct = async (data) => {
  return await axios.post(API_URL, data);
};

// 🔹 Actualizar producto
export const updateProduct = async (id, data) => {
  return await axios.put(`${API_URL}/${id}`, data);
};

// 🔹 Eliminar producto
export const deleteProduct = async (id) => {
  return await axios.delete(`${API_URL}/${id}`);
};

