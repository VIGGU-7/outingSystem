import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import { connectDB } from "./utils/connectDB.js"
const app=express()
const PORT=process.env.PORT
app.use(express.json({limit:'5mb'}))
app.use(express.urlencoded({
    extended:true,
    limit: "1mb",
}))
app.use(cookieParser())


//routes
import studentRoutes from './routes/student.routes.js'
app.use("/api/v1/student",studentRoutes)











connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`App is listening on the port ${PORT}`)
    })
})