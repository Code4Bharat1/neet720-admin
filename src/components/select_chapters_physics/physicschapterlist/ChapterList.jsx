"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShuffleIcon, AtomIcon, Menu, X } from "lucide-react";

/* -------------------------------------------------------------------- */
/*  CONFIG                                                             */
/* -------------------------------------------------------------------- */
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest`;
const PAGE_SIZE = 250;

/* -------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                     */
/* -------------------------------------------------------------------- */
export default function BiologyChapterList() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /* ------------------------------------------------------------------ */
  /*  STEP‑1  Fetch lightweight metadata → build skeleton               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const meta = await axios.get(`${API_BASE}/Physics/metadata`);
        const skeleton = meta.data.chapters.map((c, idx) => ({
          id: idx + 1,
          name: c.chapter_name,
          unit: "Unit I",
          topics: c.topics.reduce((acc, t) => {
            acc[t.topic_name] = { name: t.topic_name, questions: [] };
            return acc;
          }, {}),
          topicsList: c.topics.map((t) => t.topic_name),
          allQuestions: [],
          maxQuestions: 0,
          isChecked: false,
          selectedTopic: null,
          numQuestions: 0,
          totalMarks: 0,
          rows: [],
        }));
        setChapters(skeleton);
        await streamAllQuestions(setChapters);
        setLoading(false);
      } catch (err) {
        console.error("Physics meta fetch failed:", err);
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  STEP‑2  Stream questions                                           */
  /* ------------------------------------------------------------------ */
  const streamAllQuestions = async (setter) => {
    const res = await axios.get(`${API_BASE}/physics/questions`, {
      params: { page: 1, limit: PAGE_SIZE },
    });

    const { questions } = res.data;

    setter((prev) => {
      const map = { ...prev.reduce((m, c) => ((m[c.name] = c), m), {}) };

      questions.forEach((q) => {
        const ch = map[q.chapter_name];
        if (!ch) return;

        if (!ch.topics[q.topic_name]) {
          ch.topics[q.topic_name] = { name: q.topic_name, questions: [] };
          ch.topicsList.push(q.topic_name);
        }

        const qObj = {
          id: q.id,
          subject: "Physics",
          question: q.question_text,
          topicName: q.topic_name,
        };

        ch.topics[q.topic_name].questions.push(qObj);
        ch.allQuestions.push(qObj);
      });

      Object.values(map).forEach(
        (c) => (c.maxQuestions = c.allQuestions.length)
      );
      return Object.values(map);
    });
  };

  /* ------------------------------------------------------------------ */
  /*  LocalStorage helpers                                              */
  /* ------------------------------------------------------------------ */
  const updateLocalStorage = useCallback((chs) => {
    const selectedChapters = chs
      .filter((ch) => ch.isChecked)
      .map((ch) => ({
        chapterName: ch.name,
        unit: ch.unit,
        selectedTopic: ch.selectedTopic,
        numQuestions: ch.numQuestions,
        totalMarks: ch.numQuestions * 4,
        questions: ch.rows,
      }));
    localStorage.setItem("Physics", JSON.stringify(selectedChapters));

    const changedQuestions = chs
      .filter((ch) => ch.isChecked && ch.rows.length > 0)
      .flatMap((ch) =>
        ch.rows.map((row) => ({
          questionId: row.id,
          questionText: row.question,
          subjectName: "Physics",
          chapterName: ch.name,
          unitName: ch.unit,
          topicName: row.topicName,
          originalIndex: row.originalIndex || 0,
        }))
      );
    localStorage.setItem("changedQuestions", JSON.stringify(changedQuestions));
  }, []);

  const handleFullLengthTest = () => {
    const TOTAL_QUESTIONS = 45;
    const updated = [...chapters];
    const pool = [];

    updated.forEach((ch) => {
      const source =
        ch.selectedTopic && ch.topics[ch.selectedTopic]
          ? ch.topics[ch.selectedTopic].questions
          : ch.allQuestions;

      source.forEach((q) => {
        pool.push({
          ...q,
          chapterRef: ch,
        });
      });
    });

    const shuffled = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, TOTAL_QUESTIONS);

    const result = updated.map((ch) => ({
      ...ch,
      isChecked: false,
      rows: [],
      numQuestions: 0,
      totalMarks: 0,
    }));

    shuffled.forEach((q, index) => {
      const chIndex = result.findIndex((r) => r.name === q.chapterRef.name);
      if (chIndex !== -1) {
        const ch = result[chIndex];
        const newRow = {
          id: q.id,
          subject: "Physics",
          question: q.question,
          originalIndex: index,
          chapterName: ch.name,
          unitName: ch.unit,
          topicName: q.topicName,
        };
        result[chIndex] = {
          ...ch,
          isChecked: true,
          rows: [...ch.rows, newRow],
          numQuestions: ch.numQuestions + 1,
          totalMarks: (ch.numQuestions + 1) * 4,
        };
      }
    });

    updateLocalStorage(result);
    setChapters(result);
  };

  /* ------------------------------------------------------------------ */
  /*  Restore saved draft                                               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!chapters.length) return;

    const saved = JSON.parse(localStorage.getItem("Physics")) || [];

    setChapters((prev) =>
      prev.map((ch) => {
        const s = saved.find((x) => x.chapterName === ch.name);
        if (!s) return ch;

        const pool =
          s.selectedTopic && ch.topics[s.selectedTopic]
            ? ch.topics[s.selectedTopic].questions
            : ch.allQuestions;

        const rows =
          s.questions && s.questions.length
            ? s.questions.map((q) => {
                const match =
                  pool.find((orig) => orig.id === q.id) ||
                  ch.allQuestions.find((orig) => orig.id === q.id);

                return {
                  id: q.id,
                  subject: "Physics",
                  question: match?.question || q.question,
                  originalIndex: match
                    ? pool.findIndex((orig) => orig.id === match.id)
                    : 0,
                  chapterName: ch.name,
                  unitName: ch.unit,
                  topicName: q.topicName,
                };
              })
            : pool.slice(0, s.numQuestions).map((q, idx) => ({
                id: q.id,
                subject: "Physics",
                question: q.question,
                originalIndex: idx,
                chapterName: ch.name,
                unitName: ch.unit,
                topicName: q.topicName,
              }));

        return {
          ...ch,
          isChecked: true,
          selectedTopic: s.selectedTopic ?? null,
          numQuestions: s.numQuestions ?? rows.length,
          totalMarks: (s.numQuestions ?? rows.length) * 4,
          rows,
        };
      })
    );
  }, [chapters.length]);

  /* ------------------------------------------------------------------ */
  /*  Event handlers                                                    */
  /* ------------------------------------------------------------------ */
  const handleCheckboxChange = (id) =>
    setChapters((prev) => toggleChapterCheck(prev, id, updateLocalStorage));

  const handleTopicChange = (chapterId, topic) =>
    setChapters((prev) =>
      changeTopic(prev, chapterId, topic, updateLocalStorage)
    );

  const handleQuestionChange = (id, e) =>
    setChapters((prev) => changeQuestionCount(prev, id, e, updateLocalStorage));

  const handleReplaceQuestion = (chapterId, rowIndex) => {
    setRefreshing({ chapterId, rowIndex });
    setTimeout(() => {
      setChapters((prev) =>
        replaceRandom(
          prev,
          chapterId,
          rowIndex,
          setRefreshing,
          updateLocalStorage
        )
      );
    }, 600);
  };

  /* ------------------------------------------------------------------ */
  /*  Animation variants                                                */
  /* ------------------------------------------------------------------ */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  /* ------------------------------------------------------------------ */
  /*  Loading spinner                                                   */
  /* ------------------------------------------------------------------ */
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
          ></motion.div>
          <p className="text-lg text-gray-700">Loading Physics questions…</p>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Mobile Card Component                                             */
  /* ------------------------------------------------------------------ */
const MobileChapterCard = ({ chapter, index }) => (
  <motion.div
    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    variants={itemVariants}
    layout
  >
    {/* Card Header */}
    <div className="p-4 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className={`w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer shadow-sm ${
              chapter.isChecked
                ? "bg-gradient-to-r from-purple-500 to-blue-500"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() => handleCheckboxChange(chapter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
          <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
            Chapter {index + 1}
          </span>
        </div>
        <motion.div
          className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 min-w-[60px] text-center"
          animate={{
            backgroundColor:
              chapter.totalMarks > 0
                ? ["#f5f3ff", "#ede9fe", "#f5f3ff"]
                : "#f5f3ff",
          }}
          transition={{
            duration: 1.5,
            repeat: chapter.totalMarks > 0 ? Infinity : 0,
            repeatType: "reverse",
          }}
        >
          <span className="text-sm font-bold text-purple-700">
            {chapter.totalMarks}
          </span>
          <span className="text-xs text-gray-500 block">marks</span>
        </motion.div>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-xl">
          <Image
            src="/Atoms.svg"
            alt="Physics"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
        <h3 className="font-semibold text-gray-800 text-base leading-tight flex-1">
          {chapter.name}
        </h3>
      </div>
    </div>

    {/* Card Content */}
    <div className="p-4 sm:p-5">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Topic Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Select Topic
          </label>
          <div className="relative">
            <select
              value={chapter.selectedTopic || ""}
              onChange={(e) =>
                handleTopicChange(chapter.id, e.target.value || null)
              }
              className={`w-full h-12 bg-gray-50 text-sm font-medium outline-none rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none pr-10 px-4 ${
                chapter.isChecked
                  ? "cursor-pointer"
                  : "cursor-not-allowed opacity-60"
              }`}
              disabled={!chapter.isChecked}
            >
              <option value="">
                All Topics ({chapter.topicsList.length})
              </option>
              {chapter.topicsList.map((t, idx) => (
                <option key={idx} value={t}>
                  {t} ({chapter.topics[t].questions.length})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Questions Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
            Questions
          </label>
          <div className="flex items-center space-x-2">
            <motion.input
              type="number"
              value={chapter.numQuestions}
              onChange={(e) => handleQuestionChange(chapter.id, e)}
              className="flex-1 h-12 bg-gray-50 text-center text-sm font-semibold outline-none rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              min={0}
              max={
                chapter.selectedTopic && chapter.topics[chapter.selectedTopic]
                  ? chapter.topics[chapter.selectedTopic].questions.length
                  : chapter.maxQuestions
              }
              whileFocus={{ scale: 1.02 }}
            />
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              /{" "}
              {chapter.selectedTopic && chapter.topics[chapter.selectedTopic]
                ? chapter.topics[chapter.selectedTopic].questions.length
                : chapter.maxQuestions}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Expanded Questions Section - Add this back from your original code */}
    <AnimatePresence>
      {chapter.isChecked && chapter.numQuestions > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Selected Questions:
            </h4>
            <div className="space-y-3">
              {chapter.rows.length ? (
                chapter.rows.map((row, idx) => (
                  <motion.div
                    key={`${row.id}-${idx}`}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-purple-600">
                          Q{idx + 1}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          {row.topicName}
                        </span>
                      </div>
                      <motion.div
                        onClick={() => handleReplaceQuestion(chapter.id, idx)}
                        className="cursor-pointer p-1 bg-purple-100 rounded-full hover:bg-purple-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ShuffleIcon className="w-4 h-4 text-purple-600" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {row.question}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No questions available for this chapter/topic
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */
  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4 lg:px-6 xl:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 sm:p-6 lg:p-8 text-white mb-6 shadow-lg"
        variants={itemVariants}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Physics Chapters
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 mt-2">
              Select chapters, topics and specify the number of questions
            </p>
          </div>
          <motion.button
            onClick={handleFullLengthTest}
            className="bg-white text-blue-800 font-semibold px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-blue-100 transition text-sm sm:text-base whitespace-nowrap shadow-md hover:shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Generate Full Length Test (45 Qs)
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="">
              {" "}
              {/* Reduced minimum width */}
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  className="border-b border-gray-100 last:border-b-0"
                  variants={itemVariants}
                >
                  <table className="w-full text-sm text-left font-Poppins text-[#181C32]">
                    <thead className="bg-gradient-to-r from-blue-50 to-purple-50 text-[#181C32] font-Mulish font-semibold">
                      <tr>
                        {[
                          { title: "Selected", width: "w-24" },
                          { title: "Sr.no", width: "w-20" },
                          { title: "Chapter Name", width: "w-96" },
                          { title: "Select Topic", width: "w-64" },
                          { title: "Questions", width: "w-36" },
                          { title: "Total Marks", width: "w-32" },
                        ].map((header, i) => (
                          <th
                            key={i}
                            className={`py-4 px-4 text-center text-sm font-semibold ${
                              header.width
                            } ${i === 0 ? "rounded-tl-xl" : ""} ${
                              i === 5 ? "rounded-tr-xl" : ""
                            }`}
                          >
                            {header.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <motion.div
                            className={`w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer mx-auto shadow-sm ${
                              chapter.isChecked
                                ? "bg-gradient-to-r from-purple-500 to-blue-500"
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            onClick={() => handleCheckboxChange(chapter.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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

                        {/* Sr No */}
                        <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {index + 1}
                          </span>
                        </td>

                        {/* Chapter Name */}
                        <td className="py-4 px-4 text-left font-Mulish font-semibold text-black">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-xl flex-shrink-0">
                              <Image
                                src="/Atoms.svg"
                                alt="Physics"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                            </div>
                            <span className="font-semibold text-gray-800 leading-tight">
                              {chapter.name}
                            </span>
                          </div>
                        </td>

                        {/* Topic Selector */}
                        <td className="py-4 px-4 text-center">
                          <div className="relative">
                            <select
                              value={chapter.selectedTopic || ""}
                              onChange={(e) =>
                                handleTopicChange(
                                  chapter.id,
                                  e.target.value || null
                                )
                              }
                              className={`w-full h-12 bg-gray-50 text-center font-Mulish font-semibold outline-none rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none pr-10 ${
                                chapter.isChecked
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed opacity-60"
                              }`}
                              disabled={!chapter.isChecked}
                            >
                              <option value="">
                                All Topics ({chapter.topicsList.length})
                              </option>
                              {chapter.topicsList.map((t, idx) => (
                                <option key={idx} value={t}>
                                  {t} ({chapter.topics[t].questions.length})
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Questions Input */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <motion.input
                              type="number"
                              value={chapter.numQuestions}
                              onChange={(e) =>
                                handleQuestionChange(chapter.id, e)
                              }
                              className="w-20 h-12 bg-gray-50 text-center font-Mulish font-semibold outline-none rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                              min={0}
                              max={
                                chapter.selectedTopic &&
                                chapter.topics[chapter.selectedTopic]
                                  ? chapter.topics[chapter.selectedTopic]
                                      .questions.length
                                  : chapter.maxQuestions
                              }
                              whileFocus={{ scale: 1.02 }}
                            />
                            <div className="text-xs text-gray-500 font-medium">
                              <span className="block">max</span>
                              <span className="block">
                                {chapter.selectedTopic &&
                                chapter.topics[chapter.selectedTopic]
                                  ? chapter.topics[chapter.selectedTopic]
                                      .questions.length
                                  : chapter.maxQuestions}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Marks */}
                        <td className="py-4 px-4 text-center font-Mulish font-semibold">
                          <motion.div
                            className="w-20 h-12 bg-gradient-to-r from-purple-50 to-blue-50 flex flex-col items-center justify-center rounded-xl mx-auto border-2 border-purple-200 shadow-sm"
                            animate={{
                              backgroundColor:
                                chapter.totalMarks > 0
                                  ? ["#f5f3ff", "#ede9fe", "#f5f3ff"]
                                  : "#f5f3ff",
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: chapter.totalMarks > 0 ? Infinity : 0,
                              repeatType: "reverse",
                            }}
                          >
                            <span className="text-lg font-bold text-purple-700">
                              {chapter.totalMarks}
                            </span>
                            <span className="text-xs text-gray-500">marks</span>
                          </motion.div>
                        </td>
                      </tr>

                      {/* Expanded question rows */}
                      <AnimatePresence>
                        {chapter.isChecked && chapter.numQuestions > 0 && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={6} className="p-4">
                              {" "}
                              {/* Updated colspan */}
                              <motion.div
                                className="rounded-xl shadow-lg bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 overflow-hidden"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm text-left font-Poppins text-[#181C32] min-w-[800px]">
                                    <thead className="bg-gradient-to-r from-gray-100 to-purple-100 text-black border-b border-gray-200">
                                      <tr>
                                        {[
                                          { title: "Q.no", width: "w-16" },
                                          { title: "Subject", width: "w-32" },
                                          { title: "Topic", width: "w-48" },
                                          {
                                            title: "Question",
                                            width: "flex-1",
                                          },
                                          { title: "Action", width: "w-24" },
                                        ].map((h, i) => (
                                          <th
                                            key={i}
                                            className={`py-3 px-4 font-Mulish font-semibold text-center ${
                                              h.width
                                            } ${
                                              i === 0 ? "rounded-tl-xl" : ""
                                            } ${
                                              i === 4 ? "rounded-tr-xl" : ""
                                            }`}
                                          >
                                            {h.title}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <AnimatePresence>
                                        {chapter.rows.length ? (
                                          chapter.rows.map((row, idx) => (
                                            <motion.tr
                                              key={`${row.id}-${idx}`}
                                              className={`hover:bg-white transition-colors ${
                                                idx === chapter.rows.length - 1
                                                  ? "border-none"
                                                  : "border-b border-gray-200"
                                              }`}
                                              initial={{ opacity: 0, y: 10 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              transition={{ delay: idx * 0.05 }}
                                              exit={{ opacity: 0, y: -10 }}
                                            >
                                              <td className="py-4 px-4 text-center font-Mulish font-bold">
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                                                  {idx + 1}
                                                </span>
                                              </td>
                                              <td className="py-4 px-4 text-center">
                                                <div className="font-Mulish font-semibold flex items-center justify-center space-x-2">
                                                  <div className="p-1.5 bg-purple-100 rounded-lg">
                                                    <Image
                                                      src="/Atoms.svg"
                                                      alt="Physics"
                                                      width={16}
                                                      height={16}
                                                      className="w-4 h-4"
                                                    />
                                                  </div>
                                                  <span className="text-sm font-semibold text-gray-700">
                                                    Physics
                                                  </span>
                                                </div>
                                              </td>
                                              <td className="py-4 px-4 text-center font-Mulish font-medium text-gray-600">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full inline-block font-medium">
                                                  {row.topicName}
                                                </span>
                                              </td>
                                              <td className="py-4 px-4 font-Mulish font-medium text-gray-700">
                                                <div className="leading-relaxed">
                                                  {row.question}
                                                </div>
                                              </td>
                                              <td className="py-4 px-4 text-center">
                                                <div className="flex justify-center">
                                                  <motion.div
                                                    onClick={() =>
                                                      handleReplaceQuestion(
                                                        chapter.id,
                                                        idx
                                                      )
                                                    }
                                                    className="cursor-pointer p-2 bg-purple-100 rounded-xl hover:bg-purple-200 shadow-sm"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                  >
                                                    <ShuffleIcon className="w-5 h-5 text-purple-600" />
                                                  </motion.div>
                                                </div>
                                              </td>
                                            </motion.tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan={5}
                                              className="py-8 text-center text-gray-500"
                                            >
                                              <div className="flex flex-col items-center space-y-2">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                  <span className="text-2xl text-gray-400">
                                                    📝
                                                  </span>
                                                </div>
                                                <p className="font-medium">
                                                  No questions available for
                                                  this chapter/topic
                                                </p>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </AnimatePresence>
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        <div className="grid gap-4">
          {chapters.map((chapter, index) => (
            <MobileChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------- */
/*  Pure helper reducers                                                */
/* -------------------------------------------------------------------- */
function toggleChapterCheck(prev, id, cb) {
  const upd = prev.map((ch) =>
    ch.id === id
      ? {
          ...ch,
          isChecked: !ch.isChecked,
          numQuestions: !ch.isChecked ? 0 : ch.numQuestions,
          totalMarks: !ch.isChecked ? 0 : ch.totalMarks,
          rows: !ch.isChecked ? [] : ch.rows,
          selectedTopic: !ch.isChecked ? null : ch.selectedTopic,
        }
      : ch
  );
  cb(upd);
  return upd;
}

function changeTopic(prev, chapterId, topicName, cb) {
  const upd = prev.map((ch) =>
    ch.id === chapterId
      ? {
          ...ch,
          selectedTopic: topicName || null,
          numQuestions: 0,
          totalMarks: 0,
          rows: [],
        }
      : ch
  );
  cb(upd);
  return upd;
}

function changeQuestionCount(prev, id, e, cb) {
  let value = parseInt(e.target.value, 10) || 0;
  const upd = prev.map((ch) => {
    if (ch.id !== id) return ch;

    const pool =
      ch.selectedTopic && ch.topics[ch.selectedTopic]
        ? ch.topics[ch.selectedTopic].questions
        : ch.allQuestions;
    value = Math.min(value, pool.length);

    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const rows = shuffledPool.slice(0, value).map((q, idx) => ({
      id: q.id,
      subject: "physics",
      question: q.question,
      originalIndex: pool.findIndex((x) => x.id === q.id),
      chapterName: ch.name,
      unitName: ch.unit,
      topicName: q.topicName,
    }));

    return {
      ...ch,
      isChecked: value > 0 || ch.isChecked,
      numQuestions: value,
      totalMarks: value * 4,
      rows,
    };
  });
  cb(upd);
  return upd;
}

function replaceRandom(prev, chapterId, rowIndex, setRefreshing, cb) {
  const upd = prev.map((ch) => {
    if (ch.id !== chapterId) return ch;
    const pool =
      ch.selectedTopic && ch.topics[ch.selectedTopic]
        ? ch.topics[ch.selectedTopic].questions
        : ch.allQuestions;
    const taken = new Set(ch.rows.map((r) => r.id));
    const candidates = pool.filter((q) => !taken.has(q.id));
    if (!candidates.length) return ch;

    const newQ = candidates[Math.floor(Math.random() * candidates.length)];
    const rows = [...ch.rows];
    rows[rowIndex] = {
      id: newQ.id,
      subject: "Physics",
      question: newQ.question,
      originalIndex: pool.findIndex((q) => q.id === newQ.id),
      chapterName: ch.name,
      unitName: ch.unit,
      topicName: newQ.topicName,
    };
    return { ...ch, rows };
  });
  cb(upd);
  setRefreshing(null);
  return upd;
}
