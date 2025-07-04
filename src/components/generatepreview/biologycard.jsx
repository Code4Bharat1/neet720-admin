"use client";
import React, { useEffect, useState } from "react";

const BiologyCard = () => {
  const [chapterData, setChapterData] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);

  useEffect(() => {
    const storedBiology = localStorage.getItem("Biology");
    if (storedBiology) {
      const parsedData = JSON.parse(storedBiology);
      setChapterData(parsedData);

      const questionCount = parsedData.reduce((acc, chapter) => acc + chapter.numQuestions, 0);
      setTotalQuestions(questionCount);
      setTotalMarks(questionCount * 4);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#B1CEFB] to-[#9AC0FA] shadow-lg rounded-2xl w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-5 border-b border-blue-200">
        <div className="bg-white p-3 rounded-full shadow-md mr-4">
          <img src="/botany.png" alt="Biology Icon" className="w-10 h-10" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Biology</h2>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
              Questions: {totalQuestions}
            </div>
            <div className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-sm">
              Marks: {totalMarks}
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Table */}
      <div className="bg-white m-4 rounded-xl overflow-hidden shadow-sm">
        <h3 className="text-xl font-semibold px-4 py-3 bg-gray-50 border-b border-gray-100">
          Selected Chapters
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="px-4 py-3 text-left font-medium w-16">Sr.No</th>
                <th className="px-4 py-3 text-left font-medium">Chapter Name</th>
                <th className="px-4 py-3 text-center font-medium w-24">Questions</th>
              </tr>
            </thead>
            <tbody>
              {chapterData.map((chapter, index) => (
                <tr 
                  key={index} 
                  className={`border-t border-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-blue-50"}`}
                >
                  <td className="px-4 py-3 text-gray-800">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-800">{chapter.chapterName}</td>
                  <td className="px-4 py-3 text-center font-medium text-blue-600">{chapter.numQuestions}</td>
                </tr>
              ))}
              {chapterData.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    No chapters selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BiologyCard;