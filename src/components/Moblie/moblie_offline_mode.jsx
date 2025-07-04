"use client";
import Head from "next/head";
import React from "react";
import { useRouter } from "next/navigation";
import {
  MdOutlineSchedule
} from "react-icons/md";
import {
  CiPen
} from "react-icons/ci";
import {
  LuBookCheck
} from "react-icons/lu";
import {
  FaEye,
  FaQuestionCircle,
  FaSearch,
  FaRegQuestionCircle
} from "react-icons/fa";

const MobileOfflineMode = () => {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-white md:hidden">
      <Head>
        <title>Office Mode - Test Generator</title>
        <meta name="description" content="Generate and manage tests in office mode" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      

      {/* Heading */}
      <div className="w-full flex justify-center items-center mt-6 mb-4">
        <h2 className="text-xl font-semibold">Test Questions</h2>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col items-center gap-4 px-4">
        <button
          onClick={() => router.push("/test_preview")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          <FaEye size={20} /> Test Preview
        </button>
        <button
          onClick={() => router.push("/offline_mode")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          <FaQuestionCircle size={20} /> Offline Mode
        </button>
        <button
          onClick={() => router.push("/schedule_test")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 w-full justify-center"
        >
          <MdOutlineSchedule size={20} /> Schedule Test
        </button>
      </div>

      {/* Generation Actions */}
      <div className="flex flex-col space-y-3 items-center my-6 px-4">
        <button
          onClick={() => router.push("/generatequestionpaper")}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 w-full justify-center"
        >
          <FaRegQuestionCircle size={15} /> Generate Question Paper
        </button>
        <button
          onClick={() => router.push("/generateanswerpaper")}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 w-full justify-center"
        >
          <CiPen size={15} /> Generate Answer Key
        </button>
        <button
          onClick={() => alert("OMR Generation Coming Soon")}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded flex items-center gap-2 w-full justify-center"
        >
          <LuBookCheck size={15} /> Generate OMR
        </button>
      </div>

      {/* Display Area */}
      <div className="flex justify-center my-6 px-4">
        <div className=" border-gray-400 rounded p-4 text-center w-full flex items-center justify-center">
          <img
            src="/sample-question-paper.png"
            alt="Sample Test Paper"
            className="w-full max-w-sm h-auto object-contain rounded shadow"
          />
          {/* <p className="text-black font-semibold italic">Test Paper will be displayed here.</p> */}
        </div>
      </div>
    </div>
  );
};

export default MobileOfflineMode;
