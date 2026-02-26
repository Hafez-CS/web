import { Spin, Button } from "antd";
import { PlusCircleOutlined, RobotOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

export function ChatSidebar({
  rooms,
  loading,
  onNewChat,
}: {
  rooms?: any[];
  loading: boolean;
  onNewChat: () => void;
}) {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center gap-3 p-3 w-[230px] bg-gray-200 dark:bg-gray-800 shadow-lg">
      <h1 className="font-semibold flex items-center justify-center gap-2 text-lg text-white bg-blue-600 w-full text-center py-2 rounded-lg">
        <RobotOutlined />
        <span>چت با دستیار</span>
      </h1>

      <Button
        type="dashed"
        icon={<PlusCircleOutlined />}
        onClick={onNewChat}
        className="w-full border-blue-500 py-2 text-blue-600 font-semibold"
      >
        چت جدید
      </Button>

      <div className="flex flex-col gap-2 w-full mt-2 overflow-y-auto h-full">
        {loading ? (
          <Spin />
        ) : rooms?.length ? (
          rooms.map((data) => (
            <button
              key={data.id}
              onClick={() => navigate(`/helper/${data.slug}`)}
              title={data.name}
              className={`flex flex-col cursor-pointer justify-between py-3 px-2  rounded-lg transition-all duration-200 ${
                id === data.slug
                  ? "roomItem"
                  : "bg-white dark:bg-gray-700 text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-600"
              }`}
            >
              <p className="font-medium text-right w-full truncate">
                {data.name}
              </p>

              <p className={`text-[11px] text-left ${id === data.slug ? "text-white" : "text-black"}  dark:text-white opacity-70`}>
                {data.created_at
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
  );
}