import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { chatapi, type sendMessagedto } from "../../../services/chat/chat.service";
import { Button, Form, Input, Modal, Spin } from "antd";
import { toast } from "react-toastify";
import type { IChatResponse, IModal, Irooms, ISendmessageResponse } from "./@types";
import { PlusCircleOutlined, SendOutlined } from "@ant-design/icons";

export default function AIHelper() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = Cookies.get("token-access");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    setMessage("");
    queryClient.invalidateQueries({ queryKey: ["ChatMessages", id] });
  }, [id]);

  const { data: rooms, isLoading: roomsLoading } = useQuery<Irooms[]>({
    queryKey: ["rooms"],
    queryFn: chatapi.rooms,
  });

  const { data: ChatHistoryBySlug, isLoading: chatLoading } = useQuery<IChatResponse>({
    queryKey: ["ChatMessages", id],
    queryFn: () => chatapi.ChatHistory(id || "test"),
    enabled: !!id,
  });

  const new_room = useMutation({
    mutationFn: chatapi.new_room,
    onSuccess: (data: ISendmessageResponse) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      navigate(`/helper/${data.slug}`);
      toast.success("چت جدید با موفقیت ساخته شد");
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "خطا در ساخت چت جدید!");
    },
  });

  const sendMessageBySlug = useMutation({
    mutationFn: (payload: sendMessagedto) => chatapi.SendMessage(payload),
    onSuccess: () => {
      toast.success("پیام با موفقیت ارسال شد");
      queryClient.invalidateQueries({ queryKey: ["ChatMessages", id] });
      form.resetFields();
      setMessage("");
    },
    onError: () => {
      toast.error("خطا در ارسال پیام!");
    },
  });

  const handleSetNewRoom = (values: IModal) => {
    new_room.mutate(values.name);
  };

  const handleSend = (values: { content: string }) => {
    if (!values.content.trim()) return;
    sendMessageBySlug.mutate({
      slug: id || "test",
      message: values.content,
    });
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ChatHistoryBySlug]);

  return (
    <div className="flex h-[85vh] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-inner overflow-hidden">

      <div className="flex flex-col items-center gap-3 p-3 w-[230px] bg-gray-200 dark:bg-gray-800 shadow-lg">
        <h1 className="font-semibold text-lg text-white bg-blue-600 w-full text-center py-2 rounded-lg">
          لیست چت‌ها
        </h1>

        <Button
          type="dashed"
          icon={<PlusCircleOutlined />}
          onClick={() => setIsModalOpen(true)}
          className="w-full border-blue-500 text-blue-600 font-semibold"
        >
          چت جدید
        </Button>

        <div className="flex flex-col w-full mt-2 overflow-y-auto h-full">
          {roomsLoading ? (
            <Spin />
          ) : rooms?.length ? (
            rooms.map((data) => (
              <button
                key={data.id}
                onClick={() => navigate(`/helper/${data.slug}`)}
                className={`text-right p-2 my-1 rounded-lg transition-all duration-200 ${
                  id === data.slug
                    ? "bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600"
                }`}
              >
                <p className="font-medium truncate">{data.name}</p>
                <p className="text-[11px] opacity-70">
                  {data?.created_at
                    ? new Date(data.created_at).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </p>
              </button>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-10">چتی وجود ندارد</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {chatLoading ? (
            <div className="flex justify-center items-center h-full">
              <Spin tip="در حال بارگذاری..." />
            </div>
          ) : ChatHistoryBySlug?.messages.length ? (
            ChatHistoryBySlug.messages.map((data) => (
              <div
                key={data.id}
                className={`flex ${
                  data.sender === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl shadow-md ${
                    data.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}
                >
                  <div className="text-sm">{data.message}</div>
                  <div className="text-[10px] opacity-70 mt-1 text-right">
                    {new Date(data.timestamp).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center mt-10">
              هنوز پیامی ارسال نشده است.
            </p>
          )}
          <div ref={chatEndRef} />
        </div>

        <Form
          form={form}
          layout="inline"
          style={{height : "90px" , padding : "12px" , display : "flex" , justifyContent : "space-between" , alignItems : "center"}}
          onFinish={handleSend}
          className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl "
        >
          <Form.Item
            name="content"
            style={{width:"100%" , maxWidth : "400px"}}
            className="flex-1 mr-2"
            rules={[{ required: true, message: "پیام خود را وارد کنید!" }]}
          >
            <Input
              placeholder="پیام خود را بنویسید..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-xl h-[45px]"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={sendMessageBySlug.isPending}
          >
            ارسال
          </Button>
        </Form>
      </div>

      <Modal
        title="اتاق جدید"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form onFinish={handleSetNewRoom}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: "نام اتاق را وارد کنید!" }]}
          >
            <Input placeholder="نام چت جدید..." />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={new_room.isPending}
              className="w-full"
            >
              ساختن
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
