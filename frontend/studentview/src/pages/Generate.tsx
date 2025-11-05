import { useState } from "react";
import { useForm } from "react-hook-form";
import { QRCodeCanvas } from "qrcode.react";
import useauthStore from "../utils/store";

export default function Generate() {
  const { authUser } = useauthStore(); // Get student data dynamically
  const [qrData, setQrData] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const outingType = watch("outingType");
  const user={
    Name:authUser?.Name,
    MIS:authUser?.MIS,
    Branch:authUser?.Branch,
    Hostel:authUser?.Hostel,
    roomNo:authUser?.roomNo,
    Batch:authUser?.Batch

  }
  const onSubmit = (data) => {
    const combinedData = {
      ...user, 
      ...data,
      generatedAt: new Date().toLocaleString(),
    };
    setQrData(JSON.stringify(combinedData, null, 2));
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Generate Outing Pass
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Outing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Outing
            </label>
            <select
              {...register("outingType", { required: true })}
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select outing type
              </option>
              <option value="general">General Outing</option>
              <option value="special">Special Outing / Overnight</option>
            </select>
            {errors.outingType && (
              <p className="text-red-600 text-sm mt-1">Select outing type</p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              {...register("purpose", { required: true })}
              placeholder="Enter purpose of outing"
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
            {errors.purpose && (
              <p className="text-red-600 text-sm mt-1">Purpose is required</p>
            )}
          </div>

          {/* Place */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Place
            </label>
            <input
              type="text"
              {...register("place", { required: true })}
              placeholder="Enter place you are going"
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
            {errors.place && (
              <p className="text-red-600 text-sm mt-1">Place is required</p>
            )}
          </div>

          {/* Parent Contact (for special outing only) */}
          {outingType === "special" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Contact
              </label>
              <input
                type="text"
                {...register("parentContact", {
                  required: "Parent contact required for special outing",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit number",
                  },
                })}
                placeholder="Enter parent contact number"
                className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
              />
              {errors.parentContact && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.parentContact.message}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Generate QR
          </button>
        </form>

        {qrData && (
          <div className="mt-8 text-center">
            <p className="text-gray-700 font-medium mb-2">
              Outing QR Generated:
            </p>
            <div className="flex justify-center">
              <QRCodeCanvas value={qrData} size={180} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
