"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GrAddCircle } from "react-icons/gr";
import { FaSearch } from "react-icons/fa";

// Mobile optimized component definition
const PaperInstruction1_mobile = () => {
  const [active, setActive] = useState("Paper Instruction");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [showCandidateField, setShowCandidateField] = useState(false);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [candidates, setCandidates] = useState([]);

  const candidateInstructions = [
    "Instruction 1: Lorem ipsum dolor sit amet.",
    "Instruction 2: Integer nec odio.",
    "Instruction 3: Sed nisi.",
    "Instruction 4: Duis sagittis ipsum."
  ];
  
  // Load selected template and instructions from localStorage
  useEffect(() => {
    const storedTemplate = localStorage.getItem("selectedTemplate");
    const storedInstructions = localStorage.getItem("instructions");
    if (storedTemplate && storedInstructions) {
      setSelectedTemplate(storedTemplate);
      setInstructions(storedInstructions);
    }
  }, []);

  const handleTemplateSelection = (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);
    const newInstructions = `Instructions for ${templateId}`;
    setInstructions(newInstructions);
    localStorage.setItem("instructions", newInstructions);
  };

  const handleNextInstruction = () => {
    setCurrentInstructionIndex((prevIndex) => 
      prevIndex < candidateInstructions.length - 1 ? prevIndex + 1 : 0
    );
  };

  const handleAddCandidate = () => {
    const newCandidate = {
      id: candidates.length + 1,
      name: `Candidate ${candidates.length + 1}`,
      instructions: candidateInstructions[0],
    };
    setCandidates((prevCandidates) => [...prevCandidates, newCandidate]);
    setShowCandidateField(true);
  };

  return (
    <div className="flex flex-col items-center mt-8 w-full bg-white rounded-lg p-2">

            {/* Search Bar */}
        <div className="flex justify-center ">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Name,Student_Id... "
              className="w-full shadow-lg px-15 py-2 pl-10 rounded-md border-[1px] border-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white  font-medium "
            />
            <div className="bg-[#007AFF] left-3 top-1/2 transform -translate-y-1/2">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

      {/* Tab Container */}
      <div className="flex w-full border-b border-gray-300 mb-4 mt-8">
        <button
          className={`flex-1 py-2 font-semibold text-center ${active === "Paper Candidate Field" ? "bg-blue-600 text-white" : "text-gray-800 hover:bg-blue-100"}`}
          onClick={() => setActive("Paper Candidate Field")}
        >
          Paper Candidate Field
        </button>
        <button
          className={`flex-1 py-2 font-semibold text-center ${active === "Paper Instruction" ? "bg-blue-500 text-white" : "text-gray-800 hover:bg-blue-100"}`}
          onClick={() => setActive("Paper Instruction")}
        >
          Paper Instruction
        </button>
      </div>

     {/* Template Selection Section - Two Images Per Row in Mobile View */}
<div className="w-full flex flex-wrap justify-center gap-4 mt-4">
  {["template1", "template2", "template3", "template4"].map((template, index) => (
    <div
      key={index}
      className={`w-[20x] shadow-lg ${selectedTemplate === template ? "border-4 border-blue-800" : "border-2 border-gray-300"} rounded-lg overflow-hidden cursor-pointer`}
      onClick={() => handleTemplateSelection(template)}
    >
      <Image src={`/image${index + 1}.svg`} alt={`Template ${index + 1}`} className="w-full h-full object-cover" width={100} height={100} />
    </div>
  ))}
</div>

      {/* Candidate Field Section */}
      <div className="w-full bg-white p-4 mt-10 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold">Candidate Field</h3>
          <button className="bg-blue-500 text-white py-2 px-4 text-sm rounded-lg flex items-center" onClick={handleAddCandidate}>
            <GrAddCircle className="text-white mr-2" />
            Add New Candidate Instructions
          </button>
        </div>

        {showCandidateField && (
          <table className="w-full border-collapse border border-gray-400 mb-10 ">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-2 py-1">Sr.No</th>
                <th className="px-2 py-1">Name</th>
                <th className="px-2 py-1">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="border px-2 py-1 text-center">{candidate.id}</td>
                  <td className="border px-2 py-1 text-center">{candidate.name}</td>
                  <td className="border px-2 py-1">{candidate.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaperInstruction1_mobile;
