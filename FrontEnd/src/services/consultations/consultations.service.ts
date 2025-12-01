import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { http } from "../../lib/http";

// TYPES
export interface ICode {
  message: string;
  coupon: ICodeInfo;
}

export interface ICodeInfo {
  id: number;
  code: string;
  used: boolean;
  used_at: string;
  created_at: string;
}
export interface IReserve {
  consultant_id: number,
  consultation_type: "single" | "package",
  scheduled_date: string,
  scheduled_time: string,
  discount_code ?: string
}

export interface IConsultant {
  id: number;
  username: string;
  full_name: string;
  email: string;
  bio: string;
}

export interface IConsultationItem {
  consultant: IConsultant;
  available_slots_count: number;
  available_slots: [];
}

export interface IReceivedConsultation {
  id: number;
  user: number;
  user_name: string;
  consultant: number;
  consultant_name: string;
  consultation_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  status_display: string;
  session_number: number;
  package_group: null;
  discount_code: string;
  discount_amount: string;
  user_completed: boolean;
  consultant_completed: boolean;
  completed_at: null;
  can_complete: boolean;
  is_completed: boolean;
  created_at: string;
}

// HOOK SERVICE
export const useConsultations = () => {
  const authHeader = useAuthHeader();

  const getHeader = () => {
    const token = authHeader;
    if (!token) throw new Error("No auth token found");
    return { Authorization: token };
  };

  const Request_Free_Coupon = async (): Promise<ICode> => {
    const res = await http.post(
      `api/consultations/coupons/request_free_coupon/`,
      {},
      { headers: getHeader() }
    );
    return res.data;
  };

  const available_consultants = async (
    type: "single" | "package"
  ): Promise<IConsultationItem[]> => {
    const res = await http.get(
      `api/consultations/consultations/available_consultants/?consultation_type=${type}`,
      { headers: getHeader() }
    );
    return res.data;
  };
  const complete_consultants = async (
    id : number
  ) => {
    const res = await http.post(
      `api/consultations/consultations/${id}/complete/`, {} ,
      { headers: getHeader() }
    );
    return res.data;
  };
  const Complete_consultants_List = async (
    
  ) => {
    const res = await http.get(
      `/api/consultations/consultations/completed/`,
      { headers: getHeader() }
    );
    return res.data;
  };
  const ReserveTime = async (data : IReserve): Promise<ICode> => {
    const res = await http.post(
      `api/consultations/consultations/book/`,
      data,
      { headers: getHeader() }
    );
    return res.data;
  };
  // api/consultations/consultations/statistics/
  const Report_Consultant = async() => {
    const res = await http.get(
      `api/consultations/consultations/statistics/`,
      { headers: getHeader() }
    );
    return res.data;
  };
  const Complete_Consultant = async (data : IReserve): Promise<ICode> => {
    const res = await http.post(
      `api/consultations/consultations/book/`,
      data,
      { headers: getHeader() }
    );
    return res.data;
  };

  const exist_consultation = async (): Promise<IReceivedConsultation[]> => {
    const res = await http.get(
      `api/consultations/consultations/received/`,
      { headers: getHeader() }
    );
    return res.data;
  };

  return {
    Request_Free_Coupon,
    Report_Consultant,
    available_consultants,
    complete_consultants,
    Complete_Consultant,
    Complete_consultants_List,
    exist_consultation,
    ReserveTime,
  };
};
