"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiUser, FiLock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ AdminId: "", PassKey: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // ✅ Redirect to dashboard if token already exists
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
      router.replace("/admindashboard");
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on input change
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

      toast.success(" Login Successful!");
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0077B6] via-[#0096C7] to-[#00B4D8]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#ADE8F4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#48CAE4] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#90E0EF] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCAwdjJoMnYtMmgtMnptLTQgMHYyaDJ2LTJoLTJ6bTI4IDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

      <div className="relative flex flex-col lg:flex-row min-h-screen items-center justify-center p-4 lg:p-8">
        {/* Left Section - Logo & Branding */}
        <div className={`hidden lg:flex flex-col items-center justify-center w-full lg:w-1/2 space-y-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          <div className="relative">
            {/* Glowing effect behind logo */}
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150"></div>
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
              <Image
                src="/neet720_logo.jpg"
                alt="Neet720 Logo"
                width={320}
                height={220}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          
          <div className="text-center space-y-3 max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Admin Portal
            </h1>
            <p className="text-lg text-white/90 font-medium">
              Secure Access to NEET720 Management System
            </p>
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">System Online</span>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className={`w-full lg:w-1/2 flex items-center justify-center transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <Image
                    src="/neet720_logo.jpg"
                    alt="Neet720 Logo"
                    width={140}
                    height={100}
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Admin Portal</h1>
            </div>

            {/* Login Card */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              {/* Decorative gradient bar */}
              <div className="h-2 bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#ADE8F4]"></div>
              
              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0077B6] to-[#00B4D8] rounded-2xl shadow-lg mb-4">
                    <FiLock className="text-white text-2xl" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">
                    Sign in to access your admin dashboard
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Admin ID Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="AdminId"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Admin ID
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400 group-focus-within:text-[#0077B6] transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="AdminId"
                        id="AdminId"
                        value={formData.AdminId}
                        onChange={handleChange}
                        required
                        placeholder="Enter your admin ID"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="PassKey"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiLock className="text-gray-400 group-focus-within:text-[#0077B6] transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="PassKey"
                        id="PassKey"
                        value={formData.PassKey}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B6] focus:border-transparent focus:bg-white outline-none transition-all duration-200 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#0077B6] transition-colors focus:outline-none"
                      >
                        {showPassword ? (
                          <AiOutlineEye className="text-xl" />
                        ) : (
                          <AiOutlineEyeInvisible className="text-xl" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group bg-gradient-to-r from-[#0077B6] to-[#00B4D8] hover:from-[#005A8D] hover:to-[#0096C7] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                  >
                    {/* Button shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <span className="relative flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <FiArrowRight className="text-xl group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Secure Connection</span>
                    </div>
                    <span>•</span>
                    <span>Powered by Nexcore</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                Protected by enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;