import { Button, Popconfirm, Table } from "antd";
// import persian from "react-date-object/calendars/persian";
// import { DateObject } from "react-multi-date-picker";
import { useConsultations } from "../../../../services/consultations/consultations.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
// import { useConvertPersianDate } from "../../../../hooks/useConvertPersianDate";
import { PersianDateCell } from "../../../../utils/persianDateCell";

export default function RecievedList() {
  const { exist_consultation, complete_consultants } = useConsultations();
  
  const { data: list, refetch: updateList } = useQuery({
    queryKey: ["listConsultantforuser"],
    queryFn: exist_consultation,
  });
  const CompleteConsultant = useMutation({
    mutationFn: (id: number) => complete_consultants(id),
    onSuccess: () => {
      toast.success("مشاوره با موفقیت به اتمام شما رسید");
      updateList();
    },
    onError: (error: AxiosError) => {
      const err = error.response?.data as { error?: string };
      toast.error(err?.error || "خطا");
    },
  });

  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id" },
    {
      title: "نوع مشاوره",
      dataIndex: "consultation_type",
      key: "consultation_type",
      render: (value: "single" | "package") =>
        value === "single" ? "تک جلسه" : "پکیج",
    },
    {
      title: "وضعیت",
      dataIndex: "is_completed",
      key: "is_completed",
      render: (value: boolean) => (value ? "تمام شده" : "تمام نشده"),
    },

    {
      title: "تاریخ",
      dataIndex: "scheduled_date",
      key: "scheduled_date",
      render: (value: any) =>(
        <PersianDateCell value={value}/>
      )
    },

    { title: "ساعت", dataIndex: "scheduled_time", key: "scheduled_time" },

    {
      title: "عملیات",
      key: "action",
      render: (_: any, data: any) => (
        <Popconfirm
          title="مطمئنی میخوای این کارو بکنی؟"
          okText="بله"
          cancelText="نه"
          onConfirm={() => CompleteConsultant.mutate(data.id)}
        >
          <Button disabled={CompleteConsultant.isPending} danger>
            اتمام مشاوره
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return <Table columns={columns} dataSource={list ?? []} rowKey="id" />;
}
