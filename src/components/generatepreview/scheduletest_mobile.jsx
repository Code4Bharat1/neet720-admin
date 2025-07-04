"use client";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function Scheduletest_mobile() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Create Test Button onClick function
  const handleCreateTest = () => {
    console.log("Create Test button clicked!");
    // Add your logic for creating the test here
    // For example, navigating to another page or saving data
  };

  return (
    <div className="relative h-auto overflow-hidden justify-between mb-0">
      {/* Back and Create Buttons */}
      <div className="flex flex-row sm:flex-row justify-between items-center sm:mx-8 mb-17 mt-2 p-4 sm:p-0">
        <button className="flex items-center px-8 py-2 bg-[#FFBB38] text-white rounded-full hover:bg-[#FFBB38] transition mb-2 sm:mb-2">
          <FaArrowLeft className="mr-2 font-bold" /> Back
        </button>
        <button
          onClick={openModal}
          className="flex items-center px-8 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition "
        >
          Create <FaArrowRight className="ml-2 text-bold" />
        </button>
      </div>

      {/* Modal (Schedule Test for Batch) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-centerew ">
          {/* Full-screen blur backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal content */}
          <div className="relative bg-white p-3 border-[#848080] rounded-xl shadow-lg max-w-screen-sm sm:max-w-lg md:max-w-2xl w-full mx-3 sm:mx-6 overflow-hidden">
            {/* Modal Header */}
            <h2 className="text-2xl font-semibold mb-5 mt-0">Schedule test for Batch</h2>

            {/* Border below the title */}
            <div className="border-b border-gray-300 mb-3"></div>

            {/* Total Marks and Question Count */}
            <div className="flex  sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 ml-2 gap-4">
              <button
                style={{ backgroundColor: "#007AFF80" }}
                className="bg-blue-100 text-sm text-white px-1 py-2 rounded-sm h-9 sm:w-7"
              >
                Total Question: 16
              </button>
              <button
                style={{ backgroundColor: "#007AFF80" }}
                className="bg-blue-50 -mx-2 text-sm text-white px-1 py-1 rounded-sm h-9 sm:w-7"
              >
                Question Count: 4
              </button>
            </div>
            {/* First Row: Test Duration and Scheduled at Ends at */}
            <div className="sm:flex-row gap-1 mt-2">
              <div className="flex flex-col ">
                <label className="text-[#535353] font-medium text-sm ">Test Duration (in Minutes):</label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm"
                  style={{ backgroundColor: "#D9D9D9" }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">Scheduled at:</label>
                <input
                  type="date"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm text-gray-500"
                  style={{ backgroundColor: "#D9D9D9" }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">Ends at:</label>
                <input
                  type="date"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm text-gray-500"
                  style={{ backgroundColor: "#D9D9D9" }}
                />
              </div>
            </div>



            {/* Second Row: Show Test Results Instantly, Select Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">Show Test Results Instantly:</label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm"
                  style={{ backgroundColor: "#D9D9D9" }}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">Select Batch:</label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm"
                  style={{ backgroundColor: "#D9D9D9" }}
                />
              </div>
            </div>

            {/* Modal Footer with Cancel and Create Test Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-x-0 sm:space-x-4 mt-6">
              <button
                onClick={closeModal}
                className="bg-[#CEDFFC] text-[#000000] py-2 px-9 rounded-full mb-4 sm:mb-0"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTest} // Added onClick handler for Create Test
                className="bg-[#EB3D3C] text-[#FFFFFF] py-2 px-8 rounded-full"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduletest_mobile;
