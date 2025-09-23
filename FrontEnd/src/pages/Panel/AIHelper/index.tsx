import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import {
  chatapi,
  type sendMessagedto,
} from "../../../services/chat/chat.service";
import { Button, Form, Input, Modal } from "antd";

import { toast } from "react-toastify";
import type {
  IChatResponse,
  IModal,
  Irooms,
  ISendmessageResponse,
} from "./@types";

export default function AIHelper() {
  const { id } = useParams();
  // const [slug , setSlug] = useState<string | null>(null)
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  console.log("🚀 ~ AIHelper ~ id:", id || "no slug");

  useEffect(() => {
    const token = Cookies.get("token-access");
    if (!token) navigate("/login");
  }, [navigate]);
  useEffect(() => {
    setMessage("");
    queryClient.invalidateQueries({ queryKey: ["ChatMessages", id] });
  }, [id]);

  const { data: rooms } = useQuery<Irooms[]>({
    queryKey: ["rooms"],
    queryFn: chatapi.rooms,
  });
  console.log("🚀 ~ AIHelper ~ rooms:", rooms);
  const { data: ChatHistoryBySlug } = useQuery<IChatResponse>({
    queryKey: ["ChatMessages" , id],
    queryFn: () => chatapi.ChatHistory(id || "test"),
    enabled: !!id,
  });

  console.log("🚀 ~ AIHelper ~ getAllChats:", ChatHistoryBySlug);

  const new_room = useMutation({
    mutationFn: chatapi.new_room,
    onSuccess: (data: ISendmessageResponse) => {
      console.log("🚀 ~ AIHelper ~ data:", data);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      navigate(`/helper/${data.slug}`);

      toast.success("چت جدید با موفقیت ساخته شد");
    },
    onError: (err) => {
      toast.error(err.message || "خطا در ساخت چت جدید!");
    },
  });

  const sendMessageBySlug = useMutation({
    mutationFn: (payload: sendMessagedto) => chatapi.SendMessage(payload),
    onSuccess: (data) => {
      console.log("🚀 پیام ارسال شد:", data);
      toast.success("پیام با موئفقیت ارسال شد");
      queryClient.invalidateQueries({ queryKey: ["ChatMessages", id] });
      setMessage("");
    },
    onError: () => {
      toast.error("خطا");
    },
  });

  const handleSetNewRoom = (data: IModal) => {
    console.log("🚀 ~ handleSetNewRoom ~ data:", data);
    new_room.mutate(data.name);
  };
  const handleSend = (values: { content: string }) => {
    if (!values.content.trim()) return;
    setMessage(values.content);
    sendMessageBySlug.mutate({
      slug: id || "test",
      message: values.content,
    });
  };

  return (
    <div className="flex flex-col relative h-[85vh] bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col absolute  gap-1 left-0 rounded-r-2xl py-5 px-2 h-full w-[200px] bg-gray-300 shadow-md">
        <h1 className="font-semibold justify-center items-center flex bg-primary rounded-md text-white p-2 text-[16px]">
          لیست چت ها
        </h1>
        {rooms?.map((data) => {
          return (
            <button
              className="chat-room-button"
              onClick={() => navigate(`/helper/${data.slug}`)}
              key={data.id}
            >
              <p>{data.name}</p>
              <p className="text-[12px]">
                {data?.created_at
                  ? new Date(data.created_at).toLocaleTimeString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex w-full bg-red-100 h-full overflow-y-scroll flex-col gap-2 p-4 space-y-3">
        {ChatHistoryBySlug?.messages.map((data) => (
          <div
            key={data.id}
            className={` inline-flex justify-between ${
              data.sender === "user"
                ? " mr-auto bg-amber-300"
                : " ml-auto text-right bg-primary text-white"
            } w-[200px] min-h-[100px] p-4 rounded-xl`}
          >
            <div className="flex gap-2 flex-col">
              <span className="text-[12px] font-bold">
                {data.sender === "user" ? "شما:" : "ربات:"}
              </span>
              <span>{data.message}</span>
            </div>
            <div className="text-[10px] opacity-50 mt-1 text-left">
              {new Date(data.timestamp).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>

      <Form
        style={{
          fontFamily: "Vazir",
          width: "100%",
          position: "absolute",
          bottom: "0px",
          right: "0px",
          border: "none",
          boxShadow: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 20px",
        }}
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
            style={{ fontFamily: "Vazir" }}
            placeholder="پیام خود را بنویسید..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="rounded-xl h-[50px] flex items-center justify-start"
          />
        </Form.Item>

        <Modal
          title={"اتاق جدید"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form onFinish={handleSetNewRoom}>
            <Form.Item name={"name"}>
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                ساختن
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Form.Item style={{ width: "60px", height: "30px" }}>
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
