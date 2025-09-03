import { http } from "../../lib/http";
import type { ILogin } from "../../pages/auth/Login/@types";
import type { ISignUp } from "../../pages/auth/SignUp/@types";

export class Auth {
   async Login(payload: ILogin) {
    return await http.post(`api`, payload);
  }
  async SignUp(payload : ISignUp) {
    return await http.post("" , payload)
  }
}

export const auth = new Auth()