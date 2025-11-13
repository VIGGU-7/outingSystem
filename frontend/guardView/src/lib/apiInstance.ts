import axios from 'axios'
export const apiInstance=axios.create({
    baseURL:"http://localhost:8080/api/v1/guard",
    withCredentials:true
})