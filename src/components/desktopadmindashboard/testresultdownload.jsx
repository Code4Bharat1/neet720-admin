import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { FaDownload, FaFileExcel, FaSpinner, FaStar, FaTrophy, FaUserGraduate } from 'react-icons/fa';
import { IoMdSchool } from 'react-icons/io';

const TestResultDownload = () => {
  // State to store the fetched test results
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('Practice'); // Mode state (default to 'Practice')
  const [downloadLoading, setDownloadLoading] = useState(false);


  const cleanName = (...parts) => {
  const raw = parts
    .map((s) => (s ?? "").toString().trim())
    .filter(Boolean)
    .join(" ");
  const cleaned = raw
    .replace(/\b(null|undefined|n\/a|na)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "Unknown";
};
  // Fetch the test results based on the selected mode
 useEffect(() => {
  const fetchTestResults = async () => {
    setLoading(true);
    try {
      const apiUrl =
        selectedMode === 'Practice'
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/testresult/result`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/testresult/customizedresult`;

      // 🔥 GET TOKEN
const token = localStorage.getItem("adminAuthToken");

      // 🔥 SEND TOKEN WITH AXIOS
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.results) {
        const results = response.data.results.map((result) => ({
          name: cleanName(result.fullName, result.firstName, result.lastName),
          score: result.marksObtained,
          totalMarks: result.totalMarks,
          percentage: Math.round((result.marksObtained / result.totalMarks) * 100),
          studentId: result.studentId,
          icon: getIcon(result.marksObtained, result.totalMarks),
          testName: result.testName || "Practice Test",
          date: result.testDate || new Date().toLocaleDateString(),
        }));
        setTestResults(results);
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  fetchTestResults();
}, [selectedMode]);
 // Dependency on selectedMode

  // Function to get the icon based on score percentage
  const getIcon = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    
    if (percentage >= 90) {
      return <FaTrophy className="text-yellow-500" />;
    } else if (percentage >= 75) {
      return <FaStar className="text-blue-500" />;
    } else if (percentage >= 60) {
      return <IoMdSchool className="text-green-500" />;
    } else {
      return <FaUserGraduate className="text-gray-500" />;
    }
  };

  // Function to handle the Excel download
  const downloadExcel = () => {
    setDownloadLoading(true);
    
    try {
     const data = testResults.map((result) => ({
      "Student Name": cleanName(result.name), // already clean, but safe
      "Student ID": result.studentId,
      "Test Name": result.testName,
      "Score": `${result.score}/${result.totalMarks}`,
      "Percentage": `${result.percentage}%`,
      "Date": result.date
    }));


      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

      // Add some styling to the worksheet
      const colWidths = [
        { wch: 20 }, // Student Name
        { wch: 15 }, // Student ID
        { wch: 20 }, // Test Name
        { wch: 10 }, // Score
        { wch: 12 }, // Percentage
        { wch: 15 }  // Date
      ];
      
      ws['!cols'] = colWidths;

      // Generate filename with date and test type
      const date = new Date().toISOString().split('T')[0];
      const filename = `${selectedMode.toLowerCase()}_test_results_${date}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  // Get performance color based on percentage
  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return "text-yellow-500 bg-yellow-50";
    if (percentage >= 75) return "text-blue-500 bg-blue-50";
    if (percentage >= 60) return "text-green-500 bg-green-50";
    return "text-red-500 bg-red-50";
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-[350px] h-[400px] flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <p className="text-gray-500">Loading test results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-[350px] h-[400px] flex justify-center items-center">
        <div className="text-red-500 flex flex-col items-center">
          <div className="text-3xl mb-2">⚠️</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-[350px] h-auto">
      {/* Card header with title and toggle buttons */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-500">
              <FaFileExcel />
            </span>
            Last Test Results
          </h2>
          
          {/* Download Button */}
          <button
            onClick={downloadExcel}
            disabled={downloadLoading}
            className="bg-green-50 text-green-600 py-2 px-4 rounded-md hover:bg-green-600 hover:text-white transition-all flex items-center gap-2 shadow-sm"
          >
            {downloadLoading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>Export</span>
          </button>
        </div>
        
        {/* Toggle Button to switch between modes */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setSelectedMode('Practice')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedMode === 'Practice' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Practice Tests
          </button>
          <button
            onClick={() => setSelectedMode('Customize')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              selectedMode === 'Customize' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-transparent text-gray-600 hover:bg-gray-200'
            }`}
          >
            Custom Tests
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
        <span>Showing {testResults.length} results</span>
        <span className="text-blue-600 font-medium">{selectedMode} Tests</span>
      </div>

      {/* Results List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {testResults.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No test results available
          </div>
        ) : (
          testResults.map((result, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                  {result.icon}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{result.name}</div>
                  <div className="text-xs text-gray-500">ID: {result.studentId}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-bold px-2 py-1 rounded-md ${getPerformanceColor(result.percentage)}`}>
                  {result.score}/{result.totalMarks}
                </div>
                <div className="text-xs text-gray-500 mt-1">{result.percentage}%</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer with test info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 flex justify-between">
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TestResultDownload;