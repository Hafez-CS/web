import { http } from "../../lib/http";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import type { login } from "../auth/@types";
import type { IForm } from "../../pages/Panel/profile/@types";

export default function useProfileApi() {
  const authHeader = useAuthHeader();

  const getHeader = () => {
    const token = authHeader;
    if (!token) throw new Error("No Token");
    return { Authorization: token };
  };

  return {
    getProfileInfo: () =>
      http.get("/api/accounts/profile/", {
        headers: getHeader(),
      }),

    DeleteAccount: () =>
      http.delete("/api/accounts/delete-user/", {
        headers: getHeader(),
      }),

    updateProfileInfoPUT: (payload: IForm) =>
      http.put("/api/accounts/profile/", payload, {
        headers: getHeader(),
      }),

    updateProfileInfoPATCH: (payload: login) =>
      http.patch("/api/accounts/profile/", payload, {
        headers: getHeader(),
      }),
  };
}
