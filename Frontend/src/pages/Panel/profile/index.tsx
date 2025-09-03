import Cookies from "js-cookie";
import { useEffect } from "react";
import {  useNavigate } from "react-router-dom";
// import { MenuItems } from "./@types";

export default function Profile() {
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  return (
    <div className="w-full h-full flex justify-center  items-center">
    <section className="w-full h-full max-w-[1440px] grid-cols-2 p-5 bg-gray-200 mt-20 rounded-md">
    </section>
    </div>
  );
}
