"use client";
import React from 'react';

const ChemistryCard_mobile = () => {
  return (
    <div className="p-4 bg-[#B1CEFB] shadow-xl rounded-tr-2xl rounded-tl-2xl ml-6 mr-3 w-50px sm:w-[34rem] max-h-[700px] mt-10 sm:-mt-60">
      {/* Header Section */}
      <div className="flex flex-row sm:flex-row items-center space-x-0 sm:space-x-4 mb-6">
        <div className="relative bg-[#B1CEFB] shadow-lg mb-4 sm:mb-0">
          <img
            src="/science_2022299.svg"  // Ensure the icon path is correct
            alt="Chemistry Icon"
            className="object-cover w-16 h-15"
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Chemistry</h2>

          {/* Flexbox for side-by-side boxes */}
          <div className="flex flex-row sm:flex-row space-y-2 sm:space-x-4 ml-2 mt-2 sm:mt-2 gap-2">
            {/* Total Questions Box */}
            <div className="bg-blue-400 text-white text-sm px-2 py-2 rounded-md  sm:w-30 text-center h-9 ">
              Total Questions: 11
            </div>
            {/* Total Marks Box */}
            <div className="bg-blue-400 text-white text-sm px-2 py-2 rounded-md  sm:w-30 text-center h-9">
              Total Marks: 44
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        <h3 className="text-2xl font-semibold ml-6 mb-6 align-middle mt-2">Selected Chapters</h3>
        <table className="w-full table-auto border-collapse:separate border-spacing-y-2">
          <thead className="border-1b">
            <tr className="border-b bg-[#F5F5F5] border-gray-300">
              <th className="p-2 text-center rounded-tl-lg">Sr.No</th>
              <th className="px-4 py-2 text-center">Chapter Name</th>
              <th className="px-4 py-2 text-center rounded-tr-lg">Questions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-300 text-center">
              <td className="px-2 py-2">1</td>
              <td className="px-2 py-2">Solid State</td>
              <td className="px-2 py-2">3</td>
            </tr>
            <tr className="border-t border-gray-300 text-center">
              <td className="px-2 py-2">2</td>
              <td className="px-2 py-2">Solutions</td>
              <td className="px-2 py-2">2</td>
            </tr>
            <tr className="border-t border-gray-300 text-center">
              <td className="px-2 py-2">3</td>
              <td className="px-2 py-2">Electrochemistry</td>
              <td className="px-2 py-2">6</td>
            </tr>
            <tr className="border-t border-gray-300 text-center">
              <td className="px-2 py-2">4</td>
              <td className="px-2 py-2">Biomolecules</td>
              <td className="px-2 py-2">3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChemistryCard_mobile;
