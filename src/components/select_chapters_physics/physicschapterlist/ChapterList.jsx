"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { dataofquestions } from "../../../../public/cleaned.js";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function PhysicsChapterList() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(null);

  useEffect(() => {
    const fetchChaptersData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest/questions`);
        const questions = response.data.questions;
        
        const physicsChapters = Object.keys(dataofquestions.Physics).map((chapterKey, index) => {
          const unitName = chapterKey.split(":")[0];
          const chapterName = chapterKey.split(":")[1].trim();

          // Filter questions for this chapter
          const chapterQuestions = questions.filter((q) => q.chapter_name === chapterName);
          
          return {
            id: index + 1,
            name: chapterName,
            unit: unitName,
            isChecked: false,
            numQuestions: 0,
            totalMarks: 0,
            questions: chapterQuestions,
            rows: [], // Will be populated when numQuestions changes
            maxQuestions: chapterQuestions.length
          };
        });

        setChapters(physicsChapters);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    fetchChaptersData();
  }, []);

  // When a chapter checkbox is clicked
  const handleCheckboxChange = (id) => {
    setChapters((prev) => {
      const updatedChapters = prev.map((chapter) => {
        if (chapter.id === id) {
          // If unchecking, reset numQuestions and rows
          if (chapter.isChecked) {
            return { ...chapter, isChecked: false, numQuestions: 0, totalMarks: 0, rows: [] };
          }
          // If checking, keep current values but update isChecked status
          return { ...chapter, isChecked: !chapter.isChecked };
        }
        return chapter;
      });

      // Update localStorage
      updateLocalStorage(updatedChapters);
      return updatedChapters;
    });
  };

  // Helper function to update localStorage for both selected chapters and changed questions
const updateLocalStorage = (chapters) => {
  const selectedChapters = chapters
    .filter((chapter) => chapter.isChecked)
    .map((chapter) => ({
      chapterName: chapter.name,
      unit: chapter.unit,
      numQuestions: chapter.numQuestions,
      totalMarks: chapter.numQuestions * 4,
      questions: chapter.rows,
    }));

  localStorage.setItem("Physics", JSON.stringify(selectedChapters));

  // Create and save the changedQuestions data
  const changedQuestions = chapters
    .filter(chapter => chapter.isChecked && chapter.rows.length > 0)
    .flatMap(chapter => 
      chapter.rows.map(row => ({
        questionId: row.id,
        questionText: row.question,
        subjectName: "Physics",
        chapterName: chapter.name,
        unitName: chapter.unit,
        originalIndex: row.originalIndex
      }))
    );

  localStorage.setItem("changedQuestions", JSON.stringify(changedQuestions));
};

  const handleQuestionChange = (id, e) => {
  // Get input value
  let value = parseInt(e.target.value) || 0;
  
  setChapters((prevChapters) => {
    const targetChapter = prevChapters.find(chapter => chapter.id === id);
    
    // Check if there are questions available
    if (!targetChapter.questions || targetChapter.questions.length === 0) {
      return prevChapters;
    }
    
    // Limit value to the maximum number of available questions
    value = Math.min(value, targetChapter.maxQuestions);
    
    // Select the first n questions from available questions
    const selectedQuestions = targetChapter.questions.slice(0, value);
    
    // Create rows from selected questions with all required details
    const newRows = selectedQuestions.map((q) => ({
      id: q.id,
      subject: "Physics",
      question: q.question_text || "Question text not available",
      originalIndex: targetChapter.questions.findIndex(orig => orig.id === q.id),
      chapterName: targetChapter.name,
      unitName: targetChapter.unit
    }));
    
    // If numQuestions is > 0, ensure the chapter is checked
    const isChecked = value > 0 ? true : targetChapter.isChecked;
    
    // Update chapters
    const updatedChapters = prevChapters.map((chapter) =>
      chapter.id === id
        ? {
            ...chapter,
            isChecked: isChecked,
            numQuestions: value,
            totalMarks: value * 4,
            rows: newRows,
          }
        : chapter
    );

    // Update localStorage (which will now save both selected chapters and changed questions)
    updateLocalStorage(updatedChapters);
    return updatedChapters;
  });
};

  const handleReplaceQuestion = (chapterId, rowIndex) => {
  setRefreshing({ chapterId, rowIndex });
  
  setTimeout(() => {
    setChapters(prevChapters => {
      const chapter = prevChapters.find(c => c.id === chapterId);
      if (!chapter) return prevChapters;
      
      // Get all available questions for this chapter excluding currently selected ones
      const currentQuestionIds = new Set(chapter.rows.map(row => row.id));
      const availableQuestions = chapter.questions.filter(q => !currentQuestionIds.has(q.id));
      
      // If no replacement questions available, show a message and return unchanged
      if (availableQuestions.length === 0) {
        toast.error("No more question available for this chapter",{
          duration: 5000
        })
        setRefreshing(null);
        return prevChapters;
      }
      
      // Select a random question from available ones
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const newQuestion = availableQuestions[randomIndex];
      
      // Create updated chapter rows with the new question
      const updatedRows = [...chapter.rows];
      updatedRows[rowIndex] = {
        id: newQuestion.id,
        subject: "Physics",
        question: newQuestion.question_text || "Question text not available",
        originalIndex: chapter.questions.findIndex(q => q.id === newQuestion.id),
        chapterName: chapter.name,
        unitName: chapter.unit
      };
      
      // Update the chapter with new rows
      const updatedChapters = prevChapters.map(c => 
        c.id === chapterId 
          ? { ...c, rows: updatedRows }
          : c
      );
      
      // Update localStorage (which will now save both selected chapters and changed questions)
      updateLocalStorage(updatedChapters);
      setRefreshing(null);
      return updatedChapters;
    });
  }, 600); // Delay to show animation
};

  // Load saved data from localStorage when component mounts
  useEffect(() => {
    const savedChapters = JSON.parse(localStorage.getItem("Physics")) || [];
    
    if (savedChapters.length > 0) {
      setChapters((prevChapters) =>
        prevChapters.map((chapter) => {
          const savedChapter = savedChapters.find((saved) => saved.chapterName === chapter.name);
          if (savedChapter) {
            // Ensure numQuestions doesn't exceed maxQuestions
            const numQuestions = Math.min(savedChapter.numQuestions, chapter.maxQuestions);
            
            // Get the questions for this chapter
            const selectedQuestions = chapter.questions.slice(0, numQuestions);
            
            // Create rows from saved questions or select new ones if needed
            const rows = selectedQuestions.map((q) => ({
              id: q.id,
              subject: "Physics",
              question: q.question_text || "Question text not available",
              originalIndex: chapter.questions.findIndex(orig => orig.id === q.id)
            }));
            
            return { 
              ...chapter, 
              isChecked: true, 
              numQuestions: numQuestions,
              totalMarks: numQuestions * 4,
              rows: rows
            };
          }
          return chapter;
        })
      );
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
            }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-lg text-gray-700">Loading questions...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="flex justify-center mt-4 px-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="bg-white hidden md:block w-full max-w-5xl rounded-xl overflow-hidden border-none shadow-lg">
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white rounded-t-xl"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold">Physics Chapters</h2>
          <p className="text-sm text-blue-100">Select chapters and specify the number of questions</p>
        </motion.div>
        
        {chapters.map((chapter, index) => (
          <motion.div 
            key={chapter.id} 
            className="mb-4 overflow-hidden"
            variants={itemVariants}
          >
            <div className="overflow-x-auto px-4 py-2">
              <table className="w-full text-sm text-left font-Poppins text-[#181C32]">
                <thead className="bg-[#B1CEFB] text-[#181C32] font-Mulish font-semibold">
                  <tr>
                    {["Selected", "Sr.no", "Chapter Name", "Questions", "Total Marks"].map((header, i) => (
                      <th 
                        key={i} 
                        className={`py-3 px-4 text-center ${i === 0 ? "rounded-tl-xl w-24" : ""} ${i === 4 ? "rounded-tr-xl w-32" : ""} ${i === 2 ? "w-1/2" : ""}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-4 text-center">
                      <motion.div
                        className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer mx-auto ${chapter.isChecked ? "bg-blue-500" : "bg-gray-300"}`}
                        onClick={() => handleCheckboxChange(chapter.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {chapter.isChecked && (
                          <motion.svg 
                            className="w-5 h-5 text-white" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </motion.svg>
                        )}
                      </motion.div>
                    </td>
                    <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 text-left font-Mulish font-semibold text-black truncate">
                      <div className="flex items-center">
                        <div className="p-1 bg-blue-100 rounded-full mr-2">
                          <Image src="/physics_logo.png" alt="Physics" width={20} height={20} className="w-5 h-5" />
                        </div>
                        <span className="truncate max-w-xs" title={chapter.name}>{chapter.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <motion.input
                          type="number"
                          value={chapter.numQuestions}
                          onChange={(e) => handleQuestionChange(chapter.id, e)}
                          className="w-16 h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          min="0"
                          max={chapter.maxQuestions}
                          whileFocus={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        />
                        <span className="text-xs text-gray-500 ml-2">/ {chapter.maxQuestions}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-Mulish font-semibold">
                      <motion.div 
                        className="w-16 h-10 bg-blue-50 flex items-center justify-center rounded-md mx-auto border border-blue-100"
                        animate={{ 
                          backgroundColor: chapter.totalMarks > 0 ? ["#EBF5FF", "#DBEAFE", "#EBF5FF"] : "#EBF5FF",
                        }}
                        transition={{ duration: 1.5, repeat: chapter.totalMarks > 0 ? Infinity : 0, repeatType: "reverse" }}
                      >
                        {chapter.totalMarks || 0}
                      </motion.div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {/* Show question details when: chapter is checked AND numQuestions > 0 */}
                    {(chapter.isChecked && chapter.numQuestions > 0) && (
                      <motion.tr
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={expandVariants}
                      >
                        <td colSpan="5" className="p-0">
                          <motion.div 
                            className="rounded-xl shadow-md w-[98%] mx-auto my-3 overflow-hidden bg-gray-50 border border-gray-200"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <table className="w-full text-sm text-left font-Poppins text-[#181C32] border-collapse">
                              <thead className="bg-gray-100 text-black border-b border-gray-200">
                                <tr>
                                  {["Q.no", "Subject", "Question", "Action"].map((header, i) => (
                                    <th key={i} className={`py-3 px-4 ${i === 0 ? "rounded-tl-xl w-20 text-center" : ""} ${i === 3 ? "rounded-tr-xl w-24 text-center" : ""} ${i === 2 ? "w-3/5" : ""} font-Mulish font-semibold`}>
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence>
                                  {chapter.rows && chapter.rows.length > 0 ? (
                                    chapter.rows.map((row, index) => (
                                      <motion.tr 
                                        key={`${row.id}-${index}`}
                                        className={`hover:bg-blue-50 transition ${index === chapter.rows.length - 1 ? "border-none" : "border-b border-gray-200"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        exit={{ opacity: 0, y: -10 }}
                                      >
                                        <td className="py-3 px-4 text-center font-Mulish font-bold">{index + 1}</td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="font-Mulish font-semibold flex items-center justify-center space-x-1">
                                            <div className="p-1 bg-blue-100 rounded-full">
                                              <Image src="/physics_logo.png" alt="Physics" width={20} height={20} className="w-4 h-4" />
                                            </div>
                                            <div className="text-sm font-semibold">Physics</div>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 font-Mulish font-medium text-gray-700">
                                          <div className="line-clamp-2" title={row.question}>
                                            {row.question}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="flex justify-center space-x-3">
                                            <motion.div
                                              whileHover={{ scale: 1.2, rotate: 180 }}
                                              whileTap={{ scale: 0.9 }}
                                              animate={refreshing && refreshing.chapterId === chapter.id && refreshing.rowIndex === index ? 
                                                { rotate: 360 } : { rotate: 0 }}
                                              transition={{ duration: 0.5 }}
                                              onClick={() => handleReplaceQuestion(chapter.id, index)}
                                              className="cursor-pointer p-1 bg-blue-100 rounded-full hover:bg-blue-200"
                                            >
                                              <Image src="/refresh.png" alt="Replace Question" width={20} height={20} className="w-5 h-5" />
                                            </motion.div>
                                            <motion.div
                                              whileHover={{ scale: 1.2, x: 3 }}
                                              whileTap={{ scale: 0.9 }}
                                              className="cursor-pointer p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                                            >
                                              <Image src="/arrow.png" alt="View Details" width={20} height={20} className="w-5 h-5" />
                                            </motion.div>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="4" className="py-4 text-center text-gray-500">
                                        No questions available for this chapter
                                      </td>
                                    </tr>
                                  )}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}