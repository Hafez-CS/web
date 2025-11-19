import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { consulatations } from "../../../../../services/consultations/consultations.service";

interface props {
  singleShown: boolean;
  packageShown: boolean;
}

export default function ConsultationsTable({ singleShown, packageShown }: props) {
  const columns = [
    { title: "شناسه", dataIndex: "id", key: "id" },
    { title: "نام کاربری", dataIndex: "username", key: "username" },
    { title: "نام و نام خانوادگی", dataIndex: "full_name", key: "full_name" },
    { title: "ایمیل", dataIndex: "email", key: "email" },
    { title: "بیوگرافی", dataIndex: "bio", key: "bio" },
  ];

  // تعیین نوع درخواست
  const tableType = singleShown
    ? "single"
    : packageShown
    ? "package"
    : null;

  const { data: consultationsList  } = useQuery({
    queryKey: ["consultationList", tableType],
    enabled: !!tableType, 
    queryFn: () =>
      consulatations.available_consultants(
        tableType as "single" | "package"
      ),
  });

  const tableData =
    consultationsList?.map((item) => ({
      key: item.consultant.id,
      id: item.consultant.id,
      username: item.consultant.username,
      full_name: item.consultant.full_name,
      email: item.consultant.email,
      bio: item.consultant.bio,
    })) || [];
    // const Title = tableType === "single" ? "مشاوره تک جلسه ای" : "پک مشاوره"
    const TitleHandling = () =>{
        if(tableType === "package") return "پک مشاوره"
        else return "مشاوره تک جلسه ای"
    }

  return (
    <div className="w-full">
        
      {tableType ? (
        <Table title={TitleHandling} columns={columns} dataSource={tableData} />
      ) : (
        <p className="text-center text-gray-500 py-4">
          لطفاً یکی از دسته‌بندی‌ها را انتخاب کنید.
        </p>
      )}
         
      
    </div>
  );
}
