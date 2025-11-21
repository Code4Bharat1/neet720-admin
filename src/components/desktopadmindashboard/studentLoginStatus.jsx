"use client"
import React, { useState, useEffect } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaDownload, FaExclamationTriangle, FaEye, FaEyeSlash } from "react-icons/fa";
import * as XLSX from 'xlsx';

const StudentActivityCard = () => {
  const [studentData, setStudentData] = useState({ studentCount: 0, studentProfiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const initialsSet = ["P", "R", "S", "V", "T", "A", "B", "C", "D", "E"];

 useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminAuthToken");

      if (!token) {
        setError("Unauthorized: Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/logout/studentslogged`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,  // 🔥 IMPORTANT
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStudentData({
          studentCount: data.data.studentCount,
          studentProfiles: data.data.studentProfiles,
        });
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }

      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch data: " + error.message);
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const circleColors = [
    "bg-red-500", "bg-blue-600", "bg-green-600", "bg-yellow-500", "bg-purple-600",
    "bg-pink-500", "bg-indigo-600", "bg-teal-500", "bg-orange-500", "bg-cyan-600"
  ];

  const downloadExcel = () => {
    setDownloadLoading(true);
    try {
      const data = studentData.studentProfiles.map((profile) => ({
        "Student ID": profile.studentId || "N/A",
        "Name": profile.fullName || "N/A",
        "Email": profile.email || "N/A",
        "Last Login Date": profile.lastLoginDate || "Never",
        "Days Inactive": profile.daysInactive || "N/A",
        "Batch": profile.batchName || "N/A"
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inactive Students");

      const date = new Date().toISOString().split('T')[0];
      const filename = `inactive_students_${date}.xlsx`;

      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error("Failed to download Excel:", err);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative p-6 shadow-lg w-full sm:w-[30rem] max-w-4xl mx-auto mt-8 bg-white rounded-xl flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative p-6 shadow-lg w-full sm:w-[30rem] max-w-4xl mx-auto mt-8 bg-red-50 rounded-xl">
        <div className="flex items-center justify-center flex-col gap-3 text-red-500 py-6">
          <FaExclamationTriangle className="text-4xl" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Show "Everyone is Active" message when no inactive students
  if (studentData.studentCount === 0) {
    return (
      <div className="relative p-6 shadow-lg w-full sm:w-[30rem] max-w-4xl mx-auto mt-8 bg-green-50 rounded-xl">
        <div className="flex items-center justify-center flex-col gap-3 text-green-600 py-6">
          <h2 className="text-2xl font-bold">🎉 Everyone is Active!</h2>
          <p className="text-md">No inactive students found in the last 7 days.</p>
        </div>
      </div>
    );
  }

  const profilesToDisplay = showMore ? studentData.studentProfiles : studentData.studentProfiles.slice(0, 10);
  const remainingProfiles = studentData.studentProfiles.length - 10;

  return (
    <div className="relative p-6 shadow-lg w-full sm:w-[30rem] max-w-4xl mx-auto mt-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl overflow-hidden min-h-[20rem] --z50">
      <div className="absolute inset-0 opacity-10 -z0"
        style={{ backgroundImage: `url('/Vector 1.svg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      </div>

      <div className="flex justify-between items-start mb-8 relative --z50">
        <h2 className="text-white text-2xl font-bold">
          Inactive Students
          <p className="text-white text-sm font-normal opacity-80 mt-1">Not logged in for last 7 days</p>
        </h2>

        <button
          onClick={downloadExcel}
          disabled={downloadLoading}
          className="bg-white hover:bg-red-50 text-red-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          {downloadLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
          ) : (
            <FaDownload />
          )}
          <span className="font-medium">Export</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center relative --z10 bg-white p-3 rounded-xl shadow-inner">
        {profilesToDisplay.map((profile, index) => {
          const randomLetter = initialsSet[index % initialsSet.length];
          const circleColor = circleColors[index % circleColors.length];
          return (
            <div
              key={index}
              className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-lg font-semibold border-2 border-white ${circleColor} relative group`}
              style={{ backgroundImage: profile.profileImage ? `url(${profile.profileImage})` : "none", backgroundSize: 'cover' }}
            >
              {!profile.profileImage && randomLetter}
              <div className="bg-[#007AFF] bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max text-white text-xs py-1 px-2 rounded hidden group-hover:block --z20">
                {profile.fullName || "Unknown Student"}
              </div>
            </div>
          );
        })}

        {!showMore && remainingProfiles > 0 && (
          <div
            onClick={() => setShowMore(true)}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center text-xs font-semibold border-2 border-white cursor-pointer hover:bg-gray-200 transition-all"
          >
            +{remainingProfiles}
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4 bg-white p-3 rounded-xl shadow-xl -z10 flex items-center space-x-3">
        <AiOutlineUserAdd className="text-red-500 text-2xl" />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{studentData.studentCount}</h3>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>
      </div>

      {studentData.studentProfiles.length > 10 && (
        <div className="mt-6 flex justify-center -z10 relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-black cursor-pointer px-4 py-2 rounded-full transition-all shadow-md"
          >
            {showMore ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            <span>{showMore ? "Show Less" : "View All Students"}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentActivityCard;
