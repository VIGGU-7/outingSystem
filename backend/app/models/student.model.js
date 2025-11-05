import { model, Schema } from "mongoose";

const studentSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (value) => /^[\w.%+-]+@([a-z]+\.)?iiitp\.ac\.in$/.test(value),
        message: (props) => `${props.value} is invalid. Use your college email!`
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    MIS: {
      type: String,
      required:true
    },
    Name: {
      type: String,
      trim: true
    },
    Branch: {
      type: String,
      enum: ["cse", "ece"],
      required: true
    },
    Batch: {
      type: Number,
      required: true
    },
    Hostel:{
      type:String,
    },
    roomNo:{
      type:String,
    },
    mobileNumber: {
      type: String,
      validate: {
        validator: (value) => /^\d{10}$/.test(value),
        message: (props) => `${props.value} is invalid mobile number`
      }
    },
    isOnBoarded: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  { timestamps: true }
);

export const studentModel = model("Student", studentSchema);
