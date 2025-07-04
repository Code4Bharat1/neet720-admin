"use client";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Schedule_test = () => {
  const router = useRouter();
  const currentDate = "2025-04-03";

  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [formData, setFormData] = useState({
    testName1: "",
    testName2: "",
    scheduledAt: "",
    endsAt: "",
    showResults: "",
    duration: "",
  });

  // Get adminId from token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setAdminId(payload.id);
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Authentication error");
      }
    }
  }, []);

  // Fetch test data when adminId is available
  useEffect(() => {
    const fetchTestData = async () => {
      if (!adminId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/admin-tests`,
          { adminId }
        );
        
        if (response.data && response.data.tests) {
          setTestData(response.data.tests);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Failed to fetch test data", err);
        toast.error("Failed to load test data");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [adminId]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle row edit
  const handleEditClick = (row) => {
    setEditingRow(row.id);
    localStorage.setItem("testid", row.id);

    const [firstName, secondName] = row.testname ? row.testname.split(" ") : ["", ""];
    setFormData({
      testName1: firstName,
      testName2: secondName || "",
      scheduledAt: row.exam_start_date || "",
      endsAt: row.exam_end_date || "",
      showResults: row.batch_name || "",
      duration: row.duration || "",
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      const testId = localStorage.getItem('testid');
      const testName = `${formData.testName1} ${formData.testName2}`.trim();
  
      const payload = {
        testid: testId,
        testname: testName,
        batch_name: formData.showResults,
        duration: formData.duration,
        exam_start_date: formData.scheduledAt,
        exam_end_date: formData.endsAt,
        status: "active",
      };
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/update-test`,
        payload
      );
  
      if (response.status === 200) {
        toast.success("Test updated successfully", {
          duration: 5000
        });
        
        // Update the local state to reflect changes
        setTestData(prevData => 
          prevData.map(test => 
            test.id === testId 
              ? { 
                  ...test, 
                  testname: testName,
                  batch_name: formData.showResults,
                  duration: formData.duration,
                  exam_start_date: formData.scheduledAt,
                  exam_end_date: formData.endsAt
                } 
              : test
          )
        );
        
        setEditingRow(null);
      }
    } catch (error) {
      console.error("Failed to update test", error);
      toast.error("Error updating test", {
        duration: 5000
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRow(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Schedule Test</title>
        <meta name="description" content="Schedule and manage tests" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 pb-10">
        {/* Header with back button */}
        <div className="bg-white shadow-sm py-4 px-6 flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-colors"
          >
            <IoIosArrowBack size={20} />
          </button>
          <h1 className="text-xl font-bold ml-4 text-gray-800">Schedule Test</h1>
        </div>

        <div className="max-w-6xl mx-auto px-4">
          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-200 bg-blue-50">
              <h2 className="font-semibold text-lg text-gray-800">Schedule Test for Batch</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Test Name</label>
                  <input
                    type="text"
                    name="testName1"
                    value={formData.testName1 || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Test Name (cont.)</label>
                  <input
                    type="text"
                    name="testName2"
                    value={formData.testName2 || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Scheduled at</label>
                  <input
                    type="date"
                    name="scheduledAt"
                    value={formData.scheduledAt || ""}
                    onChange={handleInputChange}
                    min={currentDate}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Ends at</label>
                  <input
                    type="date"
                    name="endsAt"
                    value={formData.endsAt || ""}
                    onChange={handleInputChange}
                    min={currentDate}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Batch name</label>
                  <input
                    type="text"
                    name="showResults"
                    value={formData.showResults || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="Enter batch name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration || ""}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    placeholder="e.g. 60"
                  />
                </div>
              </div>
            </div>
            
            {editingRow && (
              <div className="bg-gray-50 p-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-blue-50">
              <h2 className="font-semibold text-lg text-gray-800">Test Schedule</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testData.map((row) => (
                    <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${editingRow === row.id ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.id}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{row.testname}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{row.batch_name}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.duration} min</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.exam_start_date}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-center">{row.exam_end_date}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-center text-sm">
                        <button
                          onClick={() => handleEditClick(row)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {testData.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-sm text-center text-gray-500">
                        No tests available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Schedule_test;