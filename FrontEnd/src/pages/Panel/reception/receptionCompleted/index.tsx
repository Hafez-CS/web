import { Table } from "antd";
import { useConsultations } from "../../../../services/consultations/consultations.service";
import { useQuery } from "@tanstack/react-query";

export interface IPayload {
  id: number;
  user: number;
  user_name: string;
  consultant: number;
  consultant_name: string;
  consultation_type: "single" | "package";
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  status_display: string;
  session_number: number;
  package_group: string;
  discount_code: string;
  discount_amount: string;
  user_completed: boolean;
  consultant_completed: boolean;
  completed_at: string;
  can_complete: string;
  is_completed: string;
  created_at: string;
}

export default function ReceptionCompleted() {
  const {  Complete_consultants_List } = useConsultations();

  const { data: list, isLoading } = useQuery({
    queryKey: ["complete_consultants"],
    queryFn: Complete_consultants_List, 
  });
  

  console.log("🚀 ReceptionCompleted list:", list);

  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id" },
    // { title: "کاربر", dataIndex: "user_name", key: "user_name" },
    { title: "مشاور", dataIndex: "consultant_name", key: "consultant_name" },
    { title: "نوع مشاوره", dataIndex: "consultation_type", key: "consultation_type" , render : (value : any) =>{
      return(
        <>
        {value === "single" ? "تک جلسه" :"مشاوره"}
        </>
      )
    } },
    { title: "تاریخ", dataIndex: "scheduled_date", key: "scheduled_date" },
    { title: "ساعت", dataIndex: "scheduled_time", key: "scheduled_time" },
    { title: "وضعیت", dataIndex: "status_display", key: "status_display" },
    { title: "تعداد جلسه", dataIndex: "session_number", key: "session_number" },
    { title: "کد تخفیف", dataIndex: "discount_code", key: "discount_code" },
    { title: "مبلغ تخفیف", dataIndex: "discount_amount", key: "discount_amount" },
    { title: "اتمام کاربر", dataIndex: "user_completed", key: "user_completed",
      render: (v: boolean) => (v ? "✔️" : "—") },
    { title: "اتمام مشاور", dataIndex: "consultant_completed", key: "consultant_completed",
      render: (v: boolean) => (v ? "✔️" : "—") },
    { title: "تکمیل شده", dataIndex: "is_completed", key: "is_completed" },
    { title: "تاریخ ایجاد", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <div className="w-full mt-20 h-full gap-4 flex flex-col">
        <div className="flex justify-start items-center">
            <h1 className="text-3xl font-bold">تکمیل شده</h1>
        </div>
        <Table
        className="overflow-y-auto"
          columns={columns}
          dataSource={list ?? []}
          loading={isLoading}
          rowKey="id"
        />
    </div>
  );
}
