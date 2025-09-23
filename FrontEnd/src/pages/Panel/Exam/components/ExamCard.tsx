import {  FileTextOutlined } from "@ant-design/icons"

interface IExamCard {
    id : number
    name : string

}

export default function ExamCard({id , name} : IExamCard) {
    
  return (
    <div key={id} className="w-full max-w-[200px] h-[200px] gap-10  shadow-md hover:scale-105 cursor-pointer transition-all p-1 bg-[#e5e5e5] rounded-md flex flex-col justify-evenly items-center dark:bg-[#415a77]">
          <div className="w-full dark:bg-[#778da9] shadow bg-white h-[300px] flex items-center justify-center rounded-md">
            <FileTextOutlined  className="text-3xl"/>
          </div>
          <div className="flex text-[14px] font-bold w-full h-full">
            نام : {name}
          </div>
    </div>
  )
}
