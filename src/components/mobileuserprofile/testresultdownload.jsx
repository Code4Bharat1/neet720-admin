import React from 'react';
import * as XLSX from 'xlsx';

const TestResultDownloadmobile = () => {
  const testResults = [
    { name: 'Ayaan Raje', score: '230/240', icon: '🌐' },
    { name: 'Muskan Shaikh', score: '240/240', icon: '🧑‍🏫' },
    { name: 'Tanvi Sawant', score: '210/240', icon: '👩‍🏫' },
    { name: 'Wajiha Jafri', score: '200/240', icon: '💬' },
  ];

  const downloadExcel = () => {
    // Prepare data for download
    const data = testResults.map(result => ({
      Name: result.name,
      Score: result.score,
    }));

    // Create a new workbook and sheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

    // Write file
    XLSX.writeFile(wb, 'test_results.xlsx');
  };

  return (
    <div className="flex mt-7 items-center justify-center pb-15">
      <div className="bg-white p-6 rounded-lg shadow-md sm:w-full w-80 mt-6">
        <div className='flex justify-between'>
          <h2 className="text-xl font-bold mb-4">Last Test Result</h2>
          <button
            onClick={downloadExcel}
            className="mb-4 bg-white text-blue-500 py-2 px-4 rounded-md border border-blue-500 hover:bg-blue-500 hover:text-white sm:text-sm text-xs"
          >
            Download
          </button>
        </div>
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md sm:text-base text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">{result.icon}</span>
                <span>{result.name}</span>
              </div>
              <span>{result.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResultDownloadmobile;
