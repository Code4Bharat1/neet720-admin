"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  Shield,
  Eye,
  EyeOff,
  Building,
  Key,
  ArrowLeft,
  UserMinus,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";

export default function AddStaffPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    PassKey: "",
    name: "",
    Course: "",
    Email: "",
    mobileNumber: "",
    whatsappNumber: "",
    StartDate: "",
    ExpiryDate: "",
    address: "",
    HodName: "",
    role: "admin",
  });

  const generatePassword = () => {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*";
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "@#$%^&*";

    let password = "";

    // Ensure at least one character from each category
    password +=
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password +=
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the remaining characters randomly
    for (let i = 4; i < 12; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password to avoid predictable patterns
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setFormData((prev) => ({ ...prev, PassKey: password }));
    toast.success("Password generated successfully! 🔐", { duration: 3000 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // guard to keep only digits for phone fields (UI-level)
    if (name === "mobileNumber" || name === "whatsappNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10); // keep max 10
      setFormData((s) => ({ ...s, [name]: digits }));
    } else {
      setFormData((s) => ({ ...s, [name]: value }));
    }
  };

  const sendEmailToAdmin = async (
    email,
    adminId,
    password,
    startDate,
    expiryDate
  ) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email`,
        {
          to: email,
          subject: "🎉 Welcome Aboard as Admin at Exam Portal!",
          text: `Hey there 👋,\n\n🎊 Congratulations on becoming an Admin at Exam Portal! 🎯\n\nHere are your login credentials:\n\n🆔 Admin ID: ${adminId}\n🔐 Password: ${password}\n📅 Start Date: ${startDate}\n📆 Expiry Date: ${expiryDate}\n\nPlease keep this information safe and secure. 🔒\n\nYou're now ready to manage the portal like a pro! 💪\n\nBest wishes,\nThe Exam Portal Team 🚀`,
        }
      );
      if (res.status === 200) console.log("Admin email sent successfully ✅");
    } catch (err) {
      console.error("Error sending admin email:", err);
      toast.error("Admin was created, but email sending failed.");
    }
  };

  function getAuthToken() {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("adminAuthToken") ||
      sessionStorage.getItem("adminAuthToken") ||
      getCookie("adminAuthToken")
    );
  }

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  function decodeJwtNoVerify(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadB64 = parts[1];
    // base64url -> base64 + padding
    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4 || 4)) % 4);

    try {
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null; // invalid/garbled token
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = getAuthToken();
    if (!token) return { token: null, creatorId: null, claims: null };
    const claims = decodeJwtNoVerify(token);
    console.log("response : ", claims.adminId);

    try {
      const payload = {
        addedByAdminId: claims.adminId,
        PassKey: formData.PassKey,
        name: formData.name,
        Course: formData.Course,
        Email: formData.Email,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber,
        StartDate: formData.StartDate,
        ExpiryDate: formData.ExpiryDate,
        address: formData.address,
        HodName: formData.HodName,
        role: formData.role || "admin",
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/superadmin/createadmin`,
        payload
      );

      console.log("this is the res : ",res.data)

      await sendEmailToAdmin(
        formData.Email,
        res.data.admin.AdminId,
        formData.PassKey,
        formData.StartDate,
        formData.ExpiryDate
      );

      setFormData({
        PassKey: "",
        name: "",
        Course: "",
        Email: "",
        mobileNumber: "",
        whatsappNumber: "",
        StartDate: "",
        ExpiryDate: "",
        address: "",
        HodName: "",
        role: "admin",
      });

      toast.success("Admin added successfully! Email sent 📧", {
        duration: 5000,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pt-2 sm:pt-4 md:pt-6 lg:pt-10">
        {/* Header */}
        <div className="sticky top-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left side - Logo and title */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <div className="flex-shrink-0 p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                    Add Staff Member
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Create a new staff member account
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/remove-staff"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <UserMinus className="w-4 h-4" />
                  Remove Staff
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-3">
                <div className="space-y-2">
                  <Link
                    href="/remove-staff"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserMinus className="w-4 h-4" />
                    Remove Staff
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200/50 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column - Basic Information */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="pb-3 sm:pb-4 border-b border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      Basic Information
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                      Essential details for the admin account
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <Key className="w-4 h-4 inline mr-2 text-blue-600" />
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="PassKey"
                          value={formData.PassKey}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 pr-20 sm:pr-24 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                          placeholder="Enter secure password"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                            title={
                              showPassword ? "Hide Password" : "Show Password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-xs text-gray-500">
                          Must be at least 8 characters with uppercase, lowercase, numbers & symbols
                        </p>
                        <button
                          type="button"
                          onClick={generatePassword}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-all duration-200 self-start sm:self-auto"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Auto Generate
                        </button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <User className="w-4 h-4 inline mr-2 text-blue-600" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        placeholder="Enter full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <Mail className="w-4 h-4 inline mr-2 text-blue-600" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        placeholder="Enter email address"
                      />
                    </div>

                    {/* Course and Role - Stack on mobile, side-by-side on larger screens */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          <Building className="w-4 h-4 inline mr-2 text-blue-600" />
                          Course/Department
                        </label>
                        <input
                          type="text"
                          name="Course"
                          value={formData.Course}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                          placeholder="Enter course or department"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          <Shield className="w-4 h-4 inline mr-2 text-blue-600" />
                          Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        >
                          <option value="admin">Admin</option>
                          <option value="batchmanager">Batch Manager</option>
                          <option value="teacher">Teacher</option>
                          <option value="supporter">Supporter</option>
                          <option value="content_manager">Content Creator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Contact & Additional Info */}
                <div className="space-y-6 sm:space-y-8">
                  <div className="pb-3 sm:pb-4 border-b border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg mr-2 sm:mr-3">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      </div>
                      Contact & Additional Information
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-2">
                      Contact details and additional information
                    </p>
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Phone Numbers - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          <Phone className="w-4 h-4 inline mr-2 text-green-600" />
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          name="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={handleChange}
                          required
                          pattern="\d{10}"
                          maxLength={10}
                          inputMode="numeric"
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                          placeholder="9876543210"
                        />
                        <p className="text-xs text-gray-500 mt-1">10 digits only</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleChange}
                          pattern="\d{10}"
                          maxLength={10}
                          inputMode="numeric"
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                          placeholder="9876543210"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional, 10 digits</p>
                      </div>
                    </div>

                    {/* Date Fields - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="StartDate"
                          value={formData.StartDate}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          <Calendar className="w-4 h-4 inline mr-2 text-green-600" />
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          name="ExpiryDate"
                          value={formData.ExpiryDate}
                          onChange={handleChange}
                          required
                          className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <MapPin className="w-4 h-4 inline mr-2 text-green-600" />
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        placeholder="Enter complete address"
                      />
                    </div>

                    {/* HOD Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        <User className="w-4 h-4 inline mr-2 text-green-600" />
                        HOD Name
                      </label>
                      <input
                        type="text"
                        name="HodName"
                        value={formData.HodName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                        placeholder="Enter HOD name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                      <span>Creating Staff...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Create Staff Member Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}