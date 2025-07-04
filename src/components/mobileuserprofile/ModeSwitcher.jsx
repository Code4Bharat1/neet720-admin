"use client";
import React from "react";

const ModeSwitcher = ({ selectedMode, setSelectedMode }) => {
  return (
    <div className="flex sm:hidden w-full max-w-4xl my-4 px-4 justify-between space-x-4">
      <button
        className={`px-6 py-2 rounded-md text-white ${
          selectedMode === "Practice" ? "bg-blue-500" : "bg-gray-300"
        }`}
        onClick={() => setSelectedMode("Practice")}
      >
        Practice
      </button>
      
      <button
        className={`px-6 py-2 rounded-md text-white ${
          selectedMode === "Customized" ? "bg-blue-500" : "bg-gray-300"
        }`}
        onClick={() => setSelectedMode("Customized")}
      >
        Customized
      </button>
    </div>
  );
};

export default ModeSwitcher;
