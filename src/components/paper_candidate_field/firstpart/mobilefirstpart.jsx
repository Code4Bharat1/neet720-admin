"use client";
import React, { useState } from "react";
import { BsSearch } from "react-icons/bs";
import MobileCandidateTable from "../candidate/mobilecandidate";
import InstructionTable from "../InstructionTable";


const FirstPartMobile = () => {
  const [active, setActive] = useState("Paper Candidate Field");

  return (
    <div className="flex flex-col items-center w-full justify-center pt-10 px-4 md:hidden">
      <div className="flex flex-col items-center w-full pt-1">
        {/* Search Bar - Only Mobile View */}
        <div className="flex flex-col items-center gap-4 mb-6 w-full px-4">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search Name, Student ID..."
              className="w-full pl-12 pr-6 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md"
            />
            <span className="bg-[#007AFF] left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              <BsSearch />
            </span>
          </div>
        </div>

        {/* Tab Container */}
        <div className="w-full rounded-lg flex justify-center bg-white shadow-[1px_1px_5px_lightgray] mx-2 mb-2 px-4 py-1">
          <button
            className={`px-3 py-1 text-xs font-Nunito Sans font-normal transition-all rounded-md ${
              active === "Paper Candidate Field"
                ? "bg-[#007AFF] text-white"
                : "text-black hover:bg-blue-100"
            }`}
            onClick={() => setActive("Paper Candidate Field")}
          >
            Paper Candidate Field
          </button>

          <button
            className={`px-3 py-1 text-xs font-Nunito Sans font-normal transition-all rounded-md ${
              active === "Paper Instruction"
                ? "bg-[#007AFF] text-white"
                : "text-black hover:bg-blue-100"
            }`}
            onClick={() => setActive("Paper Instruction")}
          >
            Paper Instruction
          </button>
        </div>

        {/* Render Tables Based on Active Tab */}
        <div className="w-full">
          {active === "Paper Candidate Field" ? (
            <MobileCandidateTable />
          ) : (
            <InstructionTable/>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstPartMobile;
