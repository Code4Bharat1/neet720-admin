"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function ChemistryChapterList() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(null);

  // Fetch chemistry questions and group by unique chapter
  useEffect(() => {
    const fetchChemistryChapters = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest/chemistry-questions`);
        const { questions } = response.data;

        // Group questions by chapter name
        const chapterMap = {};
        questions.forEach((q) => {
          if (!chapterMap[q.chapter_name]) {
            chapterMap[q.chapter_name] = {
              id: Object.keys(chapterMap).length + 1,
              name: q.chapter_name,
              unit: q.unit || "Unit I",
              isChecked: false,
              numQuestions: 0,
              totalMarks: 0,
              rows: [],
              questions: [],
            };
          }
          chapterMap[q.chapter_name].questions.push({
            id: q.id, // real question ID from backend
            subject: "Chemistry",
            question: q.question_text,
          });
        });

        // Add maxQuestions property to each chapter
        const chaptersWithLimits = Object.values(chapterMap).map(chapter => ({
          ...chapter,
          maxQuestions: chapter.questions.length
        }));

        setChapters(chaptersWithLimits);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chemistry questions:", error);
        setLoading(false);
      }
    };

    fetchChemistryChapters();
  }, []);

  const handleCheckboxChange = (id) => {
    setChapters((prev) => {
      const updatedChapters = prev.map((chapter) =>
        chapter.id === id ? 
        { 
          ...chapter, 
          isChecked: !chapter.isChecked,
          // If unchecking, reset question count and rows
          numQuestions: chapter.isChecked ? 0 : chapter.numQuestions,
          totalMarks: chapter.isChecked ? 0 : chapter.totalMarks,
          rows: chapter.isChecked ? [] : chapter.rows
        } : chapter
      );

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

  localStorage.setItem("Chemistry", JSON.stringify(selectedChapters));

  // Create and save the changedQuestions data
  const changedQuestions = chapters
    .filter(chapter => chapter.isChecked && chapter.rows.length > 0)
    .flatMap(chapter => 
      chapter.rows.map(row => ({
        questionId: row.id,
        questionText: row.question,
        subjectName: "Chemistry",
        chapterName: chapter.name,
        unitName: chapter.unit,
        originalIndex: row.originalIndex || chapter.questions.findIndex(q => q.id === row.id)
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
    
    // Select the first n questions (or as many as available)
    const selectedQuestions = targetChapter.questions.slice(0, value);
    
    // Create rows from selected questions with all required details
    const newRows = selectedQuestions.map((q) => ({
      id: q.id,
      subject: "Chemistry",
      question: q.question || "Question text not available",
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
        alert("No more questions available for replacement in this chapter.");
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
        subject: "Chemistry",
        question: newQuestion.question || "Question text not available",
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

  useEffect(() => {
  const savedChapters = JSON.parse(localStorage.getItem("Chemistry")) || [];
  
  setChapters((prevChapters) =>
    prevChapters.map((chapter) => {
      const saved = savedChapters.find((sc) => sc.chapterName === chapter.name);
      if (saved) {
        // Ensure numQuestions doesn't exceed maxQuestions
        const numQuestions = Math.min(saved.numQuestions, chapter.maxQuestions || 0);
        
        // Create rows based on numQuestions or use saved questions if available
        const rows = saved.questions && saved.questions.length ? 
          saved.questions.map(q => ({
            ...q,
            originalIndex: chapter.questions.findIndex(orig => orig.id === q.id) || 0
          })) : 
          chapter.questions.slice(0, numQuestions).map(q => ({
            id: q.id,
            subject: "Chemistry",
            question: q.question || "Question text not available",
            originalIndex: chapter.questions.findIndex(orig => orig.id === q.id),
            chapterName: chapter.name,
            unitName: chapter.unit
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
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-lg text-gray-700">Loading chemistry questions...</p>
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
          className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white rounded-t-xl"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold">Chemistry Chapters</h2>
          <p className="text-sm text-purple-100">Select chapters and specify the number of questions</p>
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
                    {["Selected", "Sr.no", "Chapter Name", "Unit", "Questions", "Total Marks"].map((header, i) => (
                      <th 
                        key={i} 
                        className={`py-3 px-4 text-center ${i === 0 ? "rounded-tl-xl w-24" : ""} ${i === 5 ? "rounded-tr-xl w-32" : ""} ${i === 2 ? "w-1/3" : ""}`}
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
                        className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer mx-auto ${chapter.isChecked ? "bg-purple-500" : "bg-gray-300"}`}
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
                        <div className="p-1 bg-purple-100 rounded-full mr-2">
                          <Image src="/chem.png" alt="Chemistry" width={20} height={20} className="w-5 h-5" />
                        </div>
                        <span className="truncate max-w-xs" title={chapter.name}>{chapter.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">
                      {chapter.unit}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <motion.input
                          type="number"
                          value={chapter.numQuestions}
                          onChange={(e) => handleQuestionChange(chapter.id, e)}
                          className="w-16 h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
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
                        className="w-16 h-10 bg-purple-50 flex items-center justify-center rounded-md mx-auto border border-purple-100"
                        animate={{ 
                          backgroundColor: chapter.totalMarks > 0 ? ["#f5f3ff", "#ede9fe", "#f5f3ff"] : "#f5f3ff",
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
                        <td colSpan="6" className="p-0">
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
                                        className={`hover:bg-purple-50 transition ${index === chapter.rows.length - 1 ? "border-none" : "border-b border-gray-200"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        exit={{ opacity: 0, y: -10 }}
                                      >
                                        <td className="py-3 px-4 text-center font-Mulish font-bold">{index + 1}</td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="font-Mulish font-semibold flex items-center justify-center space-x-1">
                                            <div className="p-1 bg-purple-100 rounded-full">
                                              <Image src="/chem.png" alt="Chemistry" width={20} height={20} className="w-4 h-4" />
                                            </div>
                                            <div className="text-sm font-semibold">Chemistry</div>
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
                                              className="cursor-pointer p-1 bg-purple-100 rounded-full hover:bg-purple-200"
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