import { http } from "../../lib/http";
import type { ILogin } from "../../pages/auth/Login/@types";
import type {  ISignUpPayload } from "../../pages/auth/SignUp/@types";


export class Auth {
   async Login(payload: ILogin) {
    return await http.post(`api/accounts/login`, payload);
  }
  async SignUp(payload : ISignUpPayload) {
    return await http.post("api/accounts/register" , payload)
  }
}

export const auth = new Auth()