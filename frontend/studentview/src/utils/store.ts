import {create} from 'zustand'
export interface authUser {
  _id: string;
  email: string;
  MIS: string;
  Branch: string;
  Batch: number;
  isOnBoarded: boolean;
  emailVerified: boolean;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  __v: number;
  Name: string;
  mobileNumber: string;
  Hostel: string;
  roomNo: string;
}

interface authStoreInterface{
    authUser:authUser | null,
    setUser:(user:any)=> void;
    isLoading:boolean
    setisLoading:(val:boolean)=>void;
    isLoggedIn:boolean,
    setIsLoggedIn:(val:boolean)=>void;
}
export const authStore=create<authStoreInterface>((set)=>(
    {   isLoggedIn:false,
        setIsLoggedIn:(val)=>{
            set({isLoggedIn:val})
        },
        authUser:null,
        setUser:(user)=>{
            set({authUser:user})
        },
        isLoading:true,
        setisLoading:(val)=>{
            set({isLoading:val})
        }
    }
))

export default authStore;