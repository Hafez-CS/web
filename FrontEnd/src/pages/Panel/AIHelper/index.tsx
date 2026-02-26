"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form } from "antd";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";




import { NewRoomModal } from "./components/NewRoomModal";


import { ChatSidebar } from "./components/chatSideBar";
import { useAIHelperChat } from "../../../hooks/useAIHelperChat";
import ChatInputForm from "./components/chatInputForm";
import ChatMessageList from "./components/chatMessageList";

export default function AIHelper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();

  const {
    roomsQuery,
    chatQuery,
    newRoomMutation,
    sendMessageMutation,
  } = useAIHelperChat(id);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatQuery.data]);

  return (
    <div className="flex h-[90vh] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-inner overflow-hidden">
      <ChatSidebar
        rooms={roomsQuery.data}
        loading={roomsQuery.isLoading}
        onNewChat={() => setIsModalOpen(true)}
      />

      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          <ChatMessageList
            messages={chatQuery.data?.messages}
            loading={chatQuery.isLoading}
          />
          <div ref={chatEndRef} />
        </div>

        {id && (
          <ChatInputForm
            form={form}
            loading={sendMessageMutation.isPending}
            onSend={(values) => {
              if (!values.content.trim()) return;

              sendMessageMutation.mutate({
                slug: id,
                message: values.content,
              });

              form.resetFields();
            }}
          />
        )}
      </div>

      <NewRoomModal
        open={isModalOpen}
        loading={newRoomMutation.isPending}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(values) => newRoomMutation.mutate(values.name)}
      />
    </div>
  );
}