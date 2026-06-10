import axios from "axios";

const api = axios.create({
  baseURL: "http://10.1.189.191:3333/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
