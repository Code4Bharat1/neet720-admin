"use client";

import React, { useEffect, useState } from "react";
import { FaUserAlt, FaBuilding } from "react-icons/fa";
import { MdOutlineAutoAwesome } from "react-icons/md"; // icon for generated tests
import axios from "axios";

const StatsCarddesktop = () => {
  const [fullTestCount, setFullTestCount] = useState(0);
  const [meTestCount, setMeTestCount] = useState(0);
  const [generatedTestCount, setGeneratedTestCount] = useState(0);

  useEffect(() => {
    const fetchTestData = async () => {
      const studentId = localStorage.getItem("studentId");

      if (!studentId) return;

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-result`,
          { studentId }
        );

        const { fullTestCount, meTestCount, generatedTestCount } = response.data.data;
        console.log("Fetched test data:", response.data.data);
        setFullTestCount(fullTestCount);
        setMeTestCount(meTestCount);
        setGeneratedTestCount(generatedTestCount);
      } catch (error) {
        console.error(
          "Error fetching student test data:",
          error.response?.data || error.message
        );
      }
    };

    fetchTestData();
  }, []);

  const Card = ({ title, icon: Icon, count, bgColor, textColor }) => (
    <div
      className={`p-6 rounded-2xl flex flex-col justify-between shadow-md hover:shadow-lg transition-all duration-200 w-full`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
      <div className="flex justify-between items-center mt-4">
        <Icon className="text-4xl opacity-90" />
        <div className="px-4 py-2 bg-white/20 rounded-lg text-lg font-bold">
          {count}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top Row - Generated Test */}
      <div className="flex justify-center">
        <div className="w-full md:w-2/3">
          <Card
            title="Generated Tests"
            icon={MdOutlineAutoAwesome}
            count={generatedTestCount}
            bgColor="#10B981" // green-500
            textColor="white"
          />
        </div>
      </div>

      {/* Bottom Row - Responsive */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <Card
            title="Full Tests Given"
            icon={FaUserAlt}
            count={fullTestCount}
            bgColor="#3B82F6" // blue-500
            textColor="white"
          />
        </div>

        <div className="w-full md:w-1/2">
          <Card
            title="MeTest Given"
            icon={FaBuilding}
            count={meTestCount}
            bgColor="#FACC15" // yellow-400
            textColor="#1F2937" // gray-800
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCarddesktop;
