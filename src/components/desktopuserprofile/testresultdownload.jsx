"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { FileText, Download, ChevronDown, File, Award, TrendingDown, Clock, Star, BarChart, AlertTriangle } from 'lucide-react';

const TestResultDownload = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [downloadType, setDownloadType] = useState(null);
  const [activeView, setActiveView] = useState('all'); // 'all', 'top', 'low'
  const menuRef = useRef(null);
  
  useEffect(() => {
    const fetchTestResults = async () => {
      const studentId = localStorage.getItem("studentId"); // Get studentId from localStorage

      if (!studentId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-result`, // Your endpoint
          { studentId } // Send studentId to the backend
        );

        const fullTestResults = response.data.data.fullTestResults || [];
        const meTestResults = response.data.data.resultsWithTotalMarks || [];

        // Combine fullTestResults and meTestResults if necessary
        setTestResults([...fullTestResults, ...meTestResults]);
      } catch (error) {
        console.error("Error fetching test results:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults(); // Fetch data when the component mounts
    
    // Click outside to close menu
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to download the results in Excel format
  const downloadExcel = () => {
    // Prepare data for download
    const data = testResults.map((result) => ({
      TestName: result.testName,
      MarksObtained: result.marksObtained,
      TotalMarks: result.totalMarks,
      Percentage: `${((result.marksObtained / result.totalMarks) * 100).toFixed(1)}%`,
      Status: result.marksObtained < 0 ? 'Negative' : 
        (result.marksObtained / result.totalMarks) >= 0.8 ? 'Excellent' :
        (result.marksObtained / result.totalMarks) >= 0.6 ? 'Good' :
        (result.marksObtained / result.totalMarks) >= 0.4 ? 'Average' : 'Needs Improvement'
    }));

    // Create a new workbook and sheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

    // Write file
    XLSX.writeFile(wb, 'test_results.xlsx');
    
    setIsMenuOpen(false);
    setDownloadType('excel');
    
    // Reset download type after animation
    setTimeout(() => setDownloadType(null), 2000);
  };
  
  // Function to download as PDF
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
        <title>Test Results</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; }
          h1 { color: #2563eb; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { background-color: #2563eb; color: white; text-align: left; padding: 10px; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .negative { color: #ef4444; font-weight: bold; }
          .excellent { color: #10b981; }
          .good { color: #3b82f6; }
          .average { color: #f59e0b; }
          .poor { color: #ef4444; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Test Results</h1>
        <table>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Marks</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add data rows
    testResults.forEach(result => {
      const percentage = (result.marksObtained / result.totalMarks) * 100;
      let performanceClass = '';
      let performanceText = '';
      
      if (result.marksObtained < 0) {
        performanceClass = 'negative';
        performanceText = 'Negative';
      } else if (percentage >= 80) {
        performanceClass = 'excellent';
        performanceText = 'Excellent';
      } else if (percentage >= 60) {
        performanceClass = 'good';
        performanceText = 'Good';
      } else if (percentage >= 40) {
        performanceClass = 'average';
        performanceText = 'Average';
      } else {
        performanceClass = 'poor';
        performanceText = 'Needs Improvement';
      }
      
      htmlContent += `
        <tr>
          <td>${result.testName}</td>
          <td>${result.marksObtained}/${result.totalMarks}</td>
          <td class="${performanceClass}">${performanceText}</td>
        </tr>
      `;
    });
    
    // Close table and add footer
    htmlContent += `
          </tbody>
        </table>
        <div class="footer">
          Downloaded on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
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
    
    setIsMenuOpen(false);
    setDownloadType('pdf');
    
    // Reset download type after animation
    setTimeout(() => setDownloadType(null), 2000);
  };
  
  // Calculate percentage for progress bars
  const calculatePercentage = (obtained, total) => {
    return (obtained / total) * 100;
  };
  
  // Get sorted results for different views
  const getSortedResults = () => {
    if (activeView === 'all') return testResults;
    
    const sortedResults = [...testResults].sort((a, b) => {
      const percentageA = (a.marksObtained / a.totalMarks);
      const percentageB = (b.marksObtained / b.totalMarks);
      return activeView === 'top' ? percentageB - percentageA : percentageA - percentageB;
    });
    
    return sortedResults.slice(0, 3); // Return top/bottom 3
  };
  
  // Calculate statistics
  const getStatistics = () => {
    if (!testResults.length) return { avg: 0, top: 0, low: 0, negativeCount: 0, excellentCount: 0 };
    
    let sum = 0;
    let top = -Infinity;
    let low = Infinity;
    let negativeCount = 0;
    let excellentCount = 0;
    
    testResults.forEach(result => {
      const percentage = (result.marksObtained / result.totalMarks) * 100;
      sum += percentage;
      
      if (percentage > top) top = percentage;
      if (percentage < low) low = percentage;
      
      if (result.marksObtained < 0) negativeCount++;
      if (percentage >= 80) excellentCount++;
    });
    
    return {
      avg: (sum / testResults.length).toFixed(1),
      top: top.toFixed(1),
      low: low.toFixed(1),
      negativeCount,
      excellentCount
    };
  };
  
  const stats = getStatistics();
  const sortedResults = getSortedResults();
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-auto w-full max-w-[500px] h-[420px] relative">
      <div className='flex justify-between items-center mb-4'>
        <h2 className="text-xl font-bold text-gray-800">Last Test Results</h2>
        
        {/* Dropdown menu for download options */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 py-1">
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4 text-green-600" />
                <span>Download as Excel</span>
              </button>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                <File className="h-4 w-4 text-red-600" />
                <span>Download as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      {!loading && testResults.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="bg-blue-50 rounded-lg p-2 flex items-center gap-2 flex-1 min-w-[100px] border border-blue-100">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <BarChart className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-blue-600">Average</div>
              <div className="font-bold text-blue-800">{stats.avg}%</div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-2 flex items-center gap-2 flex-1 min-w-[100px] border border-green-100">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-green-600">Top Score</div>
              <div className="font-bold text-green-800">{stats.top}%</div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-2 flex items-center gap-2 flex-1 min-w-[100px] border border-red-100">
            <div className="bg-red-100 p-1.5 rounded-full">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-red-600">Lowest</div>
              <div className="font-bold text-red-800">{stats.low}%</div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Selector */}
      {!loading && testResults.length > 0 && (
        <div className="flex mb-4 bg-gray-100 p-1 rounded-md">
          <button
            onClick={() => setActiveView('all')}
            className={`flex-1 py-1.5 text-sm font-medium rounded ${
              activeView === 'all' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
            }`}
          >
            All Tests
          </button>
          <button
            onClick={() => setActiveView('top')}
            className={`flex-1 py-1.5 text-sm font-medium rounded ${
              activeView === 'top' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'
            }`}
          >
            Top Scores
          </button>
          <button
            onClick={() => setActiveView('low')}
            className={`flex-1 py-1.5 text-sm font-medium rounded ${
              activeView === 'low' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'
            }`}
          >
            Needs Work
          </button>
        </div>
      )}
      
      {/* Download notification */}
      {downloadType && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-2 rounded shadow-lg z-20">
          {downloadType === 'excel' ? 'Excel file downloaded!' : 'PDF file prepared!'}
        </div>
      )}
      
      <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100% - 190px)' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500">Loading your results...</p>
          </div>
        ) : testResults.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>No test results available yet.</p>
          </div>
        ) : (
          sortedResults.map((result, index) => {
            const percentage = calculatePercentage(result.marksObtained, result.totalMarks);
            const isNegative = result.marksObtained < 0;
            
            // Determine performance level and associated styles
            let performanceIcon = null;
            let performanceBadge = null;
            
            if (isNegative) {
              performanceIcon = <AlertTriangle className="h-5 w-5 text-red-500" />;
              performanceBadge = <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Negative</span>;
            } else if (percentage >= 80) {
              performanceIcon = <Star className="h-5 w-5 text-yellow-500" />;
              performanceBadge = <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Excellent</span>;
            } else if (percentage >= 60) {
              performanceIcon = <Award className="h-5 w-5 text-blue-500" />;
              performanceBadge = <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Good</span>;
            } else if (percentage >= 40) {
              performanceIcon = <Clock className="h-5 w-5 text-yellow-500" />;
              performanceBadge = <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Average</span>;
            } else {
              performanceIcon = <TrendingDown className="h-5 w-5 text-red-500" />;
              performanceBadge = <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Needs Work</span>;
            }
            
            return (
              <div 
                key={index} 
                className={`transition-all hover:shadow-md p-3 rounded-lg border ${
                  isNegative 
                    ? 'bg-red-50 border-red-200'
                    : percentage >= 80
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {performanceIcon}
                    <h3 className="font-medium text-gray-800">{result.testName}</h3>
                  </div>
                  <div className={`text-sm font-semibold px-2 py-1 rounded ${
                    isNegative 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {result.marksObtained}/{result.totalMarks}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">
                    {isNegative 
                      ? 'Negative marks' 
                      : `${percentage.toFixed(1)}% score`}
                  </div>
                  {performanceBadge}
                </div>
                
                {/* Progress bar - only show if not negative */}
                {!isNegative && (
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        percentage > 80 
                          ? 'bg-green-500' 
                          : percentage > 60 
                            ? 'bg-blue-500' 
                            : percentage > 40 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Summary Footer */}
      {!loading && testResults.length > 0 && (
        <div className="mt-4 pt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs text-gray-500">
            <span>{testResults.length} Test Results</span>
            {stats.excellentCount > 0 && <span>{stats.excellentCount} Excellent Scores</span>}
            {stats.negativeCount > 0 && <span>{stats.negativeCount} Negative Scores</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultDownload;
