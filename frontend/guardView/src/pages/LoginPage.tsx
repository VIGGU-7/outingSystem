import React from 'react'
import type { FormEvent } from 'react'
import { AlertCircleIcon,X } from "lucide-react"
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import './Auth.css'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { apiInstance } from '@/lib/apiInstance'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
    const navigate=useNavigate()
    const {setIsLoading,setUserData}=useAuthStore()
  const [data, setData] = React.useState({
    email: "",
    password: ""
  })
  const [error, setError] = React.useState("")

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault()

    if (!data.email.trim()) {
      setError("Email is required")
      return
    }
    const ivalidEmail = !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)
   
    if (!data.password.trim()) {
      setError("Password is required")
      return
    }
     if (ivalidEmail) {
      setError("Invalid email address")
      return
    }
    try {
        setIsLoading(true)
        const response=await apiInstance.post('/login',data)
        
        setUserData(response.data.user)
        navigate('/')
    } catch (error: any) {
       setError(error?.response?.data?.message || "Login failed. Please try again.")
    }finally{
        setIsLoading(false)
    }

  }
  React.useEffect(() => {
  if (error) {
    const timer = setTimeout(() => setError(""), 3000)
    return () => clearTimeout(timer)
  }
}, [error])


  return (
    <div className="dotted-bg h-screen w-full flex items-center justify-center font-poppins relative">
      <div className="bg-white w-[380px] p-10 rounded-lg shadow-xl">
        <p className="text-2xl font-medium">Guard Login</p>
        <p className="text-gray-500 text-sm mt-1">Login to your account to continue</p>

        <form className="mt-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="text"
            placeholder="you@gmail.com"
            className="w-full mt-1"
            onChange={(e) =>
              setData({
                ...data,
                email: e.target.value,
              })
            }
          />

          <label className="text-sm font-medium mt-4">Password</label>
          <Input
            type="password"
            placeholder="*******"
            className="w-full mt-1"
            onChange={(e) =>
              setData({
                ...data,
                password: e.target.value,
              })
            }
          />

          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded-lg mt-5 hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Forgot Password Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <p className="text-sm mt-3 text-center text-blue-500 hover:underline cursor-pointer">
              Forgot Password?
            </p>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Forgot Password</AlertDialogTitle>
              <AlertDialogDescription>
                Please contact your administrator to reset your password.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
  {error && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="absolute top-2 w-[350px]"
    >
      <Alert variant="destructive" className="relative">
        <AlertCircleIcon className="mr-2" />
        <AlertTitle>{error}</AlertTitle>

        {/* Close Button */}
        <button
          className="absolute right-2 top-2 hover:cursor-pointer"
          onClick={() => setError("")}
        >
          <X size={16} />
        </button>
      </Alert>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}

export default LoginPage
