import axios from "axios";

import { ENV } from "@/config/env";

export const axiosInstance = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
