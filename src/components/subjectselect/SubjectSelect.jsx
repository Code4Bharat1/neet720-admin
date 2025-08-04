"use client";

import React, { useState, useEffect } from "react";
import { FaFlask, FaDumbbell, FaArrowRight } from "react-icons/fa";
import { GiFruitBowl } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaFlask, FaDumbbell, FaArrowRight } from "react-icons/fa";
import { GiFruitBowl } from "react-icons/gi";
import { MdScience } from "react-icons/md";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const SelectSubjectPage = () => {
  const [difficulty, setDifficulty] = useState("Medium");
  const [marks, setMarks] = useState([]);
  const [marks, setMarks] = useState([]);
  const [testName, setTestName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("");
  const router = useRouter();
  const router = useRouter();
  const [questionTypeCounts, setQuestionTypeCounts] = useState({});

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const popIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const popIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };
  const allQuestionTypes = [
    "MCQ",
    "True/False",
    "Statement Based"
  ];

  const defaultCountsByDifficulty = {
    Easy: {
      MCQ: 10,
      "True/False": 5,
      "Short Answer": 2,
      "Statement Based": 0
    },
    Medium: {
      MCQ: 8,
      "True/False": 4,
      "Statement Based": 2
    },
    Hard: {
      MCQ: 4,
      "True/False": 2,
      "Statement Based": 3,
    },
  };

  // Load selected subjects from localStorage when the component mounts
  useEffect(() => {
    const savedSubjects =
      JSON.parse(localStorage.getItem("selectedSubjects")) || [];
    setSelectedSubjects(savedSubjects);
  }, []);

  // Load question type counts from localStorage or set defaults
  useEffect(() => {
    const savedCounts = JSON.parse(localStorage.getItem("questionTypeCounts"));
    if (savedCounts) setQuestionTypeCounts(savedCounts);
  }, []);

  // Save question type counts to localStorage whenever they change
  // Save question type counts to localStorage whenever they change
  useEffect(() => {
    let question_type = {
      "mcq":questionTypeCounts.MCQ,
      "statement_based":questionTypeCounts["Statement Based"],
      "true_false":questionTypeCounts["True/False"]
    }
    localStorage.setItem(
      "questionTypeCounts",
      JSON.stringify(question_type)
    );
  }, [questionTypeCounts]);

  // Function to update selected subjects and store them in localStorage
  const handleSubjectChange = (subjectOrSubjects) => {
    setSelectedSubjects((prev) => {
      let updatedSubjects;

      const subjects = Array.isArray(subjectOrSubjects)
        ? subjectOrSubjects
        : [subjectOrSubjects];

      // Toggle: if all are already selected → remove all, else → add all
      const allSelected = subjects.every((s) => prev.includes(s));

      if (allSelected) {
        updatedSubjects = prev.filter((s) => !subjects.includes(s));
      } else {
        updatedSubjects = [...new Set([...prev, ...subjects])];
      }

      localStorage.setItem("selectedSubjects", JSON.stringify(updatedSubjects));
      return updatedSubjects;
    });
  };

  // Load marks in localStorage
  useEffect(() => {
    const savedMarks = JSON.parse(localStorage.getItem("selectedMarks")) || [];
    setMarks(savedMarks);
  }, []);

  const handleMarksChange = (marksOption) => {
    setMarks((prev) => {
      let updatedMarks;
      if (prev.includes(marksOption)) {
        updatedMarks = prev.filter((m) => m !== marksOption);
      } else {
        updatedMarks = [...prev, marksOption];
      }
      localStorage.setItem("selectedMarks", JSON.stringify(updatedMarks));
      return updatedMarks;
    });
  };

  // Handle input change and save positive and negative marks to localStorage at once
  const handlePositiveMarksChange = (e) => {
    const value = e.target.value;
    setPositiveMarks(value);
    saveMarksToLocalStorage(value, negativeMarks, difficulty); // Save all values together
  };

  const handleNegativeMarksChange = (e) => {
    const value = e.target.value;
    setNegativeMarks(value);
    saveMarksToLocalStorage(positiveMarks, value, difficulty); // Save all values together
  };

  // Function to save positive, negative marks and difficulty in localStorage
  const saveMarksToLocalStorage = (positive, negative, difficulty) => {
    const marksData = {
      positiveMarks: positive,
      negativeMarks: negative,
      difficultyLevel: difficulty,
    };
    localStorage.setItem("marks", JSON.stringify(marksData));
  };

  // Handle Test Name change and save to localStorage
  const handleTestNameChange = (e) => {
    const value = e.target.value;
    setTestName(value);
    localStorage.setItem("testName", value); // Save test name to localStorage whenever it changes
  };

  // Handle "Continue" button click (route to first subject's page)
  const handleContinueClick = () => {
    if (!testName.trim()) {
      toast.error("Test name is required!", {
        duration: 5000,
      });
      toast.error("Test name is required!", {
        duration: 5000,
      });
      return;
    }

    if (selectedSubjects.length > 0) {
      const subject = selectedSubjects[0].toLowerCase(); // Get the first selected subject and convert it to lowercase
      router.push(`/select_chapters_${subject}`); // Route to the first selected subject's page
    } else {
      toast.error("Please select at least one subject!", {
        duration: 5000,
      });
    }
  };

    if (selectedSubjects.length > 0) {
      const subject = selectedSubjects[0].toLowerCase(); // Get the first selected subject and convert it to lowercase
      router.push(`/select_chapters_${subject}`); // Route to the first selected subject's page
    } else {
      toast.error("Please select at least one subject!", {
        duration: 5000,
      });
    }
  };

  return (
    <motion.div
      className="max-w-[1000px] m-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Top Section: Create Test */}
        <motion.div
          className="text-center mb-8 md:ml-50"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <motion.h3
            className="text-base font-extrabold text-black text-center mb-2 sm:text-lg md:text-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Create Test
          </motion.h3>
          <motion.input
            type="text"
            placeholder="Enter Test Name"
            value={testName}
            onChange={handleTestNameChange}
            className="mt-4 px-9 py-2 border-none rounded-xl bg-[#D1E3FF] text-black font-bold text-lg w-full md:w-2/5 placeholder:text-gray-400 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            whileFocus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.5)" }}
          />
        </motion.div>

        {/* Main Content Section */}
        <motion.div
          className="grid grid-cols-1 max-w-full md:grid-cols-3 gap-2 items-start text-black ml-35"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Left Section */}
          <motion.div className="relative w-[100%]" variants={fadeIn}>
            {/* Difficulty */}
            <motion.div className="relative mb-8" variants={popIn}>
              <h3 className="text-2xl font-semibold">Select Difficulty</h3>
              <p className="mt-5">
                Select at least 1 difficulty for each subject
              </p>
              <motion.select
                value={difficulty}
                onChange={(e) => {
                  const newDifficulty = e.target.value;
                  setDifficulty(newDifficulty);

                  const defaultCounts =
                    defaultCountsByDifficulty[newDifficulty];
                  setQuestionTypeCounts(defaultCounts); // Override existing counts with defaults

                  saveMarksToLocalStorage(
                    positiveMarks,
                    negativeMarks,
                    newDifficulty
                  );
                }}
                className="p-2 mt-5 w-[480px] h-[54px] rounded-[15px] bg-[#007AFF] text-white appearance-none px-9 text-lg outline-none focus:ring-0 shadow-lg font-normal ml-[-10px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option value="Easy" className="bg-white text-black">
                  Easy
                </option>
                <option value="Medium" className="bg-white text-black">
                  Medium
                </option>
                <option value="Hard" className="bg-white text-black">
                  Hard
                </option>
              </motion.select>

              <motion.img
                src="Vector 1.png" // Replace with the actual path of your arrow image
                alt="Dropdown Arrow"
                className="absolute top-1/2 left-110 w-4 h-3 pointer-events-none mt-11"
                animate={{ y: [0, 3, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            {/* Subjects */}
            <motion.div className="mb-8" variants={fadeIn}>
              <h3 className="text-lg font-semibold">Select Subjects</h3>
              <button
                className="p-2 bg-blue-400 text-white rounded cursor-pointer"
                onClick={() =>
                  handleSubjectChange(["Physics", "Chemistry", "Biology"])
                }
              >
                Select All
              </button>

              <motion.div
                className="flex flex-col gap-4 mt-2"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {[
                  { name: "Physics", img: "physic.png" },
                  { name: "Chemistry", img: "chemistry.png" },
                  { name: "Biology", img: "botany.png" },
                ].map((subject) => (
                  <motion.div
                    key={subject.name}
                    onClick={() => handleSubjectChange(subject.name)}
                    className={`cursor-pointer p-4 w-[357px] font-[700] h-[50px] drop-shadow-md rounded-2xl text-center ${
                      selectedSubjects.includes(subject.name)
                        ? "bg-blue-500 text-white border-purple-500"
                        : "bg-white border-gray-400"
                    } flex items-center justify-start gap-4 transition-colors duration-300`}
                    variants={popIn}
                    whileHover={{
                      scale: 1.05,
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={
                      selectedSubjects.includes(subject.name)
                        ? { y: [0, -5, 0], transition: { duration: 0.3 } }
                        : {}
                    }
                  >
                    <img
                      src={subject.img}
                      alt={subject.name}
                      className="w-8 h-8"
                    />
                    <span>{subject.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Section: Step Indicator & Cards in 2 Columns */}
          <motion.div className="grid grid-cols-2 w-[650px]" variants={fadeIn}>
            {/* Step Indicator */}
            <motion.div
              className="flex flex-col items-center gap-0 mt-9 md:w-[10px] pl-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div
                className="w-13 h-13 rounded-full border-4 border-blue-500 flex justify-center items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-blue-500 flex justify-center items-center text-white text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                ></motion.div>
              </motion.div>
              <motion.div
                className="w-1 h-34 bg-blue-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              ></motion.div>
              <motion.div
                className="w-10 h-10 rounded-full bg-gray-400 flex justify-center items-center text-white text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
              ></motion.div>
              <motion.div
                className="w-1 h-34 bg-blue-500"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              ></motion.div>
              <motion.div
                className="w-10 h-10 rounded-full bg-gray-400 flex justify-center items-center text-white text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              ></motion.div>
            </motion.div>

            {/* Cards */}
            <motion.div
              className="flex flex-col gap-2"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="flex justify-between w-full h-40 bg-[#007AFF] rounded-4xl p-5 text-white"
                variants={popIn}
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-semibold">Choose Subjects</h3>
                  <p className="font-semibold">
                    Select the Subjects and Difficulty
                  </p>
                </div>
                <motion.img
                  src="book.png"
                  alt="Books Icon"
                  className="w-20 h-22"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              <motion.div
                className="p-4 bg-yellow-400 text-white flex justify-between items-center w-full h-40 rounded-[25px]"
                variants={popIn}
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div>
                  <h3 className="text-xl font-semibold">
                    Please select chapters and other Details
                  </h3>
                  <p className="text-sm">
                    You can select chapters of different subjects and select
                    dedicated questions of each chapter
                  </p>
                </div>
                <motion.img
                  src="book.png"
                  alt="Books Icon"
                  className="w-20"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
              </motion.div>

              <motion.div
                className="flex justify-between w-full h-40 bg-yellow-400 rounded-4xl p-5 text-white"
                variants={popIn}
                whileHover={{
                  scale: 1.03,
                  boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-semibold">Completed!!</h3>
                  <p className="font-semibold">
                    Woah you have created a new Test
                  </p>
                </div>
                <motion.img
                  src="book.png"
                  alt="Books Icon"
                  className="w-20 h-22"
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6 mt-8 p-6 pl-10">
          {/* Set Number of Questions */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">
              Set Number of Questions per Type
            </h3>
            <div className="space-y-4">
              {allQuestionTypes.map((type) => (
                <div key={type} className="flex items-center justify-between">
                  <label className="text-gray-700 font-medium w-48">
                    {type}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={questionTypeCounts[type] || 0}
                    onChange={(e) => {
                      const updatedCounts = {
                        ...questionTypeCounts,
                        [type]: parseInt(e.target.value || 0, 10),
                      };
                      setQuestionTypeCounts(updatedCounts);
                    }}
                    className="w-28 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Select Marks per Question */}
          <motion.div
            className="flex-1 bg-[#FFBB38] rounded-[38px] p-6 shadow-lg border border-[#FBB03B] hidden lg:block"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-medium text-center text-white">
              Select Marks per Question
            </h2>

            {/* Positive Marks Input */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 }}
            >
              <label className="block text-xl font-light text-white">
                Positive marks (per question)
              </label>
              <motion.input
                type="text"
                value={positiveMarks}
                onChange={handlePositiveMarksChange}
                className="w-full mt-2 p-3 border border-white rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBB03B]"
                whileFocus={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              />
            </motion.div>

            {/* Negative Marks Input */}
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5 }}
            >
              <label className="block text-xl font-light text-white">
                Negative marks (per question)
              </label>
              <motion.input
                type="text"
                value={negativeMarks}
                onChange={handleNegativeMarksChange}
                className="w-full mt-2 p-3 border border-white rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FBB03B]"
                whileFocus={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.div
          className=" mb-5 flex justify-end text-center pr-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <motion.button
            className="bg-blue-500 text-white py-2 px-6 rounded-full flex items-center"
            onClick={handleContinueClick}
            whileHover={{ scale: 1.1, backgroundColor: "#3b82f6" }}
            whileTap={{ scale: 0.9 }}
          >
            Continue
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <FaArrowRight className="ml-2 text-white text-xl" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
    </motion.div>
  );
};

export default SelectSubjectPage;
