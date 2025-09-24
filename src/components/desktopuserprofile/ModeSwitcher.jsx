"use client";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
const ModeSwitcheruserProfile = ({ selectedMode, setSelectedMode }) => {
  const router = useRouter();
  return (
    <div className="flex justify-between w-full my-10 px-4">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 font-medium mb-4 hover:underline"
      >
        <IoIosArrowBack size={20} />
        Back
      </button>

      {/* Button Section */}
      <div className="flex space-x-6">
        <button
          className={`px-6 py-2 rounded-xl drop-shadow-lg text-white ${
            selectedMode === "Practice" ? "bg-white-500" : "bg-white-300"
          }`}
          onClick={() => setSelectedMode("Practice")}
        ></button>

        <button
          className={`px-6 py-2 rounded-xl drop-shadow-lg text-white ${
            selectedMode === "Customized" ? "bg-white-500" : "bg-white-300"
          }`}
          onClick={() => setSelectedMode("Customized")}
        ></button>
      </div>
    </div>
  );
};

export default ModeSwitcheruserProfile;
