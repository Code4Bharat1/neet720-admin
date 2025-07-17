"use client"

import { useState, useRef } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, CheckCircle, XCircle, Loader2, Send, Trash2, Zap, Key, HelpCircle } from "lucide-react"

// File Upload Component
const FileUploadZone = ({ onFileSelect, files, label, color = "blue", icon: Icon }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    onFileSelect(selectedFiles)
  }

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFileSelect(updatedFiles)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
        <Icon className="w-4 h-4 mr-2" />
        {label}
      </label>

      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept="image/*"
        />
        <motion.div
          className={`border-2 border-dashed border-gray-300 hover:border-${color}-400 bg-gradient-to-br from-gray-50 to-${color}-50 rounded-xl p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-lg`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">Click to upload {label.toLowerCase()}</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Or drag and drop files here</p>
          {files.length > 0 && (
            <motion.p
              className={`text-${color}-600 font-semibold mt-2 text-sm`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {files.length} file(s) selected
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Display Selected Files */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Selected Files ({files.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file, idx) => (
              <motion.div
                key={idx}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`${label} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const OMRScannerSimplified = () => {
  const [answerKeyFiles, setAnswerKeyFiles] = useState([])
  const [questionPaperFiles, setQuestionPaperFiles] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const handleEvaluate = async (e) => {
    e.preventDefault()

    if (answerKeyFiles.length === 0 || questionPaperFiles.length === 0) {
      alert("Please upload both OMR answer key and question paper files.")
      return
    }

    try {
      setLoading(true)

      // Step 1: Process Answer Key
      const answerKeyFormData = new FormData()
      answerKeyFiles.forEach((file) => answerKeyFormData.append("omrfile", file))

      console.log("Processing Answer Key...")
      const answerKeyResponse = await axios.post("https://omr.neet720.com/api/process-omr", answerKeyFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Step 2: Process Question Paper
      const questionPaperFormData = new FormData()
      questionPaperFiles.forEach((file) => questionPaperFormData.append("omrfile", file))

      console.log("Processing Question Paper...")
      const questionPaperResponse = await axios.post("https://omr.neet720.com/api/process-omr", questionPaperFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Step 3: Compare both responses
      console.log("Comparing responses...")
      const comparisonResult = compareOMRResponses(answerKeyResponse.data, questionPaperResponse.data)
      setResult(comparisonResult)
    } catch (error) {
      console.error("Error evaluating:", error.response?.data || error.message)
      alert(`Evaluation failed: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to compare answer key and question paper responses
  const compareOMRResponses = (answerKeyData, questionPaperData) => {
    console.log("Answer Key Data:", answerKeyData)
    console.log("Question Paper Data:", questionPaperData)

    if (!answerKeyData.success || !questionPaperData.success) {
      throw new Error("Invalid response format from one or both APIs")
    }

    if (!answerKeyData.results || !questionPaperData.results) {
      throw new Error("Missing results data from one or both APIs")
    }

    const answerKey = answerKeyData.results
    const studentAnswers = questionPaperData.results

    // Create a map of correct answers from answer key
    const correctAnswersMap = {}
    answerKey.forEach((item) => {
      if (item.marked === 1) {
        // Only consider marked answers as correct
        correctAnswersMap[item.question] = item.option
      }
    })

    // Create a map of student answers
    const studentAnswersMap = {}
    studentAnswers.forEach((item) => {
      if (item.marked === 1) {
        // Only consider marked answers
        studentAnswersMap[item.question] = item.option
      }
    })

    // Get all question numbers (union of both sets)
    const allQuestions = new Set([
      ...answerKey.map((item) => item.question),
      ...studentAnswers.map((item) => item.question),
    ])

    const comparedResults = []
    let correctCount = 0
    let incorrectCount = 0
    let unansweredCount = 0

    // Compare each question
    Array.from(allQuestions)
      .sort((a, b) => a - b)
      .forEach((questionNum) => {
        const correctAnswer = correctAnswersMap[questionNum] || null
        const studentAnswer = studentAnswersMap[questionNum] || null

        let status = "unanswered"
        if (studentAnswer === null) {
          unansweredCount++
          status = "unanswered"
        } else if (correctAnswer === null) {
          // If no correct answer is provided, mark as incorrect
          incorrectCount++
          status = "incorrect"
        } else if (studentAnswer === correctAnswer) {
          correctCount++
          status = "correct"
        } else {
          incorrectCount++
          status = "incorrect"
        }

        comparedResults.push({
          question: questionNum,
          correctAnswer: correctAnswer || "N/A",
          studentAnswer: studentAnswer || "N/A",
          status: status,
        })
      })

    // Group questions by pages (45 questions per page)
    const questionsPerPage = 45
    const pages = []
    const totalQuestions = comparedResults.length
    const pageCount = Math.ceil(totalQuestions / questionsPerPage)

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const startIdx = (pageNum - 1) * questionsPerPage
      const endIdx = Math.min(startIdx + questionsPerPage, totalQuestions)
      const pageQuestions = comparedResults.slice(startIdx, endIdx)

      const pageCorrect = pageQuestions.filter((q) => q.status === "correct").length
      const pageIncorrect = pageQuestions.filter((q) => q.status === "incorrect").length
      const pageUnanswered = pageQuestions.filter((q) => q.status === "unanswered").length

      pages.push({
        page: pageNum,
        questions: pageQuestions,
        score: pageCorrect,
        maxScore: pageQuestions.length,
        correct: pageCorrect,
        incorrect: pageIncorrect,
        unanswered: pageUnanswered,
      })
    }

    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0

    return {
      success: true,
      message: "OMR comparison completed successfully",
      answerKeySummary: answerKeyData.summary,
      questionPaperSummary: questionPaperData.summary,
      answerKeyImage: answerKeyData.processed_image,
      questionPaperImage: questionPaperData.processed_image,
      pages: pages,
      totalScore: correctCount,
      maxScore: totalQuestions,
      totalQuestions: totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      accuracy: accuracy,
      comparisonDetails: {
        totalAnswerKeyQuestions: answerKey.length,
        totalStudentQuestions: studentAnswers.length,
        answerKeyMarked: answerKey.filter((item) => item.marked === 1).length,
        studentMarked: studentAnswers.filter((item) => item.marked === 1).length,
      },
    }
  }

  const handleSubmitMarks = async () => {
    if (!result) {
      alert("Please evaluate the OMR first.")
      return
    }

    try {
      setSubmitLoading(true)
      const allQuestions = result.pages.flatMap((page) => page.questions)
      const answers = allQuestions.map((q) => (q.studentAnswer === "N/A" ? null : q.studentAnswer))

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/omr-marks`, {
        answers,
        score: result.totalScore,
        correctAnswers: result.correctAnswers,
        incorrectAnswers: result.incorrectAnswers,
        unattempted: result.unansweredQuestions,
        totalquestions: result.totalQuestions,
        overallMarks: result.totalScore,
        accuracy: result.accuracy,
        answerKeySummary: result.answerKeySummary,
        questionPaperSummary: result.questionPaperSummary,
        comparisonDetails: result.comparisonDetails,
      })

      alert("Result saved successfully!")
    } catch (error) {
      console.error("Error saving marks:", error.response?.data || error.message)
      alert("Saving marks failed.")
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          className="mb-6 sm:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            OMR Scanner & Comparator
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload OMR answer key and question paper for comparison and evaluation
          </p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 w-full rounded-full mb-4 sm:mb-6"></div>

          <form onSubmit={handleEvaluate} className="space-y-6">
            {/* File Upload Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* OMR Answer Key Upload */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <FileUploadZone
                  onFileSelect={setAnswerKeyFiles}
                  files={answerKeyFiles}
                  label="OMR Answer Key"
                  color="blue"
                  icon={Key}
                />
              </motion.div>

              {/* Question Paper Upload */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <FileUploadZone
                  onFileSelect={setQuestionPaperFiles}
                  files={questionPaperFiles}
                  label="Student Question Paper"
                  color="purple"
                  icon={HelpCircle}
                />
              </motion.div>
            </div>

            {/* Evaluate Button */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Comparing OMR Sheets...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Compare & Evaluate OMR Sheets
                  </div>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="space-y-4 sm:space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex flex-col space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">OMR Comparison Complete!</h2>
                    <p className="text-green-100 text-sm sm:text-base">{result.message}</p>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-200">{result.correctAnswers}</div>
                      <div className="text-xs opacity-90">Correct</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-200">{result.incorrectAnswers}</div>
                      <div className="text-xs opacity-90">Incorrect</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-200">{result.unansweredQuestions}</div>
                      <div className="text-xs opacity-90">Unanswered</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">{result.accuracy}%</div>
                      <div className="text-xs opacity-90">Accuracy</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">
                        {result.totalScore}/{result.maxScore}
                      </div>
                      <div className="text-xs opacity-90">Score</div>
                    </div>
                  </div>

                  {/* Comparison Details */}
                  {result.comparisonDetails && (
                    <div className="text-center text-sm text-green-100">
                      <p>
                        Answer Key: {result.comparisonDetails.answerKeyMarked}/
                        {result.comparisonDetails.totalAnswerKeyQuestions} marked
                      </p>
                      <p>
                        Student Paper: {result.comparisonDetails.studentMarked}/
                        {result.comparisonDetails.totalStudentQuestions} marked
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Processed Images Display */}
              {(result.answerKeyImage || result.questionPaperImage) && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Answer Key Image */}
                  {result.answerKeyImage && (
                    <motion.div
                      className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                        <h3 className="text-lg font-bold">Answer Key (Processed)</h3>
                      </div>
                      <div className="p-4">
                        <img
                          src={`data:image/png;base64,${result.answerKeyImage}`}
                          alt="Processed Answer Key"
                          className="w-full h-auto max-h-64 object-contain border border-gray-200 rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Question Paper Image */}
                  {result.questionPaperImage && (
                    <motion.div
                      className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 text-white">
                        <h3 className="text-lg font-bold">Student Paper (Processed)</h3>
                      </div>
                      <div className="p-4">
                        <img
                          src={`data:image/png;base64,${result.questionPaperImage}`}
                          alt="Processed Question Paper"
                          className="w-full h-auto max-h-64 object-contain border border-gray-200 rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Detailed Results Table */}
              <div className="space-y-4 sm:space-y-6">
                {result.pages.map((page, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* Page Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 text-white">
                      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">Page {page.page}</h3>
                        <div className="flex space-x-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-green-200">{page.correct}</div>
                            <div className="text-xs opacity-90">Correct</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-red-200">{page.incorrect}</div>
                            <div className="text-xs opacity-90">Incorrect</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-200">{page.unanswered}</div>
                            <div className="text-xs opacity-90">Unanswered</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questions Table */}
                    <div className="p-3 sm:p-6">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                              <th className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bold">
                                Q#
                              </th>
                              <th className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bold">
                                Correct Answer
                              </th>
                              <th className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bold">
                                Student Answer
                              </th>
                              <th className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {page.questions.map((q, i) => (
                              <tr
                                key={i}
                                className={`transition-colors ${
                                  q.status === "correct"
                                    ? "bg-green-50 hover:bg-green-100"
                                    : q.status === "incorrect"
                                      ? "bg-red-50 hover:bg-red-100"
                                      : "bg-gray-50 hover:bg-gray-100"
                                }`}
                              >
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
                                  {q.question}
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-blue-600">
                                  {q.correctAnswer}
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">
                                  <span
                                    className={
                                      q.status === "correct"
                                        ? "text-green-600"
                                        : q.status === "incorrect"
                                          ? "text-red-600"
                                          : "text-gray-600"
                                    }
                                  >
                                    {q.studentAnswer}
                                  </span>
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                                  {q.status === "correct" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Correct</span>
                                      <span className="sm:hidden">✓</span>
                                    </span>
                                  ) : q.status === "incorrect" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Incorrect</span>
                                      <span className="sm:hidden">✗</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Unanswered</span>
                                      <span className="sm:hidden">-</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Submit Button */}
              <motion.div
                className="pt-4 sm:pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={handleSubmitMarks}
                  disabled={submitLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  {submitLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      Submitting Results...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Submit Marks to Database
                    </div>
                  )}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default OMRScannerSimplified
