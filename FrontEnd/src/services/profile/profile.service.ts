import { http } from "../../lib/http";
import type { login } from "../auth/@types";
import { Token } from "../auth/@types";



export class ProfileAPI {

    async getProfileInfo() {
        return await http.get("/api/accounts/profile"  ,
            { headers: {"Authorization" : `Bearer ${Token}`} }
        )
    }
    async updateProfileInfoPUT(payload : login) {
        return await http.put("/api/accounts/profile" , payload)
    }
    async updateProfileInfoPATCH(payload : login) {
        return await http.put("/api/accounts/profile" , payload)
    }
}

export const profileAPI = new ProfileAPI()