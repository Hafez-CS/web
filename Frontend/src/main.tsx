import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login/Login.tsx";
import SignUp from "./pages/auth/SignUp/SignUp.tsx";
import ProfileLayout from "./layout/profile/index.tsx";
import Profile from "../src/pages/Panel/profile/index.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileLayout />}>
          <Route index path="/" element={<Profile />} />
          <Route index path="/reception" element={<Profile />} />
          <Route index path="/helper" element={<Profile />} />
          <Route index path="/exams" element={<Profile />} />
          <Route index path="/assistant" element={<Profile />} />
          <Route index path="/setting" element={<Profile />} />
        </Route>
        {/* </Route> */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
