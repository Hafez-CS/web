import type { ILogin } from "./@types";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../../services/auth/auth.service";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";
import { Spin } from "antd";


export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ILogin>();

  const SendData = useMutation({
    mutationFn: auth.Login,
    onSuccess: (res) => {
      const { data } = res; // همون response
      if (data?.data) {
      
        toast.success(data.message || "ورود موفقیت‌آمیز بود");
        Cookies.set("token-access", data.data.access);
        Cookies.set("token-refresh", data.data.refresh);
        navigate("/");
      } else {
        
        toast.error(data?.message || "ورود ناموفق بود");
      }
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ message?: string }>;
      console.log("🚀 ~ Login ~ err:", err)
      if(err.status === 401) toast.error("ایمیل یا رمز عبور اشتباه است")
      if(err.status === 500) toast.error("خطا از سمت سرور")
    },
  });
  

  const SendDataHandler = (data: ILogin) => {
    SendData.mutate(data);
    console.log("🚀 ~ SendDataHandler ~ data:", data);
    reset();
  };

  return (
    <section className="w-full h-screen bg-primary flex justify-center items-center">
      <form
        className="flex flex-col w-full gap-8 max-w-[550px] bg-white p-10 rounded-2xl shadow-xl"
        onSubmit={handleSubmit(SendDataHandler)}
      >
        <h1 className="text-3xl text-center text-black font-bold mb-4">
          فرم ورود
        </h1>

        <div className="flex flex-col gap-2">
          <label
            className="text-base text-black font-semibold"
            htmlFor="userName"
          >
            ایمیل :
          </label>
          <input
            className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
            {...register("email", { required: "نام کاربری الزامی است" })}
            type="email"
          />
          {errors.email && (
            <p className="text-red-500 font-bold text-sm">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-base text-black font-semibold"
            htmlFor="password"
          >
            رمز عبور :
          </label>
          <input
            className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
            {...register("password", { required: "رمز عبور الزامی است" })}
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 font-bold text-sm">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
  id="btnhover"
  className={`rounded-xl cursor-pointer transition-colors py-3 font-extrabold flex justify-center items-center
    ${SendData.isPending ? "opacity-50 cursor-not-allowed" : ""}
  `}
  type="submit"
  disabled={SendData.isPending}
>
  {SendData.isPending ? <Spin /> : "ورود"}
</button>


        <Link to={`/signup`}>
          <p className="text-center mx-auto text-black pt-6 font-medium">
            حساب ندارید؟{" "}
            <span className="text-secondry font-bold">ثبت نام</span>
          </p>
        </Link>
      </form>
    </section>
  );
}
