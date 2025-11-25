import { Button, Table } from "antd";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
// import { Schedulecolumns } from './@types'
import { useAdminConsulation } from "../../../../services/consultations/adminConsultations.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { IConsultantItem } from "./@types";
import { CheckCircleTwoTone, CloseCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

export default function ScheduleList() {
    const { ConsulationList , DeleteConsultantTime} = useAdminConsulation();
    const { data: ConsulationListData , refetch : RefetchTableData } = useQuery({
      queryKey: ["ConsulationListData"],
      queryFn: ConsulationList,
    });
    const DeleteConsultant = useMutation({
        mutationFn : DeleteConsultantTime,
        onSuccess : () => {
            toast.success("تایم با موفقیت حذف شد")
            RefetchTableData()
        },
        onError: (error: any) => {
            console.log("🚀 ~ ScheduleList ~ error:", error)
            const msg = error?.response.data.error || "خطای ناشناخته";
            toast.error(msg);
          },
    })
  const Schedulecolumns = [
    {
      title: "شناسه",
      dataIndex: "id",
      key: "id",
    },
    // {
    //   title: "شناسه مشاور",
    //   dataIndex: "consultant",
    //   key: "consultant",
    // },
    // {
    //   title: "نام مشاور",
    //   dataIndex: "consultant_name",
    //   key: "consultant_name",
    // },
    {
      title: "تاریخ",
      dataIndex: "date",
      key: "date",
      render: (value: string) => {
        if (!value) return "-";
        const date = new DateObject(value);
        const persianDate = date.convert(persian);
        return persianDate.format("YYYY/MM/DD");
      },
    },
    {
      title: "ساعت شروع",
      dataIndex: "start_time",
      key: "start_time",
      
    },
    {
      title: "ساعت پایان",
      dataIndex: "end_time",
      key: "end_time",
      
    },
    {
      title: "وضعیت",
      dataIndex: "is_available",
      key: "is_available",
      render: (_: any, d: IConsultantItem) => (
        <>
          <p>{d.is_available ? <CheckCircleTwoTone /> : <CloseCircleOutlined />}</p>
        </>
      ),
    },
    {
      title: "وضعیت رزور",
      dataIndex: "is_booked",
      key: "is_booked",
      render: (_: any, d: IConsultantItem) => (
        <>
          <p>{d.is_booked ? <CheckCircleTwoTone /> : <CloseCircleOutlined />}</p>
        </>
      ),
    },
    {
      title: "قابل تغیر؟",
      dataIndex: "can_modify",
      key: "can_modify",
      render: (_: any, d: IConsultantItem) => (
        <>
          <p>{d.is_booked ? <CheckCircleTwoTone /> : <CloseCircleOutlined />}</p>
        </>
      ),
    },
    {
      title: "ساعت ساخت",
      dataIndex: "created_at",
      key: "created_at",
      render: (value: string) => {
        if (!value) return "-";
        const date = new DateObject(value);
        const persianDate = date.convert(persian);
        return persianDate.format("YYYY/MM/DD");
      },
    },
    {
        title: "عملیات",
        dataIndex: "action",
        key: "action",
        render: (_ : any , d : IConsultantItem) => {
        return(
          <>
          <div className="flex gap-1">
          <Button type="primary">ویرایش</Button>
          <Button onClick={()=>{DeleteConsultant.mutate(d.id)}} danger>حذف</Button>
          </div>
          </>
        )
        },
      },
  ];
  console.log("🚀 ~ ScheduleList ~ ConsulationListData:", ConsulationListData);
  return <Table className="overflow-y-scroll max-h-[520px]" columns={Schedulecolumns} dataSource={ConsulationListData} />;
}
