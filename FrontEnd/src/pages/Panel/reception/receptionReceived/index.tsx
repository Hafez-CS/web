import { useQuery } from "@tanstack/react-query"
import {  useConsultations } from "../../../../services/consultations/consultations.service"
import ReceivedTable from "./Table"

export default function Received() {
      const { exist_consultation} = useConsultations()
    const {data : List} = useQuery({
        queryKey : ["Consulatations"],
        queryFn : () => exist_consultation()
    })
    console.log("🚀 ~ Received ~ List:", List)

    // const Status = (status : boolean) =>{
    //     if(status) return "تکمیل شده"
    //     else {
    //         return "تکمیل نشده"
    //     }
    // }
    // const ConsualtType = (type : "single" | "package" | string) =>{
    //     if(type === "single") return "تک جلسه ای"
    //     else{
    //         return "پکیج"
    //     } 
    // }

    // const tableData : IReceivedTable[] =
    //     List?.map((item) => ({
    //         id : item.id,
    //         consultant_name : item.user_name,
    //         consultation_type : ConsualtType(item.consultation_type),
    //         is_completed : Status(item.is_completed),
    //         scheduled_date : item.scheduled_date,
    //         scheduled_time : item.scheduled_time,
    //     })) || [];

    return (
        <section className="w-full text-white">
            <ReceivedTable List={List} />
        </section>
    )
}

