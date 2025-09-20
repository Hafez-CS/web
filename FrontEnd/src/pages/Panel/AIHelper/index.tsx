import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { chatapi } from "../../../services/chat/chat.service";
import { Button, Form, Input, Modal } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

interface IModal {
  name : string
}

interface IMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

export default function AIHelper() {
  const {id} = useParams()
  const queryClient = useQueryClient();
  const [isModalOpen  , setIsModalOpen] = useState(false)
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  console.log("🚀 ~ AIHelper ~ id:", id)


  useEffect(() => {
    const token = Cookies.get("token-access");
    if (!token) navigate("/login");
  }, [navigate]);


  const { data : rooms } = useQuery({
    queryKey : ["rooms"],
    queryFn : chatapi.rooms
  })
  const { data: ChatHistoryBySlug } = useQuery<IMessage[]>({
    queryKey: ["ChatMessages"],
    queryFn:()=> chatapi.ChatHistory(id || "test")
  });
  
  // console.log("🚀 ~ AIHelper ~ getAllChats:", getAllChats)

  const new_room = useMutation({
    mutationFn : chatapi.new_room,
    onSuccess : () =>{
      queryClient.invalidateQueries({ queryKey : ["rooms"]})
      toast.success("چت جدید با موفقیت ساخته شد")
    },
    onError : (err) =>{
      toast.error(err.message || "خطا در ساخت چت جدید!")
    }
  })

  const sendMessageBySlug = useMutation({
    mutationFn: chatapi.SendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ChatMessages"] });
      setMessage("");
    },
  });
  const handleSetNewRoom = (data : IModal) => {
    console.log("🚀 ~ handleSetNewRoom ~ data:", data)
    new_room.mutate(data.name , id)
}
  const handleSend = (values: { content: string }) => {
    if (!values.content.trim()) return;
    sendMessageBySlug.mutate(values.content);
  };

  return (
    <div className="flex flex-col relative h-[85vh] bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col absolute left-0 rounded-r-2xl  h-full w-[200px] bg-gray-500 shadow-md">
        {/* {rooms.map((data : string)=>{
          <p>{data}</p>
        })} */}
      </div>
    
      <div className="flex overflow-y-auto flex-col gap-2 p-4 space-y-3">
        {/* {isLoading && <p className="text-gray-500">در حال بارگذاری...</p>} */}
        {/* {isError && <p className="text-red-500">خطا در دریافت پیام‌ها</p>} */}

        {ChatHistoryBySlug?.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[300px] flex flex-col p-3 rounded-2xl ${
              msg.role === "user"
                ? " bg-blue-500 text-white"
                : " bg-gray-300 text-black"
            }`}
          >
            <span>{msg.content}</span>
            <div className="text-[10px] opacity-50 mt-1 text-right">
              {new Date(msg.created_at).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      <Form
      style={{fontFamily : "Vazir", width : "100%" , position : "absolute", bottom : "0px", right : "0px" , border : "none" , boxShadow : "inherit", display : "flex" , alignItems : "center", justifyContent : "space-between", padding  : "10px 20px"}}
      rootClassName="Vazir"
        onFinish={handleSend}
        layout="inline"
        className="p-4 border-t shadow-2xl bg-white dark:bg-gray-800 flex items-center"
      >
        <Form.Item
          name="content"
          className="w-[300px] "
          rules={[{ required: true, message: "پیام خود را وارد کنید!" }]}
        >
          <Input
          style={{fontFamily : "Vazir" ,}}
            placeholder="پیام خود را بنویسید..."
            value={message}

            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl h-[50px] flex items-center justify-start"
          />
        </Form.Item>
        <Modal title={"اتاق جدید"} open={isModalOpen} onCancel={()=>setIsModalOpen(false)} footer={null}>
          <Form onFinish={handleSetNewRoom}>
            <Form.Item name={"name"}>
              <Input/>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">ساختن</Button>
            </Form.Item>
          </Form>
        </Modal>
          <Button onClick={()=>setIsModalOpen(true)} style={{width : "30px" , height : "30px" , borderRadius : "100%" , display : "flex" , marginLeft : "auto" , justifyContent : "center" , alignItems : "center"}} type="primary">
            <PlusCircleOutlined/>
          </Button>
        <Form.Item style={{width : "60px", height : "30px"}}>
          <Button
            type="primary"
            className="w-full h-full"
            htmlType="submit"
            disabled={sendMessageBySlug.isPending}
          >
            ارسال
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
