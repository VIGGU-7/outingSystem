import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { apiInstance } from "../utils";

type OutingType = "General" | "Special";

interface Outing {
  _id: string;
  outingType: OutingType;
  purpose: string;
  place: string;
  parentContact?: string;
  status?: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

interface FormInputs {
  outingType: OutingType;
  purpose: string;
  place: string;
  parentContact?: string;
}

export default function Generate() {
  const [qrData, setQrData] = useState<string>("");
  const [history, setHistory] = useState<Outing[]>([]);
  const [zoomedQR, setZoomedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingHistory, setFetchingHistory] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInputs>();

  const outingType = watch("outingType");

  // Fetch previous outings
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const res = await apiInstance.get<{ outings: Outing[] }>("/outing");
        if (isMounted) setHistory(res.data?.outings || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to fetch history");
      } finally {
        if (isMounted) setFetchingHistory(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  // Submit outing request
  const onSubmit = async (data: FormInputs) => {
    setLoading(true);

    try {
      const payload: Partial<Outing> =
        data.outingType === "General"
          ? {
              outingType: data.outingType,
              purpose: data.purpose,
              place: data.place,
            }
          : {
              outingType: data.outingType,
              purpose: data.purpose,
              place: data.place,
              parentContact: data.parentContact,
            };

      const res = await apiInstance.post<{ outing: Outing }>(
        "/outing/add",
        payload
      );

      if (res.status === 201) {
        const createdOuting = res.data.outing;

        // 🔥 QR contains ONLY the MongoDB _id
        setQrData(createdOuting._id);

        setHistory((prev) => [createdOuting, ...prev]);
        toast.success("Outing created successfully!");
        reset();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4 relative">

      {/* Profile Button */}
      <button
        onClick={() => (window.location.href = "/profile")}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow hover:bg-gray-50 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="font-medium text-gray-700">Profile</span>
      </button>

      {/* Form */}
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border mt-14">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Generate Outing Pass
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Outing Type */}
          <div>
            <label className="block font-semibold mb-1">Outing Type</label>
            <select
              {...register("outingType", { required: true })}
              className="w-full border rounded-md p-2"
              defaultValue=""
            >
              <option value="" disabled>
                Select outing type
              </option>
              <option value="General">General</option>
              <option value="Special">Special / Overnight</option>
            </select>
            {errors.outingType && (
              <p className="text-red-600 text-sm">Required</p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-semibold mb-1">Purpose</label>
            <input
              type="text"
              {...register("purpose", { required: true })}
              placeholder="Purpose of outing"
              className="w-full border rounded-md p-2"
            />
            {errors.purpose && (
              <p className="text-red-600 text-sm">Purpose required</p>
            )}
          </div>

          {/* Place */}
          <div>
            <label className="block font-semibold mb-1">Place</label>
            <input
              type="text"
              {...register("place", { required: true })}
              placeholder="Destination"
              className="w-full border rounded-md p-2"
            />
            {errors.place && (
              <p className="text-red-600 text-sm">Place required</p>
            )}
          </div>

          {/* Parent Contact - Special only */}
          {outingType === "Special" && (
            <div>
              <label className="block font-semibold mb-1">
                Parent Contact
              </label>
              <input
                type="text"
                {...register("parentContact", {
                  required: "Required for special outing",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Invalid phone number",
                  },
                })}
                placeholder="Parent phone number"
                className="w-full border rounded-md p-2"
              />
              {errors.parentContact && (
                <p className="text-red-600 text-sm">
                  {errors.parentContact.message}
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md font-semibold text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Generating..." : "Generate QR"}
          </button>
        </form>

        {/* Latest QR */}
        {qrData && (
          <div className="mt-8 text-center">
            <p className="text-gray-700 font-medium mb-2">
              Latest Outing QR:
            </p>
            <div
              className="flex justify-center cursor-pointer"
              onClick={() => setZoomedQR(qrData)}
            >
              <QRCodeCanvas value={qrData} size={200} />
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      {!fetchingHistory && history.length > 0 && (
        <div className="mt-8 bg-white shadow-lg rounded-2xl p-5 w-full max-w-md border">
          <h2 className="text-lg font-bold mb-3 text-center">
            Previous Passes
          </h2>

          <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                onClick={() => setZoomedQR(item._id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">
                    {item.purpose} - {item.place}
                  </p>

                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      item.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status || "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString()} (
                    {item.outingType})
                  </p>
                  <QRCodeCanvas value={item._id} size={50} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedQR && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center"
          onClick={() => setZoomedQR(null)}
        >
          <div className="bg-white p-6 rounded-2xl shadow-lg relative">
            <QRCodeCanvas value={zoomedQR} size={350} />
            <button
              onClick={() => setZoomedQR(null)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
