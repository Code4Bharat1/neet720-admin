"use client";

import React, { useEffect, useState } from "react";
import { FaUserAlt } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";
import axios from "axios";

const StatsCarddesktop = () => {
  const [fullTestCount, setFullTestCount] = useState(0);
  const [meTestCount, setMeTestCount] = useState(0);

  useEffect(() => {
    const fetchTestData = async () => {
      const studentId = localStorage.getItem("studentId"); // Get studentId from localStorage

      if (!studentId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-result`,
          { studentId } // Send studentId to the backend
        );

        const { fullTestCount, meTestCount } = response.data.data;
        // Update state with the counts
        setFullTestCount(fullTestCount);
        setMeTestCount(meTestCount);
      } catch (error) {
        console.error("Error fetching student test data:", error.response?.data || error.message);
      }
    };

    fetchTestData();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-center gap-9 items-center">

        {/* Card 1: Full Test Given */}
        <div className="bg-blue-500 p-6 rounded-xl w-1/3 flex flex-col items-center text-white"
          style={{
            backgroundImage: "url('/counter-bg1.png')", // Replace with your image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h3 className="text-sm text-start w-full font-semi">Full Tests Given</h3>
          <div className="flex justify-between mt-3 w-full">
            <FaUserAlt className="text-5xl" />
            <div className="bg-blue-400 p-3 rounded-lg text-lg">{fullTestCount}</div>
          </div>
        </div>

        {/* Card 2: MeTest Given */}
        <div className="bg-yellow-400 p-6 rounded-xl w-1/3 flex flex-col items-center text-white"
          style={{
            backgroundImage: "url('/counter-bg3.png')", // Replace with your image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h3 className="text-sm text-start w-full font-semi">MeTest Given</h3>
          <div className="flex justify-between mt-3 w-full">
            <FaBuilding className="text-5xl" />
            <div className="bg-yellow-200 p-3 rounded-lg text-lg">{meTestCount}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StatsCarddesktop;
