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

const ChapterWisePerformancemobile = ({ selectedMode }) => {
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
    <div className="block mr-5 ml-5 mb-5 mt-15 sm:hidden mx-auto bg-white shadow-[1px_1px_5px_gray] rounded-lg justify-center">
      <div className="w-full p-4">

        {/* Floating (range) Bar Chart with horizontal bars */}
        <div className="w-full h-[180px] md:h-[350px]">
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
              barThickness: 20,
              borderRadius: 8,
              borderSkipped: false,
              grouped: false,
              elements: {
                bar: {
                  borderWidth: 6,
                  borderColor: "#ffffff",
                },
              },
            }}
          />
        </div>

        {/* FOOTER ROW (All in one line) */}
        <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
          <div className="text-lg w-full text-center font-semibold">Chapter wise Performance</div>

          {/* Subject pills */}
          <div className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            Physics
          </div>
          <div className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            Chemistry
          </div>
          <div className="px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            Biology
          </div>

          {/* Legend pills */}
          <div className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F93535" }} />
            Incorrect
          </div>
          <div className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#356CF9" }} />
            Correct
          </div>
          <div className="flex items-center px-3 py-1 bg-[#F2F4FE] text-[#1A1A1A] rounded-full text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F9AB35" }} />
            Skipped
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterWisePerformancemobile;
