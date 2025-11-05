import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { apiInstance } from "../utils";
import useauthStore from "../utils/store";
import { useNavigate } from "react-router-dom";

const studentSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  hostel: z.enum(["bh1", "bh2", "gh"] as const),
  roomNo: z.string().min(1, "Enter your room number"),
});

export default function Onboard() {
  const { setisLoading,authUser } = useauthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      setisLoading(true);
      const response = await apiInstance.post("/onboard", data);
      toast.success(response.data.message || "Details saved successfully");
      reset();
      if (authUser) authUser.isOnBoarded = true;
      navigate("/");
    } catch (error: any) {
      toast.error((error as any)?.response?.data?.message || "Something went wrong");
    } finally {
      setisLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Onboarding
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              {...register("mobileNumber")}
              placeholder="10-digit mobile number"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.mobileNumber && (
              <p className="text-red-600 text-sm mt-1">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>

          {/* Hostel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel
            </label>
            <select
              {...register("hostel")}
              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select hostel
              </option>
              <option value="bh1">BH1</option>
              <option value="bh2">BH2</option>
              <option value="gh">GH</option>
            </select>
            {errors.hostel && (
              <p className="text-red-600 text-sm mt-1">
                {errors.hostel.message}
              </p>
            )}
          </div>

          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              {...register("roomNo")}
              placeholder="e.g., 107"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {errors.roomNo && (
              <p className="text-red-600 text-sm mt-1">
                {errors.roomNo.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Please ensure all details are correct before submitting.
        </p>
      </div>
    </div>
  );
}
