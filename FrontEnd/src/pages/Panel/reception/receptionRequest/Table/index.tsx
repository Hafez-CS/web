import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Modal, Table } from "antd";
// import persian from "react-date-object/calendars/persian";

import { useConsultations, type IReserve } from "../../../../../services/consultations/consultations.service";
// import { DateObject } from "react-multi-date-picker";
import { toast } from "react-toastify";
import { PersianDateCell } from "../../../../../utils/persianDateCell";
// import { queryClient } from "../../../../../App";

interface props {
  singleShown: boolean;
  packageShown: boolean;
}

export default function ConsultationsTable({ singleShown, packageShown }: props) {
  const { available_consultants , ReserveTime  } = useConsultations();
  const tableType = singleShown ? "single" : packageShown ? "package" : null;
  const { data: consultationsList , refetch : refetchList } = useQuery({
    queryKey: ["consultationList", tableType],
    enabled: !!tableType,
    queryFn: () => available_consultants(tableType as "single" | "package"),
  });
  const reserve = useMutation({
    mutationFn : (data : IReserve) => ReserveTime(data),
    onSuccess : () =>{ 
    refetchList()
    setIsModalOpen(false)
      toast.success("رزرو با موفقیت انجام شد")} ,
    onError : () => toast.error("رزرو ناموفق بود")
  })
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const [selectedConsultantName, setSelectedConsultantName] = useState("");
  

  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id" },
    { title: "نام کاربری", dataIndex: "username", key: "username" },
    { title: "نام و نام خانوادگی", dataIndex: "full_name", key: "full_name" },
    { title: "ایمیل", dataIndex: "email", key: "email" },
    { title: "بیوگرافی", dataIndex: "bio", key: "bio" },

    {
      title: "عملیات",
      key: "action",
      render: (_: any, data: any) => {
        const original = consultationsList?.find(
          (i) => i.consultant.id === data.id
        );

        return (
          <Button
            type="primary"
            onClick={() => {
              setSelectedSlots(original?.available_slots || []);
              setSelectedConsultantName(data.full_name);
              setIsModalOpen(true);
            }}
          >
            لیست مشاوره‌ها
          </Button>
        );
      },
    },
  ];
  const handleReserve = (data : any) =>{
    reserve.mutate(data)
  
    // queryClient.invalidateQueries({ queryKey : ["consultationList"]})

  }



  const tableData =
    consultationsList?.map((item) => ({
      key: item.consultant.id,
      id: item.consultant.id,
      username: item.consultant.username,
      full_name: item.consultant.full_name,
      email: item.consultant.email,
      bio: item.consultant.bio,
    })) || [];

// consultation_type
const modalColumns = [
  { title: "شناسه", dataIndex: "id", key: "id" },

  {
    title: "نوع مشاوره",
    dataIndex: "consultation_type",
    key: "consultation_type",
    render: (value : string) => (value === "single" ? "تک جلسه" : "پکیج"),
  },

  {
    title: "تاریخ",
    dataIndex: "date",
    key: "date",
    render: (value: string) => {
      return(
        <PersianDateCell value={value}/>
      )
    },
  },

  { title: "شروع", dataIndex: "start_time", key: "start_time" },
  { title: "پایان", dataIndex: "end_time", key: "end_time" },

  {
    title: "رزرو شده؟",
    dataIndex: "is_booked",
    key: "is_booked",
    render: (val: boolean) => (val ? "بله" : "خیر"),
  },

  {
    title: "عملیات",
    key: "action",
    render: (_: any, slot: any) => {
      const reserveData: IReserve = {
        consultant_id: slot.consultant,          // ❗ درست شد
        consultation_type: tableType as "single" | "package",
        scheduled_date: slot.date,               // ❗ درست شد
        scheduled_time: slot.start_time,         // ❗ درست شد
      };
  
      return (
        <Button
          disabled={slot.is_booked || reserve.isPending}
          type="primary"
          onClick={() => handleReserve(reserveData)}
        >
          رزرو
        </Button>
      );
    },
  },
];


  return (
    <div className="w-full">
      {tableType ? (
        <Table columns={columns} dataSource={tableData} />
      ) : (
        <p className="text-center text-gray-500 py-4">
          لطفاً یکی از دسته‌بندی‌ها را انتخاب کنید.
        </p>
      )}

      
      <Modal
        title={`لیست تایم‌های مشاور: ${selectedConsultantName}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={"1000px"}
        height={"100%"}
      >
        <Table
        // style={{}}
        className='overflow-y-auto'
          dataSource={selectedSlots.map((s) => ({ ...s, key: s.id }))}
          columns={modalColumns}
          pagination={false}
        />
      </Modal>
    </div>
  );
}
