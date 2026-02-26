import { useQuery } from '@tanstack/react-query'
import persian from "react-date-object/calendars/persian";
import { Table } from 'antd'
// import React from 'react'
// import Consultant from '..'
import { useConsultations } from '../../../../services/consultations/consultations.service'
import DateObject from 'react-date-object';

export default function CompleteList() {
    const {Complete_consultants_List} = useConsultations()
    const {data : completeList} = useQuery({
        queryKey : ["CompleteListForConsultant"],
        queryFn : Complete_consultants_List
    })
    console.log("🚀 ~ CompleteList ~ completeList:", completeList)
    
    const columns = [
        { title: "شناسه", dataIndex: "id", key: "id" },
        { title: "کاربر", dataIndex: "user_name", key: "user_name" },
        // { title: "مشاور", dataIndex: "consultant_name", key: "consultant_name" },
        { title: "نوع مشاوره", dataIndex: "consultation_type", key: "consultation_type" , render : (value : any) =>{
          return(
            <>
            {value === "single" ? "تک جلسه" :"پکیچ"}
            </>
          )
        } },
        { title: "تاریخ", dataIndex: "scheduled_date", key: "scheduled_date" , render : (value : any) =>{
            if (!value) return "-";
          const date = new DateObject(value);
          const persianDate = date.convert(persian);
          return persianDate.format("YYYY/MM/DD");
        } },
        { title: "ساعت", dataIndex: "scheduled_time", key: "scheduled_time" },
        { title: "وضعیت", dataIndex: "status_display", key: "status_display" },
        { title: "تعداد جلسه", dataIndex: "session_number", key: "session_number" },
        // { title: "کد تخفیف", dataIndex: "discount_code", key: "discount_code" },
        // { title: "مبلغ تخفیف", dataIndex: "discount_amount", key: "discount_amount" },
        { title: "اتمام کاربر", dataIndex: "user_completed", key: "user_completed",
          render: (v: boolean) => (v ? "✔️" : "—") },
        { title: "اتمام مشاور", dataIndex: "consultant_completed", key: "consultant_completed",
          render: (v: boolean) => (v ? "✔️" : "—") },
        { title: "تکمیل شده", dataIndex: "is_completed", key: "is_completed" , render: (v: boolean) => (v ? "✔️" : "—")  },
        // { title: "تاریخ ایجاد", dataIndex: "created_at", key: "created_at" },
      ];
    
  return (
   <Table className='overflow-y-auto' dataSource={completeList} columns={columns}/>
  )
}
