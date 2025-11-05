import { studentModel } from "../models/student.model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/genToken.js";
import sendEmail from "../utils/mailer.js";
import crypto from 'crypto'
function validateFields(data, res) {
  for (const key in data) {
    if (!data[key]?.trim()) {
      res.status(400).json({ message: `${key} is required` });
      return false;
    }
  }
  return true;
}

export const registerStudent = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();
    const regex = /^[\w.%+-]+@([a-z]+\.)?iiitp\.ac\.in$/;

    if (!validateFields({ email, password }, res)) return;

    if (!regex.test(email)) {
      return res.status(400).json({
        message: "Use your college email (example@iiitp.ac.in)",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password length must be at least 8 characters",
      });
    }

    const emailExists = await studentModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    //as mis and branch and batch has fixed variables like cse.iiitp.ac.in and mis 
    const studentVariables=email.split("@")
    const MIS=studentVariables[0]
    const Branch=studentVariables[1].split(".")[0]
    const Batch=Number(`${studentVariables[0]}`.slice(2,4))+4 //adding 4 year becomes the batch
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new studentModel({ email, password: hashedPassword,MIS,Branch,Batch});
    const token = crypto.randomBytes(32).toString("hex");
    newUser.emailVerificationToken = token;
    newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000; //10min
    await newUser.save();
    await sendEmail("verify",email,token)
    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error occurred at student signup controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!validateFields({ email, password }, res)) return;

    const user = await studentModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "No user found associated with email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token=genToken(user._id)
    res.cookie("token",token,{
        secure:true,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        sameSite:"strict"
    })
    return res.status(200).json({
      message: "Login success",
      token,
    });
  } catch (error) {
    console.error("Error occurred at student login controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
