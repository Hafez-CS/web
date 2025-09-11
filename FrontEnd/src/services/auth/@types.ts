import Cookies from "js-cookie";
export interface login {
  username: string;
  password: string;
}
export interface signup {
  username: string;
  email: string;
  password: string;
}
export interface Rlogin {
  access: string;
  refresh: string;
}
export interface Rsignup {
  id: number;
  username: string;
  email: string;
}

export const Token = Cookies.get("token-access");
