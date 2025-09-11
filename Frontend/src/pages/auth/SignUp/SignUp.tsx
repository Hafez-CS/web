import type { ISignUp, ISignUpPayload } from "./@types.ts";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../../../services/auth/auth.service.ts";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";
export default function SignUp() {
 const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ISignUp>();


  const SendData = useMutation({
    mutationFn: auth.SignUp,
    onSuccess: () => {
      navigate("/login")
      toast.success("ثبت نام با موفقیت انجام شد");
    },
    onError: (error: AxiosError<any>) => {
  console.log("🚀 ~ SignUp ~ error:", error);
  const msguserName = error.response?.data?.errors?.username?.[0];
  const msguserEmail = error.response?.data?.errors?.email?.[0];
  toast.error(msguserName || null)
  toast.error(msguserEmail || null)
  
}

  });

  const SendDataHandler = (data: ISignUp) => {
    if(data.password === data.acceptPassword){
      const Payload : ISignUpPayload = {
        username : data.username,
        email : data.email,
        password : data.password
      }
      SendData.mutate(Payload);
      console.log("🚀 ~ SendDataHandler ~ data:", data);
      reset();
    }
    else{
      toast.error("رمز عبور مطابقت ندارد")
    }
  };

  return (
    <section className="w-full h-screen bg-primary flex md:justify-normal justify-center items-center">
 
      <div className="w-1/2 hidden h-screen bg-secondry md:flex justify-center items-center">
        <h1 className="text-5xl font-extrabold text-white">ثبت نام</h1>
      </div>

    
      <div className="md:w-1/2 w-full flex justify-center items-center">
        <form
          className="flex flex-col w-full justify-center h-auto gap-8 max-w-[500px] bg-white p-10 rounded-2xl shadow-xl"
          onSubmit={handleSubmit(SendDataHandler)}
        >
          <h1 className="text-3xl text-blackColor text-center font-bold mb-4">
            فرم ثبت نام
          </h1>

       
          <div className="flex flex-col gap-2">
            <label className="text-base text-blackColor font-semibold">
              نام کاربری :
            </label>
            <input
              className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
              type="text"
              {...register("username", { required: "نام کاربری الزامیست" })}
            />
            {errors.username && (
              <p className="text-red-500 font-bold text-sm">
                {errors.username.message}
              </p>
            )}
          </div>

       
          <div className="flex flex-col gap-2">
            <label className="text-base text-blackColor font-semibold">
              رمز عبور :
            </label>
            <input
              className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
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
            <label className="text-base text-blackColor font-semibold">
              تایید رمز عبور :
            </label>
            <input
              className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
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
            <label className="text-base text-blackColor font-semibold">
              ایمیل :
            </label>
            <input
              className="p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-secondry text-black"
              type="email"
              {...register("email" )}
            />
            
          </div>

         
          <button
            className="rounded-xl cursor-pointer transition-colors py-4 hover:bg-black bg-secondry text-white font-extrabold flex justify-center items-center"
            type="submit"
          >
            ثبت نام
          </button>

          
          <Link to={"/login"}>
            <p className="text-center text-black pt-4 font-medium">
              حساب کاربری دارید؟{" "}
              <span className="text-secondry font-bold">ورود</span>
            </p>
          </Link>
        </form>
      </div>
    </section>
  );
}
