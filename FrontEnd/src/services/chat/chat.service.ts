import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { http } from "../../lib/http";

export interface sendMessagedto {
  slug: string;
  message: string;
}

export const useChatApi = () => {
  const authHeader = useAuthHeader();

  const getHeader = () => {
    if (!authHeader) throw new Error("No token found");
    return { Authorization: authHeader };
  };

  const SendMessage = async (payload: sendMessagedto) => {
    const res = await http.post(
      `api/chat/${payload.slug}/send-message/`,
      { message: payload.message },
      { headers: getHeader() }
    );
    return res.data;
  };

  const ChatHistory = async (slug: string) => {
    const res = await http.get(`api/chat/${slug}/chat-history/`, {
      headers: getHeader(),
    });
    return res.data;
  };

  const Rooms = async () => {
    const res = await http.get("api/chat/rooms/", {
      headers: getHeader(),
    });
    return res.data;
  };

  const New_room = async (name: string) => {
    const res = await http.post(
      "api/chat/new-room/",
      { name },
      { headers: getHeader() }
    );
    return res.data;
  };

  return {
    SendMessage,
    ChatHistory,
    Rooms,
    New_room,
  };
};
