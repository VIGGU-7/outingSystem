import { create } from 'zustand'
interface userData{
    _id:String,
    guardId:String,
    name:String,
    email:String
}
interface AuthStore {
  isLoading: boolean
  setIsLoading: (val: boolean) => void
  userData:userData | null,
  setUserData:(data:userData)=>void
}


export const useAuthStore = create<AuthStore>((set) => ({
  isLoading: false,

  setIsLoading: (value: boolean) => {
    set({ isLoading: value })
  },

  userData:null,
  setUserData:(data:userData)=>{
    set({userData:data})
  }
}))
