"use client";
import React from "react";
import { BsSearch } from "react-icons/bs";

export default function MobileBioFirstPart() {
  return (
    <section className="block md:hidden p-4 gap-2 font-['Segoe_UI']">
      {/* Search Bar - Visible only in Mobile View */}
      <div className="flex flex-col items-center gap-4 mb-6 w-full px-4">
        <div className="relative w-full max-w-xl bg-[#F5F7FA] py-2 rounded-full">
          <input
            type="text"
            placeholder="Search Tests"
            className="w-full pl-12 pr-6 py-1 text-lg font-medium bg-transparent focus:outline-none tracking-wider"
          />
          <span className="bg-[#007AFF] left-4 top-1/2 -translate-y-1/2 text-gray-600 text-lg ml-2">
            <BsSearch />
          </span>
        </div>
      </div>

      {/* Centered Heading */}
      <h1 className="text-xl text-center font-medium font-SegoeUI">Select Bio Chapters</h1>

      {/* Subject-wise Marks Section */}
      <div className="flex justify-center items-center gap-4 mt-3 flex-wrap">
        <h2 className="text-lg font-medium font-SegoeUI">Subject-wise Marks</h2>
        <div className="bg-[#EEF5FF] text-[#718EBF] text-sm font-normal px-4 py-2 rounded-lg">
          Subject-wise Marks
        </div>
      </div>

      {/* Select Chapters and Search Bar Section */}
      <div className="flex items-center justify-between w-full mt-4">
        {/* Select Chapters */}
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium whitespace-nowrap">Select Chapters</h2>
        </div>

        {/* Search Bar */}
        <div className="flex items-center rounded-full px-4 py-1 bg-[#EEF5FF] text-[#8BA3CB] hover:bg-blue-200 transition w-3/5">
          <BsSearch className="mr-2 text-sm text-[#718EBF]" />
          <input
            type="text"
            placeholder="Search Tests"
            className="bg-transparent outline-none w-full text-xs pr-2"
          />
        </div>
      </div>
    </section>
  );
}
