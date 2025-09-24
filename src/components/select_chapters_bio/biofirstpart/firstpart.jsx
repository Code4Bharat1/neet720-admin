"use client";
import React, { useState, useEffect } from "react";
import { BsBook, BsGraphUp } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

export default function SubjectSelection() {
  const router = useRouter();
  const pathname = usePathname(); // Get current URL path
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selectedSubjects");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAvailableSubjects(parsed.map((s) => s.toLowerCase()));
          }
        } catch (error) {
          console.error("Error parsing selectedSubjects:", error);
        }
      }
    }
  }, []);

  const handleSubjectClick = (subject) => {
    if (subject) router.push(`/select_chapters_${subject.toLowerCase()}`);
  };

  // Get current subject from URL
  const currentSubject = pathname?.split("_")[2] || "";

  return (
    <section className="font-['Segoe_UI'] bg-gray-50 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Generate Test Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-gray-700 w-full sm:w-auto px-5 py-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition flex items-center justify-center sm:justify-start gap-2 font-medium"
        >
          <span className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <FiSettings className="text-lg" />
          </span>
          Generate Test
        </motion.button>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2 text-center sm:text-left"
        >
          <span className="bg-blue-500 p-1.5 rounded-full text-white shadow-sm">
            <BsBook className="text-lg" />
          </span>
          Select Chapters
        </motion.h1>
      </div>

      {/* Subject-wise Marks Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left Heading */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <BsGraphUp className="text-xl" />
            </div>
            <h2 className="text-lg sm:text-xl font-medium text-gray-800">
              Subject-wise Marks
            </h2>
          </div>

          {/* Subject Chips */}
          <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-3 sm:mt-0">
            {availableSubjects.includes("physics") && (
              <div
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start cursor-pointer  ${
                  currentSubject === "physics"
                    ? "bg-blue-600 text-white "
                    : "bg-blue-50 text-blue-700 "
                }`}
                onClick={() => handleSubjectClick("physics")}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    currentSubject === "physics" ? "bg-white" : "bg-blue-600"
                  }`}
                ></span>
                Physics
              </div>
            )}

            {availableSubjects.includes("chemistry") && (
              <div
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start cursor-pointer  ${
                  currentSubject === "chemistry"
                    ? "bg-purple-600 text-white "
                    : "bg-purple-50 text-purple-700 "
                }`}
                onClick={() => handleSubjectClick("chemistry")}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    currentSubject === "chemistry"
                      ? "bg-white"
                      : "bg-purple-600"
                  }`}
                ></span>
                Chemistry
              </div>
            )}

            {availableSubjects.includes("biology") && (
              <div
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start cursor-pointer  ${
                  currentSubject === "biology"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-green-50 text-green-700 border-green-100"
                }`}
                onClick={() => handleSubjectClick("biology")}
              >
                <span
                  className={`w-3 h-3 rounded-full ${
                    currentSubject === "biology" ? "bg-white" : "bg-green-600"
                  }`}
                ></span>
                Biology
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
