export interface Irooms {
  created_at: string;
  id: number;
  name: string;
  slug: string;
}

export interface IModal {
  name : string
}

export interface IMessage {
  id: number;
  role: "user" | "ai";
  content: string;
  created_at: string;
}
export interface ISendmessageResponse {
    id: number
     slug: string
      name: string
       created_at: string
}
export interface IMessageInfo {
  id: string;
  room: string;
  sender: "user" | "bot";
  message: string;
  timestamp: string;
}

export interface IChatResponse {
  count: number;
  limit: number;
  offset: number;
  room: string;
  messages: IMessageInfo[];
}

