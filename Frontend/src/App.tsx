
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import ProfileLayout from './layout/profile'
import Profile from './pages/Panel/profile'
import Login from './pages/auth/Login/Login'
import SignUp from './pages/auth/SignUp/SignUp'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import Reception from './pages/Panel/reception'



const App = () => {
const queryclinet = new QueryClient()
  return (
    <>
<QueryClientProvider client={queryclinet}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProfileLayout />}>
          <Route index path="/" element={<Profile />} />
          <Route index path="/reception" element={<Reception/>} />
          <Route index path="/helper" element={<Reception/>} />
          <Route index path="/exams" element={<Reception/>} />
          <Route index path="/assistant" element={<Reception/>} />
          <Route index path="/setting" element={<Reception/>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
</QueryClientProvider>
<ToastContainer position='top-center'  />

    </>
  )
}

export default App
