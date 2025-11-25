import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";




export const http = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = Cookies.get("_auth"); // توکن auth-kit
  if (token) config.headers.Authorization = token;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      toast.error("دسترسی غیرمجاز. لطفاً دوباره وارد شوید.");
      if(window.location.pathname !== "/login"){
        window.location.assign("/login");
      }
      
    }
    if (status === 500) toast.error("خطای سرور! لطفاً بعداً تلاش کنید.");
    if (error.message === "Network Error") toast.error("ارتباط با سرور برقرار نشد!");
    return Promise.reject(error);
  }
);
