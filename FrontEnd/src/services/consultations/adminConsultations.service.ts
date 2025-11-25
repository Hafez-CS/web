import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { http } from "../../lib/http";

interface ISetConsultant {
    date : string
    start_time : string
    end_time : string
    is_available : boolean
}


export const useAdminConsulation = () => {
  const authHeader = useAuthHeader();

  const getHeader = () => {
    const token = authHeader;
    if (!token) throw new Error("No auth token found");
    return { Authorization: token };
  };
// Single Consultant
  const ConsulationList = async () => {
    const res = await http.get(
      `/api/consultations/calendar/`,
      { headers: getHeader() }
    );
    return res.data;
  };

  const SetConsultantTime = async (
    data : ISetConsultant
  ) => {
    const res = await http.post(
      `/api/consultations/calendar/`, data ,
      { headers: getHeader() }
    );
    return res.data;
  };
  const EditConsultantTime = async ( id : number ,
    data : ISetConsultant
  ) => {
    const res = await http.patch(
      `/api/consultations/calendar/${id}/`, data ,
      { headers: getHeader() }
    );
    return res.data;
  };

  const DeleteConsultantTime = async (id : number) => {
    const res = await http.delete(
      `/api/consultations/calendar/${id}/`,
      { headers: getHeader() }
    );
    return res.data;
  };
  //   TODO ASK for more information
// Package Consultant
const ConsulationPackageList = async () => {
    const res = await http.get(
      `/api/consultations/calendar/date_range/`,
      { headers: getHeader() }
    );
    return res.data;
  };
//   TODO ASK for more information
  const SetPackageConsultantTime = async (
    data : ISetConsultant
  ) => {
    const res = await http.post(
      `/api/consultations/calendar/bulk_create/`, data ,
      { headers: getHeader() }
    );
    return res.data;
  };
  //   TODO ASK for more information
  const EditPackageConsultantTime = async ( id : number ,
    data : ISetConsultant
  ) => {
    const res = await http.patch(
      `/api/consultations/calendar/bulk_update/${id}/`, data ,
      { headers: getHeader() }
    );
    return res.data;
  };
//   TODO ASK for more information
  const DeletePackageConsultantTime = async (id : number) => {
    const res = await http.delete(
      `/api/consultations/calendar/bulk_delete/${id}/`,
      { headers: getHeader() }
    );
    return res.data;
  };

  return {
    ConsulationList,
    SetConsultantTime,
    DeleteConsultantTime,
    EditConsultantTime,
    DeletePackageConsultantTime,
    EditPackageConsultantTime,
    SetPackageConsultantTime,
    ConsulationPackageList
  };
};
