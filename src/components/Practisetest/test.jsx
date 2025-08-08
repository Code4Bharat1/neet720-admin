'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { CiSearch } from "react-icons/ci";
import { IoDownloadOutline, IoSchoolOutline, IoBookOutline, IoCheckmarkCircleOutline, IoArrowForward, IoFilterOutline, IoCloseOutline } from "react-icons/io5";
import { FiFileText, FiDownload } from "react-icons/fi";
import axios from 'axios';

export default function PracticeTest() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const downloadRef = useRef(null);
  const router = useRouter();


  const cleanName = (...parts) => {
  const raw = parts.map(s => (s ?? '').toString().trim()).filter(Boolean).join(' ');
  const cleaned = raw.replace(/\b(null|undefined|n\/a|na)\b/gi, '').replace(/\s+/g, ' ').trim();
  return cleaned || 'Unknown';
};

const safePct = (num, den) => {
  const n = Number(num || 0), d = Number(den || 0);
  if (!d) return 0;
  const p = Math.round((n / d) * 100);
  return Number.isFinite(p) ? p : 0;
};

  // Categories for search filter
  const searchCategories = [
    { value: "all", label: "All Categories" },
    { value: "name", label: "Student Name" },
    { value: "id", label: "Student ID" },
    { value: "test", label: "Test Name" },
    { value: "subject", label: "Subject" },
  ];

 useEffect(() => {
  const storedStudents = localStorage.getItem('studentsData');

  const sanitizeRows = (rows = []) =>
    rows.map(r => ({
      ...r,
      fullName: cleanName(r.fullName, r.firstName, r.lastName),
      // normalize common fields defensively
      studentId: r.studentId ?? r.id ?? '',
      testName: r.testName ?? '',
      subject: r.subject ?? '',
      totalMarks: Number(r.totalMarks || 0),
      marksObtained: Number(r.marksObtained || 0),
    }));

  if (storedStudents) {
    setStudents(sanitizeRows(JSON.parse(storedStudents)));
    setIsLoading(false);
    return;
  }

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/practicetest/practice`);
      const sanitized = sanitizeRows(res.data?.results || []);
      setStudents(sanitized);
      localStorage.setItem('studentsData', JSON.stringify(sanitized));
    } catch (err) {
      // If endpoint returns 404, just show zero results (no scary error)
      if (err?.response?.status === 404) {
        setStudents([]);
        localStorage.setItem('studentsData', JSON.stringify([]));
      } else {
        console.error('Error fetching student data:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchStudents();
}, []);


  // Generate search suggestions based on input and selected category
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    let suggestions = [];
    const maxSuggestions = 6;

    const addSuggestionsByField = (field, label) => {
  const values = [...new Set(
    students
      .map(student => field === 'fullName'
        ? cleanName(student.fullName)              // sanitize here
        : student[field]
      )
      .filter(value => value && value.toString().toLowerCase().includes(query))
  )];

  values.slice(0, 3).forEach(value => {
    if (!suggestions.some(s => s.value === value)) {
      suggestions.push({ value, label: `${value} (${label})`, field });
    }
  });
};


    // Add suggestions based on selected category
    if (selectedCategory === "all" || selectedCategory === "name") {
      addSuggestionsByField("fullName", "Student Name");
    }
    if (selectedCategory === "all" || selectedCategory === "id") {
      addSuggestionsByField("studentId", "ID");
    }
    if (selectedCategory === "all" || selectedCategory === "test") {
      addSuggestionsByField("testName", "Test");
    }
    if (selectedCategory === "all" || selectedCategory === "subject") {
      addSuggestionsByField("subject", "Subject");
    }

    // Limit the number of suggestions
    setSearchSuggestions(suggestions.slice(0, maxSuggestions));
  }, [searchQuery, students, selectedCategory]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef, filterRef, downloadRef]);

  // Handling student name click to route to the student details page
  const handleStudentClick = (studentId) => {
    router.push(`/desktopuserprofile`);
    localStorage.setItem("studentId", studentId);
  };

  // Function to download the student data as CSV
  const downloadCSV = () => {
    const headers = ['SR.NO', 'STUDENT NAME', 'STUDENT ID', 'TEST NAME', 'SUBJECT', 'TOTAL MARKS', 'MARKS OBTAINED'];
    const rows = students.map((student, index) => [
      index + 1,
      student.fullName,
      student.studentId,
      student.testName,
      student.subject,
      student.totalMarks,
      student.marksObtained
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'students_test_results.csv');
      link.click();
      URL.revokeObjectURL(url);
    }
    
    setShowDownloadOptions(false);
  };
  
  // Function to download the student data as PDF
  const downloadPDF = () => {
    // Create a printable document
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to download PDF');
      return;
    }
    
    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { color: #2563eb; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #2563eb; color: white; text-align: left; padding: 10px; font-size: 12px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          .subject-tag { background-color: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .student-id { color: #3b82f6; font-weight: bold; }
          .score-high { color: #16a34a; }
          .score-medium { color: #f59e0b; }
          .score-low { color: #ef4444; }
          .footer { margin-top: 30px; font-size: 11px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Student Test Results</h1>
        <table>
          <thead>
            <tr>
              <th>SR.NO</th>
              <th>STUDENT NAME</th>
              <th>STUDENT ID</th>
              <th>TEST NAME</th>
              <th>SUBJECT</th>
              <th>MARKS</th>
              <th>PERCENTAGE</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add data rows
    filteredStudents.forEach((student, index) => {
      const percentage = (student.marksObtained / student.totalMarks) * 100;
      let scoreClass = '';
      
      if (percentage >= 80) {
        scoreClass = 'score-high';
      } else if (percentage >= 60) {
        scoreClass = 'score-medium';
      } else {
        scoreClass = 'score-low';
      }
      
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${student.fullName || "N/A"}</td>
          <td class="student-id">${student.studentId || "N/A"}</td>
          <td>${student.testName || "N/A"}</td>
          <td><span class="subject-tag">${student.subject || "N/A"}</span></td>
          <td>${student.marksObtained || 0}/${student.totalMarks || 0}</td>
          <td class="${scoreClass}">${Math.round(percentage)}%</td>
        </tr>
      `;
    });
    
    // Close table and add footer
    htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Results: ${filteredStudents.length} | High Scorers: ${highScorers}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // After the content is loaded, trigger print dialog which can be saved as PDF
    printWindow.onload = function() {
      printWindow.print();
      // Some browsers may close the window after printing, some may not
    };
    
    setShowDownloadOptions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.value);
    setShowSuggestions(false);
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilterDropdown(false);
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
    setSearchSuggestions([]);
  };

 const filteredStudents = students.filter(student => {
  const q = searchQuery.toLowerCase();
  if (!q) return true;

  const name = cleanName(student.fullName).toLowerCase();
  const id = String(student.studentId || '').toLowerCase();
  const test = (student.testName || '').toLowerCase();
  const subj = (student.subject || '').toLowerCase();

  switch (selectedCategory) {
    case 'name': return name.includes(q);
    case 'id': return id.includes(q);
    case 'test': return test.includes(q);
    case 'subject': return subj.includes(q);
    case 'all':
    default:
      return name.includes(q) || id.includes(q) || test.includes(q) || subj.includes(q);
  }
});


  // Calculate statistics
  const totalTests = filteredStudents.length;
  const uniqueStudents = new Set(filteredStudents.map(student => student.studentId)).size;
  const highScorers = filteredStudents.filter(student => 
    (student.marksObtained / student.totalMarks) >= 0.8
  ).length;

  // Toggle download options
  const toggleDownloadOptions = () => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <div className="bg-white shadow-md rounded-2xl overflow-hidden">
          <button className="flex items-center justify-center gap-2 h-14 w-48 text-gray-700 text-sm py-3 px-8 font-medium transition-all hover:bg-gray-50">
            <IoBookOutline className="text-yellow-500 text-xl" />
            <span>Practice Test</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Search and Actions Row */}
        <div className="mb-6 bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar with Suggestions */}
            <div className="relative w-full md:w-2/3" ref={searchRef}>
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedCategory !== "all" ? `by ${searchCategories.find(c => c.value === selectedCategory)?.label}` : "by Name, Student ID, Test Name or Subject..."}`}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => searchQuery && setShowSuggestions(true)}
                    className="w-full h-12 pl-12 pr-10 bg-gray-50 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700"
                  />
                  {searchQuery && (
                    <button 
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <IoCloseOutline className="text-xl" />
                    </button>
                  )}
                </div>
                
                {/* Filter Button */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="h-12 px-4 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <div className="flex items-center gap-1">
                      <IoFilterOutline className="text-gray-500" />
                      <span className="text-sm text-gray-600 hidden sm:inline">
                        {searchCategories.find(c => c.value === selectedCategory)?.label}
                      </span>
                    </div>
                  </button>
                  
                  {/* Filter Dropdown */}
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200 py-1 animate-fade-in">
                      {searchCategories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => handleCategoryChange(category.value)}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                            selectedCategory === category.value ? 'text-yellow-600 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-1 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <CiSearch className="text-gray-400 mr-2" />
                      <div>
                        <span className="text-gray-800 mr-1">{suggestion.value}</span>
                        <span className="text-xs text-gray-500">in {suggestion.field === "fullName" ? "Name" : suggestion.field === "studentId" ? "ID" : suggestion.field === "testName" ? "Test" : "Subject"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Dropdown Button */}
            <div className="w-full md:w-auto" ref={downloadRef}>
              <div className="relative">
                <button
                  onClick={toggleDownloadOptions}
                  className="w-full md:w-auto bg-blue-500 text-white h-12 px-6 rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <IoDownloadOutline className="text-lg" />
                  <span className="font-medium">Download</span>
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${showDownloadOptions ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {/* Download Options Dropdown */}
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-1 animate-fade-in">
                    <button
                      onClick={downloadCSV}
                      className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      <FiDownload className="text-green-600 mr-3" />
                      <span>Download Excel</span>
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      <FiFileText className="text-red-600 mr-3" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Tests Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoBookOutline className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Tests</p>
                <h3 className="text-2xl font-bold text-gray-800">{totalTests}</h3>
                <p className="text-xs text-gray-500 mt-1">Practice tests completed</p>
              </div>
            </div>
            <div className="h-1 bg-blue-500"></div>
          </div>

          {/* Students Count Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoSchoolOutline className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-800">{uniqueStudents}</h3>
                <p className="text-xs text-gray-500 mt-1">Students who took tests</p>
              </div>
            </div>
            <div className="h-1 bg-yellow-500"></div>
          </div>

          {/* High Scorers Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoCheckmarkCircleOutline className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">High Scorers</p>
                <h3 className="text-2xl font-bold text-gray-800">{highScorers}</h3>
                <p className="text-xs text-gray-500 mt-1">Students with 80%+ score</p>
              </div>
            </div>
            <div className="h-1 bg-green-500"></div>
          </div>
        </div>

        {/* Test Results Table */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Test Results</h2>
            <span className="text-sm text-gray-500">Showing {filteredStudents.length} of {students.length} results</span>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mb-2"></div>
              <p>Loading test results...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b-2 border-gray-200 uppercase text-xs font-semibold tracking-wider">
                    <th className="py-4 px-4 text-left border-r border-gray-200">#</th>
                    <th className="py-4 px-4 text-left border-r border-gray-200">Student Name</th>
                    <th className="py-4 px-4 text-left border-r border-gray-200">Student ID</th>
                    <th className="py-4 px-4 text-left border-r border-gray-200">Test Name</th>
                    <th className="py-4 px-4 text-left border-r border-gray-200">Subject</th>
                    <th className="py-4 px-4 text-center border-r border-gray-200">Marks</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr key={`${student.studentId}-${student.testName}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-800 font-medium border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium border-r border-gray-200">
                          {cleanName(student.fullName)}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-medium">
                            {student.studentId || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          {student.testName || "N/A"}
                        </td>
                        <td className="py-3 px-4 border-r border-gray-200">
                          <span className="bg-teal-50 text-teal-700 py-1 px-3 rounded-full text-xs font-medium">
                            {student.subject || "N/A"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center border-r border-gray-200">
                          <div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-1">
                            <div 
                              className={`h-2.5 rounded-full ${
                                (student.marksObtained / student.totalMarks) >= 0.8 
                                  ? 'bg-green-500' 
                                  : (student.marksObtained / student.totalMarks) >= 0.6 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${(student.marksObtained / student.totalMarks) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">
                            {student.marksObtained || 0} / {student.totalMarks || 0}
                            {' '}
                            <span className="text-gray-500">
                              ({Math.round((student.marksObtained / student.totalMarks) * 100)}%)
                            </span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleStudentClick(student.studentId)}
                            className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors inline-flex items-center justify-center gap-1"
                            title="View Student Profile"
                          >
                            <IoArrowForward className="text-base" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <IoBookOutline className="text-gray-300 text-5xl mb-3" />
                          <p className="text-gray-500 mb-1">No matching test results found</p>
                          <p className="text-gray-400 text-xs">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}