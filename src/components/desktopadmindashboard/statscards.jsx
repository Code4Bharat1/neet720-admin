"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaLayerGroup } from "react-icons/fa";

const StatsCards = () => {
  const [statsData, setStatsData] = useState({
    studentCount: { total: 0 },
    testsTaken: { total: 0 },
    batchCount: { total: 0 }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("adminAuthToken");

          if (!token) {
            console.error("Admin auth token not found.");
            return;
          }

          // Decode the JWT to extract adminId
          const payload = JSON.parse(atob(token.split(".")[1]));
          const adminId = payload.id;

          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/dashboard-details`,
            { adminId }
          );

          const result = response.data;

          setStatsData({
            studentCount: { total: result.data.totalStudents },
            testsTaken: { total: result.data.totalTests },
            batchCount: { total: result.data.totalBatches }
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    {
      id: 1,
      title: "Total Students",
      description: "Active students enrolled in the platform",
      icon: <FaUsers className="text-2xl md:text-3xl" />,
      image: "/dashboardimg1.png",
      value: statsData.studentCount.total,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50"
    },
    {
      id: 2,
      title: "Tests Taken",
      description: "Practice tests completed by students",
      icon: <FaClipboardCheck className="text-2xl md:text-3xl" />,
      image: "/dashboardimg2.png",
      value: statsData.testsTaken.total,
      color: "from-green-500 to-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50"
    },
    {
      id: 3,
      title: "Active Batches",
      description: "Current ongoing batches in system",
      icon: <FaLayerGroup className="text-2xl md:text-3xl" />,
      image: "/dashboardimg3.png",
      value: statsData.batchCount.total,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 px-4 md:px-16 lg:px-24 max-w-7xl mx-auto">
      {stats.map((item) => (
        <div
          key={item.id}
          className={`${item.bgColor} rounded-xl p-6 border border-gray-200 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${item.textColor} flex items-center gap-3`}>
              {item.icon}
              <h2 className="font-bold text-lg md:text-xl">{item.title}</h2>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <h3 className="text-gray-800 text-3xl md:text-4xl font-bold">
              {loading ? "-" : item.value.toLocaleString()}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
          </div>

          <div className="mt-4 relative h-32 overflow-hidden rounded-lg">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className={`bg-[#007AFF] inset-0 bg-gradient-to-r ${item.color} opacity-20`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
