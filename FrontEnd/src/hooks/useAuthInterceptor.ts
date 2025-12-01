import { useEffect } from "react";
import { toast } from "react-toastify";
import useSignOut from 'react-auth-kit/hooks/useSignOut';
import { useNavigate } from "react-router-dom";
import { http } from "../lib/http";


export default function useAuthInterceptor() {
  const signOut = useSignOut();
  const navigate = useNavigate();

  useEffect(() => {
    const responseInterceptor = http.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        if (status === 401) {
          toast.error("نشست شما منقضی شده است. لطفاً دوباره وارد شوید.");

          // خروج از لاگین
          signOut();
          // ریدایرکت
          navigate("/login");
        }

        if (status === 500) {
          toast.error("خطا در سرور!");
        }

        if (error.message === "Network Error") {
          toast.error("اتصال به سرور برقرار نشد!");
        }

        return Promise.reject(error);
      }
    );

    // پاکسازی اینترسپتور زمانی که کامپوننت unmount شود
    return () => {
      http.interceptors.response.eject(responseInterceptor);
    };
  }, [signOut, navigate]);
}
