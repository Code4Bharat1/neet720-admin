
"use client";
import React, { useState } from "react";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";  // Import the search icon

const GenerateAnswerKeyMobile = () => {
  const [toggleStates, setToggleStates] = useState({
    watermark: false,
    solutions: false,
    chapterDetails: false,
    logoHeader: false,
  });

  const handleToggle = (toggle) => {
    setToggleStates((prev) => ({ ...prev, [toggle]: !prev[toggle] }));
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-2 overflow-hidden ">
      <div className="w-full max-w-[470px] mx-4 bg-white rounded-lg p-6 ">
        {/* Top Section with Icon and Generate Test Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-blue-700 text-3xl hidden md:block">
            <FaChevronCircleLeft />
          </div>
          <div className="flex-1 flex justify-center">
            <button className="hidden bg-gray-200 px-4 py-2 rounded-md text-gray-600 shadow-md">
              Generate Test
            </button>
          </div>
        </div>

           {/* Search Bar */}
          <div className="flex justify-center mt-4">
            <div className="relative w-full  mx-1">
              <input
                type="text"
                placeholder="Search Tests"
                className="w-full px-6 py-3 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F5F7FA] font-medium "
              />
              <div className="bg-[#007AFF] left-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="h-5 w-4 text-gray-400" />
              </div>
            </div>
          </div>



        {/* Toggle Section with Action Buttons */}
        <div className="border border-gray-100 w-full shadow-[0_4px_12px_rgba(0,0,0,0.4)] p-4 mt-5  ">
          <h3 className="font-semibold mb-4">Details to Generate Answer Key</h3>
          <div className="flex flex-col gap-4 mb-12 ">
            {[
              { label: "Show Watermark", key: "watermark" },
              { label: "Show Solutions", key: "solutions" },
              { label: "Enable Chapter Details for Test", key: "chapterDetails" },
              { label: "Enable header (Logo) in the Question paper", key: "logoHeader" },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center ">
                <div
                  className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer ${
                    toggleStates[key] ? "bg-red-500" : ""
                  }`}
                  onClick={() => handleToggle(key)}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      toggleStates[key] ? "translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <span className="ml-3 text-sm">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-center mt-4 gap-3">
            <button className="bg-blue-500 text-white w-30 py-2 rounded-md cursor-pointer transition duration-300 hover:bg-blue-600">
              Proceed
            </button>
            <button className="bg-red-500 text-white w-30 py-2 rounded-md cursor-pointer transition duration-300 hover:bg-red-600">
              Close
            </button>
          </div>
        </div>

        {/* Print Preview Section */}
        <div className="mt-8 text-center">
          <h3 className="font-semibold italic text-left text-xl">Print Preview</h3>
          <div className="border-6 border-gray-300 border-dashed h-54 mt-1 rounded-md bg-gray-100"></div>
          <button className="bg-red-500 text-white w-full py-1 mt-4 rounded-md cursor-pointer transition duration-300 hover:bg-red-600 text-2xl">
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateAnswerKeyMobile;


















































