import Cookies from "js-cookie";
import { http } from "../../lib/http";

export interface IMessagePayload {
    content: string;
  }
  
export class ChatAPI {
    async SendMessage(payload: IMessagePayload) {
      const token = Cookies.get("token-access");
      return await http.post(
        "api/chat/send-message/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  
    async ChatHistory() {
      const token = Cookies.get("token-access");
      const res = await http.get("api/chat/chat-history/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    }
  }
  

  export const chatapi = new ChatAPI()