"use client";
import React from 'react';

const GenerateTestButton = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mt-10">
      <button className="bg-[#007AFF] text-white text-lg font-semibold py-2 px-11 rounded-lg shadow-md transition-colors ">
        Generate Test
      </button>
      <span className="font-bold text-2xl">Preview</span>
    </div>
  );
};

export default GenerateTestButton;
