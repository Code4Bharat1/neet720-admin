"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/desktopsidebar/sidebar";
import { Users, BookOpen, RefreshCw, Search } from "lucide-react";
import DesktopNavbar from "@/components/desktopnav/nav";

const BatchesInfoPage = () => {
  const [batchData, setBatchData] = useState(null);
  const [studentsData, setStudentsData] = useState([]);
  const [adminTests, setAdminTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("students"); // students, tests

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

      setBatchData(response.data.batchData);
      setStudentsData(response.data.studentsData);
      setAdminTests(response.data.adminTests);
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

  // Handle refresh
  const handleRefresh = () => {
    fetchBatchInfo();
  };

  // Filter students based on search query
  const filteredStudents = studentsData.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(query) ||
      student.emailAddress?.toLowerCase().includes(query) ||
      student.mobileNumber?.toLowerCase().includes(query) ||
      student.domicileState?.toLowerCase().includes(query)
    );
  });

  // Filter tests based on search query
  const filteredTests = adminTests.filter((test) => {
    const query = searchQuery.toLowerCase();
    return (
      test.testname?.toLowerCase().includes(query) ||
      test.subject?.toLowerCase().includes(query)
    );
  });

  // Format date helper
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
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar with fixed positioning */}
        <div className="w-64 fixed h-screen z-10">
          <Sidebar />
        </div>

        {/* Main content with padding to prevent overlap */}
        <div className="flex-1 ml-64 flex justify-center items-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading batch information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex w-full">

        {/* Sidebar with fixed positioning */}
<div className="w-55 fixed h-screen  z-10">
  <Sidebar />
</div>

        <div className="min-h-screen bg-gray-50 w-full ml-50 overflow-x-hidden">

      <DesktopNavbar/>

        {/* Main content with padding to prevent overlap */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header with batch info */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mx-auto text-center">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Batch Information
                  </h1>
                  {batchData && (
                    <p className="text-gray-600 mt-1">
                      Batch: {batchData.batchName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Batch Info Summary */}
            {batchData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Batch Name
                  </h3>
                  <p className="text-gray-700 mt-1">{batchData.batchName}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Number of Students
                  </h3>
                  <p className="text-gray-700 mt-1">
                    {batchData.no_of_students || studentsData.length}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Number of Tests
                  </h3>
                  <p className="text-gray-700 mt-1">{adminTests.length}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="flex border-b">
                <button
                  className={`py-3 px-6 font-medium ${
                    activeTab === "students"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("students")}
                >
                  Students
                </button>
                <button
                  className={`py-3 px-6 font-medium ${
                    activeTab === "tests"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("tests")}
                >
                  Tests
                </button>
              </div>

              {/* Search */}
              <div className="p-4 bg-gray-50 border-b">
                <div className="flex">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      placeholder={`Search ${
                        activeTab === "students" ? "students" : "tests"
                      }...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none"
                    />
                    <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Students Tab Content */}
            {activeTab === "students" && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Full Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Domicile State
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Batch ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {student.fullName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.emailAddress}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.mobileNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.domicileState}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.batchId}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No students found{" "}
                            {searchQuery
                              ? "matching your search"
                              : "for this batch"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tests Tab Content */}
            {activeTab === "tests" && (
              <div className="bg-white rounded-lg max-w-screen shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Test Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Questions
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          End Date
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Duration (mins)
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTests.length > 0 ? (
                        filteredTests.map((test, index) => {
                          // Calculate test status
                          const now = new Date();
                          const startDate = new Date(test.exam_start_date);
                          const endDate = new Date(test.exam_end_date);

                          let testStatus = "Upcoming";
                          let statusColor = "bg-blue-100 text-blue-800";

                          if (now > endDate) {
                            testStatus = "Completed";
                            statusColor = "bg-gray-100 text-gray-800";
                          } else if (now >= startDate) {
                            testStatus = "Active";
                            statusColor = "bg-green-100 text-green-800";
                          }

                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {test.testname}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.no_of_questions}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(test.exam_start_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(test.exam_end_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.duration}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.subject}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                                >
                                  {testStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No tests found{" "}
                            {searchQuery
                              ? "matching your search"
                              : "for this batch"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default BatchesInfoPage;
