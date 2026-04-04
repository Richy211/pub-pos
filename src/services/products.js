import axios from "axios";
import api from "./api";

const API_URL = "http://localhost:5000/products";


export const getProducts = () => api.get("/products");

export const createProduct = (data) => api.post("/products", data);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);
