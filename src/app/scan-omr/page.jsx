"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Trash2,
  Zap,
  Key,
  HelpCircle,
  QrCode,
} from "lucide-react";
import { useRouter } from "next/navigation";

// File Upload Component
const FileUploadZone = ({
  onFileSelect,
  files,
  label,
  color = "blue",
  icon: Icon,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    onFileSelect(selectedFiles);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFileSelect(updatedFiles);
  };

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
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Click to upload {label.toLowerCase()}
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Or drag and drop files here
          </p>
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
  );
};

const OMRScannerSimplified = () => {
  const router = useRouter();
  const [answerKeyFiles, setAnswerKeyFiles] = useState([]);
  const [questionPaperFiles, setQuestionPaperFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedTestQuestions, setSelectedTestQuestions] = useState([]);

  // Fetch tests on mount
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) {
          console.error("Admin auth token not found.");
          setTestData([]);
          setTestCount(0);
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const adminId = payload.id;
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/admin-tests`,
          {
            adminId,
          }
        );
        if (res.data?.tests) setTests(res.data.tests);
      } catch (err) {
        console.error("Error fetching tests:", err);
      }
    };
    fetchTests();
  }, []);

  // Inside OMRScannerSimplified component
  useEffect(() => {
    if (!selectedTest?.id) return;

    const fetchTestQuestions = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/get-questions`,
          { testid: selectedTest.id }
        );
        console.log(response.data);
        if (Array.isArray(response.data?.data)) {
          setSelectedTestQuestions(response.data?.data); // Define state for this
        } else {
          console.error("Unexpected response format for test questions");
        }
      } catch (err) {
        console.error("Error fetching test questions:", err);
      }
    };

    fetchTestQuestions();
  }, [selectedTest]);

  // Floating WhatsApp CTA
  const FloatingWhatsAppCTA = ({
    phone = "+91XXXXXXXXXX", // <-- put your business WhatsApp number here (with country code, no spaces)
    message, // string OR function () => string
    label = "We’ll do this for you — WhatsApp us!",
  }) => {
    const buildLink = () => {
      const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
      const text = typeof message === "function" ? message() : message;
      return `${base}?text=${encodeURIComponent(
        text || "Hi, I need help with OMR/QR scanning and evaluation."
      )}`;
    };

    return (
      <a
        href={buildLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 group"
      >
        <div className="flex items-center gap-3 rounded-full shadow-xl bg-white pr-4 pl-2 py-2 border border-emerald-200 hover:shadow-2xl transition-all">
          {/* WhatsApp icon */}
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow">
            <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
              <path d="M19.11 17.3c-.29-.15-1.68-.83-1.94-.92-.26-.1-.45-.15-.64.15-.19.3-.74.92-.9 1.11-.17.2-.33.22-.62.08-.29-.15-1.23-.45-2.35-1.43-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.61.13-.13.29-.33.43-.49.14-.16.19-.27.29-.46.1-.2.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5l-.55-.01c-.2 0-.5.07-.76.36-.26.3-1 1-1 2.45 0 1.44 1.03 2.83 1.17 3.03.14.2 2.03 3.1 4.92 4.35.69.3 1.22.48 1.63.61.68.22 1.29.19 1.78.11.54-.08 1.68-.69 1.91-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.54-.34zM26.67 5.33C23.8 2.46 20.02 1 16.01 1 7.64 1 1 7.64 1 16.01c0 2.65.69 5.2 1.99 7.46L1 31l7.71-1.97c2.21 1.2 4.7 1.84 7.3 1.84h.01c8.37 0 15.01-6.64 15.01-15.01 0-4-1.56-7.78-4.36-10.53zM16.01 28.79h-.01c-2.33 0-4.6-.63-6.59-1.83l-.47-.28-4.58 1.17 1.22-4.46-.3-.46c-1.22-2-1.86-4.3-1.86-6.93 0-7.12 5.8-12.91 12.93-12.91 3.45 0 6.69 1.34 9.13 3.78 2.44 2.44 3.78 5.68 3.78 9.13 0 7.13-5.8 12.92-12.92 12.92z" />
            </svg>
          </span>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-emerald-900">{label}</p>
            <p className="text-xs text-emerald-700">
              Fast response on WhatsApp
            </p>
          </div>
        </div>
      </a>
    );
  };

  // Handler
  const handleTestSelect = (e) => {
    const selectedId = parseInt(e.target.value);
    const test = tests.find((t) => t.id === selectedId);
    setSelectedTest(test);
  };
  const handleEvaluate = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Step 1: Process QR Code for Question Paper
      const questionPaperQrFormData = new FormData();
      questionPaperFiles.forEach((file) =>
        questionPaperQrFormData.append("file", file)
      );
      console.log("Processing QR Code for Question Paper...");
      const questionPaperQrResponse = await axios.post(
        "https://omr.neet720.com/api/scan_qr",
        questionPaperQrFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle successful QR scan
      if (questionPaperQrResponse.status === 200) {
        console.log("QR Code Scanned Successfully");

        // Step 2: Process OMR Question Paper
        const questionPaperOmrFormData = new FormData();
        questionPaperFiles.forEach((file) =>
          questionPaperOmrFormData.append("omrfile", file)
        );
        console.log("Processing OMR Question Paper...");
        const questionPaperOmrResponse = await axios.post(
          "https://omr.neet720.com/api/process-omr",
          questionPaperOmrFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("OMR Sheet Processed Successfully");
        console.log(questionPaperOmrResponse.data);

        // Step 3: Compare both OMR and QR responses
        console.log("Comparing OMR and QR responses...");

        // Assuming `compareOMRResponses` needs both the QR and OMR response data
        const comparisonResult = compareOMRResponses(
          questionPaperOmrResponse.data, // OMR response data
          questionPaperQrResponse.data, // QR response data
          selectedTestQuestions
        );

        // Set the comparison result to state (or handle accordingly)
        setResult(comparisonResult);
      } else {
        throw new Error("QR Code scanning failed. Please try again.");
      }
    } catch (error) {
      console.error("Error evaluating:", error.response?.data || error.message);
      alert(
        `Evaluation failed: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to compare answer key and question paper responses
  const compareOMRResponses = (
    questionPaperOmrData,
    questionPaperQrData,
    testQuestions
  ) => {
    if (
      !questionPaperOmrData.success ||
      !Array.isArray(questionPaperOmrData.results)
    ) {
      throw new Error("Invalid or missing OMR result data");
    }

    const omrResults = questionPaperOmrData.results;
    const optionLabels = ["A", "B", "C", "D"];

    console.log("🔍 OMR Results (raw):", omrResults);

    // Step 1: Clean & Map the OMR results
    const studentAnswerMap = {}; // question number → selected option

    for (const entry of omrResults) {
      const { question, option, marked } = entry;

      if (typeof question !== "number" || !option || marked !== 1) {
        console.warn("⚠️ Invalid or unmarked entry skipped:", entry);
        continue;
      }

      if (!studentAnswerMap[question]) {
        studentAnswerMap[question] = option;
      } else {
        console.warn(
          `⚠️ Duplicate marked entry for Q${question}: already ${studentAnswerMap[question]}, ignored ${option}`
        );
      }
    }

    console.log("📋 Student Answer Map:", studentAnswerMap);

    const comparedResults = [];
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    testQuestions.forEach((q, i) => {
      const qNum = i + 1;
      const correctAnswerText = q.correctanswer?.trim();
      const correctIndex = q.options.findIndex(
        (opt) => opt.trim() === correctAnswerText
      );
      const correctLabel = optionLabels[correctIndex] || "N/A";

      const studentAnswer = studentAnswerMap[qNum] || null;
      let status = "unanswered";

      if (!studentAnswer) {
        console.warn(`⚠️ No answer found for Q${qNum}`);
        unansweredCount++;
      } else if (studentAnswer === correctLabel) {
        correctCount++;
        status = "correct";
      } else {
        incorrectCount++;
        status = "incorrect";
      }

      comparedResults.push({
        question: qNum,
        questionText: q.question_text,
        correctAnswer: correctLabel,
        correctText: correctAnswerText,
        studentAnswer: studentAnswer || "N/A",
        status,
      });
    });

    const questionsPerPage = 45;
    const pages = [];
    const totalQuestions = comparedResults.length;
    const pageCount = Math.ceil(totalQuestions / questionsPerPage);

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const start = (pageNum - 1) * questionsPerPage;
      const pageItems = comparedResults.slice(start, start + questionsPerPage);

      pages.push({
        page: pageNum,
        questions: pageItems,
        correct: pageItems.filter((q) => q.status === "correct").length,
        incorrect: pageItems.filter((q) => q.status === "incorrect").length,
        unanswered: pageItems.filter((q) => q.status === "unanswered").length,
        score: pageItems.filter((q) => q.status === "correct").length,
        maxScore: pageItems.length,
      });
    }

    const accuracy =
      totalQuestions > 0
        ? ((correctCount / totalQuestions) * 100).toFixed(1)
        : "0";

    return {
      success: true,
      message: "Evaluation completed using test master data",
      pages,
      totalScore: correctCount,
      maxScore: totalQuestions,
      totalQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      accuracy,
      questionPaperQrData,
    };
  };

  const handleSubmitMarks = async () => {
    if (!result) {
      alert("Please evaluate the OMR first.");
      return;
    }

    try {
      setSubmitLoading(true);
      const allQuestions = result.pages.flatMap((page) => page.questions);
      const answers = allQuestions.map((q) =>
        q.studentAnswer === "N/A" ? null : q.studentAnswer
      );

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
        answerKeyQrData: result.answerKeyQrData, // Include QR data
        questionPaperQrData: result.questionPaperQrData, // Include QR data
        qrComparisonStatus: result.qrComparisonStatus, // Include QR comparison status
      });
      alert("Result saved successfully!");
    } catch (error) {
      console.error(
        "Error saving marks:",
        error.response?.data || error.message
      );
      alert("Saving marks failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push("/admindashboard")}
          className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        {/* Header Section */}
        <motion.div
          className="mb-6 sm:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            OMR & QR Scanner Comparator
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Upload OMR answer key and question paper for comparison and
            evaluation, including QR code verification.
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
              <div className="space-y-4">
                {/* Dropdown Selector of tests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Key className="w-4 h-4 mr-2" />
                    Select Test
                  </label>
                  <select
                    onChange={handleTestSelect}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Choose a Test --</option>
                    {tests.map((test) => (
                      <option key={test.id} value={test.id}>
                        {test.testname} ({test.subject})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Display Selected Test Details */}
                {selectedTest && (
                  <motion.div
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="text-lg font-bold text-blue-700">
                      {selectedTest.testname}
                    </h3>
                    <p className="text-sm text-gray-700">
                      <b>Subjects:</b> {selectedTest.subject}
                    </p>
                    <p className="text-sm text-gray-700">
                      <b>Batch:</b> {selectedTest.batch_name}
                    </p>
                    <p className="text-sm text-gray-700">
                      <b>Duration:</b> {selectedTest.duration} min
                    </p>
                    <p className="text-sm text-gray-700">
                      <b>Marks:</b> {selectedTest.marks} ( +
                      {selectedTest.positivemarks} / -
                      {selectedTest.negativemarks} )
                    </p>
                    <p className="text-sm text-gray-700">
                      <b>Status:</b> {selectedTest.status}
                    </p>
                    <p className="text-sm text-gray-700">
                      <b>Instruction:</b> {selectedTest.instruction}
                    </p>

                    {/* Topics List */}
                    {selectedTest.topic_name && (
                      <div className="text-sm text-gray-700">
                        <b>Topics:</b>
                        <ul className="list-disc ml-5">
                          {JSON.parse(
                            selectedTest.topic_name
                          )[0].topic_names.map((topic, idx) => (
                            <li key={idx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              {selectedTestQuestions.length > 0 && (
                <motion.div
                  className="bg-white border border-gray-200 rounded-lg p-4 mt-4 shadow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h4 className="text-lg font-semibold mb-3 text-blue-700">
                    Test Questions
                  </h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {selectedTestQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-50 border border-blue-100 rounded p-3"
                      >
                        <p className="font-semibold text-gray-800">
                          Q{idx + 1}: {q.question_text}
                        </p>
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                          {q.options.map((opt, i) => (
                            <li
                              key={i}
                              className={
                                opt === q.correctanswer
                                  ? "text-green-600 font-medium"
                                  : ""
                              }
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Question Paper Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
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
                    Comparing OMR & QR Sheets...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Compare & Evaluate Sheets
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
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                      OMR & QR Comparison Complete!
                    </h2>
                    <p className="text-green-100 text-sm sm:text-base">
                      {result.message}
                    </p>
                  </div>
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-200">
                        {result.correctAnswers}
                      </div>
                      <div className="text-xs opacity-90">Correct</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-200">
                        {result.incorrectAnswers}
                      </div>
                      <div className="text-xs opacity-90">Incorrect</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-200">
                        {result.unansweredQuestions}
                      </div>
                      <div className="text-xs opacity-90">Unanswered</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">
                        {result.accuracy}%
                      </div>
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
                        Answer Key OMR:{" "}
                        {result.comparisonDetails.answerKeyMarked}/
                        {result.comparisonDetails.totalAnswerKeyQuestions}{" "}
                        marked
                      </p>
                      <p>
                        Student Paper OMR:{" "}
                        {result.comparisonDetails.studentMarked}/
                        {result.comparisonDetails.totalStudentQuestions} marked
                      </p>
                    </div>
                  )}
                  {/* QR Code Details */}
                  <div className="bg-white/20 rounded-lg p-3 text-center text-sm">
                    <h3 className="font-bold text-lg mb-2 flex items-center justify-center">
                      <QrCode className="w-5 h-5 mr-2" /> QR Code Verification
                    </h3>
                    <p
                      className={`font-semibold ${
                        result.qrComparisonStatus === "matched"
                          ? "text-green-200"
                          : "text-red-200"
                      }`}
                    >
                      Status: {result.qrComparisonMessage}
                    </p>
                    {result.answerKeyQrData && (
                      <div className="mt-2">
                        <p className="font-semibold text-green-100">
                          Answer Key QR:
                        </p>
                        <p>
                          Test Name: {result.answerKeyQrData.testName || "N/A"}
                        </p>
                        <p>Test ID: {result.answerKeyQrData.testId || "N/A"}</p>
                        <p>
                          Batch Name:{" "}
                          {result.answerKeyQrData.batchName || "N/A"}
                        </p>
                      </div>
                    )}
                    {result.questionPaperQrData && (
                      <div className="mt-2">
                        <p className="font-semibold text-green-100">
                          Student Paper QR:
                        </p>
                        <p>
                          Student ID:{" "}
                          {result.questionPaperQrData.studentId || "N/A"}
                        </p>
                        <p>
                          Test Name:{" "}
                          {result.questionPaperQrData.testName || "N/A"}
                        </p>
                        <p>
                          Test ID: {result.questionPaperQrData.testId || "N/A"}
                        </p>
                        <p>
                          Subject: {result.questionPaperQrData.subject || "N/A"}
                        </p>
                        <p>
                          Chapter: {result.questionPaperQrData.chapter || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
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
                        <h3 className="text-lg font-bold">
                          Answer Key (Processed)
                        </h3>
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
                        <h3 className="text-lg font-bold">
                          Student Paper (Processed)
                        </h3>
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
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold">
                          Page {page.page}
                        </h3>
                        <div className="flex space-x-4 text-center">
                          <div>
                            <div className="text-xl font-bold text-green-200">
                              {page.correct}
                            </div>
                            <div className="text-xs opacity-90">Correct</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-red-200">
                              {page.incorrect}
                            </div>
                            <div className="text-xs opacity-90">Incorrect</div>
                          </div>
                          <div>
                            <div className="text-xl font-bold text-gray-200">
                              {page.unanswered}
                            </div>
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
                                      <span className="hidden sm:inline">
                                        Correct
                                      </span>
                                      <span className="sm:hidden">✓</span>
                                    </span>
                                  ) : q.status === "incorrect" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">
                                        Incorrect
                                      </span>
                                      <span className="sm:hidden">✗</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">
                                        Unanswered
                                      </span>
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
      <FloatingWhatsAppCTA
        phone="+91XXXXXXXXXX" // <-- replace with your WhatsApp number
        message={() => {
          // Prefill message using current context (selected test, counts, etc.)
          const testLine = selectedTest
            ? `\nTest: ${selectedTest.testname} (${selectedTest.subject}) | Batch: ${selectedTest.batch_name}`
            : "";
          const qCount = selectedTestQuestions?.length || 0;
          return (
            "Hi NEET720 team, I want you to handle OMR + QR comparison and upload results for me." +
            testLine +
            (qCount ? `\nQuestions detected: ${qCount}` : "") +
            "\nPlease contact me."
          );
        }}
        label="We’ll do this for you — WhatsApp us!"
      />
    </div>
  );
};

export default OMRScannerSimplified;
