import axios from "axios"
export const apiInstance=axios.create({
baseURL:`${import.meta.env.VITE_BACKEND_URL}/api/v1/student`,
withCredentials:true,
})
