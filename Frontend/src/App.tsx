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

// ⚡ Store رو خارج از کامپوننت می‌سازیم
const store = createAuthStore("cookie", {
  authName: "_auth",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "https:",
});

// مسیر محافظت‌شده
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const queryClient = new QueryClient();

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
