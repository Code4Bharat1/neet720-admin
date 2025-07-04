"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaUserGraduate,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaCheck,
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import axios from "axios";

// Helper function to convert a date string into a day name (Mon, Tue, etc.)
const getDayName = (date) => {
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayIndex = new Date(date).getDay();
  return daysOfWeek[dayIndex];
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-md border border-gray-200">
        <p className="font-semibold text-gray-800">{label}</p>
        <div className="mt-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              ></div>
              <p style={{ color: entry.fill }}>
                {entry.name}:{" "}
                <span className="font-semibold">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// LoginAttendance Component
const LoginAttendance = () => {
  const [studentName, setStudentName] = useState(""); // Local state for student name
  const [testData, setTestData] = useState([]); // Local state to store the fetched test data
  const [loading, setLoading] = useState(true); // Loading state for API data
  const [error, setError] = useState(null); // Error state for API data
  const [filteredData, setFilteredData] = useState([]); // Filtered data based on student name or ID
  const [showFilterOptions, setShowFilterOptions] = useState(false); // Toggle filter options
  const [filterBy, setFilterBy] = useState("fullName"); // Filter by category (fullName, studentId, etc.)
  const [dateRange, setDateRange] = useState("week"); // Date range filter (week, month, etc.)

  // Filter options
  const filterOptions = [
    { value: "fullName", label: "Student Name" },
    { value: "studentId", label: "Student ID" },
  ];

  // Date range options
  const dateRangeOptions = [
    { value: "week", label: "Last 7 Days" },
    { value: "month", label: "Last 30 Days" },
    { value: "quarter", label: "Last 90 Days" },
  ];

  // Fetch data when component is mounted
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // URL with date range parameter
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/loginattendance/attendance?range=${dateRange}`
        );

        setTestData(response.data.results || []); // Set the fetched data
        setFilteredData(response.data.results || []); // Initialize filtered data
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        setError("Failed to fetch data"); // Handle any errors
        setLoading(false); // Set loading to false on error
      }
    };

    fetchTestData(); // Fetch data when the component mounts
  }, [dateRange]); // Dependency on dateRange to refetch when changed

  // Handle student name change and filter data based on the search
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setStudentName(searchTerm);
    filterData(searchTerm);
  };

  // Filter data based on search term and filter category
  const filterData = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredData(testData);
      return;
    }

    // Filter logic based on selected filter category
    const filtered = testData.filter((item) => {
      if (filterBy === "fullName") {
        return item.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (filterBy === "studentId") {
        return item.studentId.toString().includes(searchTerm);
      } else if (filterBy === "batchName" && item.batchName) {
        return item.batchName.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });

    setFilteredData(filtered);
  };

  // Reset all filters
  const resetFilters = () => {
    setStudentName("");
    setFilterBy("fullName");
    setDateRange("week");
    setFilteredData(testData);
    setShowFilterOptions(false);
  };

  // If data is loading, show loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 w-full bg-white rounded-2xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there is an error fetching the data, show error message
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-2xl flex flex-col items-center justify-center h-64">
        <div className="text-3xl mb-4">⚠️</div>
        <div>{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-100 text-red-500 px-4 py-2 rounded-md hover:bg-red-200 flex items-center gap-2"
        >
          <HiRefresh /> Retry
        </button>
      </div>
    );
  }

  // Format data for chart
  const chartData = filteredData.flatMap((item) => {
    return item.attendance.map((attendance) => {
      const dayName = getDayName(attendance.day);
      return {
        day: dayName,
        FullTest: attendance.FullTest || 0,
        MeTest: attendance.MeTest || 0,
        RecommendedTest: attendance.RecommendedTest || 0,
        studentName: item.fullName,
      };
    });
  });

  // Remove duplicate days and aggregate test counts
  const uniqueDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Fixed order of days
  const aggregatedData = {};

  // Initialize data for all days with zero values
  uniqueDays.forEach((day) => {
    aggregatedData[day] = { day, FullTest: 0, MeTest: 0, RecommendedTest: 0 };
  });

  // Aggregate the data for the filtered test results
  chartData.forEach((item) => {
    if (aggregatedData[item.day]) {
      aggregatedData[item.day].FullTest += item.FullTest;
      aggregatedData[item.day].MeTest += item.MeTest;
      aggregatedData[item.day].RecommendedTest += item.RecommendedTest;
    }
  });

  // Prepare the final aggregated data for the chart
  const finalChartData = uniqueDays.map((day) => aggregatedData[day]);

  // Calculate totals for summary
  const totalFullTest = finalChartData.reduce(
    (acc, item) => acc + (item.FullTest || 0),
    0
  );
  const totalMeTest = finalChartData.reduce(
    (acc, item) => acc + (item.MeTest || 0),
    0
  );
  const totalRecommendedTest = finalChartData.reduce(
    (acc, item) => acc + (item.RecommendedTest || 0),
    0
  );

  // Custom tick formatter for the Y-Axis to show values like 1, 2, 4, etc.
  const formatYAxisTicks = (tickValue) => {
    return tickValue % 1 === 0 ? tickValue : ""; // Only show whole numbers
  };

  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-6xl pb-10 shadow-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Login Attendance Dashboard
        </h2>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-2"></div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="relative flex flex-col md:flex-row items-center gap-4">
          {/* Search Input with icon */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={`Search by ${
                filterOptions.find((opt) => opt.value === filterBy)?.label ||
                "Name"
              }`}
              className="border border-gray-300 rounded-lg pl-10 pr-4 py-3 w-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              value={studentName}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg transition-colors"
          >
            <FaFilter />
            <span>Filters</span>
          </button>

          {/* Reset Button */}
          {(studentName || filterBy !== "fullName" || dateRange !== "week") && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-lg transition-colors"
            >
              <HiRefresh />
              <span>Reset</span>
            </button>
          )}

          {/* Selected Student Display if any */}
          {studentName && filteredData.length > 0 && (
            <div className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg gap-2 ml-2">
              <FaUserGraduate />
              <span className="font-medium">
                {filteredData[0]?.fullName || studentName}
              </span>
            </div>
          )}
        </div>

        {/* Filter Options */}
        {showFilterOptions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="font-medium text-gray-700 mb-3">Filter by:</h3>
            <div className="flex flex-wrap gap-3">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterBy(option.value);
                    filterData(studentName);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    filterBy === option.value
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {filterBy === option.value && <FaCheck className="text-xs" />}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="text-blue-700 font-medium">Full Tests</h4>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalFullTest}
          </p>
          <p className="text-gray-500 text-sm mt-1">Complete test attempts</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="text-red-700 font-medium">Me Tests</h4>
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{totalMeTest}</p>
          <p className="text-gray-500 text-sm mt-1">
            Personalized test attempts
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <h4 className="text-yellow-700 font-medium">Recommended Tests</h4>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalRecommendedTest}
          </p>
          <p className="text-gray-500 text-sm mt-1">Suggested test attempts</p>
        </div>
      </div>

      {/* Chart Title */}
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Weekly Activity
      </h3>

      {/* Bar Chart - Increased width */}
      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={finalChartData}>
            <defs>
              <linearGradient id="fullTestGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
                <stop offset="100%" stopColor="#1e40af" /> {/* blue-900 */}
              </linearGradient>

              <linearGradient id="meTestGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f87171" /> {/* red-400 */}
                <stop offset="100%" stopColor="#b91c1c" /> {/* red-800 */}
              </linearGradient>

              <linearGradient
                id="recommendedTestGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#fde047" /> {/* yellow-300 */}
                <stop offset="100%" stopColor="#ca8a04" /> {/* yellow-800 */}
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              tick={{ fill: "#4B5563" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxisTicks}
              tick={{ fill: "#4B5563" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontWeight: "500",
              }}
            />
            <Bar
              dataKey="FullTest"
              name="Full Tests"
              stackId="a"
              fill="url(#fullTestGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="MeTest"
              name="Me Tests"
              stackId="a"
              fill="url(#meTestGradient)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="RecommendedTest"
              name="Recommended Tests"
              stackId="a"
              fill="url(#recommendedTestGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* No Data Message */}
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data found for the selected filters. Try adjusting your search
          criteria.
        </div>
      )}
    </div>
  );
};

export default LoginAttendance;
