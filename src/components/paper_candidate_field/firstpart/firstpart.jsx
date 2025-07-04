"use client";
import React, { useState } from "react";
import CandidateTable from "../candidate/Candidatepage";
import InstructionTable from "../InstructionTable";


const FirstPart = () => {
  const [active, setActive] = useState("Paper Candidate Field");

  return (
    <div className=" flex-col items-center w-full justify-center md:justify-start pt-10 md:pt-0 px-4 hidden md:block">
      <div className="flex flex-col items-center w-full pt-1">
        {/* Settings Button - Visible Only on Desktop */}
        
       <div className="bg-white text-[#979797] px-12  text-lg py-4 mt-4  rounded-lg border border-[#BBBBBB] shadow-[0_4px_6px_0_rgba(0,0,0,0.25)]  hover:bg-gray-100 transition cursor-pointer">
          Settings
        </div>

        {/* Full-width Tab Container */}
        <div className="w-full md:max-w-[90%] rounded-lg flex justify-center bg-white shadow-[1px_1px_5px_lightgray] md:mt-15 mx-4 mb-4 px-12 py-1">
          <button
            className={`px-4 py-2 text-sm md:text-base font-Nunito Sans font-normal transition-all rounded-md ${
              active === "Paper Candidate Field"
                ? "bg-[#007AFF] text-white"
                : "text-black hover:bg-blue-100"
            }`}
            onClick={() => setActive("Paper Candidate Field")}
          >
            Paper Candidate Field
          </button>

          <button
            className={`px-8 py-2 text-sm md:text-base font-Nunito Sans font-normal transition-all rounded-md ${
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
          {active === "Paper Candidate Field" ? <CandidateTable /> : <InstructionTable />}
        </div>
      </div>
    </div>
  );
};

export default FirstPart;
