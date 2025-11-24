import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, theme as antdTheme } from "antd";

import ProfileLayout from "./layout/profile";
import Profile from "./pages/Panel/profile";
import Login from "./pages/auth/Login/Login";
import SignUp from "./pages/auth/SignUp/SignUp";
import Reception from "./pages/Panel/reception";
import Setting from "./pages/Panel/Setting";
import AIHelper from "./pages/Panel/AIHelper";
import ExamPage from "./pages/Panel/Exam";
import Request from "./pages/Panel/reception/receptionRequest";
import Received from "./pages/Panel/reception/receptionReceived";
import { useTheme } from "./context/ThemeContext";

import "antd/dist/reset.css";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import AuthProvider from "react-auth-kit";
import createAuthStore from "react-auth-kit/store/createAuthStore";
import Consultant from "./pages/Panel/Consultant";
import Manager from "./pages/Panel/SchoolManager";
import Platform_Manager from "./pages/Panel/PlatformManager";
import Reports from "./pages/Panel/PlatformManager/Report";
import ConsultantPanelManager from "./pages/Panel/PlatformManager/Consultant";


const store = createAuthStore("cookie", {
  authName: "_auth",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "https:",
});



const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const queryClient = new QueryClient();

const App = () => {
  const { theme } = useTheme();

  return (
    <AuthProvider store={store}>
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
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProfileLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Profile />} />
                <Route path="reception" element={<Reception />} />
                <Route path="helper">
                  <Route index element={<AIHelper />} />
                  <Route path=":id" element={<AIHelper />} />
                </Route>
                <Route path="exams" element={<ExamPage />} />
                <Route path="assistant">
                  <Route path="request" element={<Request />} />
                  <Route path="received" element={<Received />} />
                  <Route path="completed" element={<Reception />} />
                </Route>
                <Route path={"assistantpanel"}>
                  <Route path="time" element={<Consultant/>}/>
                  <Route path="received" element={<Consultant/>}/>
                  <Route path="completed" element={<Consultant/>}/>
                  <Route path="report" element={<Consultant/>}/>

                </Route>
                <Route path="manager">
                  <Route path="users" element={<Manager/>} />
                  <Route path="report" element={<Manager/>} />
                </Route>
                {/* <Route path="platform_Manager"> */}
                  <Route path="platform_Manager/report" element={<Reports/>} />
                  <Route path="platform_Manager/users" element={<Platform_Manager/>} />
                  <Route path="platform_Manager/consultant" element={<ConsultantPanelManager/>}/>
                  <Route path="platform_Manager/manager" element={<ConsultantPanelManager/>}/>

                {/* </Route> */}
                <Route path="setting" element={<Setting />} />
              </Route>

              {/* auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>
      <ToastContainer position="top-center" />
    </AuthProvider>
  );
};

export default App;
