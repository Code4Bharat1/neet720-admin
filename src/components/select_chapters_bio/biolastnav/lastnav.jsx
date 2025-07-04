import React, { useState, useEffect } from "react";  // <-- Add this import
import { HiOutlineArrowLeft, HiOutlineArrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";

export default function BioLastnavDesktop() {
  const router = useRouter();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem("selectedSubjects")) || [];
    setSelectedSubjects(savedSubjects);
  }, []);

  // Handle back navigation (to the previous subject)
  const handleBackClick = () => {
    if (selectedSubjects.indexOf("Biology") > 0) {
      const previousSubject = selectedSubjects[selectedSubjects.indexOf("Biology") - 1].toLowerCase();
      router.push(`/select_chapters_${previousSubject}`);
    }else {
      // If there's no previous subject, navigate to the first subject page or any fallback page
      router.push("/subjectselect"); // Replace with your fallback subject selection page URL
    }
  };

    // Handle continue navigation (to the next subject)
    const handleContinueClick = () => {
      const currentIndex = selectedSubjects.indexOf("Biology");
      const nextSubject = selectedSubjects[currentIndex + 1]?.toLowerCase();
  
      if (nextSubject) {
        router.push(`/select_chapters_${nextSubject}`);
      } else {
        router.push("/generatepreview");
      }
    };
  






  return (
    <div className="hidden md:flex justify-between items-center w-full p-4">
      <button
      onClick={handleBackClick}
        className="flex items-center px-10 py-2 mt-8 ml-10 font-Poppins text-lg bg-[#FFBB38] text-white rounded-full shadow-md hover:bg-yellow-500 transition"
      >
        <HiOutlineArrowLeft className="mr-3 text-xl" /> Back
      </button>
      <button
         onClick={handleContinueClick}
        className="flex items-center px-6 py-2 mt-8 mr-17 font-Poppins text-lg bg-[#007AFF] text-white rounded-full shadow-md hover:bg-blue-600 transition"
      >
        Continue <HiOutlineArrowRight className="ml-3 text-xl" />
      </button>
    </div>
  );
}
