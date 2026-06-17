import axios from "axios";

let authToken = null;

const api = axios.create({
  baseURL: "http://10.1.189.191:3333/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export function setAuthToken(token) {
  authToken = token;
}

export default api;
