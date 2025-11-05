import { studentModel } from "../models/student.model.js";
import { outingModel } from "../models/outing.model.js";

export const addOuting = async (req, res) => {
  try {
    const user = req.user;
    const { outingType, purpose, place, parentContact, outTime } = req.body;

    // Basic validation
    if (!outingType || !purpose || !place) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate date (if provided)
    let outingDate = new Date();
    if (outTime) {
      outingDate = new Date(outTime);
      if (isNaN(outingDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format for outTime" });
      }
    }

    // Check if student exists
    const studentExists = await studentModel.findOne({ MIS: user.MIS });
    if (!studentExists) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Validate outing type
    const formattedOutingType =
      outingType.charAt(0).toUpperCase() + outingType.slice(1).toLowerCase();

    if (!["General", "Special"].includes(formattedOutingType)) {
      return res.status(400).json({
        message: "Invalid outing type. Must be 'General' or 'Special'.",
      });
    }

    // Check if there's already a pending outing for that day
    const startOfDay = new Date(outingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(outingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingPending = await outingModel.findOne({
      MIS: user.MIS,
      outTime: { $gte: startOfDay, $lte: endOfDay },
      status: "Pending",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending outing request for today.",
      });
    }

    // Create outing
    const newOuting = new outingModel({
      studentName: user.Name,
      MIS: user.MIS,
      Hostel: user.Hostel,
      mobileNumber: user.mobileNumber,
      roomNo: user.roomNo,
      outingType: formattedOutingType,
      purpose,
      place,
      parentContact: parentContact || null,
      outTime: outingDate,
      status: "Pending",
    });

    await newOuting.save();

    return res.status(201).json({
      message: "Outing request submitted successfully",
      outing: newOuting,
    });
  } catch (error) {
    console.error("Error at addOuting controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getStudentHistory = async (req, res) => {
  try {
    const studentMIS = req.user.MIS; 

    const outings = await outingModel
      .find({ MIS: studentMIS })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Student outing history fetched successfully",
      total: outings.length,
      outings,
    });
  } catch (error) {
    console.error("Error fetching student history:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
