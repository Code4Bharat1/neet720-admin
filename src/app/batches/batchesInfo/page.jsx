"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  BookOpen,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  ArrowLeft
} from "lucide-react";
import DesktopNavbar from "@/components/desktopnav/nav";

const BatchesInfoPage = () => {
  const [batchData, setBatchData] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [adminTests, setAdminTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const router = useRouter()

  const fetchBatchInfo = async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      const batchId =
        typeof window !== "undefined" ? localStorage.getItem("batchId") : null;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/batchesInfo`,
        { params: { batchId } }
      );

      const { batch, students, tests } = response.data;
      setBatchData(batch || {});
      setStudentsData(students || []);
      setAdminTests(tests || []);
    } catch (error) {
      setError(
        "Error fetching data: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatchInfo();
  }, []);

  const handleRefresh = () => {
    fetchBatchInfo();
  };

  const filteredStudents = studentsData.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(query) ||
      student.emailAddress?.toLowerCase().includes(query) ||
      student.mobileNumber?.toLowerCase().includes(query) ||
      student.domicileState?.toLowerCase().includes(query)
    );
  });

  const filteredTests = adminTests.filter((test) => {
    const query = searchQuery.toLowerCase();
    return (
      test.testname?.toLowerCase().includes(query) ||
      test.subject?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (isLoading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">
              Loading batch information
            </p>
            <p className="text-gray-500 mt-1">
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <button
                  onClick={() => router.push("/batches")}
                  className="inline-flex items-center px-4 py-2 mb-6 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  <span className="font-medium">Back</span>
                </button>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Batch Dashboard
                </h1>
                {batchData && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <BookOpen className="h-5 w-5" />
                    <p className="text-lg">{batchData.batchName}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <RefreshCw
                  className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {batchData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Batch Name
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {batchData.batchName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Total Students
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {batchData.no_of_students || studentsData.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Total Tests
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {adminTests.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === "students"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("students")}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Students ({studentsData.length})</span>
                  </div>
                </button>
                <button
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === "tests"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveTab("tests")}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Tests ({adminTests.length})</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="p-6 bg-white border-b border-gray-100">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${
                    activeTab === "students" ? "students" : "tests"
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Batch ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr
                          key={student.id || index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {student.fullName?.charAt(0) || "S"}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.fullName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.emailAddress}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.mobileNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {student.domicileState || (
                              <span className="text-gray-400 italic">
                                Not specified
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {batchData.batchId}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-500">
                              No students found
                            </p>
                            <p className="text-gray-400 mt-1">
                              Try adjusting your search criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tests Tab */}
            {activeTab === "tests" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Questions
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTests.length > 0 ? (
                      filteredTests.map((test, index) => {
                        const now = new Date();
                        const startDate = new Date(test.exam_start_date);
                        const endDate = new Date(test.exam_end_date);

                        let testStatus = "Upcoming";
                        let statusColor = "bg-blue-100 text-blue-800";
                        let statusIcon = Calendar;

                        if (now > endDate) {
                          testStatus = "Completed";
                          statusColor = "bg-gray-100 text-gray-800";
                        } else if (now >= startDate) {
                          testStatus = "Active";
                          statusColor = "bg-green-100 text-green-800";
                        }

                        return (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {test.testname}
                              </div>
                              <div className="text-sm text-gray-500">
                                {test.subject}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {test.no_of_questions}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                Start: {formatDate(test.exam_start_date)}
                              </div>
                              <div>End: {formatDate(test.exam_end_date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {test.duration} mins
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                              >
                                {testStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-500">
                              No tests found
                            </p>
                            <p className="text-gray-400 mt-1">
                              Try adjusting your search criteria
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchesInfoPage;
