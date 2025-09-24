import React, { useState, useEffect } from "react"; // <-- Add this import
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function ChemLastnav() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // Load selected subjects from localStorage
  useEffect(() => {
    const savedSubjects =
      JSON.parse(localStorage.getItem("selectedSubjects")) || [];
    setSelectedSubjects(savedSubjects);
  }, []);

  // Handle back navigation (to the previous subject)
  const handleBackClick = () => {
    if (selectedSubjects.indexOf("Chemistry") > 0) {
      const previousSubject =
        selectedSubjects[
          selectedSubjects.indexOf("Chemistry") - 1
        ].toLowerCase();
      router.push(`/select_chapters_${previousSubject}`);
    } else {
      // If there's no previous subject, navigate to the first subject page or any fallback page
      router.push("/subjectselect"); // Replace with your fallback subject selection page URL
    }
  };

  //continue button
  const handleContinueClick = () => {
    const currentIndex = selectedSubjects.indexOf("Chemistry");
    const nextSubject = selectedSubjects[currentIndex + 1]?.toLowerCase();

    if (nextSubject) {
      router.push(`/select_chapters_${nextSubject}`);
    } else {
      router.push("/generatepreview");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 sm:gap-8 px-4 mt-6">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="flex items-center w-full sm:w-auto justify-center px-6 sm:px-10 py-3 rounded-full shadow-md bg-[#FFBB38] text-white font-medium text-base sm:text-lg hover:bg-yellow-500 transition"
      >
        <HiOutlineArrowLeft className="mr-2 sm:mr-3 text-lg sm:text-xl" />
        Back
      </button>

      {/* Continue Button */}
      <button
        onClick={handleContinueClick}
        className="flex items-center w-full sm:w-auto justify-center px-6 sm:px-10 py-3 rounded-full shadow-md bg-[#007AFF] text-white font-medium text-base sm:text-lg hover:bg-blue-600 transition"
      >
        Continue
        <HiOutlineArrowRight className="ml-2 sm:ml-3 text-lg sm:text-xl" />
      </button>
    </div>
  );
}
