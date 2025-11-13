import { guardModel } from "../models/guard.model.js";
import bcrypt from 'bcryptjs'
import {genToken} from '../utils/genToken.js'
import { outingModel } from "../models/outing.model.js";
//only valid for strings;
function validateFields(data,res){
    for(const i in data){
        if(!data[i]?.trim()){
            res.status(400).json({
                message:`${i} is required`
            })
            return false;
        }
    }
            return true;
}
export const guardRegister = async (req, res) => {
  try {
    const { guardId, name, email, password } = req.body;
    if (!validateFields({ guardId, name, email, password }, res)) return;

    const normalizedEmail = email.toLowerCase().trim();

    const validEmail = /^\S+@\S+\.\S+$/.test(normalizedEmail);
    if (!validEmail) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existingGuard = await guardModel.findOne({
      $or: [{ email: normalizedEmail }, { guardId }]
    });

    if (existingGuard) {
      return res.status(400).json({
        message:
          existingGuard.email === normalizedEmail
            ? "Email already exists"
            : "A user with same guard Id exists in the db"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newGuard = new guardModel({
      guardId,
      name,
      email: normalizedEmail,
      password: hashedPassword
    });

    await newGuard.save();

    return res.status(201).json({
      message: "Guard registered successfully",
      guard: { guardId, name, email: normalizedEmail }
    });
  } catch (error) {
    console.error("An error occurred at guard register controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const guardLogin=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!validateFields({email,password},res)) return;
        const user=await guardModel.findOne({email})
        if(!user){
            return res.status(400).json({
                message:"The guard email isn't registered"
            })
        } 
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                message:"Wrong password"
            })
        }       
        const token=genToken(user._id)
        res.cookie("token",token,{
            secure: process.env.NODE_ENV=="production",
             maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "strict",
        })
        return res.status(200).json({
            message:"Login success ",
            user:{
                guardId:user.guardId,
                name:user.name,
                email:user.email
            }
        })
    } catch (error) {
        console.log(error)
         console.log("An error occured at guard register controller")
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}
export const approveOuting=async(req,res)=>{
    try {
        const guard=req.guard;
        const {data}=req.body;
        console.log(data)
        if(!data){
            res.status(400).json({
                message:"No outing data has been specified"
            })
        }
        const outingData=await outingModel.findById(data._id);
        if(!outingData){
            return res.status(400).json({
                message:"No outing request found ask user to recreate the request"
            })
        }
        console.log(guard)
        const updateData=await outingModel.findByIdAndUpdate(data._id,{
            status:"Approved",
            outTime:new Date(),
            checkedBy:guard.id
        })
        return res.status(200).json({
            data:updateData,
            message:"Outing has been approved"
        })

    } catch (error) {
        console.log(error)
        console.log("An error occured at approve outing controller")
        return res.status(500).json(
            {
                message:"Internal server error"
            }
        )
    }
}
export const rejectOuting=async(req,res)=>{
    try {
        const guard=req.guard;
        const {data}=req.body
        if(!data){
            return res.status(400).json({
                message:"No data has been specified"
            })
        }
        const outingData=await outingModel.findById(data._id);
        if(!outingData){
            return res.status(400).json({
                message:"No outing request found ask user to recreate the request"
            })
        }
        const updateData=await outingModel.findByIdAndUpdate(data._id,{
            status:"Rejected",
            outTime:new Date(),
            checkedBy:guard.id
        })
        return res.status(200).json({
            data:updateData,
            message:"Outing has been rejected"
        })
    } catch (error) {
         console.log("An error occured at reject outing controller")
        return res.status(500).json(
            {
                message:"Internal server error"
            }
        )
    }
}
export const completeOuting=async(req,res)=>{
    try {
        const guard=req.guard;
        const {data}=req.body
        if(!data){
            return res.status(400).json({
                message:"No data has been specified"
            })
        }
        const outingData=await outingModel.findById(data._id);
        if(!outingData){
            return res.status(400).json({
                message:"No outing request found ask user to recreate the request"
            })
        }
        const updateData=await outingModel.findByIdAndUpdate(data._id,{
            status:"Completed",
            outTime:new Date(),
            checkedBy:guard.id
        })
        return res.status(200).json({
            data:updateData,
            message:"Outing has been marked complete"
        })
    } catch (error) {
         console.log("An error occured at complete outing controller")
        return res.status(500).json(
            {
                message:"Internal server error"
            }
        )
    }
}   

export const getOutingDetailsSortByDate = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    startDate = startDate ? new Date(startDate) : null;
    endDate = endDate ? new Date(endDate) : null;

    if (!startDate) {
      const data = await outingModel.find().sort({ outTime: -1 });
      return res.status(200).json({
        data,
        message: "Outing data fetched successfully",
      });
    }

    if (!endDate) {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    startDate.setHours(0, 0, 0, 0);

    const data = await outingModel.find({
      outTime: { $gte: startDate, $lte: endDate },
    }).sort({ outTime: -1 });

    return res.status(200).json({
      data,
      message: "Outing data fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const getOutingDetailsByMis=async(req,res)=>{
    try {
        const {MIS}=req.params;
        if(!MIS){
            return res.status(400).json({
                message:"MIS is required"
            })
        }
        const data=await outingModel.find({MIS}).sort({outTime:-1});
        return res.status(200).json({
            data,
            message:"Outing data fetched successfully"
        })
    } catch (error) {
        console.log("An error occured at get outing details by MIS controller")
        return res.status(500).json(        {
                message:"Internal server error"
            }
        )
    }   
}
export const checkAuthenticated=async(req,res)=>{
    try {
        const guard=req.guard;          
        return res.status(200).json({
            guard
        })  
    } catch (error) {
        console.log("An error occured at check authenticated guard controller")
        return res.status(500).json(    {
                message:"Internal server error"
            }
        )
    }  
}
export const logout=async(req,res)=>{
    try {
        res.cookie("token","",{
            maxAge:0,
            httpOnly:true,
            secure: process.env.NODE_ENV=="production",
            sameSite: "strict",
        })
        return res.status(200).json({
            message:"Logout success"
        })
    }       
    catch (error) {
        console.log("An error occured at guard logout controller")
        return res.status(500).json(    {
                message:"Internal server error"
            }
        )
    }
}
