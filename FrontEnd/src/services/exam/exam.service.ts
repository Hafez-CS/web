import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { http } from "../../lib/http";

export const useExamService = () => {
  const token = useAuthHeader();

  const getHeader = () => {
    if (!token) throw new Error("No auth token");
    return { Authorization: token };
  };

  const GetExam = async (slug: string) => {
    const res = await http.get(`api/exams/${slug}/start/`, {
      headers: getHeader(),
    });
    return res.data;
  };

  const SendExam = async (slug: string, answers: Record<number, string>) => {
    const res = await http.post(
      `api/exams/${slug}/submit/`,
      { answers },
      { headers: getHeader() }
    );
    return res.data;
  };

  return { GetExam, SendExam };
};
