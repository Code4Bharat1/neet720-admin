"use client";
import React, { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateTest() {
  const { seriesId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    testName: "",
    subject: "",
    testType: "custom",
    durationMinutes: "",
    openDate: "",
    closeDate: "",
    visibility: "assigned_only",
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ========================================
  // ANIMATION VARIANTS
  // ========================================
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE}/test-series/create-test-series/test`,
        {
          ...formData,
          seriesId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`,
          },
        }
      );

      if (res.status === 201) {
        // Success animation/feedback
        alert("✅ Test created successfully!");
        router.push(`/test-series/${seriesId}`);
      }
    } catch (err) {
      console.error("Error creating test:", err);
      setError(err.response?.data?.error || "Failed to create test.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER COMPONENTS
  // ========================================
  const renderHeader = () => (
    <motion.div 
      className="text-center mb-12"
      variants={itemVariants}
    >
      <motion.div
        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6"
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </motion.div>
      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
        Create New Test
      </h1>
      <p className="text-gray-600 text-lg max-w-md mx-auto">
        Configure your test settings and preferences to create an engaging assessment experience
      </p>
    </motion.div>
  );

  const renderErrorMessage = () => {
    if (!error) return null;
    
    return (
      <motion.div
        className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </motion.div>
    );
  };

  const renderBasicInfoSection = () => (
    <motion.div 
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test Name *
          </label>
          <input
            type="text"
            name="testName"
            placeholder="Enter test name"
            value={formData.testName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            placeholder="Enter subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Test Type
          </label>
          <select
            name="testType"
            value={formData.testType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          >
            <option value="custom">Custom Test</option>
            <option value="mock">Mock Test</option>
            <option value="practice">Practice Test</option>
          </select>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <input
            type="number"
            name="durationMinutes"
            placeholder="60"
            value={formData.durationMinutes}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
        </motion.div>
      </div>
    </motion.div>
  );

  const renderScheduleSection = () => (
    <motion.div 
      className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
      variants={cardVariants}
      whileHover="hover"
    >
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-4">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">Schedule & Availability</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Open Date
          </label>
          <input
            type="date"
            name="openDate"
            value={formData.openDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Close Date
          </label>
          <input
            type="date"
            name="closeDate"
            value={formData.closeDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Visibility
          </label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          >
            <option value="public">Public Access</option>
            <option value="assigned_only">Assigned Only</option>
          </select>
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center justify-center">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-all duration-200 ${
                formData.isPublished ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200 transform ${
                  formData.isPublished ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              Publish Test Immediately
            </span>
          </label>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderActionButtons = () => (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 justify-end"
      variants={itemVariants}
    >
      <motion.button
        type="button"
        onClick={() => router.back()}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Cancel
      </motion.button>

      <motion.button
        type="submit"
        disabled={loading}
        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
        }`}
        whileHover={loading ? {} : { scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
        whileTap={loading ? {} : { scale: 0.98 }}
      >
        {loading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Test...
          </div>
        ) : (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Test
          </div>
        )}
      </motion.button>
    </motion.div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {renderHeader()}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {renderErrorMessage()}
            {renderBasicInfoSection()}
            {renderScheduleSection()}
            {renderActionButtons()}
          </form>
        </motion.div>
      </div>

      {/* Background decorative elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
}