import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const clickHandler = async (e) => {
    e.preventDefault();
    try {
      
      await axios.post("http://localhost:8000/api/accounts/register/", {
        username,
        email,
        password,
      });

      
      const res = await axios.post("http://localhost:8000/api/accounts/login/", {
        email,
        password,
      });

      const { access, refresh } = res.data;

      
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

    
      setUsername("");
      setEmail("");
      setPassword("");
      setErrorMessage("");
      navigate("/Mainpage");
    } catch (error) {
  if (error.response) {
    const data = error.response.data;
    
    
    if (typeof data === "object") {
      
      const firstError = Object.values(data)[0];
      const message = Array.isArray(firstError) ? firstError[0] : firstError;
      setErrorMessage(message);
    } else {
      setErrorMessage(data.detail || data.error ||"An unexpected error occurred.");
    }
  } else {
    setErrorMessage("Unable to connect to the server.");
  }
}};
  return (
    <div className="h-screen flex flex-col bg-amber-200">
     
      <div className="w-[50%] md:w-[40%] h-[50px] bg-white m-auto rounded-2xl flex gap-5 md:gap-10 lg:w-[40%] mb-40">
        <Link
          className="inline-block w-[50%] h-[50px] bg-orange-500 rounded-2xl text-center pt-3"
          to={"/"}
        >
          SIGN UP
        </Link>
        <Link className="text-center pt-3" to={"/Login"}>
          LOG IN
        </Link>
      </div>

      
      <div className="flex border-orange-500 w-[70%] md:w-[55%] lg:h-[400px] h-[350px] m-auto bg-white rounded-2xl items-center flex-col mt-[-150px] lg:flex-row lg:gap-2 xl:gap-8 xl:w-[52%] lg:w-[62%]">
        <div className="lg:bg-green-200 lg:w-[40%] lg:h-[100%] rounded-2xl hidden lg:block text-center text-4xl pt-25 text-orange-600">
          WELCOME
        </div>

        <div>
          <form className="flex flex-col gap-3 min-h-[250px]" onSubmit={clickHandler}>
            <h1 className="text-center text-xl text-orange-500 mt-5 sm:text-2xl sm:py-2">
              SIGN UP
            </h1>

            <input
              className="border border-orange-500 mt-3 h-[40px] rounded-md pl-3 sm:w-[400px] lg:w-[350px]"
              placeholder="USERNAME"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="border border-orange-500 mt-3 h-[40px] rounded-md pl-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="border border-orange-500 mt-3 h-[40px] rounded-md pl-3"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              className="mt-5 ml-2 rounded-sm bg-orange-500 w-[70px] h-[30px] sm:h-[35px] sm:my-5"
              type="submit"
            >
              SIGN UP
            </button>

            <div className="h-6">
              {errorMessage && (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Signup;