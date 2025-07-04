"use client";
import React from "react";

const ModeSwitcheruserProfile = ({ selectedMode, setSelectedMode }) => {
  return (
    <div className="flex justify-between w-full my-10 px-10">
      {/* Title */}
      <h2 className="text-xl font-semi">User Profile</h2>

      {/* Button Section */}
      <div className="flex space-x-6">
        <button
          className={`px-6 py-2 rounded-xl drop-shadow-lg text-white ${
            selectedMode === "Practice" ? "bg-white-500" : "bg-white-300"
          }`}
          onClick={() => setSelectedMode("Practice")}
        >
          
        </button>

        <button
          className={`px-6 py-2 rounded-xl drop-shadow-lg text-white ${
            selectedMode === "Customized" ? "bg-white-500" : "bg-white-300"
          }`}
          onClick={() => setSelectedMode("Customized")}
        >
          
        </button>
      </div>
    </div>
  );
};

export default ModeSwitcheruserProfile;
