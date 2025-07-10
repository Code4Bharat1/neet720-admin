"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function ChemistryChapterList() {
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(null)

  // Fetch chemistry questions and group by chapter and topic
  useEffect(() => {
    const fetchChemistryChapters = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest/chemistry-questions`)
        console.log("Chemistry questions response:", response.data)
        const { questions, total_topics } = response.data

        // Group questions by chapter name and then by topic
        const chapterMap = {}

        // Build chapter map from questions
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
      topics: {},
      selectedTopic: null,
      allQuestions: [],
    }
  }

  // Group by topics from questions
  if (!chapterMap[q.chapter_name].topics[q.topic_name]) {
    chapterMap[q.chapter_name].topics[q.topic_name] = {
      name: q.topic_name,
      questions: [],
    }
  }

  chapterMap[q.chapter_name].topics[q.topic_name].questions.push({
    id: q.id,
    subject: "Chemistry",
    question: q.question_text,
    topicName: q.topic_name,
  })

  chapterMap[q.chapter_name].allQuestions.push({
    id: q.id,
    subject: "Chemistry",
    question: q.question_text,
    topicName: q.topic_name,
  })
})

// Add any missing topics from total_topics
total_topics.forEach((t) => {
  if (!chapterMap[t.chapter_name]) {
    chapterMap[t.chapter_name] = {
      id: Object.keys(chapterMap).length + 1,
      name: t.chapter_name,
      unit: "Unit I",
      isChecked: false,
      numQuestions: 0,
      totalMarks: 0,
      rows: [],
      topics: {},
      selectedTopic: null,
      allQuestions: [],
    }
  }

  if (!chapterMap[t.chapter_name].topics[t.topic_name]) {
    chapterMap[t.chapter_name].topics[t.topic_name] = {
      name: t.topic_name,
      questions: [],
    }
  }
})


        // Add maxQuestions property to each chapter
        const chaptersWithLimits = Object.values(chapterMap).map((chapter) => ({
          ...chapter,
          maxQuestions: chapter.allQuestions.length,
          topicsList: Object.keys(chapter.topics),
        }))

        setChapters(chaptersWithLimits)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching chemistry questions:", error)
        setLoading(false)
      }
    }

    fetchChemistryChapters()
  }, [])

  const handleCheckboxChange = (id) => {
    setChapters((prev) => {
      const updatedChapters = prev.map((chapter) =>
        chapter.id === id
          ? {
              ...chapter,
              isChecked: !chapter.isChecked,
              numQuestions: chapter.isChecked ? 0 : chapter.numQuestions,
              totalMarks: chapter.isChecked ? 0 : chapter.totalMarks,
              rows: chapter.isChecked ? [] : chapter.rows,
              selectedTopic: chapter.isChecked ? null : chapter.selectedTopic,
            }
          : chapter,
      )

      updateLocalStorage(updatedChapters)
      return updatedChapters
    })
  }

  const handleTopicChange = (chapterId, topicName) => {
    setChapters((prevChapters) => {
      const updatedChapters = prevChapters.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              selectedTopic: topicName,
              numQuestions: 0,
              totalMarks: 0,
              rows: [],
            }
          : chapter,
      )

      updateLocalStorage(updatedChapters)
      return updatedChapters
    })
  }

  // Helper function to update localStorage
  const updateLocalStorage = (chapters) => {
    const selectedChapters = chapters
      .filter((chapter) => chapter.isChecked)
      .map((chapter) => ({
        chapterName: chapter.name,
        unit: chapter.unit,
        selectedTopic: chapter.selectedTopic,
        numQuestions: chapter.numQuestions,
        totalMarks: chapter.numQuestions * 4,
        questions: chapter.rows,
      }))

    localStorage.setItem("Chemistry", JSON.stringify(selectedChapters))

    // Create and save the changedQuestions data
    const changedQuestions = chapters
      .filter((chapter) => chapter.isChecked && chapter.rows.length > 0)
      .flatMap((chapter) =>
        chapter.rows.map((row) => ({
          questionId: row.id,
          questionText: row.question,
          subjectName: "Chemistry",
          chapterName: chapter.name,
          unitName: chapter.unit,
          topicName: row.topicName,
          originalIndex: row.originalIndex || 0,
        })),
      )

    localStorage.setItem("changedQuestions", JSON.stringify(changedQuestions))
  }

  const handleQuestionChange = (id, e) => {
    let value = Number.parseInt(e.target.value) || 0

    setChapters((prevChapters) => {
      const targetChapter = prevChapters.find((chapter) => chapter.id === id)

      // Determine which questions to use based on topic selection
      let availableQuestions = []
      if (targetChapter.selectedTopic && targetChapter.topics[targetChapter.selectedTopic]) {
        availableQuestions = targetChapter.topics[targetChapter.selectedTopic].questions
      } else {
        availableQuestions = targetChapter.allQuestions
      }

      if (!availableQuestions || availableQuestions.length === 0) {
        return prevChapters
      }

      // Limit value to the maximum number of available questions
      value = Math.min(value, availableQuestions.length)

      // Select the first n questions
      const selectedQuestions = availableQuestions.slice(0, value)

      // Create rows from selected questions
      const newRows = selectedQuestions.map((q, index) => ({
        id: q.id,
        subject: "Chemistry",
        question: q.question || "Question text not available",
        originalIndex: index,
        chapterName: targetChapter.name,
        unitName: targetChapter.unit,
        topicName: q.topicName,
      }))

      const isChecked = value > 0 ? true : targetChapter.isChecked

      const updatedChapters = prevChapters.map((chapter) =>
        chapter.id === id
          ? {
              ...chapter,
              isChecked: isChecked,
              numQuestions: value,
              totalMarks: value * 4,
              rows: newRows,
            }
          : chapter,
      )

      updateLocalStorage(updatedChapters)
      return updatedChapters
    })
  }

  const handleReplaceQuestion = (chapterId, rowIndex) => {
    setRefreshing({ chapterId, rowIndex })

    setTimeout(() => {
      setChapters((prevChapters) => {
        const chapter = prevChapters.find((c) => c.id === chapterId)
        if (!chapter) return prevChapters

        // Determine available questions based on topic selection
        let availableQuestions = []
        if (chapter.selectedTopic && chapter.topics[chapter.selectedTopic]) {
          availableQuestions = chapter.topics[chapter.selectedTopic].questions
        } else {
          availableQuestions = chapter.allQuestions
        }

        // Get all available questions excluding currently selected ones
        const currentQuestionIds = new Set(chapter.rows.map((row) => row.id))
        const replacementQuestions = availableQuestions.filter((q) => !currentQuestionIds.has(q.id))

        if (replacementQuestions.length === 0) {
          alert("No more questions available for replacement in this chapter/topic.")
          setRefreshing(null)
          return prevChapters
        }

        // Select a random question from available ones
        const randomIndex = Math.floor(Math.random() * replacementQuestions.length)
        const newQuestion = replacementQuestions[randomIndex]

        // Create updated chapter rows with the new question
        const updatedRows = [...chapter.rows]
        updatedRows[rowIndex] = {
          id: newQuestion.id,
          subject: "Chemistry",
          question: newQuestion.question || "Question text not available",
          originalIndex: availableQuestions.findIndex((q) => q.id === newQuestion.id),
          chapterName: chapter.name,
          unitName: chapter.unit,
          topicName: newQuestion.topicName,
        }

        const updatedChapters = prevChapters.map((c) => (c.id === chapterId ? { ...c, rows: updatedRows } : c))

        updateLocalStorage(updatedChapters)
        setRefreshing(null)
        return updatedChapters
      })
    }, 600)
  }

  // Load saved data from localStorage
  useEffect(() => {
    const savedChapters = JSON.parse(localStorage.getItem("Chemistry")) || []

    setChapters((prevChapters) =>
      prevChapters.map((chapter) => {
        const saved = savedChapters.find((sc) => sc.chapterName === chapter.name)
        if (saved) {
          // Determine available questions based on saved topic
          let availableQuestions = []
          if (saved.selectedTopic && chapter.topics[saved.selectedTopic]) {
            availableQuestions = chapter.topics[saved.selectedTopic].questions
          } else {
            availableQuestions = chapter.allQuestions
          }

          const numQuestions = Math.min(saved.numQuestions, availableQuestions.length)

          const rows =
            saved.questions && saved.questions.length
              ? saved.questions.map((q) => ({
                  ...q,
                  originalIndex: availableQuestions.findIndex((orig) => orig.id === q.id) || 0,
                }))
              : availableQuestions.slice(0, numQuestions).map((q, index) => ({
                  id: q.id,
                  subject: "Chemistry",
                  question: q.question || "Question text not available",
                  originalIndex: index,
                  chapterName: chapter.name,
                  unitName: chapter.unit,
                  topicName: q.topicName,
                }))

          return {
            ...chapter,
            isChecked: true,
            selectedTopic: saved.selectedTopic,
            numQuestions: numQuestions,
            totalMarks: numQuestions * 4,
            rows: rows,
          }
        }
        return chapter
      }),
    )
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const expandVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              transition: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            }}
            className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          ></motion.div>
          <p className="text-lg text-gray-700">Loading chemistry questions...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="flex justify-center mt-4 px-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="bg-white hidden md:block w-full max-w-6xl rounded-xl overflow-hidden border-none shadow-lg">
        <motion.div
          className="bg-gradient-to-r from-purple-600 to-purple-800 px-6 py-4 text-white rounded-t-xl"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold">Chemistry Chapters</h2>
          <p className="text-sm text-purple-100">Select chapters, topics and specify the number of questions</p>
        </motion.div>

        {chapters.map((chapter, index) => (
          <motion.div key={chapter.id} className="mb-4 overflow-hidden" variants={itemVariants}>
            <div className="overflow-x-auto px-4 py-2">
              <table className="w-full text-sm text-left font-Poppins text-[#181C32]">
                <thead className="bg-[#B1CEFB] text-[#181C32] font-Mulish font-semibold">
                  <tr>
                    {["Selected", "Sr.no", "Chapter Name", "Unit", "Topic", "Questions", "Total Marks"].map(
                      (header, i) => (
                        <th
                          key={i}
                          className={`py-3 px-4 text-center ${i === 0 ? "rounded-tl-xl w-24" : ""} ${i === 6 ? "rounded-tr-xl w-32" : ""} ${i === 2 ? "w-1/4" : ""} ${i === 4 ? "w-1/5" : ""}`}
                        >
                          {header}
                        </th>
                      ),
                    )}
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
                    <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">{index + 1}</td>
                    <td className="py-4 px-4 text-left font-Mulish font-semibold text-black">
                      <div className="flex items-center">
                        <div className="p-1 bg-purple-100 rounded-full mr-2">
                          <Image
                            src="/placeholder.svg?height=20&width=20"
                            alt="Chemistry"
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                        </div>
                        <span className="truncate max-w-xs" title={chapter.name}>
                          {chapter.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-Mulish font-semibold text-black">{chapter.unit}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="relative">
                        <select
                          value={chapter.selectedTopic || ""}
                          onChange={(e) => handleTopicChange(chapter.id, e.target.value || null)}
                          className="w-full h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 appearance-none pr-8"
                          disabled={!chapter.isChecked}
                        >
                          <option value="">All Topics ({chapter.topicsList?.length || 0})</option>
                          {chapter.topicsList?.map((topic, idx) => (
                            <option key={idx} value={topic}>
                              {topic} ({chapter.topics[topic]?.questions?.length || 0})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <motion.input
                          type="number"
                          value={chapter.numQuestions}
                          onChange={(e) => handleQuestionChange(chapter.id, e)}
                          className="w-16 h-10 bg-gray-100 text-center font-Mulish font-semibold outline-none rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          min="0"
                          max={
                            chapter.selectedTopic && chapter.topics[chapter.selectedTopic]
                              ? chapter.topics[chapter.selectedTopic].questions.length
                              : chapter.maxQuestions
                          }
                          whileFocus={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                        />
                        <span className="text-xs text-gray-500 ml-2">
                          /{" "}
                          {chapter.selectedTopic && chapter.topics[chapter.selectedTopic]
                            ? chapter.topics[chapter.selectedTopic].questions.length
                            : chapter.maxQuestions}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-Mulish font-semibold">
                      <motion.div
                        className="w-16 h-10 bg-purple-50 flex items-center justify-center rounded-md mx-auto border border-purple-100"
                        animate={{
                          backgroundColor: chapter.totalMarks > 0 ? ["#f5f3ff", "#ede9fe", "#f5f3ff"] : "#f5f3ff",
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: chapter.totalMarks > 0 ? Number.POSITIVE_INFINITY : 0,
                          repeatType: "reverse",
                        }}
                      >
                        {chapter.totalMarks || 0}
                      </motion.div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {chapter.isChecked && chapter.numQuestions > 0 && (
                      <motion.tr initial="hidden" animate="visible" exit="hidden" variants={expandVariants}>
                        <td colSpan="7" className="p-0">
                          <motion.div
                            className="rounded-xl shadow-md w-[98%] mx-auto my-3 overflow-hidden bg-gray-50 border border-gray-200"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <table className="w-full text-sm text-left font-Poppins text-[#181C32] border-collapse">
                              <thead className="bg-gray-100 text-black border-b border-gray-200">
                                <tr>
                                  {["Q.no", "Subject", "Topic", "Question", "Action"].map((header, i) => (
                                    <th
                                      key={i}
                                      className={`py-3 px-4 ${i === 0 ? "rounded-tl-xl w-20 text-center" : ""} ${i === 4 ? "rounded-tr-xl w-24 text-center" : ""} ${i === 3 ? "w-2/5" : ""} ${i === 2 ? "w-1/6" : ""} font-Mulish font-semibold`}
                                    >
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
                                              <Image
                                                src="/placeholder.svg?height=16&width=16"
                                                alt="Chemistry"
                                                width={16}
                                                height={16}
                                                className="w-4 h-4"
                                              />
                                            </div>
                                            <div className="text-sm font-semibold">Chemistry</div>
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-center font-Mulish font-medium text-gray-600">
                                          <div className="text-xs bg-purple-100 px-2 py-1 rounded-full inline-block">
                                            {row.topicName}
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
                                              animate={
                                                refreshing &&
                                                refreshing.chapterId === chapter.id &&
                                                refreshing.rowIndex === index
                                                  ? { rotate: 360 }
                                                  : { rotate: 0 }
                                              }
                                              transition={{ duration: 0.5 }}
                                              onClick={() => handleReplaceQuestion(chapter.id, index)}
                                              className="cursor-pointer p-1 bg-purple-100 rounded-full hover:bg-purple-200"
                                            >
                                              <Image
                                                src="/placeholder.svg?height=20&width=20"
                                                alt="Replace Question"
                                                width={20}
                                                height={20}
                                                className="w-5 h-5"
                                              />
                                            </motion.div>
                                            <motion.div
                                              whileHover={{ scale: 1.2, x: 3 }}
                                              whileTap={{ scale: 0.9 }}
                                              className="cursor-pointer p-1 bg-gray-100 rounded-full hover:bg-gray-200"
                                            >
                                              <Image
                                                src="/placeholder.svg?height=20&width=20"
                                                alt="View Details"
                                                width={20}
                                                height={20}
                                                className="w-5 h-5"
                                              />
                                            </motion.div>
                                          </div>
                                        </td>
                                      </motion.tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="5" className="py-4 text-center text-gray-500">
                                        No questions available for this chapter/topic
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
  )
}
