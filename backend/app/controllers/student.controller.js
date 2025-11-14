import { studentModel } from "../models/student.model.js";
import bcrypt from "bcryptjs";
import { genToken } from "../utils/genToken.js";
import sendEmail from "../utils/mailer.js";
import crypto from "crypto";


function validateFields(data, res) {
  for (const key in data) {
    if (!data[key]?.trim()) {
      res.status(400).json({ message: `${key} is required` });
      return false;
    }
  }
  return true;
}

//register student
export const registerStudent = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();
    const regex = /^[\w.%+-]+@([a-z]+\.)?iiitp\.ac\.in$/;

    if (!validateFields({ email, password }, res)) return;

    // Check valid college domain
    if (!regex.test(email)) {
      return res.status(400).json({
        message: "Use your college email (example@iiitp.ac.in)",
      });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password length must be at least 8 characters",
      });
    }

    // Check if email already exists
    const emailExists = await studentModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    // Extract MIS, Branch, and Batch info from email
    const studentVariables = email.split("@");
    const MIS = studentVariables[0];
    const domainParts = studentVariables[1].split(".");
    const Branch = domainParts.length > 1 ? domainParts[0] : "unknown";
    const Batch = Number(`${studentVariables[0]}`.slice(2, 4)) + 4; // add 4 years

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user record
    const newUser = new studentModel({
      email,
      password: hashedPassword,
      MIS,
      Branch,
      Batch,
    });

    // Generate secure verification token (10 min expiry)
    const token = crypto.randomBytes(32).toString("hex");
    newUser.emailVerificationToken = token;
    newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

    await newUser.save();

    // Send verification email
    await sendEmail("verify", email, token);

    return res.status(201).json({
      message: "User created successfully. Please verify your email.",
    });
  } catch (error) {
    console.error("Error occurred at student signup controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//student login
export const loginStudent = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password?.trim();

    if (!validateFields({ email, password }, res)) return;

    const user = await studentModel.findOne({ email });
    const userfordata=await studentModel.findOne({ email }).select("-password")
    if (!user) {
      return res.status(400).json({
        message: "No user found associated with email",
      });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const jwtToken = genToken(user._id);

    // Set cookie (7 days)
    res.cookie("token", jwtToken, {
      secure: process.env.NODE_ENV == "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Login success",
      user:userfordata
    });
  } catch (error) {
    console.error("Error occurred at student login controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//resend verify email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validateFields({ email }, res)) return;

    const user = await studentModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Prevent spamming resend (limit once every 2 min)
    const lastSentAgo =
      Date.now() - (user.emailVerificationExpires - 10 * 60 * 1000);
    if (lastSentAgo < 2 * 60 * 1000) {
      return res
        .status(429)
        .json({ message: "Please wait 2 minutes before requesting again" });
    }

    // Generate a new token & expiry
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = token;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send new verification email
    await sendEmail("verify", user.email, token);

    return res.status(200).json({
      message: "Verification email resent successfully. Check your inbox!",
    });
  } catch (error) {
    console.error("Error in resend verification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user by token and ensure token is not expired
    const user = await studentModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error in verify email controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
//edit user trend

export async function editUser(req, res) {
  try {
    const { Name, mobileNumber, Hostel, roomNo } = req.body;

    // Ensure the user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Build dynamic update object
    const updates = {};
    if (Name) updates.Name = Name;
    if (Hostel) updates.Hostel = Hostel;
    if (roomNo) updates.roomNo = roomNo;

    if (mobileNumber) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(mobileNumber)) {
        return res.status(400).json({ message: "Invalid mobile number format" });
      }
      updates.mobileNumber = mobileNumber;
    }

    // If no fields were provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // Update user document
    const updatedUser = await studentModel.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    ).select("-password"); // exclude sensitive fields

    if (!updatedUser) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in edit user controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// onboarding the user
export async function userOnBoard(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, mobileNumber,hostel,roomNo } = req.body;
    if (!validateFields({ name, mobileNumber,hostel,roomNo }, res)) return;

    const existingUser = await studentModel.findById(user._id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const mobileStr = mobileNumber.toString();
    if (!/^\d{10}$/.test(mobileStr)) {
      return res.status(400).json({ message: "Invalid mobile number" });
    }

    existingUser.mobileNumber = mobileStr;
    existingUser.Hostel = hostel;
    existingUser.roomNo=roomNo;
    existingUser.Name = name.trim();
    existingUser.isOnBoarded = true;

    // save changes
    await existingUser.save();

    return res.status(200).json({
      message: "Student onboarding successful",
      user: {
        name: existingUser.Name,
        mobileNumber: existingUser.mobileNumber,
        isOnBoarded: existingUser.isOnBoarded,
      },
    });
  } catch (error) {
    console.error("Error in student onboarding controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), 
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error in student logout controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth=async(req,res)=>{
  try {
    const user=req.user
    return res.status(200).json(user)
  } catch (error) {
    console.error("Error in student checkauth controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}