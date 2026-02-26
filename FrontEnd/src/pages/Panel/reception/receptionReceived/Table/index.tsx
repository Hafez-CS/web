import { Button, Popconfirm, Table } from "antd";
// import { DateObject } from "react-multi-date-picker";
// import persian from "react-date-object/calendars/persian";
import { useMutation } from "@tanstack/react-query";
import { useConsultations } from "../../../../../services/consultations/consultations.service";
import { toast } from "react-toastify";
import { queryClient } from "../../../../../App";
import { PersianDateCell } from "../../../../../utils/persianDateCell";


export interface IReceivedTable {
    id : number
    consultant_name : string
    consultation_type : string
    is_completed : string
    scheduled_date : string
    scheduled_time : string
}

export default function ReceivedTable({ List }: { List: any }) {
    const {complete_consultants} = useConsultations()
    const CompleteConsultant = useMutation({
        mutationFn : (id : number) => complete_consultants(id),
        onSuccess : () =>{
            toast.success("مشاوره با موفقیت به اتمام شما رسید")
            queryClient.invalidateQueries({ queryKey : ["Consulatations"]})
        },
        onError : () =>{
            toast.error("خطا")
        }
    })

    const columns = [
        { title: 'شناسه', dataIndex: 'id', key: 'id' },
        { title: 'مشاور', dataIndex: 'consultant_name', key: 'consultant_name' },
        { title: 'نوع مشاوره', dataIndex: 'consultation_type', key: 'consultation_type' , render : (value : any) =>{
            return(
                <>
                {value === "single" ? "تک جلسه" : "پکیج"}
                </>
            )
        } },
        { title: 'وضعیت', dataIndex: 'is_completed', key: 'is_completed' , render : (value : any) => {
            return(
                <>
                {value ? "تکمیل" : "تکمیل نشده"}
                </>
            )
        } },
        { title: 'تاریخ', dataIndex: 'scheduled_date', key: 'scheduled_date' , render : (value : any) =>{
            return(

                <PersianDateCell value={value}/>
            )
        } },
        { title: 'ساعت', dataIndex: 'scheduled_time', key: 'scheduled_time' },
        { title: 'عملیات', dataIndex: 'action', key: 'action' , render : (_ : any , data : any) =>{
            return(
                <Popconfirm title={"آیا اطمینان از پایان مشاوره دارید؟"}  okText={"بله"} cancelText={"نه"} onConfirm={()=>CompleteConsultant.mutate(data.id)} >
                    <Button danger >پایان مشاوره</Button>
                </Popconfirm>
            )
        } },
    ];

    return (
        <Table 
        className='overflow-y-auto'
            title={() => "مشاوره های دریافت شده"} 
            dataSource={List} 
            columns={columns}
            rowKey="id"
        />
    )
}
