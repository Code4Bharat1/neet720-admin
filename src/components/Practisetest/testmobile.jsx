'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { CiSearch } from "react-icons/ci";
import { BsDownload } from "react-icons/bs";
import { ArrowRightCircle } from 'lucide-react';
import axios from 'axios';

export default function Practisetest() {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/practicetest/practice`);
        setStudents(response.data.results);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleStudentClick = (studentId) => {
    localStorage.setItem('studentId', studentId);
    router.push(`/desktopuserprofile`);
  };

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
      link.setAttribute('download', 'students_data.csv');
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 w-full max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative w-full sm:flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search Name, Student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-7 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
          />
          <span className="bg-[#007AFF] left-3 top-1/2 -translate-y-1/2 text-gray-500 text-3xl">
            <CiSearch />
          </span>
        </div>

        <div className="flex flex-row sm:flex-row justify-end gap-4 w-full sm:max-w-lg">
          <button className="px-3 py-3 w-fit text-sm bg-white text-gray-400 border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition active:scale-95 cursor-pointer">
            Practice Test
          </button>

          <button
            className="px-3 py-3 w-fit sm:w-2/3 bg-white text-sm text-gray-400 border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition flex items-center justify-center active:scale-95 cursor-pointer"
            onClick={downloadCSV}
          >
            Download Test <BsDownload className="ml-2 text-xl" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border-2 rounded-3xl">
        <table className="w-full border-2 border-black rounded-3xl shadow-md overflow-hidden">
          <thead className="bg-white-100 border-b border-black">
            <tr className="text-center text-sm font-bold text-[2B313E]">
              <th className="p-4 border-2 border-black border-r-white rounded-tl-lg">SR.NO</th>
              <th className="p-4 border-2 border-black border-r-white">STUDENT NAME</th>
              <th className="p-4 border-2 border-black border-r-white">STUDENT ID</th>
              <th className="p-4 border-2 border-black border-r-white">TEST NAME</th>
              <th className="p-4 border-2 border-black border-r-white">SUBJECT</th>
              <th className="p-4 border-2 border-black border-r-white">TOTAL MARKS</th>
              <th className="p-4 border-2 border-black border-r-white rounded-tr-lg">ACTIONS</th>
            </tr>
          </thead>

          <tbody className="text-center">
            {filteredStudents.map((student, index) => (
              <tr key={`${student.studentId}-${student.testName}`} className="border-b border-black hover:bg-gray-50">
                <td className="p-4 border-2 border-black font-bold">{index + 1}</td>
                <td className="p-4 border-2 border-black">
                  <button
                    className="text-black hover:text-black font-bold hover:underline cursor-pointer"
                    onClick={() => handleStudentClick(student.studentId)}
                  >
                    {student.fullName}
                  </button>
                </td>
                <td className="p-4 border-2 border-black">{student.studentId}</td>
                <td className="p-4 border-2 border-black">{student.testName}</td>
                <td className="p-4 border-2 border-black text-[#00B0FF]">{student.subject}</td>
                <td className="p-4 border-2 border-black">{student.marksObtained} / {student.totalMarks}</td>
                <td className="p-4 border-2 border-black text-center">
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
