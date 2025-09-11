import type { ILogin } from "./@types";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../../services/auth/auth.service";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";


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
    onError: (error : AxiosError) => {
      console.log("🚀 ~ Login ~ error:", error)
      // toast.error(error.);
    },
    onSuccess: (data) => {
      console.log("🚀 ~ Login ~ data:", data.data);
      toast.success("با موفقیت وارد شدید");
      Cookies.set("token-access", data.data.access);
      Cookies.set("token-refresh", data.data.refresh);
      navigate("/");
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
          className="rounded-xl cursor-pointer transition-colors py-3 hover:bg-black bg-secondry text-white font-extrabold flex justify-center items-center"
          type="submit"
        >
          ورود
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
