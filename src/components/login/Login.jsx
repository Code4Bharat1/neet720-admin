"use client";
import { useState } from "react";
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/login`,
        {
          AdminId: formData.AdminId,
          PassKey: formData.PassKey,
        }
      );

      localStorage.setItem("adminAuthToken", response.data.token);
      router.push("/admindashboard");
      toast.success("Login Successful!", { duration: 5000 });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-[#0077B6] to-[#ADE8F4]">
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
      <div className="flex flex-col items-center justify-center w-full md:w-[60%] bg-white p-8 md:rounded-l-3xl shadow-lg">
        {/* Mobile Logo */}
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

        <form
          onSubmit={handleSubmit}
          className="space-y-5 w-full max-w-md"
        >
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#45A4CE] hover:bg-[#3e9ec7] text-white font-semibold rounded-md transition-all"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
