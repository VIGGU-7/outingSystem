import jwt from 'jsonwebtoken';
import { studentModel } from '../models/student.model.js';

export async function studentMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "User not logged in" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await studentModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in studentMiddleware:", error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired, please log in again" });
    } 
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}
