"use client";
import React from "react";
import { FaRegImage } from "react-icons/fa";

const StatsCardsmobile = () => {
  // Data for each card
  const stats = [
    {
      id: 1,
      title: "Student Count",
      image: "/dashboardimg1.svg",
    },
    {
      id: 2,
      title: "Practice Test Given",
      image: "/dashboardimg2.svg",
    },
    {
      id: 3,
      title: "Batch Count",
      image: "/dashboardimg3.svg",
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-4 pt-8 px-4 sm:px-4 md:px-60 drop-shadow-2xl sm:p-5 md:pt-16">
      {stats.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-sm p-3 sm:p-3 md:p-4 border border-gray-200 shadow-sm"
        >
          {/* Title */}
          <div className="flex items-center gap-2 text-gray-700 font-semibold text-[5px] sm:text-sm md:text-base">
            <FaRegImage className="text-base md:text-lg" />
            <h2>{item.title}</h2>
          </div>

          {/* Image */}
          <div className="mt-2">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-auto max-h-40 sm:max-h-52 md:max-h-52 object-contain rounded-sm"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCardsmobile;
