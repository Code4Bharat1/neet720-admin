'use client';

import { CiSearch } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { FiFilter, FiFileText } from "react-icons/fi";
import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRightCircle, ChevronDown, FileText, Download } from 'lucide-react';
import axios from 'axios';

export default function StudentTestTable() {
  const [students, setStudents] = useState([]);
  const [overallSummary, setOverallSummary] = useState({
    totalPhysicsTests: 0,
    totalChemistryTests: 0,
    totalBiologyTests: 0,
    totalCount: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [stats, setStats] = useState({
    totalTests: 0,
    highestMarks: 0,
    physicsCount: 0,
    chemistryCount: 0,
    biologyCount: 0,
  });
  const [sortOrder, setSortOrder] = useState('ascending');
  const [sortType, setSortType] = useState('score');
  const [totalTest, setTotalTest] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const downloadRef = useRef(null);
  const filterRef = useRef(null);
  const router = useRouter();


  const cleanName = (...parts) => {
  const raw = parts.map(s => (s ?? '').toString().trim()).filter(Boolean).join(' ');
  const cleaned = raw.replace(/\b(null|undefined|n\/a|na)\b/gi, '').replace(/\s+/g, ' ').trim();
  return cleaned || 'Unknown';
};

const sanitizeRows = (rows = []) =>
  rows.map(r => ({
    ...r,
    fullName: cleanName(r.fullName, r.firstName, r.lastName),
    studentId: r.studentId ?? r.id ?? '',
    testName: r.testName ?? '',
    subject: r.subject ?? '',
    subjects: Array.isArray(r.subjects) ? r.subjects : [],
    totalMarks: Number(r.totalMarks || 0),
    score: Number(r.score || 0),
  }));

 useEffect(() => {
  const stored = localStorage.getItem('customTestStudentsData');
  if (stored) {
    const parsed = sanitizeRows(JSON.parse(stored));
    setStudents(parsed);
    updateStats(parsed);
    setIsLoading(false);
    return;
  }
  fetchData();
}, [filterType]);


  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterOptions(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef, downloadRef]);

 const fetchData = async () => {
  setIsLoading(true);
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/generatetest/customize`,
      { headers :{
        Authorization : `Bearer ${localStorage.getItem("adminAuthToken")}`
      } }
    );
    const fetched = sanitizeRows(res.data?.results || []);
    setStudents(fetched);
    localStorage.setItem('customTestStudentsData', JSON.stringify(fetched));
    updateStats(fetched);
  } catch (err) {
    if (err?.response?.status === 404) {
      // Treat as no data, not an error
      setStudents([]);
      updateStats([]);
      localStorage.setItem('customTestStudentsData', JSON.stringify([]));
    } else {
      console.error('Error fetching student data:', err);
    }
  } finally {
    setIsLoading(false);
  }
};


  const updateStats = (studentsData) => {
    const physicsCount = studentsData.filter(s => 
      (s.subjects || []).includes('Physics') || s.subject === 'Physics'
    ).length;
    
    const chemistryCount = studentsData.filter(s => 
      (s.subjects || []).includes('Chemistry') || s.subject === 'Chemistry'
    ).length;
    
    const biologyCount = studentsData.filter(s => 
      (s.subjects || []).includes('Biology') || s.subject === 'Biology'
    ).length;

    const totalCount = physicsCount + chemistryCount + biologyCount;
    const highestScore = studentsData.length > 0 
      ? Math.max(...studentsData.map(s => s.score || 0))
      : 0;

    setOverallSummary({
      totalPhysicsTests: physicsCount,
      totalChemistryTests: chemistryCount,
      totalBiologyTests: biologyCount,
      totalCount
    });

    setStats({
      totalTests: studentsData.length,
      highestMarks: highestScore,
      physicsCount,
      chemistryCount,
      biologyCount,
    });

    setTotalTest(studentsData.length);
  };

const sortedStudents = useMemo(() => {
  const q = searchTerm.toLowerCase();

  const filtered = students.filter((s) => {
    if (!q) return true;
    const name = cleanName(s.fullName).toLowerCase();
    const id = String(s.studentId || '').toLowerCase();
    const test = (s.testName || '').toLowerCase();
    const subj = (s.subject || '').toLowerCase();
    const subjArr = (s.subjects || []).map(x => x.toLowerCase());
    return (
      name.includes(q) ||
      id.includes(q) ||
      test.includes(q) ||
      subj.includes(q) ||
      subjArr.some(x => x.includes(q))
    );
  });

  return [...filtered].sort((a, b) => {
    if (sortType === 'score') {
      return sortOrder === 'ascending' ? a.score - b.score : b.score - a.score;
    }
    // sort by id
    const aid = Number(a.studentId) || 0;
    const bid = Number(b.studentId) || 0;
    return sortOrder === 'ascending' ? aid - bid : bid - aid;
  });
}, [students, searchTerm, sortType, sortOrder]);

  // Update totalTest when sortedStudents changes
  useEffect(() => {
    setTotalTest(sortedStudents.length);
  }, [sortedStudents]);

  const downloadCSV = () => {
  const headers = ['SR.NO', 'STUDENT NAME', 'STUDENT ID', 'TEST NAME', 'SUBJECT', 'SCORE', 'TOTAL MARKS'];
  const rows = sortedStudents.map((s, i) => [
    i + 1,
    cleanName(s.fullName),
    s.studentId,
    s.testName,
    s.subject || (s.subjects || []).join(", "),
    s.score,
    s.totalMarks
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'students_test_data.csv';
  link.click();
  setShowDownloadOptions(false);
};
  
  // Function to download as PDF
  const downloadPDF = () => {
    // Create a printable document
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to download PDF');
      return;
    }
    
    // Get subject label for table
    const getSubjectLabel = (student) => {
      if (student.subject) return student.subject;
      if (student.subjects && student.subjects.length > 0) return student.subjects.join(", ");
      return "N/A";
    };
    
    // Get performance class for scores
    const getScoreClass = (score, totalMarks) => {
      
      const percentage = (score / totalMarks) * 100;
      if (percentage >= 80) return "performance-high";
      if (percentage >= 60) return "performance-medium";
      return "performance-low";
    };
    
    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #333; }
          h1 { color: #1e40af; margin-bottom: 20px; text-align: center; }
          .summary { margin-bottom: 30px; display: flex; justify-content: space-between; }
          .summary-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; width: 30%; }
          .summary-title { font-size: 12px; color: #64748b; margin-bottom: 5px; }
          .summary-value { font-size: 18px; font-weight: bold; color: #1e3a8a; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #1e40af; color: white; text-align: left; padding: 10px; font-size: 12px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          
          .student-id { background-color: #dbeafe; color: #1e40af; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
          .subject-tag { background-color: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-size: 10px; display: inline-block; }
          
          .performance-high { color: #16a34a; font-weight: bold; }
          .performance-medium { color: #ca8a04; font-weight: bold; }
          .performance-low { color: #dc2626; font-weight: bold; }
          
          .footer { margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>Student Test Performance Report</h1>
        
        <div class="summary">
          <div class="summary-card">
            <div class="summary-title">Total Tests</div>
            <div class="summary-value">${sortedStudents.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Highest Score</div>
            <div class="summary-value">${stats.highestMarks}</div>
          </div>
          <div class="summary-card">
            <div class="summary-title">Subject Distribution</div>
            <div class="summary-value">${overallSummary.totalPhysicsTests}P / ${overallSummary.totalChemistryTests}C / ${overallSummary.totalBiologyTests}B</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Test Name</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Total Marks</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add data rows
    sortedStudents.forEach((student, index) => {
      const subjectLabel = getSubjectLabel(student);
      const scoreClass = getScoreClass(student.score, student.totalMarks);
      const percentage = ((student.score / student.totalMarks) * 100).toFixed(1);
      
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${student.fullName || "N/A"}</td>
          <td><span class="student-id">${student.studentId || "N/A"}</span></td>
          <td>${student.testName || "N/A"}</td>
          <td><span class="subject-tag">${subjectLabel}</span></td>
          <td class="${scoreClass}">${student.score || 0}</td>
          <td>${student.totalMarks || 0}</td>
          <td class="${scoreClass}">${percentage}%</td>
        </tr>
      `;
    });
    
    // Close table and add footer
    htmlContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>This report contains detailed test performance data for all students. For any questions, please contact the administration.</p>
        </div>
      </body>
      </html>
    `;
    
    // Write to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // After content is loaded, trigger print dialog which can be saved as PDF
    printWindow.onload = function() {
      printWindow.print();
      // Some browsers may close the window after printing, some may not
    };
    
    setShowDownloadOptions(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'ascending' ? 'descending' : 'ascending');
  };

  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };
  
  const toggleDownloadOptions = () => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  const handleFilterSelection = (filter) => {
    if (filter === 'low-performers') {
      setSortType('score');
      setSortOrder('ascending');
    } else if (filter === 'top-performers') {
      setSortType('score');
      setSortOrder('descending');
    } else if (filter === 'by-id') {
      setSortType('id');
      setSortOrder('ascending');
    } else if (filter === 'physics') {
      setFilterType('Physics');
    } else if (filter === 'chemistry') {
      setFilterType('Chemistry');
    } else if (filter === 'biology') {
      setFilterType('Biology');
    } else if (filter === 'all-subjects') {
      setFilterType('');
    }
    setShowFilterOptions(false);
  };

  const handleStudentClick = (studentId) => {
    router.push(`/desktopuserprofile`);
    localStorage.setItem("studentId", studentId);
  };

  const getScoreColorClass = (score, totalMarks) => {
    const percentage = (score / totalMarks) * 100;
    if (percentage >= 80) return "text-green-600 font-medium";
    if (percentage >= 60) return "text-blue-600 font-medium";
    if (percentage >= 40) return "text-orange-500 font-medium";
    return "text-red-500 font-medium";
  };

  return (
    <div className="py-6 w-full mx-auto px-4 lg:px-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 w-fit mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Student Test Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage and analyze student test performances</p>
        </div>
        
       {/* Search & Action Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        {/* Search + Refresh */}
        <div className="relative flex-1 w-full">
          <div className="flex items-center">
            <div className="relative flex-1">
              <CiSearch
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, ID, test name or subject..."
                className="w-full py-3 pl-12 pr-4 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all shadow-sm text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search students"
              />
            </div>
            <button
              onClick={fetchData}
              className="ml-3 px-5 py-3 bg-white text-gray-600 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all active:scale-95"
              aria-label="Refresh data"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Download Dropdown Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative" ref={downloadRef}>
            <button
              onClick={toggleDownloadOptions}
              className="flex-1 sm:flex-none px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center active:scale-95 font-medium"
              aria-label="Download test data"
            >
              Download <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            
            {/* Download Options Dropdown */}
            {showDownloadOptions && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200 py-1 animate-fade-in">
                <button
                  onClick={downloadCSV}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                >
                  <Download className="text-green-600 mr-3 h-4 w-4" />
                  <span>Download Excel</span>
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 text-gray-700"
                >
                  <FileText className="text-red-600 mr-3 h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total Tests", value: totalTest, icon: "📊" },
            { label: "Highest Score", value: stats.highestMarks, icon: "🏆" },
            { label: "Physics Tests", value: overallSummary.totalPhysicsTests, icon: "⚛️" },
            { label: "Chemistry Tests", value: overallSummary.totalChemistryTests, icon: "🧪" },
            { label: "Biology Tests", value: overallSummary.totalBiologyTests, icon: "🔬" }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{stat.icon}</span>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Button & Dropdown */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-700">Student Test Results</h2>
          
          <div className="relative" ref={filterRef}>
            <button
              onClick={toggleFilterOptions}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95"
              aria-expanded={showFilterOptions}
              aria-haspopup="true"
            >
              <FiFilter className="text-gray-500" /> 
              <span>Filter & Sort</span>
              <ChevronDown size={16} className={`text-gray-500 transition-transform ${showFilterOptions ? 'rotate-180' : ''}`} />
            </button>

            {showFilterOptions && (
              <div className="absolute right-0 mt-2 z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-56 py-1 overflow-hidden">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">SORT BY</div>
                <button
                  onClick={() => handleFilterSelection('low-performers')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
                >
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Low Performers First
                </button>
                <button
                  onClick={() => handleFilterSelection('top-performers')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
                >
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Top Performers First
                </button>
                <button
                  onClick={() => handleFilterSelection('by-id')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm flex items-center gap-2"
                >
                  <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                  By Student ID
                </button>

                
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No test data found</h3>
              <p className="text-gray-500 max-w-md">
                {searchTerm ? `No results matching "${searchTerm}"` : "There are no test records available at the moment"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200"> 
                  {sortedStudents.map((student, index) => (
                    <tr 
                      key={`${student.studentId}-${student.testName}-${student.subject || student.subjects?.join('-')}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{cleanName(student.fullName)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{student.studentId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{student.testName}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                          {student.subject || (student.subjects || []).join(", ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={getScoreColorClass(student.score, student.totalMarks)}>
                          {student.score}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{student.totalMarks}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          className="text-gray-700 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
  onClick={() => handleStudentClick(student.studentId)}
  aria-label={`View details for ${cleanName(student.fullName)}`}
                        >
                          <ArrowRightCircle size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Table Footer with Pagination (placeholder for future implementation) */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{sortedStudents.length}</span> of{" "}
                  <span className="font-medium">{sortedStudents.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  <button className="bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}