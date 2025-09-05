import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
     
      const res = await axios.post("http://localhost:8000/api/accounts/login/", {
        email,
        password,
      });

      
      const { access, refresh } = res.data;

     
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      console.log("ورود موفق! توکن‌ها:", { access, refresh });

     
      navigate("/Mainpage");
    } catch (error) {
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        alert("Login failed: " + JSON.stringify(error.response.data));
      } else {
        console.error("Error:", error.message);
        alert("Something went wrong!");
      }
    }
  };

  return (
    <form
      className="h-screen bg-amber-200 flex items-center justify-center p-4"
      onSubmit={handleSubmit}
    >
      <div className="w-full max-w-md bg-amber-50 rounded-xl shadow-lg p-6">
        <div className="text-center text-slate-900 text-3xl font-bold mb-6">
          LOG IN
        </div>
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-400 block w-full h-12 rounded-md px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-400 block w-full h-12 rounded-md px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full h-12 rounded-md bg-orange-500 text-white font-semibold hover:bg-green-300 transition"
          type="submit"
        >
          LOG IN
        </button>
        <div className="mt-4 text-center">
          <Link to="/" className="text-orange-600 font-semibold">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default Login;