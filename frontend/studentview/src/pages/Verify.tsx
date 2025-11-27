import { useEffect, useState, useRef } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiInstance } from "../utils";
import toast from "react-hot-toast";

export default function Verify() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // prevent duplicate calls in StrictMode / double renders
  const executedRef = useRef(false);

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setLoading(false);
        setError(true);
        toast.error("No verification token provided");
        return;
      }

      // avoid duplicate calls (React 18 StrictMode may mount twice in dev)
      if (executedRef.current) return;
      executedRef.current = true;

      try {
        const encoded = encodeURIComponent(token.trim());
        await apiInstance.get(`/verify/${encoded}`);
        toast.success("Email verified successfully!");
        setError(false);
        // short delay then redirect to login
        setTimeout(() => navigate("/login"), 1100);
      } catch (err: unknown) {
        const msg =
          (err as any)?.response?.data?.message || "Verification failed";
        toast.error(msg);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token, navigate]);

  async function handleResend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleaned = email.trim().toLowerCase();
    if (
      !(
        cleaned.endsWith("@cse.iiitp.ac.in") ||
        cleaned.endsWith("@ece.iiitp.ac.in") ||
        cleaned.endsWith("@iiitp.ac.in")
      )
    ) {
      return toast.error("Please enter a valid IIITP email address");
    }

    try {
      setResending(true);
      await apiInstance.post("/resend-verify", { email: cleaned });
      toast.success("Verification email sent again!");
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data?.message || "Failed to resend email";
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-medium text-gray-700">
          Verifying your email...
        </h1>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-semibold text-red-600">
          Verification Failed
        </h1>
        <p className="text-gray-600 mt-2">
          The verification link may be invalid or expired.
        </p>

        <form
          onSubmit={handleResend}
          className="mt-6 bg-white p-6 rounded-lg shadow-md w-full max-w-sm"
        >
          <label className="block text-sm font-medium mb-1 text-left">
            Enter your IIITP Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 mb-3 focus:ring focus:ring-blue-300 focus:outline-none"
            placeholder="example@cse.iiitp.ac.in"
            required
          />
          <button
            type="submit"
            disabled={resending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
        </form>
      </div>
    );
  }

  // ✅ Success State
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-semibold text-green-700">
        Email Verified Successfully!
      </h1>
      <p className="mt-2 text-gray-600">
        You will be redirected to login shortly.
      </p>
    </div>
  );
}
