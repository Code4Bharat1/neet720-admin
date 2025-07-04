"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GrAddCircle } from "react-icons/gr";

// The component definition remains the same
const PaperInstruction1 = () => {
  const [active, setActive] = useState("Paper Instruction");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [showCandidateField, setShowCandidateField] = useState(false); // State for toggling candidate field visibility
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0); // Track current instruction
  const [candidates, setCandidates] = useState([]); // State for candidates

  // Sample instructions to be displayed
  const candidateInstructions = [
    "Instruction 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Instruction 2: Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.",
    "Instruction 3: Sed nisi. Nulla quis sem at nibh elementum imperdiet.",
    "Instruction 4: Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta."
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

  // Handle template selection
  const handleTemplateSelection = (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem("selectedTemplate", templateId);

    const newInstructions = `Instructions for ${templateId}`;
    setInstructions(newInstructions);
    localStorage.setItem("instructions", newInstructions);
  };

  // Show next instruction for current candidate
  const handleNextInstruction = () => {
    setCurrentInstructionIndex((prevIndex) => {
      // Loop back to the first instruction after the last one
      if (prevIndex < candidateInstructions.length - 1) {
        return prevIndex + 1;
      }
      return 0;
    });
  };

  // Add a new candidate
  const handleAddCandidate = () => {
    const newCandidate = {
      id: candidates.length + 1,
      name: `Candidate ${candidates.length + 1}`,
      instructions: candidateInstructions[0], // Initial instruction for the new candidate
    };
    setCandidates((prevCandidates) => [...prevCandidates, newCandidate]);
    setShowCandidateField(true); // Show candidate field after adding a new candidate
  };

  // Toggle the candidate field visibility
  const handleToggleCandidateField = () => {
    setShowCandidateField(!showCandidateField);
  };

  return (
    <div className="flex flex-col items-center mt-2 w-full bg-white rounded-lg p-2">
      {/* Settings Button */}
      <button
        className="bg-white text-gray-400 text-lg w-[15%] font-open sans px-10 py-4 rounded-xl mb-8 border border-gray-300"
        style={{ boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
      >
        Settings
      </button>

      {/* Full-width tab container */}
      <div className="p-1 w-[1004px] max-w-6xl border border-gray-300 rounded-lg shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex justify-between sm:justify-center bg-white mb-5">
        <button
          className={`px-6 py-3 w-[181px] font-Nunito Sans font-semibold transition-all rounded-lg sm:w-auto ${
            active === "Paper Candidate Field"
              ? "bg-blue-600 text-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]"
              : "text-gray-800 hover:bg-blue-100"
          }`}
          onClick={() => setActive("Paper Candidate Field")}
        >
          Paper Candidate Field
        </button>

        <button
          className={`px-6 py-3 w-[214px] font-semibold transition-all rounded-lg sm:w-auto ${
            active === "Paper Instruction"
              ? "bg-blue-500 text-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]"
              : "text-gray-800 hover:bg-blue-100"
          }`}
          onClick={() => setActive("Paper Instruction")}
        >
          Paper Instruction
        </button>
      </div>

      <div className="w-[990px] font-bold text-xl">Select Templates</div>

      {/* Templates Selection Section */}
      <div className="w-full flex flex-wrap justify-center sm:space-x-4 gap-4 mt-5">
        {/* Template 1 */}
        <div
          className={`w-[190px] h-[232px] shadow-lg ${
            selectedTemplate === "template1" ? "border-4 border-blue-800" : "border-2 border-gray-300"
          } rounded-lg overflow-hidden cursor-pointer`}
          onClick={() => handleTemplateSelection("template1")}
        >
          <Image
            src="/image1.svg"
            alt="Template 1"
            className="w-full h-full object-cover"
            width={190}
            height={232}
          />
        </div>

        {/* Template 2 */}
        <div
          className={`w-[190px] h-[232px] shadow-lg ${
            selectedTemplate === "template2" ? "border-4 border-blue-800" : "border-2 border-gray-300"
          } rounded-lg overflow-hidden cursor-pointer`}
          onClick={() => handleTemplateSelection("template2")}
        >
          <Image
            src="/image2.svg"
            alt="Template 2"
            className="w-full h-full object-cover"
            width={190}
            height={232}
          />
        </div>

        {/* Template 3 */}
        <div
          className={`w-[180px] h-[229px] shadow-lg ${
            selectedTemplate === "template3" ? "border-4 border-blue-800" : "border-2 border-gray-300"
          } rounded-lg overflow-hidden cursor-pointer`}
          onClick={() => handleTemplateSelection("template3")}
        >
          <Image
            src="/image3.svg"
            alt="Template 3"
            className="w-full h-full object-cover"
            width={190}
            height={232}
          />
        </div>

        {/* Template 4 */}
        <div
          className={`w-[180px] h-[229px] shadow-lg ${
            selectedTemplate === "template4" ? "border-4 border-blue-800" : "border-2 border-gray-300"
          } rounded-lg overflow-hidden cursor-pointer`}
          onClick={() => handleTemplateSelection("template4")}
        >
          <Image
            src="/image4.svg"
            alt="Template 4"
            className="w-full h-full object-cover"
            width={190}
            height={232}
          />
        </div>
      </div>

      {/* Add New Candidate Details Button */}
      <div className="w-[1004px] max-w-6xl bg-white shadow-[0px_0px_4px_0px_#00000040] rounded-2xl p-6 mt-10 mb-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-black">Candidate Field</h3>
          <button
            className="bg-blue-500 text-white py-2 px-6 rounded-md flex items-center space-x-2"
            onClick={handleAddCandidate} // Add a new candidate
          >
            <GrAddCircle className="text-white" />
            <span>Add New Candidate Instructions</span>
          </button>
        </div>

        {/* Conditionally render Candidate Field */}
        {showCandidateField && (
          <div className="overflow-x-hidden">
            <table className="w-[95%] border-collapse border-[0.4px] border-[#000000] mb-6 border-spacing-y-2">
              <thead>
                <tr className="bg-gray-200 font-semibold">
                  <th className="px-6 py-3 text-left text-lg">Sr.No</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {/* Map through candidates and display their instructions */}
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-8 py-4 text-lg align-top">{candidate.id}</td>
                    <td className="px-1 py-4 text-lg align-top">{candidate.name}</td>
                    <td className="px-2 py-4 text-sm w-[391px] h-[184px]">
                      {candidate.instructions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export { PaperInstruction1 };
export default PaperInstruction1;
