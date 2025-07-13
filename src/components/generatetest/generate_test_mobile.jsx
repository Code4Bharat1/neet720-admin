"use client";
import React, { useState, useEffect } from "react";
import { ArrowRightCircle, Download } from "lucide-react";
import { CiImageOn, CiSearch } from "react-icons/ci";
import * as XLSX from "xlsx";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CenterText() {
  const [searchQuery, setSearchQuery] = useState("");
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/admin-tests`);
        setTestData(response.data.tests);
      } catch (err) {
        setError("Failed to fetch test data");
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, []);

  const filteredRows = testData.filter(
    (row) =>
      row.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.marks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Data");
    XLSX.writeFile(workbook, "test_data.xlsx");
  };

  const handleGenerate = () => {
    ["Biology", "Chemistry", "Physics", "marks", "selectedSubjects", "testName", "ScheduleTest"].forEach(
      (key) => localStorage.removeItem(key)
    );
  };

  const handleActionClick = (testId) => {
    localStorage.setItem("testid", testId);
    router.push("/test_preview");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="px-4 pt-6 pb-20 min-h-screen w-full space-y-6">
      {/* Search Bar */}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Search Batch or Marks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
        />
        <CiSearch className="bg-[#007AFF] left-3 top-1/2 -translate-y-1/2 text-gray-500 text-2xl" />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
        <div className="w-full sm:w-fit text-center border border-gray-400 rounded-md px-4 py-2 text-gray-600 shadow-md">
          Generate Test
        </div>
        <button
          onClick={downloadExcel}
          className="w-full sm:w-fit flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 rounded-md text-gray-600 bg-white shadow-md"
        >
          Download Test <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Test Count Card + Generate */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md w-full sm:w-[250px]">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center">
              <CiImageOn className="w-5 h-5 mr-2" /> Test Created
            </h3>
            <span className="bg-gray-200 text-xs font-semibold px-2 py-1 rounded">
              {filteredRows.length}
            </span>
          </div>
          <img
            src="/test.png"
            alt="Test"
            className="mt-2 rounded-lg w-full h-28 object-cover"
          />
        </div>

        <Link href="/subjectselect" className="w-full sm:w-auto">
          <button
            onClick={handleGenerate}
            className="w-full sm:w-[180px] h-[38px] bg-blue-500 text-white rounded-md font-bold"
          >
            + Generate
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border border-black rounded-xl">
        <table className="min-w-full text-sm text-center">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">SR.NO</th>
              <th className="px-4 py-2 border">TEST ID</th>
              <th className="px-4 py-2 border">TEST NAME</th>
              <th className="px-4 py-2 border">BATCH</th>
              <th className="px-4 py-2 border">MARKS</th>
              <th className="px-4 py-2 border">STATUS</th>
              <th className="px-4 py-2 border">CREATED AT</th>
              <th className="px-4 py-2 border">QUESTIONS</th>
              <th className="px-4 py-2 border">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2 font-semibold">{index + 1}</td>
                <td className="border px-4 py-2">{row.id}</td>
                <td className="border px-4 py-2">{row.testname}</td>
                <td className="border px-4 py-2">{row.batch_name}</td>
                <td className="border px-4 py-2">{row.marks}</td>
                <td className="border px-4 py-2">{row.status}</td>
                <td className="border px-4 py-2">{new Date(row.createdAt).toLocaleString()}</td>
                <td className="border px-4 py-2">{row.no_of_questions}</td>
                <td className="border px-4 py-2">
                  <button
                    className="text-black hover:text-blue-500"
                    onClick={() => handleActionClick(row.id)}
                  >
                    <ArrowRightCircle size={20} strokeWidth={3} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
