"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, BookOpen, FileText, RefreshCw, Eye, Plus, Minus } from 'lucide-react';

export default function ChemistryChapterList() {
  const [chapters, setChapters] = useState({});
  const [topics, setTopics] = useState({});
  const [questions, setQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(null);
  const [expandedChapter, setExpandedChapter] = useState(null);

  // Fetch chemistry chapters and questions
  useEffect(() => {
    const fetchChemistryData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest/chemistry-questions`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const { chapters: chaptersData, questions: questionsData } = data;
        console.log("Fetched Chemistry Chapters:", chaptersData);
        console.log("Fetched Chemistry Questions:", questionsData);

        // Store chapters, topics, and questions separately
        const chaptersObj = {};
        const topicsObj = {};
        const questionsObj = {};

        // Process chapters
        chaptersData.forEach((chapter) => {
          chaptersObj[chapter.chapter_name] = {
            id: chapter.id,
            name: chapter.chapter_name,
            isSelected: false,
            selectedQuestions: 0,
            totalMarks: 0,
            totalQuestions: 0, // Will be updated after processing questions
          };

          // Initialize topics for this chapter (default to "General Topic")
          topicsObj[chapter.chapter_name] = {
            "General Topic": {
              id: chapter.id * 1000 + 1, // Generate a unique topic ID
              name: "General Topic",
              chapterName: chapter.chapter_name,
              isSelected: false,
              numQuestions: 0,
              maxQuestions: 0, // Will be updated after processing questions
              difficulty: "medium", // Default
              examType: "NEET", // Default
              selectedQuestionIds: [],
            },
          };

          // Initialize questions for this chapter
          questionsObj[chapter.chapter_name] = [];
        });

        // Process questions and assign to chapters and topics
        questionsData.forEach((q) => {
          const chapterName = q.chapter_name || "Unknown Chapter";
          if (!questionsObj[chapterName]) {
            questionsObj[chapterName] = [];
            chaptersObj[chapterName] = {
              id: Object.keys(chaptersObj).length + 1,
              name: chapterName,
              isSelected: false,
              selectedQuestions: 0,
              totalMarks: 0,
              totalQuestions: 0,
            };
            topicsObj[chapterName] = {
              "General Topic": {
                id: (Object.keys(chaptersObj).length + 1) * 1000 + 1,
                name: "General Topic",
                chapterName: chapterName,
                isSelected: false,
                numQuestions: 0,
                maxQuestions: 0,
                difficulty: "medium",
                examType: "NEET",
                selectedQuestionIds: [],
              },
            };
          }

          questionsObj[chapterName].push({
            question_id: q.id,
            question_text: q.question_text,
            pdf_id: q.pdf_id,
            difficulty_level: "medium", // Default
            exam_type: "NEET", // Default
          });

          // Update chapter and topic counts
          chaptersObj[chapterName].totalQuestions += 1;
          topicsObj[chapterName]["General Topic"].maxQuestions += 1;
        });

        setChapters(chaptersObj);
        setTopics(topicsObj);
        setQuestions(questionsObj);
        console.log("Chapters Object:", chaptersObj);
        console.log("Topics Object:", topicsObj);
        console.log("Questions Object:", questionsObj);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chemistry data:", error);
        setLoading(false);
      }
    };

    fetchChemistryData();
  }, []);

  // Toggle chapter expansion
  const toggleChapterExpansion = (chapterName) => {
    setExpandedChapter((prev) => (prev === chapterName ? null : chapterName));
  };

  // Handle chapter selection
  const handleChapterSelection = (chapterName) => {
    setChapters((prev) => {
      const updated = { ...prev };
      const chapter = updated[chapterName];
      const newSelected = !chapter.isSelected;

      updated[chapterName] = {
        ...chapter,
        isSelected: newSelected,
      };

      return updated;
    });

    setTopics((prev) => {
      const updated = { ...prev };
      const chapterTopics = updated[chapterName];
      const newSelected = !chapters[chapterName].isSelected;

      Object.keys(chapterTopics).forEach((topicName) => {
        const topic = chapterTopics[topicName];
        chapterTopics[topicName] = {
          ...topic,
          isSelected: newSelected,
          numQuestions: newSelected ? Math.min(5, topic.maxQuestions) : 0,
          selectedQuestionIds: newSelected
            ? questions[chapterName]?.slice(0, Math.min(5, topic.maxQuestions)).map((q) => q.question_id) || []
            : [],
        };
      });

      // Update chapter totals
      const totalSelectedQuestions = Object.values(chapterTopics)
        .filter((t) => t.isSelected)
        .reduce((sum, t) => sum + t.numQuestions, 0);

      setChapters((prevChapters) => ({
        ...prevChapters,
        [chapterName]: {
          ...prevChapters[chapterName],
          selectedQuestions: totalSelectedQuestions,
          totalMarks: totalSelectedQuestions * 4,
        },
      }));

      updateLocalStorage(prevChapters, updated);
      return updated;
    });
  };

  // Handle topic selection
  const handleTopicSelection = (chapterName, topicName) => {
    setTopics((prev) => {
      const updated = { ...prev };
      const topic = updated[chapterName][topicName];
      const newSelected = !topic.isSelected;

      updated[chapterName][topicName] = {
        ...topic,
        isSelected: newSelected,
        numQuestions: newSelected ? Math.min(5, topic.maxQuestions) : 0,
        selectedQuestionIds: newSelected
          ? questions[chapterName]?.slice(0, Math.min(5, topic.maxQuestions)).map((q) => q.question_id) || []
          : [],
      };

      // Update chapter totals
      const chapterTopics = updated[chapterName];
      const totalSelectedQuestions = Object.values(chapterTopics)
        .filter((t) => t.isSelected)
        .reduce((sum, t) => sum + t.numQuestions, 0);

      setChapters((prevChapters) => ({
        ...prevChapters,
        [chapterName]: {
          ...prevChapters[chapterName],
          isSelected: Object.values(chapterTopics).some((t) => t.isSelected),
          selectedQuestions: totalSelectedQuestions,
          totalMarks: totalSelectedQuestions * 4,
        },
      }));

      updateLocalStorage(chapters, updated);
      return updated;
    });
  };

  // Handle question count change for topics
  const handleTopicQuestionChange = (chapterName, topicName, value) => {
    setTopics((prev) => {
      const updated = { ...prev };
      const topic = updated[chapterName][topicName];
      const numQuestions = Math.min(Math.max(0, parseInt(value) || 0), topic.maxQuestions);
      const selectedQuestions = questions[chapterName]?.slice(0, numQuestions) || [];

      updated[chapterName][topicName] = {
        ...topic,
        isSelected: numQuestions > 0,
        numQuestions,
        selectedQuestionIds: selectedQuestions.map((q) => q.question_id),
      };

      // Update chapter totals
      const chapterTopics = updated[chapterName];
      const totalSelectedQuestions = Object.values(chapterTopics)
        .filter((t) => t.isSelected)
        .reduce((sum, t) => sum + t.numQuestions, 0);

      setChapters((prevChapters) => ({
        ...prevChapters,
        [chapterName]: {
          ...prevChapters[chapterName],
          isSelected: Object.values(chapterTopics).some((t) => t.isSelected),
          selectedQuestions: totalSelectedQuestions,
          totalMarks: totalSelectedQuestions * 4,
        },
      }));

      updateLocalStorage(chapters, updated);
      return updated;
    });
  };

  // Replace question in topic
  const handleReplaceQuestion = (chapterName, topicName, questionIndex) => {
    setRefreshing({ chapterName, topicName, questionIndex });

    setTimeout(() => {
      setTopics((prev) => {
        const updated = { ...prev };
        const topic = updated[chapterName][topicName];
        const availableQuestions = questions[chapterName]?.filter(
          (q) => !topic.selectedQuestionIds.includes(q.question_id)
        ) || [];

        if (availableQuestions.length === 0) {
          alert("No more questions available for replacement in this topic.");
          return updated;
        }

        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        const newSelectedIds = [...topic.selectedQuestionIds];
        newSelectedIds[questionIndex] = randomQuestion.question_id;

        updated[chapterName][topicName] = {
          ...topic,
          selectedQuestionIds: newSelectedIds,
        };

        updateLocalStorage(chapters, updated);
        setRefreshing(null);
        return updated;
      });
    }, 600);
  };

  // Update localStorage
  const updateLocalStorage = (chaptersData, topicsData) => {
    const selectedData = Object.values(chaptersData)
      .filter((chapter) => chapter.isSelected)
      .map((chapter) => ({
        chapterName: chapter.name,
        topics: Object.values(topicsData[chapter.name] || {})
          .filter((topic) => topic.isSelected)
          .map((topic) => ({
            topicName: topic.name,
            numQuestions: topic.numQuestions,
            totalMarks: topic.numQuestions * 4,
            questions: topic.selectedQuestionIds.map((id) => {
              const question = questions[chapter.name]?.find((q) => q.question_id === id);
              return question
                ? {
                    id: question.question_id,
                    subject: "Chemistry",
                    question: question.question_text,
                    difficulty: question.difficulty_level,
                    examType: question.exam_type,
                  }
                : null;
            }).filter(Boolean),
          })),
      }));

    localStorage.setItem("Chemistry", JSON.stringify(selectedData));
  };

  // Load from localStorage
  useEffect(() => {
    if (Object.keys(chapters).length === 0 || Object.keys(topics).length === 0) return;

    const savedData = JSON.parse(localStorage.getItem("Chemistry")) || [];

    if (savedData.length > 0) {
      setChapters((prev) => {
        const updated = { ...prev };
        savedData.forEach((savedChapter) => {
          if (updated[savedChapter.chapterName]) {
            const totalSelectedQuestions = savedChapter.topics.reduce((sum, topic) => sum + topic.numQuestions, 0);
            updated[savedChapter.chapterName] = {
              ...updated[savedChapter.chapterName],
              isSelected: true,
              selectedQuestions: totalSelectedQuestions,
              totalMarks: totalSelectedQuestions * 4,
            };
          }
        });
        return updated;
      });

      setTopics((prev) => {
        const updated = { ...prev };
        savedData.forEach((savedChapter) => {
          if (updated[savedChapter.chapterName]) {
            savedChapter.topics.forEach((savedTopic) => {
              if (updated[savedChapter.chapterName][savedTopic.topicName]) {
                updated[savedChapter.chapterName][savedTopic.topicName] = {
                  ...updated[savedChapter.chapterName][savedTopic.topicName],
                  isSelected: true,
                  numQuestions: savedTopic.numQuestions,
                  selectedQuestionIds: savedTopic.questions.map((q) => q.id),
                };
              }
            });
          }
        });
        return updated;
      });
    }
  }, [chapters, topics]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'simple':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
              transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
            }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-gray-700">Loading chemistry chapters...</p>
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
      <div className="bg-white w-full max-w-6xl rounded-xl overflow-hidden border-none shadow-lg">
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white rounded-t-xl"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Chemistry Chapters & Topics
              </h2>
              <p className="text-sm text-purple-100">Select chapters and topics to customize your question set</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100">Total Selected</div>
              <div className="text-2xl font-bold">
                {Object.values(chapters).reduce((sum, ch) => sum + ch.selectedQuestions, 0)} Questions
              </div>
            </div>
          </div>
        </motion.div>

        <div className="p-6 space-y-4">
          {Object.values(chapters).map((chapter, chapterIndex) => (
            <motion.div
              key={chapter.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
              variants={itemVariants}
            >
              {/* Chapter Header */}
              <div className="bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.button
                      onClick={() => handleChapterSelection(chapter.name)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        chapter.isSelected
                          ? 'bg-purple-500 border-purple-500'
                          : 'border-gray-300 hover:border-purple-400'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {chapter.isSelected && (
                        <motion.svg
                          className="w-4 h-4 text-white"
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
                    </motion.button>

                    <motion.button
                      onClick={() => toggleChapterExpansion(chapter.name)}
                      className="flex items-center space-x-2 text-left"
                      whileHover={{ x: 5 }}
                    >
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Image src="/chem.png" alt="Chemistry" width={24} height={24} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{chapter.name}</h3>
                        <p className="text-sm text-gray-500">
                          {chapter.totalQuestions} total questions
                        </p>
                      </div>
                    </motion.button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Selected</div>
                      <div className="font-semibold text-purple-600">
                        {chapter.selectedQuestions} / {chapter.totalQuestions}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Marks</div>
                      <div className="font-semibold text-green-600">{chapter.totalMarks}</div>
                    </div>
                    <motion.button
                      onClick={() => toggleChapterExpansion(chapter.name)}
                      className="p-2 hover:bg-gray-200 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: expandedChapter === chapter.name ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Topics Dropdown */}
              <AnimatePresence>
                {expandedChapter === chapter.name && topics[chapter.name] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid gap-4">
                        {Object.values(topics[chapter.name]).map((topic, topicIndex) => (
                          <motion.div
                            key={topic.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: topicIndex * 0.05 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <motion.button
                                  onClick={() => handleTopicSelection(chapter.name, topic.name)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    topic.isSelected
                                      ? 'bg-purple-500 border-purple-500'
                                      : 'border-gray-300 hover:border-purple-400'
                                  }`}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {topic.isSelected && (
                                    <motion.svg
                                      className="w-3 h-3 text-white"
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
                                </motion.button>

                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-purple-500" />
                                  <span className="font-medium text-gray-900">{topic.name}</span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                      topic.difficulty
                                    )}`}
                                  >
                                    {topic.difficulty}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500">Questions:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={topic.maxQuestions}
                                    value={topic.numQuestions}
                                    onChange={(e) =>
                                      handleTopicQuestionChange(chapter.name, topic.name, e.target.value)
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  />
                                  <span className="text-sm text-gray-400">/ {topic.maxQuestions}</span>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-gray-500">Marks</div>
                                  <div className="font-semibold text-green-600">{topic.numQuestions * 4}</div>
                                </div>
                              </div>
                            </div>

                            {/* Selected Questions Preview */}
                            {topic.isSelected && topic.numQuestions > 0 && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t border-gray-100"
                              >
                                <div className="space-y-2">
                                  {topic.selectedQuestionIds.slice(0, 3).map((questionId, qIndex) => {
                                    const question = questions[chapter.name]?.find((q) => q.question_id === questionId);
                                    return (
                                      <div
                                        key={questionId}
                                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs font-medium text-gray-500">
                                            Q{qIndex + 1}:
                                          </span>
                                          <span className="text-sm text-gray-700 truncate max-w-md">
                                            {question?.question_text || 'Question not found'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <motion.button
                                            onClick={() =>
                                              handleReplaceQuestion(chapter.name, topic.name, qIndex)
                                            }
                                            className="p-1 hover:bg-gray-200 rounded"
                                            whileHover={{ scale: 1.1, rotate: 180 }}
                                            whileTap={{ scale: 0.9 }}
                                            animate={
                                              refreshing &&
                                              refreshing.chapterName === chapter.name &&
                                              refreshing.topicName === topic.name &&
                                              refreshing.questionIndex === qIndex
                                                ? { rotate: 360 }
                                                : { rotate: 0 }
                                            }
                                            transition={{ duration: 0.5 }}
                                          >
                                            <RefreshCw className="w-4 h-4 text-purple-500" />
                                          </motion.button>
                                          <motion.button
                                            className="p-1 hover:bg-gray-200 rounded"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                          >
                                            <Eye className="w-4 h-4 text-gray-500" />
                                          </motion.button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {topic.numQuestions > 3 && (
                                    <div className="text-center text-sm text-gray-500">
                                      +{topic.numQuestions - 3} more questions
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}