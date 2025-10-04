import Cookies from "js-cookie";
import { http } from "../../lib/http";

export interface QuestionInfo {
  id: number;
  text: string;
  options: string[];
}

export interface GetExamIntro {
  title: string;
  slug: string;
  questions: QuestionInfo[];
}

export class ExamService {
  async GetExam(slug: string): Promise<GetExamIntro> {
    const token = Cookies.get("token-access");
    if (!token) throw new Error("No token");

    const res = await http.get(`api/exams/${slug}/start/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  }

  async SendExam(slug: string, answers: Record<number, string>) {
    const token = Cookies.get("token-access");
    if (!token) throw new Error("No token");

    const res = await http.post(
      `api/exams/${slug}/submit/`,
      { answers }, 
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return res.data;
  }
}

export const exam = new ExamService();
