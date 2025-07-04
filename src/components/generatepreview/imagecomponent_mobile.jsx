"use client";
import React from 'react';
import Image from 'next/image';


const ImageComponent_mobile= () => {
  return (
    <div className="flex flex-row md:flex-row justify-end items-center md:gap-2 gap-8 bg-white p-4 rounded-xl shadow-md mt-4 md:mt-6 mb-4 md:mb-8 mx-2 md:mx-12 w-65 ml-38">
      {/* Timer Section */}
      <div className="flex flex-col items-center gap-2 w-auto">
        <div className="relative w-12 h-12 ">
          <Image
            src="/hourglass_6290515.svg"
            alt="Time"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-sm md:text-lg font-medium text-gray-700">50 mins</span>
      </div>

      {/* Questions Section */}
      <div className="flex flex-col items-center gap-2 w-auto">
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <Image
            src="/question_13077967.svg"
            alt="Questions"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-sm md:text-lg font-medium text-gray-700">30 Qts</span>
      </div>

      {/* Marks Section */}
      <div className="flex flex-col items-center gap-2 w-auto">
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <Image
            src="/gold-medal_5406582.svg"
            alt="Marks"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-sm md:text-lg font-medium text-gray-700">120 mks</span>
      </div>
    </div>
  );
};

export default ImageComponent_mobile;
