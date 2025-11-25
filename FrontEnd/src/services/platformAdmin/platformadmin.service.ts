import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { http } from "../../lib/http";
import type { AddConsultant } from "./@types";

export const PlatformAdmin = () => {
  const token = useAuthHeader();

  const getHeader = () => {
    if (!token) throw new Error("No auth token");
    return { Authorization: token };
  };

  const consultResult = async () => {
    const res = await http.get(`api/consultations/consultations/statistics/`, {
      headers: getHeader(),
    });
    return res.data;
  };
  const TotalResult = async () => {
    const res = await http.get(`api/admin-platform/reports/`, {
      headers: getHeader(),
    });
    return res.data;
  };
  // Consultant Actions
  const GetAdminConsultantList = async () => {
    const res = await http.get(`api/admin-platform/consultants/`, {
      headers: getHeader(),
    });
    return res.data;
  };
  const CreateAdminConsultant = async (data: AddConsultant) => {
    const res = await http.post(`api/admin-platform/consultants/`, data, {
      headers: getHeader(),
    });
    return res.data;
  };
  const EditAdminConsultant = async (id: number, data: AddConsultant) => {
    const res = await http.patch(
      `api/admin-platform/consultants/${id}/`,
      data,
      {
        headers: getHeader(),
      }
    );
    return res.data;
  };
  const DeleteAdminConsultant = async (id: number) => {
    const res = await http.delete(`api/admin-platform/consultants/${id}/`, {
      headers: getHeader(),
    });
    return res.data;
  };
  // Manager_School Actions
  const GetAdminManagerList = async () => {
    const res = await http.get(`api/admin-platform/school-admins/`, {
      headers: getHeader(),
    });
    return res.data;
  };
  const CreateAdminManager = async (data: AddConsultant) => {
    const res = await http.post(`api/admin-platform/school-admins/`, data, {
      headers: getHeader(),
    });
    return res.data;
  };
  const EditAdminManager = async (id: number, data: AddConsultant) => {
    const res = await http.patch(
      `api/admin-platform/school-admins/${id}/`,
      data,
      {
        headers: getHeader(),
      }
    );
    return res.data;
  };
  const DeleteAdminManager = async (id: number) => {
    const res = await http.delete(`api/admin-platform/school-admins/${id}/`, {
      headers: getHeader(),
    });
    return res.data;
  };

  return {
    consultResult,
    GetAdminManagerList,
    DeleteAdminManager,
    EditAdminManager,
    CreateAdminManager,
    TotalResult,
    GetAdminConsultantList,
    CreateAdminConsultant,
    EditAdminConsultant,
    DeleteAdminConsultant,
  };
};
