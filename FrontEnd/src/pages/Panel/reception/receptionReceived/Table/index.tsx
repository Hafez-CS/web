import { Table } from "antd";

export interface IReceivedTable {
    id : number
    consultant_name : string
    consultation_type : string
    is_completed : string
    scheduled_date : string
    scheduled_time : string
}

export default function ReceivedTable({ List }: { List: IReceivedTable[] }) {

    const columns = [
        { title: 'شناسه', dataIndex: 'id', key: 'id' },
        { title: 'مشاور', dataIndex: 'consultant_name', key: 'consultant_name' },
        { title: 'نوع مشاوره', dataIndex: 'consultation_type', key: 'consultation_type' },
        { title: 'وضعیت', dataIndex: 'is_completed', key: 'is_completed' },
        { title: 'تاریخ', dataIndex: 'scheduled_date', key: 'scheduled_date' },
        { title: 'ساعت', dataIndex: 'scheduled_time', key: 'scheduled_time' },
    ];

    return (
        <Table 
            title={() => "مشاوره های دریافت شده"} 
            dataSource={List} 
            columns={columns}
            rowKey="id"
        />
    )
}
