import Cookies from "js-cookie";
import { http } from "../../lib/http";

export interface sendMessagedto {
  slug : string
  message : string
}

export class ChatAPI {
  async SendMessage(payload: sendMessagedto) {
  const token = Cookies.get("token-access");
  if (!token) throw new Error("No token");

  const res = await http.post(
    `api/chat/${payload.slug}/send-message/`,
    { message: payload.message },     {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
}


  async ChatHistory(slug: string) {
    const token = Cookies.get("token-access");
    if (!token) throw new Error("No token");
    const res = await http.get(`api/chat/${slug}/chat-history/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async rooms( ) {
    const token = Cookies.get("token-access");
    const res = await http.get("api/chat/rooms/" , {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async new_room(name : string) {
    const token = Cookies.get("token-access");
    // if (!token) throw new Error("N");
    const res = await http.post(
      "api/chat/new-room/",
      {name}, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  }
}

export const chatapi = new ChatAPI();
