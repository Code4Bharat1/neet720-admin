"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

// Data for Practice and Customized modes
const practiceData = {
  title: "Subject Wise Performance",
  chartData: {
    labels: ["Zoology", "Chemistry", "Physics", "Bootany"],
    datasets: [
      {
        data: [90, 80, 75, 95],
        backgroundColor: ["#3b82f6", "#34d399", "#8b5cf6", "#9333ea"], // Colors for each section
        borderColor: ["#2563eb", "#10b981", "#6b21a8", "#6b21a8"], // Border colors
        borderWidth: 1,
      },
    ],
  },
};

const customizedData = {
  title: "Customized Subject Wise Performance",
  chartData: {
    labels: ["Mathematics", "Physics", "Chemistry", "Biology"],
    datasets: [
      {
        data: [10, 30, 45, 25],
        backgroundColor: ["#3b82f6", "#34d399", "#8b5cf6", "#9333ea"], // Colors for each section
        borderColor: ["#2563eb", "#10b981", "#6b21a8", "#6b21a8"], // Border colors
        borderWidth: 1,
      },
    ],
  },
};

const ModeSwitcherChartMobile = ({ selectedMode }) => {
  // Determine which data to show based on the selected mode
  const selectedData = selectedMode === "Practice" ? practiceData : customizedData;

  return (
    <div className="flex flex-col items-center space-y-4 my-6 px-6 w-full pb-24">
      {/* Title */}
      <h2 className="text-lg w-full font-semibold text-center">{selectedData.title}</h2>

      {/* Pie Chart */}
      <div className="w-60 h-60">
        <Pie data={selectedData.chartData} />
      </div>

      {/* Labels for Subjects */}
      <div className="flex flex-wrap justify-center space-x-4 space-y-2">
        {selectedData.chartData.labels.map((label, index) => (
          <div key={index} className="flex items-center bg-[#F2F4FE] p-2 rounded-xl shadow-md">
            <div
              className={`w-4 h-4 rounded-full ${index === 0 ? "bg-blue-500" : index === 1 ? "bg-green-500" : index === 2 ? "bg-purple-500" : "bg-pink-500"}`}
            />
            <span className="ml-2 text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSwitcherChartMobile;
