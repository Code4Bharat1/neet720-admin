"use client";
import Head from "next/head";
import {
  FaEye,
  FaQuestionCircle,
  FaClock,
  FaQuestion,
  FaTrophy,
  FaSearch,
} from "react-icons/fa";
import { MdOutlineSchedule } from "react-icons/md";
import Image from "next/image";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

const TestPreview = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Office Mode - Test Generator</title>
        <meta
          name="description"
          content="Generate and manage tests in office mode"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen bg-white">
        {/* Search Bar */}
          <div className="flex justify-center mt-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search Tests"
                className="w-full px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium "
              />
              <div className="bg-[#007AFF] left-3 top-1/2 transform -translate-y-1/2">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
             
        <div className="container mx-auto px-4 py-8">
          {/* Header Section - Mobile */}
          <div className="md:hidden mb-6">
            <h1 className="text-2xl font-bold text-center text-gray-800">Test Preview</h1>
          </div>

          {/* Main Options - Mobile */}
          <div className="flex flex-col space-y-4 mb-8 md:hidden">
            <button 
              onClick={() => router.push("./test_preview")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <FaEye size={18} /> Test Preview
            </button>
            <button
              onClick={() => router.push("./offline_mode")}
              style={{ backgroundColor: "#FFBB38" }}
              className="text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600"
            >
              <FaQuestionCircle size={18} /> Offline Mode
            </button>
            <button
              onClick={() => router.push("./schedule_test")}
              style={{ backgroundColor: "#FFBB38" }}
              className="text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600"
            >
              <MdOutlineSchedule size={18} /> Schedule Test
            </button>
          </div>

        

          {/* Preview Section - Mobile */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-center">Preview</h2>
            
            <div className="flex justify-around items-center bg-gray-50 p-4 rounded-lg">
              {/* Timer */}
              <div className="flex flex-col items-center">
                <Image src="/timer.png" alt="Time" width={24} height={24} />
                <span className="text-black mt-1 text-sm">50 mins</span>
              </div>

              {/* Questions */}
              <div className="flex flex-col items-center">
                <Image src="/question.png" alt="Questions" width={24} height={24} />
                <span className="text-black mt-1 text-sm">30 Qts</span>
              </div>

              {/* Marks */}
              <div className="flex flex-col items-center">
                <Image src="/medal.png" alt="Marks" width={24} height={24} />
                <span className="text-black mt-1 text-sm">120 mks</span>
              </div>
            </div>
          </div>

          {/* Subjects Section - Mobile */}
          <div className="space-y-6">
            {/* Physics Section */}
            <div className="bg-blue-100 p-4 rounded-xl shadow">
              <div className="flex items-center space-x-3 mb-3">
                <img src="/react.png" alt="Physics" className="w-10 h-10" />
                <div>
                  <h3 className="font-semibold text-gray-800">Physics</h3>
                  <div className="flex space-x-2 mt-1">
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      11 Questions
                    </span>
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      44 Marks
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium mb-2">Selected Chapters</h4>
                <div className="space-y-2">
                  {[
                    { id: 1, name: "Gravitation", questions: 3 },
                    { id: 2, name: "Semiconductor", questions: 2 },
                    { id: 3, name: "Rational Dynamic", questions: 6 },
                    { id: 4, name: "Gravitation", questions: 3 },
                  ].map((chapter) => (
                    <div key={chapter.id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">{chapter.id}. {chapter.name}</span>
                      <span className="text-sm font-medium">{chapter.questions} Q</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chemistry Section */}
            <div className="bg-blue-100 p-4 rounded-xl shadow">
              <div className="flex items-center space-x-3 mb-3">
                <img src="/chemistry.png" alt="Chemistry" className="w-10 h-10" />
                <div>
                  <h3 className="font-semibold text-gray-800">Chemistry</h3>
                  <div className="flex space-x-2 mt-1">
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      11 Questions
                    </span>
                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded">
                      44 Marks
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <h4 className="font-medium mb-2">Selected Chapters</h4>
                <div className="space-y-2">
                  {[
                    { id: 1, name: "Solutions", questions: 3 },
                    { id: 2, name: "Electrochemistry", questions: 3 },
                    { id: 3, name: "Chemical Kinetics", questions: 5 },
                    { id: 4, name: "Chemical Kinetics", questions: 5 },
                  ].map((chapter) => (
                    <div key={chapter.id} className="flex justify-between items-center border-b pb-2">
                      <span className="text-sm">{chapter.id}. {chapter.name}</span>
                      <span className="text-sm font-medium">{chapter.questions} Q</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestPreview;