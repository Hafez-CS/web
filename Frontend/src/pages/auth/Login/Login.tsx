import { useForm } from "react-hook-form";
import type { ILogin } from "./@types";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

export default function Login() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ILogin>();

  const SendDataHandler = (data: ILogin) => {
    console.log("🚀 ~ SendDataHandler ~ data:", data);
    Cookies.set("token", "hello"); // Replace with actual token from server
    const token = Cookies.get("token");
    console.log("🚀 ~ Token from cookie:", token);
    reset();
  };

  return (
    <section className="w-full h-screen bg-primary flex justify-center items-center">
      <form
        className="flex flex-col w-full h-[400px] gap-10 max-w-[600px] bg-GrayColor p-6 rounded-2xl"
        onSubmit={handleSubmit(SendDataHandler)}
      >
        <h1 className="text-2xl text-center text-blackColor font-bold">
          فرم ورود
        </h1>

        {/* Username Field */}
        <div className="flex flex-col gap-2">
          <label
            className="text-base text-blackColor font-bold"
            htmlFor="userName"
          >
            نام کاربری :
          </label>
          <input
            className="p-2 text-center rounded-md bg-[#ffffff]"
            {...register("userName", { required: "نام کاربری الزامی است" })}
            type="text"
          />
          {errors.userName && (
            <p className="text-red-500 font-bold text-sm">
              {errors.userName.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label
            className="text-base text-blackColor font-bold"
            htmlFor="password"
          >
            رمز عبور :
          </label>
          <input
            className="p-2 text-center rounded-md bg-[#ffffff]"
            {...register("password", { required: "رمز عبور الزامی است" })}
            type="password"
          />
          {errors.password && (
            <p className="text-red-500 font-bold text-sm">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          className="rounded-xl cursor-pointer transition-colors hover:bg-blackColor bg-secondry text-white font-extrabold p-2 flex justify-center items-center"
          type="submit"
        >
          ورود
        </button>
        <Link className="" to={`/signup`}>
          <p className={`text-center mx-auto text-white pt-10 font-black`}>
            {" "}
            حساب ندارید؟ ثبت نام
          </p>
          <p className={`text-center mx-auto text-white pt-10 font-black`}></p>
        </Link>
      </form>
    </section>
  );
}
