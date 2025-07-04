"use client";

import React from "react";
import { FaUserAlt } from "react-icons/fa";
import { FaBuilding } from "react-icons/fa";

const StatsCardmobile = () => {
  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* This will hide the component on desktop view (md:block) and show it only on mobile view */}
      <div className="flex justify-center gap-9 items-center sm:block md:hidden">

        {/* Card 1: Practice Test Given - User Icon */}
        <div className="bg-blue-500 p-6 rounded-xl w-full sm:w-1/2 flex flex-col items-center text-white"
          style={{
            backgroundImage: "url('/counter-bg1.png')", // Replace with your image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h3 className="text-[11px] text-start w-full font-semi">Practise Tests Given</h3>
          <div className="flex justify-between items-center mt-3 w-full">
            <FaUserAlt className="text-2xl" />
            <div className="bg-blue-400 p-2 rounded-lg text-sm">32</div>
          </div>
        </div>

        {/* Card 2: Practice Test Given - Building Icon */}
        <div className="bg-yellow-400 p-6 rounded-xl w-full sm:w-1/2 flex flex-col items-center text-white"
          style={{
            backgroundImage: "url('/counter-bg3.png')", // Replace with your image path
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h3 className="text-[11px] text-start w-full font-semi">Practise Tests Given</h3>
          <div className="flex justify-between items-center mt-3 w-full">
            <FaBuilding className="text-2xl" />
            <div className="bg-yellow-200 p-2 rounded-lg text-sm">32</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCardmobile;
