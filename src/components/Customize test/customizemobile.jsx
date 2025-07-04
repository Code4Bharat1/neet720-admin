"use client";
import React, { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import { useRouter } from 'next/navigation';
import { ArrowRightCircle } from 'lucide-react'; // Arrow icon

import axios from 'axios';  // Axios for fetching data

export default function StudentTestTable() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search query
  const [totalTest, setTotalTest] = useState(0);
  const [filterType, setFilterType] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false); // Show filter options
  const router = useRouter(); // Router for navigation

  // Fetch student data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/generatetest/customize`, {
          params: { filterType, studentId: searchTerm }
        });

        setStudents(response.data.results); // Set the student data
        setTotalTest(response.data.results.length); // Set total test count
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    fetchData();
  }, [searchTerm, filterType]);

  // Filter students based on search query (ID or Name)
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(searchLower) ||  // Filter by full name
      String(student.studentId).toLowerCase().includes(searchLower) // Filter by student ID
    );
  });

  // Function to download student data as CSV
  const downloadCSV = () => {
    const headers = ['SR.NO', 'STUDENT NAME', 'STUDENT ID', 'TEST NAME', 'SUBJECTS', 'SCORE', 'TOTAL MARKS'];
    const rows = students.map((student, index) => [
      index + 1,
      student.fullName,
      student.studentId,
      student.testName,
      (student.subjects || []).join(", "),
      student.score,
      student.totalMarks
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'students_data.csv');
    link.click();
  };

  // Function to handle student name click to route to the student details page
  const handleStudentClick = (studentId) => {
    localStorage.setItem('studentId', studentId); // Store studentId in localStorage
    router.push(`/desktopuserprofile`); // Route to the student's profile page
  };

  // Toggle filter options visibility
  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  return (
    <div className="py-6 w-full mx-auto px-4 lg:px-6">
      {/* Search & Buttons Section */}
      <div className="flex lg:flex-row flex-col justify-between items-center gap-5 mb-6 w-full mt-2">
        <div className="relative flex-1 w-full max-w-full">
          <input
            type="text"
            placeholder="Search Name, Student ID..."
            className="lg:w-full w-[400px] pr-7 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md text-sm placeholder:text-gray-500 pl-19"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search query
          />
          <span className="bg-[#007AFF] left-6 top-1/2 -translate-y-1/2 text-gray-500 text-4xl">
            <CiSearch />
          </span>
        </div>
        <div className="flex justify-end lg:w-fit w-full gap-2 px-6 mt-4 lg:mt-0">
          <button className="lg:w-64 w-full lg:px-6 lg:py-3 px-4 py-3 bg-white text-gray-400 border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition active:scale-95 ml-[-11px]">
            Customized Test
          </button>
          <button
            onClick={downloadCSV}
            className="lg:w-64 w-full lg:px-6 lg:py-3 px-4 py-3 bg-white text-gray-400 border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition flex items-center active:scale-95"
          >
            Download Test <BsDownload className="ml-2 text-xl" />
          </button>
        </div>
      </div>

      {/* Filter Bar with Boxed Stats */}
      <div className="lg:flex grid grid-cols-2 lg:flex-wrap gap-2 mb-6 p-3 bg-white rounded-lg drop-shadow hover:bg-white-100 w-full max-w-6xl mx-auto lg:justify-between">
        {[ 
          `Total Test: ${totalTest}`,
          `Highest Marks: 180`, // You can update this dynamically if needed
          `Physics Test: 8`,
          `Chemistry Test: 8`
        ].map((item, index) => (
          <div key={index} className="px-6 py-2 min-w-[150px] bg-White-500 border border-gray-300 shadow text-base font-Regular text-center text-gray">
            {item}
          </div>
        ))}
        <button
          onClick={toggleFilterOptions}
          className="px-6 py-2 bg-white border border-gray-300 shadow hover:bg-gray-100 flex items-center justify-center transition active:scale-95"
        >
          <FiFilter className="text-xl text-gray-700" /> <span className="ml-2">Filter</span>
        </button>

        {/* Filter Options Dropdown */}
        {showFilterOptions && (
          <div className="bg-[#007AFF] bg-white shadow-lg rounded-lg mt-2 w-48 p-2 border border-gray-300 right-0">
            <button
              onClick={() => {/* Add filter logic */}}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
            >
              Filter Option 1
            </button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="border-2 overflow-x-auto rounded-xl lg:rounded-4xl w-full mx-auto">
        <table className="w-full border border-black shadow-md overflow-x-auto">
          <thead className="bg-white-100 border-b rounded-xl">
            <tr className="text-center text-sm font-bold text-[2B313E]">
              <th className="p-4 border border-r-white rounded-tl-lg">SR.NO</th>
              <th className="p-4 border border-r-white">STUDENT NAME</th>
              <th className="p-4 border border-r-white">STUDENT ID</th>
              <th className="p-4 border border-r-white">TEST NAME</th>
              <th className="p-4 border border-r-white">SUBJECTS</th>
              <th className="p-4 border border-r-white">SCORE</th>
              <th className="p-4 border border-r-white">TOTAL MARKS</th>
              <th className="p-4 border border-r-white">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-center"> 
            {filteredStudents.map((student, index) => (
              <tr key={`${student.studentId}-${student.testName}`} className="border-b hover:bg-gray-50">
                <td className="p-4 border text-left font-bold">{index + 1}</td>
                <td className="p-4 border">{student.fullName}</td>
                <td className="p-4 border">{student.studentId}</td>
                <td className="p-4 border">{student.testName}</td>
                <td className="p-4 border-b border-black text-[#00B0FF]">{(student.subjects || []).join(", ")}</td>
                <td className="p-4 border-l-1">{student.score}</td>
                <td className="p-4 border-l-1">{student.totalMarks}</td>
                <td className="p-4 border text-center">
                  <button
                    className="text-black hover:text-black font-bold"
                    onClick={() => handleStudentClick(student.studentId)}  
                  >
                    <ArrowRightCircle size={24} strokeWidth={3.5} />
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
