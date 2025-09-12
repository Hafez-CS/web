import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import ProfileLayout from './layout/profile'
import Profile from './pages/Panel/profile'
import Login from './pages/auth/Login/Login'
import SignUp from './pages/auth/SignUp/SignUp'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import Reception from './pages/Panel/reception'
import Setting from './pages/Panel/Setting'
import AIHelper from './pages/Panel/AIHelper'
import { useTheme } from './context/ThemeContext'
import { ConfigProvider, theme as antdTheme } from 'antd'
import "antd/dist/reset.css"; 

const App = () => {
  const queryClient = new QueryClient()
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
                <Route index path="/reception" element={<Reception/>} />
                <Route index path="/helper" element={<AIHelper/>} />
                <Route index path="/exams" element={<Reception/>} />
                <Route index path="/assistant" element={<Reception/>} />
                <Route index path="/setting" element={<Setting/>} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </BrowserRouter>
            
        </ConfigProvider>
      </QueryClientProvider>
      <ToastContainer position='top-center'  />
    </>
  )
}

export default App
