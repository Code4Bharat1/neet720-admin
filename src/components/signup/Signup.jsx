"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

const AdminSignUp = () => {
  const [formData, setFormData] = useState({
    AdminId: "",
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
    logo: "",
  });

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/signup`,
        formData
      );
      toast.success("Registration successful! Please check your email.",{
        duration: 5000
      });
      router.push("/admin/login"); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap bg-gradient-to-b from-[#0077B6] to-[#ADE8F4] min-h-screen">
      {/* Left Section */}
      <div className="hidden md:flex md:w-[40%] bg-gradient-to-b from-[#0077B6] to-[#ADE8F4] items-center justify-center">
        <Image
          src="/nexcore-logo-pc.png"
          alt="Nexcore Logo"
          width={300}
          height={200}
          className="object-contain"
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-col items-center justify-center w-full md:w-[60%] bg-white p-6 md:rounded-l-3xl">
        {/* Heading Section */}
        <h2 className="text-center text-2xl md:text-3xl font-bold text-[#45A4CE] mb-6">
          Create Admin Account
        </h2>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
          {/* Admin ID Input */}
          <div>
            <label
              htmlFor="AdminId"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
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
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Admin ID"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="PassKey"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Password
            </label>
            <input
              type="password"
              name="PassKey"
              id="PassKey"
              value={formData.PassKey}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
            />
          </div>

          {/* Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Full Name"
            />
          </div>

          {/* Email Input */}
          <div>
            <label
              htmlFor="Email"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              name="Email"
              id="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email Address"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Mobile Number
            </label>
            <input
              type="text"
              name="mobileNumber"
              id="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Mobile Number"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label
              htmlFor="whatsappNumber"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              WhatsApp Number
            </label>
            <input
              type="text"
              name="whatsappNumber"
              id="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="WhatsApp Number"
            />
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="StartDate"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Start Date
            </label>
            <input
              type="date"
              name="StartDate"
              id="StartDate"
              value={formData.StartDate}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label
              htmlFor="ExpiryDate"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Expiry Date
            </label>
            <input
              type="date"
              name="ExpiryDate"
              id="ExpiryDate"
              value={formData.ExpiryDate}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Address"
            />
          </div>

          {/* Hod Name */}
          <div>
            <label
              htmlFor="HodName"
              className="block text-sm font-semibold text-[#53ADD3] mb-2"
            >
              HOD Name
            </label>
            <input
              type="text"
              name="HodName"
              id="HodName"
              value={formData.HodName}
              onChange={handleChange}
              required
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="HOD Name"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-[#45A4CE] text-white font-semibold rounded-md hover:bg-[#5babcd] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${loading ? "opacity-75" : ""}`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 font-bold">
            Already have an account?{" "}
            <button
              onClick={() => router.push("/admin/login")}
              className="font-bold text-[#45A4CE] hover:text-[#469fc5] transition-all"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignUp;
