import Cookies from "js-cookie";
import { http } from "../../lib/http";

export class ChatAPI {
  async SendMessage(chatSlug: string, content: string) {
    const token = Cookies.get("token-access");
    if (!token) throw new Error("No token");
    const res = await http.post(
      `api/chat/${chatSlug}/send-message/`,
      { content }, 
      {
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

  async rooms() {
    const token = Cookies.get("token-access");
    if (!token) throw new Error("No token");
    const res = await http.get("api/chat/rooms/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }

  async new_room() {
    const token = Cookies.get("token-access");
    // if (!token) throw new Error("N");
    const res = await http.post(
      "api/chat/new-room/",
      {}, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  }
}

export const chatapi = new ChatAPI();
