"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ AdminId: "", PassKey: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // ✅ Redirect to dashboard if token already exists
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
      router.replace("/admindashboard");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.AdminId.trim() || !formData.PassKey.trim()) {
      toast.error("Please fill in all fields", { id: "admin-login-error" });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/login`,
        {
          AdminId: formData.AdminId,
          PassKey: formData.PassKey,
        }
      );

      const token = response?.data?.token;

      if (!token || typeof token !== "string" || token.trim() === "") {
        toast.error("Invalid Admin ID or Password");
        setLoading(false);
        return;
      }

      localStorage.clear();
      localStorage.setItem("adminAuthToken", token);

      toast.success("✅ Login Successful!");
      router.replace("/admindashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Invalid Admin ID or Password"
          : "Failed to login. Please try again.");

      toast.error(errorMessage, { id: "admin-login-error" });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#0077B6] to-[#ADE8F4] items-center justify-center relative">
      {/* Mobile Logo at Top */}
      <div className="md:hidden flex justify-center w-full relative top-5 z-20">
        <Image
          src="/neet720_logo.jpg"
          alt="Neet720 Logo"
          width={120}
          height={80}
          className="object-contain drop-shadow-lg"
          style={{ marginBottom: "-40px" }}
        />
      </div>

      {/* Left Logo Section */}
      <div className="hidden md:flex w-full md:w-[40%] items-center justify-center p-6">
        <Image
          src="/neet720_logo.jpg"
          alt="Neet720 Logo"
          width={300}
          height={200}
          className="object-contain"
        />
      </div>

      {/* Right Login Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-[60%] bg-white p-8 md:rounded-l-3xl shadow-lg relative z-10">
        <div className="md:hidden flex justify-center mb-6">
          <Image
            src="/nexcore-logo-pc.png"
            alt="Nexcore Logo"
            width={160}
            height={40}
            className="object-contain"
          />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-[#45A4CE] mb-2 text-center">
          Welcome Back Admin
        </h2>
        <p className="text-lg md:text-xl text-[#45A4CE] mb-6 text-center">
          Login to your Admin Panel
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md">
          {/* Admin ID */}
          <div>
            <label
              htmlFor="AdminId"
              className="block text-sm font-medium text-[#53ADD3] mb-1"
            >
              Admin ID
            </label>
            <input
              type="text"
              name="AdminId"
              id="AdminId"
              value={formData.AdminId}
              onChange={handleChange}
              required
              placeholder="admin123"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label
              htmlFor="PassKey"
              className="block text-sm font-medium text-[#53ADD3] mb-1"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="PassKey"
              id="PassKey"
              value={formData.PassKey}
              onChange={handleChange}
              required
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-9 text-xl text-gray-500 cursor-pointer"
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#45A4CE] hover:bg-[#3e9ec7] text-white font-semibold rounded-md transition-all"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
