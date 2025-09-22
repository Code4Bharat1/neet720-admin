"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, User } from "lucide-react";

const ProfileCard = () => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");

    const fetchStudentData = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/student-data`,
          { studentId }
        );
        setStudentData(response.data.data);
      } catch (error) {
        console.error("Error fetching student data:", error.response?.data || error.message);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, []);

  const getValue = (value) => value ?? "";

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white shadow-md rounded-2xl border border-gray-200">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={studentData?.profileImage || "/profilphoto.png"}
            alt="Profile Picture"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#007AFF] shadow-md"
          />
        </div>
        <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-800">
          {getValue(studentData?.firstName)} {getValue(studentData?.lastName)}
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm italic">Student Profile</p>
      </div>

      {/* Profile Info */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-1">
            First Name
          </label>
          <div className="flex items-center gap-2 bg-[#007AFF] text-white p-2 sm:p-3 rounded-md shadow-sm text-sm sm:text-base">
            <User size={16} className="sm:w-5 sm:h-5" />
            <span className="truncate">{getValue(studentData?.firstName)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-1">
            Last Name
          </label>
          <div className="flex items-center gap-2 bg-[#007AFF] text-white p-2 sm:p-3 rounded-md shadow-sm text-sm sm:text-base">
            <User size={16} className="sm:w-5 sm:h-5" />
            <span className="truncate">{getValue(studentData?.lastName)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-1">
            Email ID
          </label>
          <div className="flex items-center gap-2 bg-[#007AFF] text-white p-2 sm:p-3 rounded-md shadow-sm text-sm sm:text-base break-words">
            <Mail size={16} className="sm:w-5 sm:h-5" />
            <span className="break-all">{getValue(studentData?.emailAddress)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm text-gray-600 font-medium mb-1">
            Phone Number
          </label>
          <div className="flex items-center gap-2 bg-[#007AFF] text-white p-2 sm:p-3 rounded-md shadow-sm text-sm sm:text-base">
            <Phone size={16} className="sm:w-5 sm:h-5" />
            <span>{getValue(studentData?.mobileNumber)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
