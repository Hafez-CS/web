import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ProfileLayout from "./layout/profile";
import Profile from "./pages/Panel/profile";
import Login from "./pages/auth/Login/Login";
import SignUp from "./pages/auth/SignUp/SignUp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import Reception from "./pages/Panel/reception";
import Setting from "./pages/Panel/Setting";
import AIHelper from "./pages/Panel/AIHelper";
import { useTheme } from "./context/ThemeContext";
import { ConfigProvider, theme as antdTheme } from "antd";
import "antd/dist/reset.css";
// import Exam from "./pages/Panel/Exam";
import ExamPage from "./pages/Panel/Exam";
import Request from "./pages/Panel/reception/receptionRequest";
import Received from "./pages/Panel/reception/receptionReceived";

const App = () => {
  const queryClient = new QueryClient();
  const { theme } = useTheme();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            algorithm:
              theme === "dark"
                ? antdTheme.darkAlgorithm
                : antdTheme.defaultAlgorithm,
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<ProfileLayout />}>
                <Route index path="/" element={<Profile />} />
                <Route index path="/reception" element={<Reception />} />
                <Route path="/helper">
                  <Route index element={<AIHelper />} />
                  <Route path=":id" element={<AIHelper />} />
                </Route>
                <Route index path="/exams" element={<ExamPage />} />
                <Route path="/assistant">
                  <Route path="request" element={<Request />} />
                  <Route path="received" element={<Received />} />
                  <Route path="completed" element={<Reception />} />
                </Route>
                <Route index path="/setting" element={<Setting />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
      <ToastContainer position="top-center" />
    </>
  );
};

export default App;
