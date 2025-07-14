"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* -------------------------------------------------------------------- */
/*  CONFIG                                                             */
/* -------------------------------------------------------------------- */
const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest`;
const PAGE_SIZE = 250; // tweak if you want smaller/larger chunks

/* -------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                     */
/* -------------------------------------------------------------------- */
export default function BiologyChapterList() {
  /* -------------------- state --------------------------------------- */
  const [chapters, setChapters] = useState([]); // table data
  const [loading, setLoading] = useState(true); // first‑paint spinner
  const [refreshing, setRefreshing] = useState(null); // replace‑Q spinner

  /* ------------------------------------------------------------------ */
  /*  STEP‑1  Fetch lightweight metadata → build skeleton               */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const meta = await axios.get(`${API_BASE}/Biology/metadata`);
        /* meta.data = { chapters: [ { chapter_name, topics:[{topic_name,…}] } ] } */
        const skeleton = meta.data.chapters.map((c, idx) => ({
          id: idx + 1,
          name: c.chapter_name,
          unit: "Unit I", // replace with real unit if you have it
          topics: c.topics.reduce((acc, t) => {
            acc[t.topic_name] = { name: t.topic_name, questions: [] };
            return acc;
          }, {}),
          topicsList: c.topics.map((t) => t.topic_name),
          allQuestions: [],
          maxQuestions: 0,
          // UI state
          isChecked: false,
          selectedTopic: null,
          numQuestions: 0,
          totalMarks: 0,
          rows: [],
        }));
        setChapters(skeleton); // paint instantly
        /* stream real questions */
        await streamAllQuestions(setChapters);
        setLoading(false);
      } catch (err) {
        console.error("Biology meta fetch failed:", err);
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------------------------------------------------------ */
  /*  STEP‑2  Stream questions page‑by‑page until backend says stop      */
  /* ------------------------------------------------------------------ */
  const streamAllQuestions = async (setter) => {
    let page = 1,
      more = true;
    while (more) {
      const res = await axios.get(`${API_BASE}/biology/questions`, {
        params: { page, limit: PAGE_SIZE },
      });
      const { questions, pagination } = res.data;

      setter((prev) => {
        const map = { ...prev.reduce((m, c) => ((m[c.name] = c), m), {}) };
        questions.forEach((q) => {
          const ch = map[q.chapter_name];
          if (!ch) return; // safety guard if backend has an unknown chapter

          /* ensure topic exists */
          if (!ch.topics[q.topic_name]) {
            ch.topics[q.topic_name] = { name: q.topic_name, questions: [] };
            ch.topicsList.push(q.topic_name);
          }

          /* push question */
          const qObj = {
            id: q.id,
            subject: "biology",
            question: q.question_text,
            topicName: q.topic_name,
          };
          ch.topics[q.topic_name].questions.push(qObj);
          ch.allQuestions.push(qObj);
        });
        // recompute maxQuestions for each chapter
        Object.values(map).forEach((c) => (c.maxQuestions = c.allQuestions.length));
        return Object.values(map); // keep original order
      });

      more = pagination.has_next_page;
      page += 1;
    }
  };

  /* ------------------------------------------------------------------ */
  /*  LocalStorage helpers (kept identical to your original logic)      */
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
    localStorage.setItem("biology", JSON.stringify(selectedChapters));

    const changedQuestions = chs
      .filter((ch) => ch.isChecked && ch.rows.length > 0)
      .flatMap((ch) =>
        ch.rows.map((row) => ({
          questionId: row.id,
          questionText: row.question,
          subjectName: "biology",
          chapterName: ch.name,
          unitName: ch.unit,
          topicName: row.topicName,
          originalIndex: row.originalIndex || 0,
        }))
      );
    localStorage.setItem("changedQuestions", JSON.stringify(changedQuestions));
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Restore saved draft (only after skeleton exists)                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!chapters.length) return;
    const saved = JSON.parse(localStorage.getItem("biology")) || [];

    setChapters((prev) =>
      prev.map((ch) => {
        const s = saved.find((x) => x.chapterName === ch.name);
        if (!s) return ch;

        // available pool respecting saved topic (may still be empty)
        const pool = s.selectedTopic && ch.topics[s.selectedTopic]
          ? ch.topics[s.selectedTopic].questions
          : ch.allQuestions;
        const num = Math.min(s.numQuestions, pool.length);

        const rows =
          s.questions && s.questions.length
            ? s.questions.map((q) => ({
                ...q,
                originalIndex: pool.findIndex((orig) => orig.id === q.id) || 0,
              }))
            : pool.slice(0, num).map((q, idx) => ({
                id: q.id,
                subject: "biology",
                question: q.question,
                originalIndex: idx,
                chapterName: ch.name,
                unitName: ch.unit,
                topicName: q.topicName,
              }));

        return {
          ...ch,
          isChecked: true,
          selectedTopic: s.selectedTopic,
          numQuestions: num,
          totalMarks: num * 4,
          rows,
        };
      })
    );
  }, [chapters.length]);

  /* ------------------------------------------------------------------ */
  /*  UI Event handlers – delegate to pure helpers                      */
  /* ------------------------------------------------------------------ */
  const handleCheckboxChange = (id) =>
    setChapters((prev) => toggleChapterCheck(prev, id, updateLocalStorage));

  const handleTopicChange = (chapterId, topic) =>
    setChapters((prev) => changeTopic(prev, chapterId, topic, updateLocalStorage));

  const handleQuestionChange = (id, e) =>
    setChapters((prev) => changeQuestionCount(prev, id, e, updateLocalStorage));

  const handleReplaceQuestion = (chapterId, rowIndex) => {
    setRefreshing({ chapterId, rowIndex });
    setTimeout(() => {
      setChapters((prev) =>
        replaceRandom(prev, chapterId, rowIndex, setRefreshing, updateLocalStorage)
      );
    }, 600);
  };

  /* ------------------------------------------------------------------ */
  /*  Animation variants (same as before)                               */
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
  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  /* ------------------------------------------------------------------ */
  /*  Spinner while loading                                             */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{ rotate: 360, transition: { duration: 1.5, repeat: Infinity, ease: "linear" } }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-lg text-gray-700">Loading biology questions…</p>
        </motion.div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER TABLE (identical markup to your original)                  */
  /* ------------------------------------------------------------------ */
  return (
    <motion.div className="flex justify-center mt-4 px-2" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="bg-white hidden md:block w-full max-w-6xl rounded-xl overflow-hidden border-none shadow-lg">
        {/* Header */}
        <motion.div className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white rounded-t-xl" variants={itemVariants}>
          <h2 className="text-xl font-semibold">Biology Chapters</h2>
          <p className="text-sm text-purple-100">Select chapters, topics and specify the number of questions</p>
        </motion.div>

        {/* Rows */}
        {chapters.map((chapter, index) => (
          <motion.div key={chapter.id} className="mb-4 overflow-hidden" variants={itemVariants}>
            <div className="overflow-x-auto px-4 py-2">
              <table className="w-full text-sm text-left font-Poppins text-[#181C32]">
                <thead className="bg-[#B1CEFB] text-[#181C32] font-Mulish font-semibold">
                  <tr>
                    {["Selected", "Sr.no", "Chapter Name", "Topic", "Questions", "Total Marks"].map((header, i) => (
                      <th
                        key={i}
                        className={`py-3 px-4 text-center ${i === 0 ? "rounded-tl-xl w-24" : ""} ${i === 6 ? "rounded-tr-xl w-32" : ""} ${i === 2 ? "w-1/4" : ""} ${i === 4 ? "w-1/5" : ""}`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Top‑level chapter row */}
                  <tr className="border-b border-gray-200">
                    {/* checkbox */}
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
                    {/* sr no */}
                    <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">{index + 1}</td>
                    {/* chapter name */}
                    <td className="py-4 px-4 text-left font-Mulish font-semibold text-black">
                      <div className="flex items-center">
                        <div className="p-1 bg-purple-100 rounded-full mr-2">
                          <Image src="/placeholder.svg?height=20&width=20" alt="biology" width={20} height={20} className="w-5 h-5" />
                        </div>
                        <span className="truncate max-w-xs" title={chapter.name}>
                          {chapter.name}
                        </span>
                      </div>
                    </td>
                    {/* unit */}
                    {/* <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">{chapter.unit}</td> */}
                    {/* topic selector */}
                    <td className="py-4 px-4 text-center">
                      <div className="relative">
                        <select
                          value={chapter.selectedTopic || ""}
                          onChange={(e) => handleTopicChange(chapter.id, e.target.value || null)}
                          className={`w-full ${chapter.isChecked? "cursor-pointer": "cursor-not-allowed"} h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none pr-8`}
                          disabled={!chapter.isChecked}
                        >
                          <option value="">All Topics ({chapter.topicsList.length})</option>
                          {chapter.topicsList.map((t, idx) => (
                            <option key={idx} value={t}>
                              {t} ({chapter.topics[t].questions.length})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                    {/* num questions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <motion.input
                          type="number"
                          value={chapter.numQuestions}
                          onChange={(e) => handleQuestionChange(chapter.id, e)}
                          className="w-16 h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          min={0}
                          max={
                            chapter.selectedTopic && chapter.topics[chapter.selectedTopic]
                              ? chapter.topics[chapter.selectedTopic].questions.length
                              : chapter.maxQuestions
                          }
                          whileFocus={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          / {chapter.selectedTopic && chapter.topics[chapter.selectedTopic] ? chapter.topics[chapter.selectedTopic].questions.length : chapter.maxQuestions}
                        </span>
                      </div>
                    </td>
                    {/* marks */}
                    <td className="py-4 px-4 text-center font-Mulish font-semibold">
                      <motion.div
                        className="w-16 h-10 bg-purple-50 flex items-center justify-center rounded-md mx-auto border border-purple-100"
                        animate={{
                          backgroundColor: chapter.totalMarks > 0 ? ["#f5f3ff", "#ede9fe", "#f5f3ff"] : "#f5f3ff",
                        }}
                        transition={{ duration: 1.5, repeat: chapter.totalMarks > 0 ? Infinity : 0, repeatType: "reverse" }}
                      >
                        {chapter.totalMarks}
                      </motion.div>
                    </td>
                  </tr>

                  {/* Expanded question rows */}
                  <AnimatePresence>
                    {chapter.isChecked && chapter.numQuestions > 0 && (
                      <motion.tr initial="hidden" animate="visible" exit="hidden" variants={expandVariants}>
                        <td colSpan={7} className="p-0">
                          <motion.div
                            className="rounded-xl shadow-md w-[98%] mx-auto my-3 overflow-hidden bg-gray-50 border border-gray-200"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <table className="w-full text-sm text-left font-Poppins text-[#181C32] border-collapse">
                              <thead className="bg-gray-100 text-black border-b border-gray-200">
                                <tr>
                                  {["Q.no", "Subject", "Topic", "Question", "Action"].map((h, i) => (
                                    <th
                                      key={i}
                                      className={`py-3 px-4 font-Mulish font-semibold ${i === 0 ? "rounded-tl-xl w-20 text-center" : ""} ${i === 4 ? "rounded-tr-xl w-24 text-center" : ""} ${i === 3 ? "w-2/5" : ""} ${i === 2 ? "w-1/6" : ""}`}
                                    >
                                      {h}
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
                                        className={`hover:bg-purple-50 transition ${idx === chapter.rows.length - 1 ? "border-none" : "border-b border-gray-200"}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        exit={{ opacity: 0, y: -10 }}
                                      >
                                        <td className="py-3 px-4 text-center font-Mulish font-bold">{idx + 1}</td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="font-Mulish font-semibold flex items-center justify-center space-x-1">
                                            <div className="p-1 bg-purple-100 rounded-full">
                                              <Image src="/placeholder.svg?height=16&width=16" alt="biology" width={16} height={16} className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-semibold">biology</span>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-Mulish font-medium text-gray-600">
                                          <span className="text-xs bg-purple-100 px-2 py-1 rounded-full inline-block">{row.topicName}</span>
                                        </td>
                                        <td className="py-3 px-4 font-Mulish font-medium text-gray-700">
                                          <div className="line-clamp-2" title={row.question}>{row.question}</div>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                          <div className="flex justify-center space-x-3">
                                            {/* Replace button */}
                                            <motion.div
                                              whileHover={{ scale: 1.2, rotate: 180 }}
                                              whileTap={{ scale: 0.9 }}
                                              animate={
                                                refreshing &&
                                                refreshing.chapterId === chapter.id &&
                                                refreshing.rowIndex === idx
                                                  ? { rotate: 360 }
                                                  : { rotate: 0 }
                                              }
                                              transition={{ duration: 0.5 }}
                                              onClick={() => handleReplaceQuestion(chapter.id, idx)}
                                              className="cursor-pointer p-1 bg-purple-100 rounded-full hover:bg-purple-200"
                                            >
                                              <Image src="/placeholder.svg?height=20&width=20" alt="Replace" width={20} height={20} className="w-5 h-5" />
                                            </motion.div>
                                            {/* View button */}
                                            <motion.div whileHover={{ scale: 1.2, x: 3 }} whileTap={{ scale: 0.9 }} className="cursor-pointer p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                                              <Image src="/placeholder.svg?height=20&width=20" alt="View" width={20} height={20} className="w-5 h-5" />
                                            </motion.div>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={5} className="py-4 text-center text-gray-500">No questions available for this chapter/topic</td>
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
      ? { ...ch, selectedTopic: topicName || null, numQuestions: 0, totalMarks: 0, rows: [] }
      : ch
  );
  cb(upd);
  return upd;
}

function changeQuestionCount(prev, id, e, cb) {
  let value = parseInt(e.target.value, 10) || 0;
  const upd = prev.map((ch) => {
    if (ch.id !== id) return ch;

    const pool = ch.selectedTopic && ch.topics[ch.selectedTopic] ? ch.topics[ch.selectedTopic].questions : ch.allQuestions;
    value = Math.min(value, pool.length);

    const rows = pool.slice(0, value).map((q, idx) => ({
      id: q.id,
      subject: "biology",
      question: q.question,
      originalIndex: idx,
      chapterName: ch.name,
      unitName: ch.unit,
      topicName: q.topicName,
    }));

    return { ...ch, isChecked: value > 0 || ch.isChecked, numQuestions: value, totalMarks: value * 4, rows };
  });
  cb(upd);
  return upd;
}

function replaceRandom(prev, chapterId, rowIndex, setRefreshing, cb) {
  const upd = prev.map((ch) => {
    if (ch.id !== chapterId) return ch;
    const pool = ch.selectedTopic && ch.topics[ch.selectedTopic] ? ch.topics[ch.selectedTopic].questions : ch.allQuestions;
    const taken = new Set(ch.rows.map((r) => r.id));
    const candidates = pool.filter((q) => !taken.has(q.id));
    if (!candidates.length) return ch;

    const newQ = candidates[Math.floor(Math.random() * candidates.length)];
    const rows = [...ch.rows];
    rows[rowIndex] = {
      id: newQ.id,
      subject: "biology",
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
