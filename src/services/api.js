import axios from "axios";

// Configura la base URL de la API (cambia al puerto 5000)
const API = axios.create({
  baseURL: "http://localhost:5000", // Cambia el puerto si es necesario
});

export { API };