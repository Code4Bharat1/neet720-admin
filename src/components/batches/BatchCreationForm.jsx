"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Plus,
  X,
  Check,
  AlertCircle,
  BookOpen,
  UserPlus,
  Edit3,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Search,
  User,
} from "lucide-react";
import axios from "axios";

const BatchCreationForm = () => {
  const [batchName, setBatchName] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [status, setStatus] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const router = useRouter()

  const cleanName = (...parts) => {
    const raw = parts
    .map((s) => (s ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
    const cleaned = raw
      .replace(/\b(null|undefined|n\/a|na)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "Unknown";
  };

  // Get admin ID from localStorage or token
  const getAdminId = () => {
    if (typeof window !== "undefined") {
      // Try to get from localStorage first
      const adminId = localStorage.getItem("adminId");
      if (adminId) return adminId;

      // If not found, try to decode from token
      const token = localStorage.getItem("adminAuthToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return payload.adminId || payload.id;
        } catch (e) {
          console.error("Error decoding token:", e);
        }
      }
    }
    return null;
  };

  // Create axios instance with base configuration
  const createAxiosInstance = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminAuthToken")
        : null;

    return axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL ,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };

  // Fetch students when component mounts
  useEffect(() => {
    fetchStudents();
  }, []);
  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    setError(""); // Clear previous errors

    try {
      const adminId = getAdminId();
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        setIsLoadingStudents(false);
        return;
      }

      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoadingStudents(false);
        return;
      }

      const api = createAxiosInstance();

      const response = await api.post("/studentdata/info", {
        addedByAdminId: parseInt(adminId),
      });

      const sanitized = (response.data.studentInfo || []).map((s) => ({
        ...s,
        fullName: cleanName(s.fullName, s.firstName, s.lastName),
        email: s.email ?? s.emailAddress ?? "", // guard missing email
      }));

      if (sanitized.length === 0) {
        setError("No students found. Please add students to proceed.");
      } else {
        setAvailableStudents(sanitized);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error fetching student data";
      setError(errorMessage);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const resetForm = () => {
    setBatchName("");
    setSelectedStudents([]);
    setStatus(true);
    setError("");
    setSuccessMessage("");
    setSearchTerm("");
    setShowStudentSelector(false);
  };

  const handleStudentSelect = (student) => {
    const isSelected = selectedStudents.find((s) => s.id === student.id);
    if (isSelected) {
      setSelectedStudents(selectedStudents.filter((s) => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const removeStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter((s) => s.id !== studentId));
  };

  const filteredStudents = availableStudents.filter((s) => {
    const name = cleanName(s.fullName, s.firstName, s.lastName).toLowerCase();
    const email = (s.email ?? "").toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validation
    if (!batchName) {
      setError("Batch Name is required");
      setIsLoading(false);
      return;
    }

    if (selectedStudents.length === 0) {
      setError("Please select at least one student for the batch");
      setIsLoading(false);
      return;
    }

    try {
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("adminAuthToken");
      }

      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const studentIds = selectedStudents.map((student) => student.id);
      const api = createAxiosInstance();

      const response = await api.post("/studentdata/batch", {
        batchName: batchName.trim(),
        no_of_students: selectedStudents.length,
        studentIds: studentIds,
        status: status,
      });

      setSuccessMessage(response.data.message || "Batch created successfully!");
      setTimeout(() => resetForm(), 3000);
    } catch (error) {
      console.error("Error creating batch:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error creating batch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex items-center space-x-2 mb-6 cursor-pointer"
          onClick={() => router.push("/batches")} // Navigate back to the previous page
        >
          <X className="w-6 h-6 text-gray-600" />
          <span className="text-lg font-medium text-gray-600">Back</span>
        </motion.div>
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Create New Batch
          </h1>
          <p className="text-gray-600 text-lg">
            Set up a new student batch with all required details
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          variants={itemVariants}
        >
          {/* Form Content */}
          <div className="p-8">
            <motion.form
              onSubmit={handleCreateBatch}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Batch Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter batch name"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Must be unique for your admin account
                </p>
              </div>

              {/* Student Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Select Students <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {selectedStudents.length} selected
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowStudentSelector(!showStudentSelector)
                      }
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Students</span>
                    </button>
                  </div>
                </div>

                {/* Selected Students Display */}
                {selectedStudents.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Students:
                    </h4>
                    {selectedStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {cleanName(
                                student.fullName,
                                student.firstName,
                                student.lastName
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStudent(student.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Student Selector Modal */}
                <AnimatePresence>
                  {showStudentSelector && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-700">
                            Available Students
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowStudentSelector(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>

                        {/* Students List */}
                        {isLoadingStudents ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-sm text-gray-600">
                              Loading students...
                            </span>
                          </div>
                        ) : (
                          <div className="max-h-60 overflow-y-auto space-y-2">
                            {filteredStudents.length > 0 ? (
                              filteredStudents.map((student) => {
                                const isSelected = selectedStudents.find(
                                  (s) => s.id === student.id
                                );
                                return (
                                  <div
                                    key={student.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                      isSelected
                                        ? "bg-blue-100 border-blue-200 border"
                                        : "bg-white hover:bg-gray-50 border border-gray-200"
                                    }`}
                                    onClick={() => handleStudentSelect(student)}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        isSelected
                                          ? "bg-blue-600 border-blue-600"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                      <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">
                                        {cleanName(
                                          student.fullName,
                                          student.firstName,
                                          student.lastName
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {student.email}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {student.status} • ID: {student.id}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-center text-gray-500 py-4">
                                {searchTerm
                                  ? "No students found matching your search"
                                  : "No students available"}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Toggle */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Batch Status
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setStatus(!status)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      status
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        <span className="font-medium">Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        <span className="font-medium">Inactive</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Active batches are available for enrollment and operations
                </p>
              </div>

              {/* Error and Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm">{error}</p>
                      {error ===
                        "No students found. Please add students to proceed." && (
                        <div className="mt-2">
                          <Link href="/student-add">
                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                              Add Students
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Check className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || selectedStudents.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Batch...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>
                        Create Batch ({selectedStudents.length} students)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BatchCreationForm;
