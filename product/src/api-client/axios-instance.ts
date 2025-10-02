import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import { ENV } from "@/config/env";

const instance = axios.create({
  baseURL: ENV.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null,
  },
});

export const axiosInstance = <T = unknown, R = AxiosResponse<T>>(config: AxiosRequestConfig<T>) => {
  return instance.request<T, R>(config);
};

export default instance;
