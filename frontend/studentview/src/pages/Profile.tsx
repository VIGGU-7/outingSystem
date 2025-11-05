import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { apiInstance } from "../utils";
import useAuthStore from "../utils/store";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ✅ Define TypeScript interfaces for data
interface UserData {
  Name: string;
  mobileNumber: string;
  Hostel: string;
  roomNo: string;
  email: string;
  Branch: string;
  MIS: string;
}

interface ApiResponse {
  user?: UserData;
  [key: string]: any;
}

export default function Profile() {
  // store exposes setUser — use that name
  const { authUser, setUser } = useAuthStore();
  const [userData, setUserData] = useState<UserData>({
    Name: "",
    mobileNumber: "",
    Hostel: "",
    roomNo: "",
    email: "",
    Branch: "",
    MIS: "",
  });
  const [originalData, setOriginalData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  // ✅ Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiInstance.get<ApiResponse>("/check");
        console.log("Profile data:", res.data);
        const data = res.data.user || (res.data as UserData);
        setUserData(data);
        setOriginalData(data); // Save original data for comparison
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // ✅ Check if user actually changed something
  const hasChanges = (): boolean => {
    if (!originalData) return false;
    return (
      userData.Name !== originalData.Name ||
      userData.mobileNumber !== originalData.mobileNumber ||
      userData.Hostel !== originalData.Hostel ||
      userData.roomNo !== originalData.roomNo
    );
  };

  // ✅ Save updated profile
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasChanges()) {
      toast.error("No changes detected!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        Name: userData.Name.trim(),
        mobileNumber: userData.mobileNumber.trim(),
        Hostel: userData.Hostel.trim(),
        roomNo: userData.roomNo.trim(),
      };

      const res = await apiInstance.post<ApiResponse>("/edit", payload);

      // ✅ Handle API status explicitly
      if (res.status >= 200 && res.status < 300) {
        toast.success("Profile updated successfully!");
        setUser(res.data.user || { ...authUser, ...payload });
        setOriginalData({ ...userData }); // Update baseline
      } else {
        throw new Error(res?.data?.message || "Unexpected response from server");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.message || "Update failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md relative border border-gray-200">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 mt-2">
          My Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Editable Fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="Name"
              value={userData.Name}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Mobile
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={userData.mobileNumber}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hostel
            </label>
            <input
              type="text"
              name="Hostel"
              value={userData.Hostel}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Room No
            </label>
            <input
              type="text"
              name="roomNo"
              value={userData.roomNo}
              onChange={handleChange}
              className="w-full border rounded-md p-2 focus:ring focus:ring-blue-300 focus:outline-none"
            />
          </div>

          {/* Non-editable fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={userData.email}
              readOnly
              className="w-full border rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={userData.Branch}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                MIS
              </label>
              <input
                type="text"
                value={userData.MIS}
                readOnly
                className="w-full border rounded-md p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-4 py-2 flex items-center justify-center gap-2 rounded-md font-semibold transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : hasChanges()
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <Save className="w-5 h-5" />
            {loading
              ? "Saving..."
              : hasChanges()
              ? "Save Changes"
              : "No Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
