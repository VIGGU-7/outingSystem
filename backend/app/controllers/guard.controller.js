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
            approvedBy:guard.guardId
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
            outTime:null,
            rejectedBy:guard.guardId
            

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
            inTime:new Date(),
            markedCompletedBy:guard.guardId
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

export const getOutingById=async(req,res)=>{
    try {
      const {id}=req.params;
      if(!id?.trim()){
          return res.status(400).json({
              message:"Outing id is required"
          })
      }
      const outingData=await outingModel.findById(id);
      if(!outingData){
          return res.status(400).json({
              message:"No outing request found"
          })
      } 
      return res.status(200).json({
          data:outingData,
          message:"Outing data fetched successfully"
      })
    }
      catch (error) {
        console.log("An error occured at get outing by id controller")
        return res.status(500).json(  {
                message:"Internal server error"
            }
        )
    }
  };

export const getOutingDetailsSortByDate = async (req, res) => {
  try {
    let { startDate, endDate, status, search } = req.query;
    const query = {};

    // ------ STATUS FILTER ------
    if (status && status !== "all") {
      query.status = status;
    }

    // ------ SEARCH FILTER ------
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { studentName: regex },
        { MIS: regex },
        { purpose: regex },
        { mobileNumber: regex },
        { place: regex },
        { outingType: regex }
      ];
    }

    // ------ DATE RANGE FILTER ------
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date("2000-01-01");
      const end = endDate ? new Date(endDate) : new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      query.outTime = { $gte: start, $lte: end };
    }

    // ------ FETCH WITH SORT ------
    const data = await outingModel.find(query).sort({ outTime: -1 });

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
export const statistics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOuting = await outingModel.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          totalOutings: { $sum: 1 },
          approvedOutings: {
            $sum: {
              $cond: [{ $eq: ["$status", "Approved"] }, 1, 0],
            },
          },
          rejectedOutings: {
            $sum: {
              $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0],
            },
          },
          pendingOutings: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
            },
          },
          completedOutings:{
            $sum:{
                $cond:[{ $eq: ["$status", "Completed"] },1,0],
            }
          }
        },
      },
    ]);
    return res.status(200).json({
      data: todayOuting[0] ?? {
        totalOutings: 0,
        approvedOutings: 0,
         completedOutings: 0,
        rejectedOutings: 0,
        pendingOutings: 0,
      },
      message: "Statistics fetched successfully",
    });
  } catch (error) {
    console.log("An error occurred at guard statistics controller");
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getOutingByMis=async(req,res)=>{
    try {
        const {Mis}=req.params;
        if(!Mis?.trim()){
            return res.status(400).json({
                message:"MIS id is required"
            })
        }

        const outingData=await outingModel.findOne({MIS:Mis}).sort({createdAt:-1});
        if(!outingData){
            return res.status(400).json({ 
                message:"No outing request found"
            })
        }
        return res.status(200).json({
            data:outingData,
            message:"Outing data fetched successfully"
        })
    } catch (error) {
        console.log("An error occured at get outing by id controller")
        return res.status(500).json(  { 
                message:"Internal server error"
            }
        )
    }   
}
