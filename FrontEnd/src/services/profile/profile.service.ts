import Cookies from "js-cookie";
import { http } from "../../lib/http";
import type { login } from "../auth/@types";
import type { IForm } from "../../pages/Panel/profile/@types";

export class ProfileAPI {
  async getProfileInfo() {
    const token = Cookies.get("token-access");
    return await http.get("/api/accounts/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfileInfoPUT(payload: IForm) {
    const token = Cookies.get("token-access");
    return await http.put("/api/accounts/profile/", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfileInfoPATCH(payload: login) {
    const token = Cookies.get("token-access");
    return await http.patch("/api/accounts/profile/", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const profileInfo = new ProfileAPI();
