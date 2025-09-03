// import Cookies from "js-cookie";
// import { useEffect } from "react";
// import {  useNavigate } from "react-router-dom";
// import { MenuItems } from "./@types";




import { useQuery } from "@tanstack/react-query";
import { ProfileItems } from "./@types";
import { profileAPI } from "../../../services/profile/profile.service";

export default function Profile() {

  

  const {data : getProfileInfo} = useQuery({
    queryKey : ["ProfileInfo"],
    queryFn : profileAPI.getProfileInfo
  })
  const dataList  = [
    {key : 1 , value : getProfileInfo?.data.username},
    {key : 2 , value : getProfileInfo?.data.password},
    {key : 3 , value : getProfileInfo?.data.email},
  ]
  // const navigate = useNavigate();
  // const token = Cookies.get("token");
  // useEffect(() => {
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [token, navigate]);


  return (
    <div className="w-full h-full flex justify-center  items-center">
    <section className="w-full h-full max-w-[1440px] gap-3 grid grid-cols-1 md:grid-cols-2 p-5 bg-gray-200 mt-20 rounded-md">
      {ProfileItems.map((data)=>{
        return(
      <div key={data.id} className="w-full min-w-[120px] h-[100px] bg-gray-300 rounded-md flex md:p-4 p-1 gap-2 items-center">
        <p className="text-[16px] font-normal">{data.title}:</p>
        {dataList.map((data)=>{
          return(
            <span key={data.key} className="text-[20px] font-black">{data.value}</span>
          )
        })}
      </div>
        )
      })}
    
    </section>
    </div>
  );
}
