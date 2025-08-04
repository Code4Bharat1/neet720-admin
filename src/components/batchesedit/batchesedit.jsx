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
} from "lucide-react";
import axios from "axios";

const UpdateBatchForm = ({ batchId }) => {
  // Form fields
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

  // Helper: Get admin ID
  const getAdminId = () => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("adminId");
    if (stored) return stored;
    const token = localStorage.getItem("adminAuthToken");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.adminId || payload.id;
    } catch {
      return null;
    }
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

  // Fetch batch details and populate
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
        fullName: `${s.firstName} ${s.lastName}`,
        email: s.emailAddress,
      }));
      setBatchStudents(mapped);
      setSelectedStudents(mapped);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load batch");
    } finally {
      setIsLoadingBatch(false);
    }
  };

  // Fetch all students
  const fetchAllStudents = async () => {
    setIsLoadingStudents(true);
    setError("");
    try {
      const api = createAxios();
      const adminId = getAdminId();
      const { data } = await api.post("/studentdata/info", {
        addedByAdminId: parseInt(adminId),
      });
      setAvailableStudents(data.studentInfo || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch student list");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Fetch batch-specific students
  const fetchBatchStudents = async () => {
    setIsLoadingStudents(true);
    setError("");
    try {
      const api = createAxios();
      const adminId = getAdminId();
      const { data } = await api.post("/studentdata/batch-student", {
        addedByAdminId: parseInt(adminId),
        batchId,
      });
      const mapped = (data.studentInfo || []).map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.email,
      }));
      setBatchStudents(mapped);
      setSelectedStudents(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch batch students");
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
      setSuccessMessage(data.message || "Batch updated");
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
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto mb-2" />
        <p className="text-gray-600">Loading batch details…</p>
      </div>
    );
  }

  // Filter students not already in batch
  const filteredStudents = availableStudents.filter(
    (st) =>
      (st.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        st.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !batchStudents.some((bs) => bs.id === st.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.form
        onSubmit={handleUpdate}
        className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Batch Name */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Batch Name
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Student Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Select Students
          </label>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {selectedStudents.length} selected
            </span>
            <button
              type="button"
              onClick={() => setShowStudentSelector(!showStudentSelector)}
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Students</span>
            </button>
          </div>
          {selectedStudents.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-4 rounded-lg">
              {selectedStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {s.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStudentToggle(s)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <AnimatePresence>
            {showStudentSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(false)}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {isLoadingStudents ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : filteredStudents.length ? (
                    filteredStudents.map((st) => {
                      const isSel = selectedStudents.find(
                        (s) => s.id === st.id
                      );
                      return (
                        <div
                          key={st.id}
                          onClick={() => handleStudentToggle(st)}
                          className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                            isSel
                              ? "bg-blue-100 border-blue-200"
                              : "bg-white hover:bg-gray-50"
                          } border`}
                        >
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSel
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300"
                            }`}
                          >
                            {isSel && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <User className="w-5 h-5 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {st.fullName}
                            </p>
                            <p className="text-xs text-gray-500">{st.email}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No students found
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Status
          </label>
          <button
            type="button"
            onClick={() => setStatus(!status)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {status ? <ToggleRight /> : <ToggleLeft />}
            <span>{status ? "Active" : "Inactive"}</span>
          </button>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? "Updating..." : "Update Batch"}
          </button>
        </div>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mt-4 p-3 bg-red-50 text-red-700 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="inline-block mr-2" />
              {error}
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              className="mt-4 p-3 bg-green-50 text-green-700 rounded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Check className="inline-block mr-2" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
};

export default UpdateBatchForm;
