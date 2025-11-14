import express from 'express'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from "./utils/connectDB.js"
const app=express()
const PORT=process.env.PORT
app.use(express.json({limit:'5mb'}))
app.use(express.urlencoded({
    extended:true,
    limit: "1mb",
}))
app.use(cookieParser())
app.use(cors({
origin: ['http://localhost:5173',
    'http://localhost:5175',
    'http://localhost:8000',
    'http://localhost:8001'
],
credentials:true
}))

//routes
import studentRoutes from './routes/student.routes.js'
import outingRoutes from './routes/outing.routes.js'
app.use("/api/v1/student/outing",outingRoutes)
app.use("/api/v1/student",studentRoutes)


//guard routes
import guardRoutes from './routes/guard.routes.js'
app.use("/api/v1/guard",guardRoutes)








connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`App is listening on the port ${PORT}`)
    })
})