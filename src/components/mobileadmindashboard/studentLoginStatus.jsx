"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import axios from 'axios';

const StudentActivityCardmobile = () => {
  const [studentData, setStudentData] = useState({ studentCount: 0, studentProfiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false); // State to handle showing more profiles

  // Define a set of letters to display as initials
  const initialsSet = ["P", "R", "S", "V", "T"];

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/logout/studentslogged`);
        const data = response.data;

        if (data.success) {
          setStudentData({
            studentCount: data.data.studentCount,
            studentProfiles: data.data.studentProfiles,
          });
        }
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const circleColors = [
    "bg-[#6B4F3A]", "bg-green-800", "bg-violet-800", "bg-green-800", "bg-[#6B4F3A]",
    "bg-red-500", "bg-blue-400", "bg-purple-600", "bg-orange-400", "bg-yellow-600"
  ]; // Define additional colors for cycling

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const profilesToDisplay = showMore ? studentData.studentProfiles : studentData.studentProfiles.slice(0, 5);

  return (
    <div
      className="relative p-6 shadow-lg w-[24rem] max-w-full mx-auto mt-8 bg-[#F54E60]"
      style={{ backgroundImage: `url('/Vector 1.svg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <h2 className="text-gray-100 text-2xl font-semibold mb-16">
        Students That Have Not Logged In Since Last 7 Days
      </h2>

      <div className="flex items-center justify-between">
        <div className="bg-[#007AFF] top-16 mt-10 shadow-lg flex items-center bg-white p-2 rounded-sm translate-y-1/2">
          {profilesToDisplay.map((profile, index) => {
            const randomLetter = initialsSet[index % initialsSet.length]; // Get letter for initials
            const circleColor = circleColors[index % circleColors.length]; // Cycle through colors dynamically
            return (
              <span
                key={index}
                className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-lg font-semibold z-[${index}] -ml-4 first:ml-0 ${circleColor}`}
                style={{ backgroundImage: profile.profileImage ? `url(${profile.profileImage})` : "none", backgroundSize: 'cover' }}
              >
                {/* Display a letter if no profile image */}
                {!profile.profileImage && randomLetter}
              </span>
            );
          })}
        </div>

        <div className="bg-[#007AFF] right-5 top-24 flex items-center space-x-4 bg-[#E1F0FF] p-4 rounded-lg shadow-md transform translate-y-1/2">
          <span className="text-blue-500 text-5xl"><AiOutlineUserAdd /></span>
          <div className="flex flex-col">
            <h3 className="text-3xl font-semibold text-gray-800">{studentData.studentCount}</h3>
            <h3 className="text-sm font-semi text-gray-800">Students</h3>
          </div>
        </div>
      </div>

      {/* Show the "See More" button if there are more than 5 profiles */}
      {studentData.studentProfiles.length > 5 && (
        <div className="bg-[#007AFF] top-48 right-5">
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-white font-semibold"
          >
            {showMore ? "Show Less" : `+${studentData.studentCount - 5} More`}
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentActivityCardmobile;
