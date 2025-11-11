import { guardModel } from "../models/guard.model.js";
import jwt, { decode } from 'jsonwebtoken'
export async function guardMiddleware(req,res,next){
    try {
        const {token}=req.cookies
        if(!token){ return res.status(401).json({message : "guard not logged in"})}
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        if(!decoded){
            return res.status(401).json({message : "guard not logged in"})
        }
        const guard=await guardModel.findById(decoded.id).select("-password")
        if(!guard){
             return res.status(401).json({message : "Unauthorized"})
        }
        req.guard=guard;
        next()
        
    } catch (error) {
        console.log("Error in guard middleware")
         if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired, please log in again" });
    } 
        return res.status(500).json({
            message:"Error in guard middleware contact admin asap"
        })
    }
}