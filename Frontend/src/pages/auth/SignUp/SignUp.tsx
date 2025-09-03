import { useForm } from "react-hook-form";
import type { ISignUp } from "./@types.ts";
import { Link } from "react-router-dom";

export default function SignUp() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ISignUp>(); //

  const SendDataHandler = (data: ISignUp) => {
    console.log("🚀 ~ SendDataHandler ~ data:", data);
    reset();
  };

  return (
    <section className="w-full h-screen bg-primary flex md:justify-normal justify-center items-center">
      <div className="w-1/2 hidden h-screen bg-secondry md:flex justify-center items-center">
        <h1 className="text-4xl font-bold text-white">ثبت نام</h1>
      </div>
      <div className="md:w-1/2 w-full flex justify-center items-center">
        <form
          className="flex flex-col w-full justify-center h-[750px] gap-10 max-w-[600px] bg-GrayColor p-6 rounded-2xl"
          onSubmit={handleSubmit(SendDataHandler)}
        >
          <h1 className="text-2xl text-blackColor text-center font-bold">
            فرم ثبت نام
          </h1>
          <div className="flex flex-col gap-2">
            <label
              className="text-base text-blackColor font-bold"
              htmlFor="userName"
            >
              نام کاربری :
            </label>
            <input
              className="p-2 text-center rounded-md bg-[#ffffff]"
              type="text"
              {...register("userName", { required: "نام کاربری الزامیست" })}
            />
            {errors.userName && (
              <p className="text-red-500 font-bold text-sm">
                {errors.userName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-base text-blackColor font-bold"
              htmlFor="password"
            >
              رمز عبور :
            </label>
            <input
              className="p-2 text-center rounded-md bg-[#ffffff]"
              type="password"
              {...register("password", { required: "رمز عبور الزامیست" })}
            />
            {errors.password && (
              <p className="text-red-500 font-bold text-sm">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-base text-blackColor font-bold"
              htmlFor="acceptPassword"
            >
              تایید رمز عبور :
            </label>
            <input
              className="p-2 text-center rounded-md bg-[#ffffff]"
              type="password"
              {...register("acceptPassword", {
                required: "تایید رمز عبور الزامیست",
              })}
            />
            {errors.acceptPassword && (
              <p className="text-red-500 font-bold text-sm">
                {errors.acceptPassword.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-base text-blackColor font-bold"
              htmlFor="email"
            >
              ایمیل :
            </label>
            <input
              className="p-2 text-center rounded-md bg-[#ffffff]"
              type="email"
              {...register("email", { required: "ایمیل الزامیست" })}
            />
            {errors.email && (
              <p className="text-red-500 font-bold text-sm">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            className="rounded-xl cursor-pointer transition-colors hover:bg-blackColor bg-secondry text-white font-extrabold p-2 flex justify-center items-center"
            type="submit"
          >
            ثبت نام
          </button>

          <Link className="" to={"/login"}>
            <p className="text-center mx-auto text-black pt-10 font-black">
              حساب کاربری دارید؟ <span className="text-secondry">ورود</span>
            </p>
          </Link>
        </form>
      </div>
    </section>
  );
}
