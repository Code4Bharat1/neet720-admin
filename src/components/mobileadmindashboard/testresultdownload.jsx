import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

const TestResultDownloadmobile = () => {
  const [testResults, setTestResults] = useState([]); // State to store the fetched test results
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling
  const [selectedMode, setSelectedMode] = useState('Practice'); // Mode state (default to 'Practice')

  // Fetch the test results based on the selected mode
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        const apiUrl =
          selectedMode === 'Practice'
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/testresult/result`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/testresult/customizedresult`;

        const response = await axios.get(apiUrl); // Fetch data based on the selected mode
        if (response.data && response.data.results) {
          const results = response.data.results.map((result) => ({
            name: result.fullName,
            score: `${result.marksObtained}/${result.totalMarks}`,
            studentId: result.studentId,
            icon: getIcon(result.studentId), // Get dynamic icon based on studentId
          }));
          setTestResults(results);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [selectedMode]); // Dependency on selectedMode to refetch when mode changes

  // Function to get the icon for each student based on studentId
  const getIcon = (studentId) => {
    return studentId % 2 === 0 ? '🌐' : '🧑‍🏫'; // Example icons based on studentId
  };

  // Function to handle the Excel download
  const downloadExcel = () => {
    const data = testResults.map((result) => ({
      Name: result.name,
      Score: result.score,
      StudentId: result.studentId,
      Icon: result.icon, // Include icon in the Excel data
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

    XLSX.writeFile(wb, 'test_results.xlsx'); // Trigger the file download
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading state
  }

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  return (
    <div className="flex mt-7 items-center justify-center pb-24">
      <div className="bg-white p-6 rounded-lg shadow-md sm:w-full w-80 mt-15">
        {/* Mode Switcher */}
        <div className="flex gap-4 items-center mb-4">
          <button
            onClick={() => setSelectedMode('Practice')}
            className={`px-4 py-2 rounded-md ${selectedMode === 'Practice' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            Practice
          </button>
          <button
            onClick={() => setSelectedMode('Customize')}
            className={`px-4 py-2 rounded-md ${selectedMode === 'Customize' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            Customize
          </button>
        </div>

        {/* Title and Download Button */}
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Last Test Result</h2>
          <button
            onClick={downloadExcel}
            className="mb-4 bg-white text-blue-500 py-2 px-4 rounded-md border border-blue-500 hover:bg-blue-500 hover:text-white sm:text-sm text-xs"
          >
            Download
          </button>
        </div>

        {/* Displaying the test results */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md sm:text-base text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.icon}</span> {/* Displaying Icon */}
                <span>{result.name}</span> {/* Displaying Full Name */}
              </div>
              <span>{result.score}</span> {/* Displaying Score (Obtained Marks / Total Marks) */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResultDownloadmobile;
