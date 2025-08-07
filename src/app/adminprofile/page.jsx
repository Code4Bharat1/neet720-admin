"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "@/components/desktopsidebar/sidebar";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Home,
  Users,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Save,
  Edit3,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";

export default function AdminDashboardPage() {
  // Admin Profile States
  const [adminData, setAdminData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Table States
  const [testData, setTestData] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const rowsPerPage = 10;

  const [filterFromCard, setFilterFromCard] = useState(null);

  // Get token helper function
  const getToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminAuthToken");
    }
    return null;
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Fetch Admin Profile
  const fetchProfile = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/getProfile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      if (res.ok) {
        setAdminData(result.data);
        setFormData(result.data);
      } else {
        toast.error(result.message || "Failed to fetch profile");
      }
    } catch (err) {
      toast.error("Something went wrong loading profile");
    }
  };

  // Fetch Test Data
  const fetchTestData = async () => {
    try {
      setRefreshing(true);
      const token = getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/getTestData`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.data) {
        setTestData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch test data:", error);
      toast.error("Failed to load test data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setFilterFromCard(null);
  }, [searchQuery, sortOrder]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchTestData()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Handle profile form changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle profile edit mode
  const handleEdit = () => {
    setEditMode(true);
    toast.success("Edit mode enabled");
  };

  // Handle form cancel
  const handleCancel = () => {
    setEditMode(false);
    setFormData(adminData); // Reset form data to original
    toast.success("Edits cancelled");
  };

  // Handle profile save with validation
  const handleSave = async () => {
    // Simple validation
    if (!formData.name || !formData.email || !formData.mobileNumber) {
      toast.error("Name, Email and Mobile Number are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.mobileNumber)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/updateProfile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await res.json();
      if (res.ok) {
        setEditMode(false);
        setAdminData(result.data);
        toast.success("Profile updated successfully");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter test data based on search query and status filter
  const filteredData = testData.filter((item) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchesSearch =
      item.testname?.toLowerCase().includes(lowerCaseQuery) ||
      item.batch_name?.toLowerCase().includes(lowerCaseQuery) ||
      item.subject?.toLowerCase().includes(lowerCaseQuery);

    // If a card filter is active, prioritize that over the dropdown filter
    if (filterFromCard) {
      return (
        matchesSearch &&
        item.status.toLowerCase() === filterFromCard.toLowerCase()
      );
    }

    if (selectedFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      item.status.toLowerCase() === selectedFilter.toLowerCase()
    );
  });

  // Sort test data based on date
  const sortedData = [...filteredData].sort((a, b) => {
    return sortOrder === "latest"
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Paginate test data
  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Get total pages
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 shadow-lg">
          <Sidebar />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Profile form fields configuration
  const profileFields = [
    { label: "Name", key: "name", icon: <User size={18} />, required: true },
    {
      label: "Email Address",
      key: "email",
      icon: <Mail size={18} />,
      required: true,
    },
    {
      label: "Mobile Number",
      key: "mobileNumber",
      icon: <Phone size={18} />,
      required: true,
    },
    {
      label: "WhatsApp Number",
      key: "whatsappNumber",
      icon: <MessageSquare size={18} />,
    },
    { label: "Address", key: "address", icon: <Home size={18} /> },
    { label: "HOD Name", key: "hodName", icon: <Users size={18} /> },
    {
      label: "Start Date",
      key: "startDate",
      readonly: true,
      icon: <Calendar size={18} />,
    },
    {
      label: "Expiry Date",
      key: "expiryDate",
      readonly: true,
      icon: <Clock size={18} />,
    },
  ];

  return (
    <div className="flex min-h-screen max-sm:-ml-56 ml-20 bg-gray-50">
      <div className="block md:hidden fixed top-0 z-10">
        <MobileNavbar />
      </div>
      {/* Sidebar */}
      <div className="w-55">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 py-8 px-6 overflow-x-hidden">
        <div className="max-w-7xl mx-auto ">
          {/* Page Header with stats */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {adminData?.name || "Admin"}
                </p>
              </div>
              <div className="mt-4 md:mt-0"></div>
            </div>

            {/* Stats cards */}
            {/* Update the Stats cards section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Total Tests Card */}
              <div
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedFilter("all");
                  setFilterFromCard(null);
                  // Scroll to table
                  document
                    .getElementById("test-table-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-100">Total Tests</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {testData.length}
                    </h3>
                  </div>
                  <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                    <FileText size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm flex items-center">
                  <span>View all tests</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </div>

              {/* Active Tests Card */}
              <div
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedFilter("active");
                  setFilterFromCard("active");
                  document
                    .getElementById("test-table-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-green-100">Active Tests</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {
                        testData.filter((test) => test.status === "Active")
                          .length
                      }
                    </h3>
                  </div>
                  <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                    <Eye size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm flex items-center">
                  <span>View active tests</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </div>

              {/* Upcoming Tests Card */}
              <div
                className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white cursor-pointer hover:shadow-lg transition"
                onClick={() => {
                  setSelectedFilter("upcoming");
                  setFilterFromCard("upcoming");
                  document
                    .getElementById("test-table-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-100">Upcoming Tests</p>
                    <h3 className="text-3xl font-bold mt-1">
                      {
                        testData.filter((test) => test.status === "Upcoming")
                          .length
                      }
                    </h3>
                  </div>
                  <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                    <Calendar size={24} />
                  </div>
                </div>
                <div className="mt-4 text-sm flex items-center">
                  <span>View upcoming tests</span>
                  <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Profile Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 ml-3">
                  Admin Profile
                </h2>
              </div>
              <div className="flex space-x-3"></div>
            </div>

            {adminData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {profileFields.map(
                  ({ label, key, icon, readonly, required }) => (
                    <div
                      key={key}
                      className={`bg-gray-50 p-5 rounded-lg border ${
                        editMode && !readonly
                          ? "border-blue-200"
                          : "border-gray-200"
                      } transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-blue-600 mr-2">{icon}</span>
                        <label className="font-medium text-gray-700">
                          {label}
                          {required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleChange}
                        readOnly={readonly || !editMode}
                        className={`w-full p-3 border-gray-300 rounded-lg transition-all focus:outline-none ${
                          readonly || !editMode
                            ? "bg-gray-100 text-gray-800 cursor-default"
                            : "bg-white border-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        }`}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                      {editMode && required && !formData[key] && (
                        <p className="mt-1 text-sm text-red-500">
                          This field is required
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Test Table Section */}
          <div
            id="test-table-section"
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 ml-3">
                  Test Management
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search Filter */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search by Test, Batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <Search className="h-5 w-5 absolute left-3 top-3.5 text-gray-400" />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-white p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="all">All Tests</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Filter className="h-4 w-4 absolute right-3 top-4 text-gray-500" />
                </div>

                {/* Sort Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortOrder("latest")}
                    className={`px-4 py-3 rounded-lg font-medium transition flex items-center ${
                      sortOrder === "latest"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowDown size={16} className="mr-1" />
                    Latest
                  </button>
                  <button
                    onClick={() => setSortOrder("oldest")}
                    className={`px-4 py-3 rounded-lg font-medium transition flex items-center ${
                      sortOrder === "oldest"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                  >
                    <ArrowUp size={16} className="mr-1" />
                    Oldest
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Test Name",
                      "Difficulty",
                      "Subject",
                      "Marks",
                      "Duration",
                      "Start Date",
                      "End Date",
                      "Batch",
                      "Status",
                    ].map((title) => (
                      <th
                        key={title}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">
                            {item.testname}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {item.id || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : item.difficulty === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.marks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.duration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(item.exam_start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(item.exam_end_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.batch_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : item.status === "Completed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="10"
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        {searchQuery ? (
                          <div className="flex flex-col items-center">
                            <Search size={24} className="text-gray-400 mb-2" />
                            <p>No tests found matching your search criteria</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FileText
                              size={24}
                              className="text-gray-400 mb-2"
                            />
                            <p>No tests available</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paginatedData.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  {Math.min(
                    sortedData.length,
                    (currentPage - 1) * rowsPerPage + 1
                  )}
                  -{Math.min(currentPage * rowsPerPage, sortedData.length)} of{" "}
                  {sortedData.length} tests
                </div>
                <div className="flex items-center">
                  {/* Page Numbers */}
                  <div className="hidden md:flex mr-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 flex items-center justify-center rounded-lg mx-1 ${
                              currentPage === page
                                ? "bg-blue-600 text-white font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* Prev/Next Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="flex items-center px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage >= totalPages}
                      className="flex items-center px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-10">
        <MobilebottomNavbar />
      </div>
    </div>
  );
}
