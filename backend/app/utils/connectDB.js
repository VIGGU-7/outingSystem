import mongoose from "mongoose";
import 'dotenv/config'
export const connectDB=async()=>{
    try {
        const dbResponse=await mongoose.connect(process.env.MONGO_URI)
        const connection=dbResponse.connection
        connection.on("connected",()=>{
            console.log("Database has been connected")
        })
        connection.on("disconnected",()=>{
            console.log("Database has been disconnected")
            process.exit(1)
        })
    } catch (error) {
        console.log("An error occured while connecting to database")
    }
}