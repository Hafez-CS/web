import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { chatapi } from "../../../services/chat/chat.service";
import { Button, Form, Input } from "antd";

interface IMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

export default function AIHelper() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token-access");
    if (!token) navigate("/login");
  }, [navigate]);

  const { data: Messages, isLoading, isError } = useQuery<IMessage[]>({
    queryKey: ["ChatMessages"],
    queryFn: chatapi.ChatHistory,
  });

  const sendMessage = useMutation({
    mutationFn: chatapi.SendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ChatMessages"] });
      setMessage("");
    },
  });

  const handleSend = (values: { content: string }) => {
    if (!values.content.trim()) return;
    sendMessage.mutate({ content: values.content });
  };

  return (
    <div className="flex flex-col relative h-[85vh] bg-gray-100 dark:bg-gray-900">
    
      <div className="flex overflow-y-auto flex-col gap-2 p-4 space-y-3">
        {isLoading && <p className="text-gray-500">در حال بارگذاری...</p>}
        {isError && <p className="text-red-500">خطا در دریافت پیام‌ها</p>}

        {Messages?.map((msg) => (
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

        <Form.Item style={{width : "60px", height : "30px"}}>
          <Button
            type="primary"
            className="w-full h-full"
            htmlType="submit"
            disabled={sendMessage.isPending}
          >
            ارسال
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
