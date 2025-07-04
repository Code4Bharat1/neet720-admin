"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import { MdOutlineSchedule } from "react-icons/md";
import { IoIosArrowBack } from "react-icons/io";
import { FaEye } from "react-icons/fa6";
import { FaQuestionCircle } from "react-icons/fa";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Schedule_test = () => {
  const router = useRouter();
  const currentDate = "2025-04-03";

  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({
    testName1: "",
    testName2: "",
    scheduledAt: "",
    endsAt: "",
    showResults: "",
    duration: "",
  });

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-data`);
        setTestData(response.data.tests);
      } catch (err) {
        console.error("Failed to fetch test data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSaveChanges = async () => {
    try {
      const testId = localStorage.getItem("testid");
      const testName = `${formData.testName1} ${formData.testName2}`;
      const payload = {
        testid: testId,
        testname: testName,
        batch_name: formData.showResults,
        duration: formData.duration,
        exam_start_date: formData.scheduledAt,
        exam_end_date: formData.endsAt,
        status: "active",
      };
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/update-test`, payload);
      if (response.status === 200) {
        toast.success("Test updated successfully", { duration: 5000 });
      }
    } catch (error) {
      console.error("Failed to update test", error);
      toast.error("Error updating test", { duration: 5000 });
    }
  };

  const handleCancelEdit = () => setEditingRow(null);
  if (loading) return <div>Loading...</div>;

  return (
    <div className="relative min-h-screen bg-white md:hidden">
      <Head>
        <title>Office Mode - Test Generator</title>
        <meta name="description" content="Generate and manage tests in office mode" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex justify-center mt-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search Tests"
            className="w-full px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
          />
        </div>
      </div>

      <div className="flex flex-col items-center p-4">
        <div className="bg-white w-full">
          <div className="flex flex-col space-y-2 my-4">
            <button
              onClick={() => router.push("./test_preview")}
              style={{ backgroundColor: "#FFBB38" }}
              className="text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600"
            >
              <FaEye size={16} /> Test Preview
            </button>
            <button
              onClick={() => router.push("./offline_mode")}
              style={{ backgroundColor: "#FFBB38" }}
              className="text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600"
            >
              <FaQuestionCircle size={16} /> Offline Mode
            </button>
            <button
              onClick={() => router.push("/schedule_test")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <MdOutlineSchedule size={16} /> Schedule Test
            </button>
          </div>

          <div className="mt-6 w-full">
            <div className="overflow-x-auto shadow-md border border-black rounded-lg">
              <table className="min-w-[700px] w-full text-sm text-center table-auto">
                <thead className="bg-gray-100 text-black uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-2 py-3">ID</th>
                    <th className="px-2 py-3">Test</th>
                    <th className="px-2 py-3">Batch</th>
                    <th className="px-2 py-3">Duration</th>
                    <th className="px-2 py-3">From</th>
                    <th className="px-2 py-3">End</th>
                    <th className="px-2 py-3">Status</th>
                    <th className="px-2 py-3">Edit</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-800">
                  {testData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-300 hover:bg-gray-100 whitespace-nowrap"
                    >
                      <td className="px-2 py-3">{row.id}</td>
                      <td className="px-2 py-3 truncate max-w-[100px]">{row.testname}</td>
                      <td className="px-2 py-3 truncate max-w-[100px]">{row.batch_name}</td>
                      <td className="px-2 py-3">{row.duration}</td>
                      <td className="px-2 py-3 text-[10px]">{row.exam_start_date}</td>
                      <td className="px-2 py-3 text-[10px]">{row.exam_end_date}</td>
                      <td className="px-2 py-3">{row.status}</td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => handleEditClick(row)}
                          className="text-blue-600 underline text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule_test;
