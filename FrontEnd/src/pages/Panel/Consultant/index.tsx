import { Button } from "antd";
import { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import ScheduleList from "./ScheduleList";


export default function Consultant() {
  const [isModalOpen , setIsModalOpen] = useState(false)
  

  return (
   <div className="w-full h-full gap-4 flex flex-col">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">تایم مشاوره </h1>
      <Button type="primary" onClick={()=>setIsModalOpen(z => !z)} >تعریف تایم مشاوره</Button>
      <ScheduleModal onClose={()=>setIsModalOpen(false)} open={isModalOpen}  type="single" onSubmit={()=>console.log("finish")}/>
    </div>
    <div className="w-full h-full">
      <ScheduleList/>
    </div>
   </div>
  )
}
