"use client";

import { useEffect, useState } from "react";
import { FiFilter } from "react-icons/fi";
import axios from "axios";
import { FaRegClipboard, FaUserAlt, FaCog } from "react-icons/fa";

const AttendanceComponent = ({ selectedMode }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("yearly");

  const toggleFilterOptions = () => setShowFilterOptions(!showFilterOptions);

  const handleFilterSelection = (filterType) => {
    setSelectedFilter(filterType);
    setShowFilterOptions(false);
  };

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    const fetchAttendanceData = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/test`,
          {
            studentId: Number(studentId),
            filterType: selectedFilter,
          }
        );

        const results =
          response.data.results || [
            {
              FullTestCount: 0,
              accuracyFull: 0,
              highestMarkFull: 0,
              totalMarksFull: 0,
              MeTestCount: 0,
              accuracyMe: 0,
              highestMarkMe: 0,
              totalMarksMe: 0,
              GenerateTestCount: 0,
              accuracyGenerate: 0,
              highestMarkGenerate: 0,
              totalMarksGenerate: 0,
              totalAccuracy: 0,
            },
          ];

        setAttendanceData(results);
      } catch (err) {
        setAttendanceData([
          {
            FullTestCount: 0,
            accuracyFull: 0,
            highestMarkFull: 0,
            totalMarksFull: 0,
            MeTestCount: 0,
            accuracyMe: 0,
            highestMarkMe: 0,
            totalMarksMe: 0,
            GenerateTestCount: 0,
            accuracyGenerate: 0,
            highestMarkGenerate: 0,
            totalMarksGenerate: 0,
            totalAccuracy: 0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchAttendanceData();
    else {
      setAttendanceData([
        {
          FullTestCount: 0,
          accuracyFull: 0,
          highestMarkFull: 0,
          totalMarksFull: 0,
          MeTestCount: 0,
          accuracyMe: 0,
          highestMarkMe: 0,
          totalMarksMe: 0,
          GenerateTestCount: 0,
          accuracyGenerate: 0,
          highestMarkGenerate: 0,
          totalMarksGenerate: 0,
          totalAccuracy: 0,
        },
      ]);
      setLoading(false);
    }
  }, [selectedMode, selectedFilter]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-gray-600 text-center">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  const TestRow = ({ icon: Icon, color, label, count, accuracy, highest, total }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-4 p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow">
        <Icon className={`text-${color}-500`} size={28} />
      </div>
      <div className="flex-1">
        <span className="block text-sm font-semibold text-gray-700">
          {label}: {count}
        </span>
        <div className="mt-2 bg-gray-200 rounded-full h-2 w-full">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${accuracy || 0}%`,
              backgroundColor: (accuracy || 0) > 80 ? "#16DBCC" : "#FE5C73",
            }}
          />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap text-right">
        {highest}/{total}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white shadow rounded-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-800">Accuracy</h2>
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white text-lg font-bold shadow">
            {attendanceData.length > 0
              ? `${(
                  attendanceData.reduce((acc, d) => acc + d.totalAccuracy, 0) /
                  attendanceData.length
                ).toFixed(1)}%`
              : "0%"}
          </div>
        </div>

        {/* Filter Button */}
        <div className="relative">
          <button
            onClick={toggleFilterOptions}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 flex items-center gap-2 text-sm font-medium transition"
          >
            <FiFilter className="text-gray-600" />
            <span>Filter</span>
          </button>

          {showFilterOptions && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md border w-40 py-2 z-10">
              {["yearly", "monthly", "weekly"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterSelection(type)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    selectedFilter === type ? "font-semibold text-blue-600" : "text-gray-700"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Test Rows */}
      <div className="space-y-4">
        {attendanceData.map((d, i) => (
          <div key={i} className="space-y-4">
            <TestRow
              icon={FaRegClipboard}
              color="blue"
              label="Full Test"
              count={d.FullTestCount}
              accuracy={d.accuracyFull}
              highest={d.highestMarkFull}
              total={d.totalMarksFull}
            />
            <TestRow
              icon={FaUserAlt}
              color="green"
              label="Me Test"
              count={d.MeTestCount}
              accuracy={d.accuracyMe}
              highest={d.highestMarkMe}
              total={d.totalMarksMe}
            />
            <TestRow
              icon={FaCog}
              color="red"
              label="Generate Test"
              count={d.GenerateTestCount}
              accuracy={d.accuracyGenerate}
              highest={d.highestMarkGenerate}
              total={d.totalMarksGenerate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceComponent;
