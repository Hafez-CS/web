import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const http = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token-access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (status === 401) {
      toast.error("دسترسی غیرمجاز. لطفاً دوباره وارد شوید.");

      Cookies.remove("token-access");

      if (currentPath !== "/signup") {
        window.location.assign("/login");
      }

      if (currentPath !== "/login") {
        window.location.assign("/login");
      }

      return Promise.reject(error);
    }

    if (status === 500) {
      toast.error("خطای سرور! لطفاً بعداً تلاش کنید.");
    }

    if (error.message === "Network Error") {
      toast.error("ارتباط با سرور برقرار نشد!");
    }

    return Promise.reject(error);
  }
);
