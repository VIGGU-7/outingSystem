import mongoose from "mongoose";

const outingSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    MIS: {
      type: String, // Changed to String to match student model
      required: true,
    },
    Hostel: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    roomNo: {
      type: String,
      required: true,
    },
    outTime: {
      type: Date,
      required:true
    },
    inTime: {
      type: Date,
      default: null,
    },
    outingType: {
      type: String,
      enum: ["General", "Special"],
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    parentContact: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      } 
    },
    status: {
      type: String,
      enum: ["Approved", "Pending", "Rejected", "Completed"],
      default: "Pending",
      required: true,
    },
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guard",
      default: null,
    }
  },
  { timestamps: true }
);

export const outingModel = mongoose.model("Outing", outingSchema);
