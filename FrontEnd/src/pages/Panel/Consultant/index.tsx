// Consultant.tsx
import { Button } from "antd";
import { useState } from "react";
import ScheduleModal from "./ScheduleModal";
import ScheduleList from "./ScheduleList";
import { toast } from "react-toastify";
import { useAdminConsulation } from "../../../services/consultations/adminConsultations.service";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../../../App";

export default function Consultant() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {SetConsultantTime} = useAdminConsulation()

  const setTime = useMutation({
    mutationFn : (data) => SetConsultantTime(data as any),
    onSuccess : () =>{
      toast.success("تایم با موفقیت ثبت شد")
      queryClient.invalidateQueries({ queryKey : ["ConsulationListData"]})
    },
    onError : () =>{
      toast.error("خطا")
    }
  })

  const handleSubmit = (data: any) => {
    console.log("submitted:", data);
    // toast.success("تایم با موفقیت ثبت شد!");
    setIsModalOpen(false);
    setTime.mutate(data)

  };

  return (
    <div className="w-full h-full gap-4 flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">تایم مشاوره</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          تعریف تایم مشاوره
        </Button>
      </div>

      <ScheduleModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <div className="w-full h-full">
        <ScheduleList />
      </div>
    </div>
  );
}
