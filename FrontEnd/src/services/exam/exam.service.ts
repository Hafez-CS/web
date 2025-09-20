import Cookies from "js-cookie";
import { http } from "../../lib/http";

export interface IMessagePayload {
  content: string;
  
}

export class Exam {
  async GetExam(payload: string) {
    const token = Cookies.get("token-access");
    return await http.get(
      `api/exams/${payload}/`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  async SendExam(payload: string) {
    const token = Cookies.get("token-access");
    return await http.post(
      `api/exams/${payload}/`,
      payload, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }
}

export const exam = new Exam();
