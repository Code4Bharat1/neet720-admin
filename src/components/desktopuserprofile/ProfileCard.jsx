"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const ProfileCard = () => {
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId"); // Get studentId from localStorage

    const fetchStudentData = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/student-data`,
          { studentId } // Send studentId to the backend
        );
        setStudentData(response.data.data); // Set the student data to state
      } catch (error) {
        console.error("Error fetching student data:", error.response?.data || error.message);
      }
    };

    if (studentId) {
      fetchStudentData(); // Fetch student data only if studentId exists
    }
  }, []);

  // Provide default empty string value to inputs to avoid undefined value error
  const getValue = (value) => {
    return value ?? ""; // If value is undefined or null, return an empty string
  };

  return (
    <div className="max-w-4xl mx-auto pr-6 pl-6 pb-6 bg-white rounded-lg relative">
      {/* Profile Header */}
      <div className="flex justify-center space-x-6">
        <div className="relative -mt-12">
          {/* Red Background Circle */}
          <div className="bg-[#007AFF] inset-0 border-1 border-gray-100 shadow-lg bg-gray-100 rounded-full transform scale-100 z-0" />
          {/* Profile Image */}
          <img
            src={studentData?.profileImage || "/profilphoto.png"} // Use profileImage from API or fallback to a default image
            alt="Profile Picture"
            className="w-35 h-35 rounded-full object-cover relative z-10 drop-shadow-lg"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-6 space-y-10">
        <div className="flex space-x-10">
          <div className="w-1/2">
            <label className="block text-gray-600 font-bold">First Name</label>
            <input
              type="text"
              className="mt-1 p-3 w-full border text-white border-gray-300 font-semi italic rounded-md bg-[#007AFF]"
              value={getValue(studentData?.firstName)} // Fallback to empty string if null/undefined
              readOnly
            />
          </div>
          <div className="w-1/2">
            <label className="block text-gray-600 font-bold">Last Name</label>
            <input
              type="text"
              className="mt-1 p-3 w-full italic border text-white font-semi rounded-md bg-[#007AFF]"
              value={getValue(studentData?.lastName)} // Fallback to empty string if null/undefined
              readOnly
            />
          </div>
        </div>

        <div className="flex space-x-14">
          <div className="w-1/2">
            <label className="block text-gray-600 font-bold ">E-mail ID</label>
            <input
              type="email"
              className="mt-1 p-3 w-full border text-white border-gray-300 font-semi italic rounded-md bg-[#007AFF]"
              value={getValue(studentData?.emailAddress)} // Fallback to empty string if null/undefined
              readOnly
            />
          </div>

          <div className="w-1/2">
            <label className="block text-gray-600 font-bold">
              Phone Number
            </label>
            <input
              type="tel"
              className="mt-1 p-3 w-full border text-white border-gray-300 italic font-semi rounded-md bg-[#007AFF]"
              value={getValue(studentData?.mobileNumber)} // Fallback to empty string if null/undefined
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
