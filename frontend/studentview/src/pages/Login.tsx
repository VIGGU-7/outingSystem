import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {  z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { apiInstance } from '../utils';
import toast from 'react-hot-toast';
import useauthStore from '../utils/store'
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Enter your MIS ID or college email')
    .regex(/^(?:\d{9}|\d{9,}@\w+\.iiitp\.ac\.in)$/, 'Invalid MIS or email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
    const {setisLoading,setUser}=useauthStore()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit=async(data:any)=>{z
    try {
        setisLoading(true)
        const response=await apiInstance.post("/login",data)
        setUser(response.data.user)
        navigate("/",{replace:true})
        
    } catch (error:any) {
        toast.error(error?.response?.data?.message)
        setisLoading(false)
    }finally{
        setisLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/college_logo.png" alt="College Logo" width="80" height="80" />
        </div>

        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Student Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              College Email
            </label>
            <input
              type="text"
              {...register('email')}
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="112415235@ece.iiitp.ac.in"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">Use your official IIITP email.</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full border rounded-md p-2 pr-10 focus:ring focus:ring-blue-300 focus:outline-none"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
