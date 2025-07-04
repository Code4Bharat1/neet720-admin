"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ChapterWisePerformance = ({ selectedMode }) => {
  // Define initial data for "Practice" mode
  const practiceData = {
    labels: ["02 Nov 2022", "03 Nov 2022", "04 Nov 2022", "05 Nov 2022"],
    datasets: [
      {
        label: "Incorrect",
        backgroundColor: "#F93535",
        data: [
          [0, 40], // 02 Nov
          [0, 30], // 03 Nov
          [0, 50], // 04 Nov
          [0, 20], // 05 Nov
        ],
      },
      {
        label: "Correct",
        backgroundColor: "#356CF9",
        data: [
          [40, 70], // 02 Nov
          [30, 70], // 03 Nov
          [50, 75], // 04 Nov
          [20, 60], // 05 Nov
        ],
      },
      {
        label: "Skipped",
        backgroundColor: "#F9AB35",
        data: [
          [70, 100], // 02 Nov
          [70, 100], // 03 Nov
          [75, 100], // 04 Nov
          [60, 90],  // 05 Nov
        ],
      },
    ],
  };

  // Define data for "Customized" mode
  const customizedData = {
    labels: ["02 Nov 2022", "03 Nov 2022", "04 Nov 2022", "05 Nov 2022"],
    datasets: [
      {
        label: "Incorrect",
        backgroundColor: "#F93535",
        data: [
          [0, 30],
          [0, 25],
          [0, 40],
          [0, 35],
        ],
      },
      {
        label: "Correct",
        backgroundColor: "#356CF9",
        data: [
          [30, 60],
          [25, 65],
          [40, 80],
          [35, 70],
        ],
      },
      {
        label: "Skipped",
        backgroundColor: "#F9AB35",
        data: [
          [60, 100],
          [65, 100],
          [80, 100],
          [70, 100],
        ],
      },
    ],
  };

  // We'll set up state for our chart data, switching based on selectedMode
  const [chartData, setChartData] = useState(practiceData);

  // When `selectedMode` changes, switch data accordingly
  useEffect(() => {
    if (selectedMode === "Practice") {
      setChartData(practiceData);
    } else if (selectedMode === "Customized") {
      setChartData(customizedData);
    }
  }, [selectedMode]);

  return (
    <div className="flex items-center justify-center mb-9">
      <div className="max-w-6xl p-6 bg-white shadow-lg rounded-lg mb-10">

        {/* Floating (range) Bar Chart with horizontal bars */}
        <div className="w-[50rem] h-96">
          <Bar
            data={chartData}
            options={{
              indexAxis: "y", // Horizontal bars
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                title: {
                  display: true,
                  text: "Chapter wise Performance",
                },
                tooltip: {
                  callbacks: {
                    label: (ctx) => {
                      const [start, end] = ctx.raw;
                      return `${ctx.dataset.label}: ${start} - ${end}`;
                    },
                  },
                },
              },
              scales: {
                x: {
                  min: 0,
                  max: 100,
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Percentage",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Date",
                  },
                },
              },
              barThickness: 29,
              borderRadius: 100,
              borderSkipped: false,
              grouped: false,
              elements: {
                bar: {
                  borderWidth: 8,
                  borderColor: "#ffffff",
                },
              },
            }}
          />
        </div>

        {/* FOOTER ROW (All in one line) */}
        <div className="mt-6 flex justify-center items-center gap-3">
          <span className="text-md font-semibold">Chapter wise Performance</span>

          {/* Subject pills */}
          <span className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            Physics
          </span>
          <span className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            Chemistry
          </span>
          <span className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            Biology
          </span>

          {/* Legend pills */}
          <span className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F93535" }} />
            Incorrect
          </span>
          <span className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#356CF9" }} />
            Correct
          </span>
          <span className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F9AB35" }} />
            Skipped
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChapterWisePerformance;
