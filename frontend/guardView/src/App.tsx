import React from 'react'
import { Routes,Route, Navigate } from 'react-router-dom'
import {LoginPage,History,DashBoard,Scan} from './pages'
import { useAuthStore } from './store/authStore'
import { apiInstance } from './lib/apiInstance'
import { LoaderCircle } from 'lucide-react';
import PendingPage from './pages/Pending'
function App() {
  
  const {isLoading,setUserData,setIsLoading}=useAuthStore()
  React.useEffect(() => {
  async function checkLogin() {
    try {
         setIsLoading(true)
      const response = await apiInstance.get('/check')
      setUserData(response.data.guard)
   
    } catch (error) {
      console.log("User not logged in")
    }finally{
      setIsLoading(false)
    }
  }

  checkLogin()
}, [])
    
if(isLoading){
  return (
    <div>
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
        <LoaderCircle className="animate-spin text-blue-500" size={48} />
      </div>
    </div>
  )
}
  return (
    <Routes>
      <Route path='/login' element={
        <PublicRoute>
        <LoginPage/>
        </PublicRoute>
        }/>
      <Route path='/' element={
        <ProtectedRoute>
        <Root/>
        </ProtectedRoute>
        }/>
         <Route path='/history' element={
        <ProtectedRoute>
        <History/>
        </ProtectedRoute>
        }/>
         <Route path='/pending' element={
        <ProtectedRoute>
        <PendingPage/>
        </ProtectedRoute>
        }/>
      <Route path='/scan' element={
        <ProtectedRoute>
        <Scan/>
        </ProtectedRoute>
        }/>
    </Routes>
  )
}

export default App

const Root=()=>{
    const {userData}=useAuthStore()
  return (
    userData ? <DashBoard/> : <LoginPage/>
  )
}

const ProtectedRoute=({ children }: { children: React.ReactNode })=>{
    const {userData}=useAuthStore()
    if(!userData){
        return <Navigate to='/login' replace/>
    }
    return <>{children}</>
}
const PublicRoute=({ children }: { children: React.ReactNode })=>{
    const {userData}=useAuthStore()
    if(userData){
        return <Navigate to='/' replace/>
    }
    return <>{children}</>
}