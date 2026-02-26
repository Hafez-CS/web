import { Spin } from "antd";
import { useParams } from "react-router-dom";

export default function ChatMessageList({
  messages,
  loading,
}: {
  messages?: any[];
  loading: boolean;
}) {
    const {id} = useParams()
  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <Spin tip="در حال بارگذاری..." />
      </div>
    );

  if (!messages?.length && id)
    return (
      <p className="text-gray-400 text-center mt-10">
        هنوز پیامی ارسال نشده است.
      </p>
    );

  return (
    <>
      {messages?.map((data) => (
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
      ))}
    </>
  );
}