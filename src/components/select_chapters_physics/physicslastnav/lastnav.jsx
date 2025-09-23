import React, { useState, useEffect } from "react";
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function PhysicsLastnav() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    const savedSubjects =
      JSON.parse(localStorage.getItem("selectedSubjects")) || [];
    setSelectedSubjects(savedSubjects);
  }, []);

  // Handle back navigation
  const handleBackClick = () => {
    if (selectedSubjects.indexOf("Physics") > 0) {
      const previousSubject =
        selectedSubjects[selectedSubjects.indexOf("Physics") - 1].toLowerCase();
      router.push(`/select_chapters_${previousSubject}`);
    } else {
      router.push("/subjectselect"); // Fallback page
    }
  };

  // Handle continue navigation
  const handleContinueClick = () => {
    const currentIndex = selectedSubjects.indexOf("Physics");
    const nextSubject = selectedSubjects[currentIndex + 1]?.toLowerCase();

    if (nextSubject) {
      router.push(`/select_chapters_${nextSubject}`);
    } else {
      router.push("/generatepreview");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 sm:gap-6 p-4 mt-6">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="flex items-center justify-center sm:justify-start w-full sm:w-auto px-6 sm:px-10 py-3 font-Poppins text-base sm:text-lg bg-[#FFBB38] text-white rounded-full shadow-md hover:bg-yellow-500 transition"
      >
        <HiOutlineArrowLeft className="mr-2 sm:mr-3 text-lg sm:text-xl" /> Back
      </button>

      {/* Continue Button */}
      <button
        onClick={handleContinueClick}
        className="flex items-center justify-center sm:justify-start w-full sm:w-auto px-6 sm:px-10 py-3 font-Poppins text-base sm:text-lg bg-[#007AFF] text-white rounded-full shadow-md hover:bg-blue-600 transition"
      >
        Continue{" "}
        <HiOutlineArrowRight className="ml-2 sm:ml-3 text-lg sm:text-xl" />
      </button>
    </div>
  );
}
