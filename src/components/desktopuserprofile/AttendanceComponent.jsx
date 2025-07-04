import { useEffect, useState } from "react";
import { FiFilter } from "react-icons/fi";
import axios from "axios";
import { FaRegClipboard, FaUserAlt, FaCog } from 'react-icons/fa';

const AttendanceComponent = ({ selectedMode }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("yearly");

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  const handleFilterSelection = (filterType) => {
    setSelectedFilter(filterType);
    setShowFilterOptions(false);
  };

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/test`, {
          studentId: Number(studentId),
          filterType: selectedFilter,
        });

        // If no data comes, set default empty values
        const results = response.data.results || [{
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
          totalAccuracy: 0
        }];
        
        setAttendanceData(results);
      } catch (err) {
        // On error, set default empty values instead of showing error
        setAttendanceData([{
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
          totalAccuracy: 0
        }]);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAttendanceData();
    } else {
      // If no studentId, still show empty data instead of error
      setAttendanceData([{
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
        totalAccuracy: 0
      }]);
      setLoading(false);
    }
  }, [selectedMode, selectedFilter]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      {/* Attendance Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-5">
          <h2 className="text-xl text-Montserrat font-semibold">Accuracy</h2>
          <div className="flex justify-center items-center w-20 h-18 shadow-2xl rounded-full bg-blue-500 text-white text-xl font-semibold">
            {attendanceData.length > 0
              ? `${((attendanceData.reduce((acc, data) => acc + data.totalAccuracy, 0) / attendanceData.length).toFixed(2))}%`
              : "0%"}
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          <button
            onClick={toggleFilterOptions}
            className="px-6 py-2 bg-white border border-gray-300 shadow hover:bg-gray-100 flex items-center justify-center transition active:scale-95"
          >
            <FiFilter className="text-xl text-gray-700" /> <span className="ml-2">Filter</span>
          </button>

          {showFilterOptions && (
            <div className="bg-[#007AFF] top-full right-0 mt-2 bg-white shadow-lg rounded-lg w-48 p-2 border border-gray-300 z-10">
              <button
                onClick={() => handleFilterSelection("yearly")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Yearly
              </button>
              <button
                onClick={() => handleFilterSelection("monthly")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Monthly
              </button>
              <button
                onClick={() => handleFilterSelection("weekly")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
              >
                Weekly
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Test Results */}
      <div className="space-y-10 mt-10">
        {attendanceData.map((data, index) => (
          <div key={index} className="space-y-4">
            {/* Full Test */}
            <div className="flex gap-15 items-center">
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <FaRegClipboard className="text-blue-500" size={40} />
                </div>
              </div>
              <div className="flex-col w-full">
                <span className="text-md font-semibold">Full Test: {data?.FullTestCount || 0}</span>
                <div className="bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${data?.accuracyFull || 0}%`,
                      backgroundColor: (data?.accuracyFull || 0) > 80 ? "#16DBCC" : "#FE5C73",
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm pl-6 text-gray-500">
                {data?.highestMarkFull || 0}/{data?.totalMarksFull || 0}
              </span>
            </div>

            {/* Me Test */}
            <div className="flex gap-15 items-center">
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <FaUserAlt className="text-green-500" size={40} />
                </div>
              </div>
              <div className="flex-col w-full">
                <span className="text-md font-semibold">Me Test: {data?.MeTestCount || 0}</span>
                <div className="bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${data?.accuracyMe || 0}%`,
                      backgroundColor: (data?.accuracyMe || 0) > 80 ? "#16DBCC" : "#FE5C73",
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm pl-6 text-gray-500">
                {data?.highestMarkMe || 0}/{data?.totalMarksMe || 0}
              </span>
            </div>

            {/* Generate Test */}
            <div className="flex gap-15 items-center">
              <div className="flex items-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <FaCog className="text-red-500" size={40} />
                </div>
              </div>
              <div className="flex-col w-full">
                <span className="text-md font-semibold">Generate Test: {data?.GenerateTestCount || 0}</span>
                <div className="bg-gray-200 rounded-full h-2 relative">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${data?.accuracyGenerate || 0}%`,
                      backgroundColor: (data?.accuracyGenerate || 0) > 80 ? "#16DBCC" : "#FE5C73",
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-sm pl-6 text-gray-500">
                {data?.highestMarkGenerate || 0}/{data?.totalMarksGenerate || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceComponent;