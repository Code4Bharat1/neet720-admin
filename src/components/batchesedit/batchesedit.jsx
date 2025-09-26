"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  User,
  Plus,
  X,
  Check,
  AlertCircle,
  BookOpen,
  UserPlus,
  Loader2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Save,
  Settings,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const UpdateBatchForm = ({ batchId }) => {
  // Form fields
  const router = useRouter();
  const [batchName, setBatchName] = useState("");
  const [status, setStatus] = useState(true);

  // Student lists
  const [availableStudents, setAvailableStudents] = useState([]);
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Loading & messaging
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingBatch, setIsLoadingBatch] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // UI controls
  const [searchTerm, setSearchTerm] = useState("");
  const [showStudentSelector, setShowStudentSelector] = useState(false);

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

  const isNotFound = (err) => Number(err?.response?.status) === 404;

  // Helper: Get admin ID
  const getAdminId = () => {
    const token = localStorage.getItem("adminAuthToken");
    const payload = JSON.parse(atob(token.split(".")[1]));
    let adminId = payload.id;
    return adminId;
  };

  // Axios instance
  const createAxios = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminAuthToken")
        : null;
    return axios.create({
      baseURL:
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3085/api",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };

  // On mount or batchId change
  useEffect(() => {
    if (!batchId) return;
    fetchBatchDetails();
    fetchAllStudents();
    fetchBatchStudents();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    setIsLoadingBatch(true);
    setError("");
    try {
      const api = createAxios();
      const { data } = await api.get(`/studentdata/batch/${batchId}`);
      const batch = data.batch;
      setBatchName(batch.batchName);
      setStatus(batch.status);

      const mapped = (batch.Students || []).map((s) => ({
        id: s.id,
        fullName: cleanName(s.fullName, s.firstName, s.lastName),
        email: s.email ?? s.emailAddress ?? "",
      }));

      setBatchStudents(mapped);
      setSelectedStudents(mapped);
    } catch (err) {
      console.error(err);
      if (isNotFound(err)) {
        setBatchStudents([]);
        setSelectedStudents([]);
        setError("");
      } else {
        setError(err.response?.data?.message || "Failed to load batch");
      }
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const fetchAllStudents = async () => {
    setIsLoadingStudents(true);
    setError("");
    try {
      const api = createAxios();
      let adminId = getAdminId();
      const { data } = await api.post(`/studentdata/info`, {
        addedByAdminId: parseInt(adminId),
      });

      const sanitized = (data.studentInfo || []).map((s) => ({
        ...s,
        fullName: cleanName(s.fullName, s.firstName, s.lastName),
        email: s.email ?? s.emailAddress ?? "",
      }));

      setAvailableStudents(sanitized);
    } catch (err) {
      console.error(err);
      if (isNotFound(err)) {
        setAvailableStudents([]);
        setError("");
      } else {
        setError("Failed to fetch student list");
      }
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchBatchStudents = async () => {
    setIsLoadingStudents(true);
    setError("");
    try {
      const api = createAxios();
      const adminId = getAdminId();
      const { data } = await api.post(`/studentdata/batch-student`, {
        addedByAdminId: parseInt(adminId),
        batchId,
      });

      const mapped = (data.studentInfo || []).map((s) => ({
        id: s.id,
        fullName: cleanName(s.fullName, s.firstName, s.lastName),
        email: s.email ?? s.emailAddress ?? "",
      }));

      setBatchStudents(mapped);
      setSelectedStudents(mapped);
    } catch (err) {
      console.error(err);
      if (isNotFound(err)) {
        setBatchStudents([]);
        setSelectedStudents([]);
        setSuccessMessage("No students found in this batch.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Failed to fetch batch students");
      }
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Toggle student selection
  const handleStudentToggle = (student) => {
    setSelectedStudents((prev) => {
      const exists = prev.find((s) => s.id === student.id);
      if (exists) return prev.filter((s) => s.id !== student.id);
      return [...prev, student];
    });
  };

  // Update batch with students
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    if (!batchName.trim()) {
      setError("Batch name is required");
      setIsLoading(false);
      return;
    }
    if (!selectedStudents.length) {
      setError("Select at least one student");
      setIsLoading(false);
      return;
    }
    try {
      const api = createAxios();
      const payload = {
        batchName: batchName.trim(),
        status,
        no_of_students: selectedStudents.length,
        studentIds: selectedStudents.map((s) => s.id),
      };
      const { data } = await api.put(`/studentdata/batch/${batchId}`, payload);
      setSuccessMessage(data.message || "Batch updated successfully");
      fetchBatchDetails();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Loading batch details
            </p>
            <p className="text-gray-500 mt-1">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredStudents = availableStudents.filter((st) => {
    const name = cleanName(
      st.fullName,
      st.firstName,
      st.lastName
    ).toLowerCase();
    const email = (st.email ?? "").toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const notAlreadySelected = !selectedStudents.some(
      (selected) => selected.id === st.id
    );
    return matchesSearch && notAlreadySelected;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => router.push("/batches")}
          className="inline-flex items-center px-4 py-2 mb-6 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Update Batch
          </h1>
          <p className="text-gray-600">
            Modify batch details and manage student assignments
          </p>
        </div>

        <motion.form
          onSubmit={handleUpdate}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Batch Configuration
                </h2>
                <p className="text-blue-100">
                  Update batch information and student enrollment
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Batch Name Section */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <BookOpen className="h-4 w-4" />
                <span>Batch Name</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 font-medium"
                  placeholder="Enter batch name"
                />
              </div>
            </div>

            {/* Status Toggle */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Settings className="h-4 w-4" />
                <span>Batch Status</span>
              </label>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                className={`inline-flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  status
                    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                    : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                }`}
              >
                {status ? (
                  <ToggleRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {status ? "Active" : "Inactive"}
                </span>
              </button>
            </div>

            {/* Student Selection Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                  <UserCheck className="h-4 w-4" />
                  <span>Student Management</span>
                </label>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Users className="h-4 w-4 mr-1" />
                    {selectedStudents.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(!showStudentSelector)}
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Students
                  </button>
                </div>
              </div>

              {/* Selected Students Display */}
              {selectedStudents.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Enrolled Students
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {selectedStudents.map((student) => (
                      <motion.div
                        key={student.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {student.fullName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {student.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStudentToggle(student)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Selector */}
              <AnimatePresence>
                {showStudentSelector && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-white border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowStudentSelector(false)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 max-h-80 overflow-y-auto">
                      {isLoadingStudents ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="ml-2 text-gray-600">
                            Loading students...
                          </span>
                        </div>
                      ) : filteredStudents.length > 0 ? (
                        <div className="space-y-2">
                          {filteredStudents.map((student) => {
                            const isSelected = selectedStudents.find(
                              (s) => s.id === student.id
                            );
                            return (
                              <div
                                key={student.id}
                                onClick={() => handleStudentToggle(student)}
                                className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "bg-blue-50 border-2 border-blue-200 shadow-sm"
                                    : "bg-white hover:bg-gray-50 border border-gray-200"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors duration-200 ${
                                    isSelected
                                      ? "bg-blue-600 border-blue-600"
                                      : "border-gray-300 hover:border-blue-400"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {student.fullName.charAt(0)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {student.fullName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {student.email}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 font-medium">
                            No students available
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            All students may already be enrolled
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isLoading ? "Updating..." : "Update Batch"}
              </button>
            </div>

            {/* Error & Success Messages */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-medium">{error}</p>
                </motion.div>
              )}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 font-medium">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default UpdateBatchForm;
