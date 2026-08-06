import axios from "axios";

// In local development, "/api" works because Vite proxies it to the backend
// for us. Once deployed, the frontend and backend live at two different
// addresses, so we need to be told the backend's real address — set via the
// VITE_API_URL environment variable at build time (see .env.example).
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("globalpay_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function setToken(token) {
  if (token) localStorage.setItem("globalpay_token", token);
  else localStorage.removeItem("globalpay_token");
}

export function getToken() {
  return localStorage.getItem("globalpay_token");
}

export default api;
