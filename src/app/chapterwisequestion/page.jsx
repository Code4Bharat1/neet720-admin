"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Upload,
  Clipboard,
  CheckCircle,
  XCircle,
  Edit,
  Save,
  ChevronRight,
  ChevronDown,
  Book,
  FlaskConical,
  Atom,
  Tag,
  Lightbulb,
  Send,
  Loader2,
  ImageIcon,
  PlusCircle,
  RefreshCcw,
} from "lucide-react"
import Sidebar from "@/components/desktopsidebar/sidebar"

const Page = () => {
  // PDF form state
  const [pdfForm, setPdfForm] = useState({
    chapterName: "",
    subject: "",
    topicTags: "",
  })
  const [pdfId, setPdfId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(localStorage.getItem("mcq_submitted_count") || "0", 10)
    }
    return 0
  })

  const [chapter, setChapter] = useState("")
  const [subject, setSubject] = useState("Physics")
  const [topics, setTopics] = useState([])
  const [topicInput, setTopicInput] = useState("")
  const [showEdit, setShowEdit] = useState(true)

  // MCQ Extraction state
  const [mcqImage, setMcqImage] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)
  const [extractedQuestions, setExtractedQuestions] = useState([])
  const pasteBoxRef = useRef(null)

  // --- Local Storage Effects ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedChapter = localStorage.getItem("mcq_chapter") || ""
      const storedSubject = localStorage.getItem("mcq_subject") || "Physics"
      const storedTopics = JSON.parse(localStorage.getItem("mcq_topics") || "[]")
      setChapter(storedChapter)
      setSubject(storedSubject)
      setTopics(storedTopics)
      setTopicInput(storedTopics.join("\n"))
      setShowEdit(!(storedChapter && storedTopics.length > 0))
    }
  }, [])

  useEffect(() => {
    const savedForm = JSON.parse(localStorage.getItem("pdf_form") || "{}")
    setPdfForm({
      chapterName: savedForm.chapterName || "",
      subject: savedForm.subject || "",
      topicTags: savedForm.topicTags || "",
    })
  }, [])

  useEffect(() => {
    localStorage.setItem("pdf_form", JSON.stringify(pdfForm))
  }, [pdfForm])

  // --- Handlers ---

  // Handler for image paste (extract MCQs)
  const handlePasteImage = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          setMcqImage(file)
          setExtractError(null)
          break
        }
      }
    }
  }

  // Handler for image upload (extract MCQs)
  const handleMcqImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMcqImage(e.target.files[0])
    }
  }

  // Extract MCQs from the image
  const handleExtractMcqs = async () => {
    if (!mcqImage) {
      alert("Please paste or upload an image first.")
      return
    }
    setExtracting(true)
    setExtractError(null)
    setExtractedQuestions([])

    try {
      const formData = new FormData()
      formData.append("image", mcqImage)

      const res = await fetch("http://localhost:6004/api/extract-mcqs", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to extract MCQs")
      }

      const data = await res.json()
      const mcqs = data.mcqs

      if (Array.isArray(mcqs)) {
        setExtractedQuestions(
          mcqs.map((mcq) => ({
            ...mcq,
            options: (mcq.options || []).map((opt, i) => ({
              option_text: opt,
              is_correct: mcq.answer?.toLowerCase() === "abcd"[i],
            })),
            solution: "",
            difficulty_level: "medium",
            evaluating: false,
            evaluated: false,
            pdfId: pdfId || "",
            topic: "", // For topic suggestion
            diagramPath: "",
            diagramFile: null,
            diagramPreview: "",
            submitted: false, // New field to track submission status
            showDetails: false, // For accordion-like behavior
          })),
        )
      } else {
        setExtractError("No MCQs found in response.")
      }
    } catch (err) {
      setExtractError("Failed to extract MCQs: " + (err.message || "Unknown error"))
    } finally {
      setExtracting(false)
    }
  }

  // Update question field
  const updateQuestionField = (idx, field, value) => {
    setExtractedQuestions((prev) => {
      const arr = [...prev]
      arr[idx] = { ...arr[idx], [field]: value }
      return arr
    })
  }

  // Update an option field
  const updateOptionField = (qIdx, optIdx, field, value) => {
    setExtractedQuestions((prev) => {
      const arr = [...prev]
      arr[qIdx].options = arr[qIdx].options.map((opt, i) =>
        i === optIdx
          ? { ...opt, [field]: value }
          : field === "is_correct"
            ? { ...opt, is_correct: false } // Only one correct option
            : opt,
      )
      return arr
    })
  }

  // Evaluate difficulty for a question and fetch topic/topic_id
  const handleEvaluateDifficulty = async (idx) => {
    const q = extractedQuestions[idx]
    const mcqText =
      `${q.question}\n` + q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt.option_text}`).join("\n")

    try {
      updateQuestionField(idx, "evaluating", true)

      const res = await fetch(`http://127.0.0.1:6004/api/assess-difficulty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mcq: mcqText,
          chapter: chapter,
          topics: topics,
          subject: subject,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to assess difficulty")
      }

      const { difficulty, answer, explanation, topic, topic_id } = await res.json()

      updateQuestionField(idx, "difficulty_level", difficulty === "easy" ? "simple" : difficulty)
      updateQuestionField(idx, "solution", explanation)
      updateQuestionField(
        idx,
        "options",
        q.options.map((opt, i) => ({
          ...opt,
          is_correct: String.fromCharCode(65 + i) === (answer || "").toUpperCase(),
        })),
      )
      updateQuestionField(idx, "evaluated", true)
      updateQuestionField(idx, "topic", topic || "")
      updateQuestionField(idx, "pdfId", topic_id || "") // Treat topic_id as pdfId
    } catch (error) {
      alert("Failed to evaluate difficulty: " + (error.message || "Unknown error"))
    } finally {
      updateQuestionField(idx, "evaluating", false)
    }
  }

  // Paste handler (diagram): uploads immediately, sets diagramPath to AWS url
  const handleDiagramPaste = async (e, idx) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          const formData = new FormData()
          formData.append("file", file)
          try {
            setUploading(true)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
              method: "POST",
              body: formData,
            })

            if (!res.ok) {
              const errorData = await res.json()
              throw new Error(errorData.error || "Failed to upload image")
            }

            const data = await res.json()
            const imageUrl = data.url
            updateQuestionField(idx, "diagramPath", imageUrl)
            updateQuestionField(idx, "diagramPreview", URL.createObjectURL(file)) // For immediate preview
          } catch (err) {
            alert("Failed to upload pasted image: " + (err.message || "Unknown error"))
          } finally {
            setUploading(false)
          }
          break
        }
      }
    }
  }

  const handleDiagramUpload = async (e, idx) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    try {
      setUploading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await res.json()
      const imageUrl = data.url
      updateQuestionField(idx, "diagramPath", imageUrl)
      updateQuestionField(idx, "diagramPreview", URL.createObjectURL(file)) // For immediate preview
    } catch (err) {
      alert("Failed to upload image: " + (err.message || "Unknown error"))
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveDiagram = (idx) => {
    updateQuestionField(idx, "diagramPath", "")
    updateQuestionField(idx, "diagramFile", null)
    updateQuestionField(idx, "diagramPreview", "")
  }

  // Submit a single question (upload pasted diagram if any)
  const handleCreateQuestion = async (idx) => {
    const q = extractedQuestions[idx];
    let diagramUrl = q.diagramPath;

    // Step 1: Upload diagram if required
    if (!diagramUrl && q.diagramFile) {
      const formData = new FormData();
      formData.append("file", q.diagramFile);
      try {
        setUploading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to upload diagram");
        }

        const data = await res.json();
        diagramUrl = data.url;
      } catch (err) {
        alert("Failed to upload diagram for question: " + (err.message || "Unknown error"));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Step 2: Transform & Send Data
    try {
      const payload = {
        teacherId: "demo-teacher-id", // Replace this with actual teacherId
        subject: subject,
        chapter: chapter,
        topic: q.topic || topics[0] || "",
        question: q.question,
        options: q.options.map((opt) => opt.option_text),
        answer: q.options.find((opt) => opt.is_correct)?.option_text || "",
        difficulty: q.difficulty_level,
        explanation: q.solution || "",
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teacher/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create question");
      }

      alert(`Question ${idx + 1} created successfully.`);

      // Mark question as submitted
      setExtractedQuestions((prev) => {
        const updated = [...prev];
        updated[idx].submitted = true;
        return updated;
      });

      setSubmittedCount((c) => {
        const newCount = c + 1;
        localStorage.setItem("mcq_submitted_count", newCount.toString());
        return newCount;
      });
    } catch (error) {
      alert("Error creating question: " + (error.message || "Unknown error"));
    }
  };


  // Step 1: PDF creation
  const handleCreatePdf = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/pdfid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterName: pdfForm.chapterName,
          subject: pdfForm.subject,
          topicTags: pdfForm.topicTags.split(",").map((tag) => tag.trim()),
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to create PDF")
      }

      const data = await res.json()
      setPdfId(data.pdfId)
      setExtractedQuestions((prev) => prev.map((q) => ({ ...q, pdfId: data.pdfId })))
      alert("PDF Created. PDF ID: " + data.pdfId)
    } catch (error) {
      alert(error.message || "Error creating PDF")
    }
  }

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 text-gray-900 p-4 sm:p-6">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <motion.div
        className="max-w-4xl mx-auto md:ml-96 space-y-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-800 drop-shadow-lg mb-8">
          NEET MCQ Admin Panel
        </motion.h1>

        {/* Submitted Count */}
        <motion.div
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow-lg border border-gray-200"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle className="w-5 h-5" />
            Total Questions Submitted: {submittedCount}
          </div>
          <motion.button
            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            onClick={() => {
              const confirmReset = window.confirm("Are you sure you want to reset the submitted count?")
              if (confirmReset) {
                localStorage.setItem("mcq_submitted_count", "0")
                setSubmittedCount(0)
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Count
          </motion.button>
        </motion.div>

        {/* Chapter/Topics/Subjects section */}
        <motion.div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
            <Book className="w-5 h-5" />
            Set Chapter, Topics, and Subject
          </h2>
          {showEdit ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <input
                className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Chapter Name (e.g., Human Physiology)"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
              <div className="relative my-2">
                <select
                  className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    localStorage.setItem("mcq_subject", e.target.value)
                  }}
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>
              <textarea
                className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter topics, one per line (e.g., Digestion and Absorption)"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                rows={4}
              />
              <motion.button
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  const topicsArr = topicInput
                    .split("\n")
                    .map((t) => t.trim())
                    .filter(Boolean)
                  setTopics(topicsArr)
                  setShowEdit(false)
                  localStorage.setItem("mcq_chapter", chapter)
                  localStorage.setItem("mcq_topics", JSON.stringify(topicsArr))
                }}
                disabled={!chapter || !topicInput.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-5 h-5" />
                Save
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Book className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-700">Chapter:</span> {chapter}
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {subject === "Physics" && <Atom className="w-4 h-4 text-purple-600" />}
                  {subject === "Chemistry" && <FlaskConical className="w-4 h-4 text-green-600" />}
                  {subject === "Biology" && <Book className="w-4 h-4 text-red-600" />}
                  <span className="font-semibold text-gray-700">Subject:</span> {subject}
                </div>
                <div className="flex items-start gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-yellow-600 mt-1" />
                  <span className="font-semibold text-gray-700">Topics:</span>{" "}
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <span
                        key={t}
                        className="inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <motion.button
                className="bg-gray-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                onClick={() => {
                  setShowEdit(true)
                  setTopicInput(topics.join("\n"))
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-5 h-5" />
                Edit
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* MCQ Extraction and Question Forms */}
        <motion.div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Step 2: Paste/Upload MCQ Image & Extract
          </h2>
          <motion.div
            ref={pasteBoxRef}
            tabIndex={0}
            onPaste={handlePasteImage}
            className="border-2 border-dashed border-blue-500 rounded-lg p-8 text-center mb-4 cursor-pointer hover:bg-blue-50 focus:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-3"
            style={{ minHeight: "120px" }}
            onClick={() => pasteBoxRef.current && pasteBoxRef.current.focus()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Clipboard className="w-8 h-8 text-blue-600" />
            <span className="text-gray-700 text-lg">
              <b>Paste</b> your image snippet here (Ctrl+V or ⌘+V)
            </span>
            <span className="text-gray-600 text-sm">
              or click to focus and paste, or{" "}
              <label className="inline-flex items-center cursor-pointer text-blue-600 hover:text-blue-800">
                <Upload className="w-4 h-4 mr-1" />
                upload file
                <input type="file" accept="image/*" onChange={handleMcqImageChange} className="hidden" />
              </label>
            </span>
          </motion.div>
          <motion.button
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExtractMcqs}
            disabled={extracting || !mcqImage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {extracting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Extracting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Extract MCQs
              </>
            )}
          </motion.button>
          {extractError && (
            <motion.p
              className="text-red-600 mt-4 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <XCircle className="w-5 h-5" />
              {extractError}
            </motion.p>
          )}
          {mcqImage && (
            <motion.div
              className="mt-4 p-3 bg-gray-100 rounded-md border border-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-gray-700 text-sm mb-2">Image Preview:</h3>
              <img
                src={URL.createObjectURL(mcqImage) || "/placeholder.svg"}
                alt="MCQ upload preview"
                className="max-w-full h-auto rounded-md shadow-md border border-gray-400"
              />
            </motion.div>
          )}
        </motion.div>

        {extractedQuestions.length > 0 && (
          <motion.div variants={itemVariants}>
            <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Step 3: Review, Evaluate & Submit Each MCQ
            </h2>
            {extractedQuestions.map((q, idx) => (
              <motion.div
                key={idx}
                className="mb-6 bg-white p-6 rounded-lg shadow-lg border border-gray-200"
                variants={itemVariants}
              >
                <div
                  className="flex items-center justify-between mb-4 cursor-pointer"
                  onClick={() => updateQuestionField(idx, "showDetails", !q.showDetails)}
                >
                  <div className="font-bold text-lg text-blue-700 flex items-center gap-2">
                    Question {idx + 1}
                    {q.submitted && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  {q.showDetails ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {q.showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-gray-700 text-sm mb-1">PDF ID:</label>
                    <input
                      placeholder="PDF ID"
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={q.pdfId || pdfId || ""}
                      onChange={(e) => updateQuestionField(idx, "pdfId", e.target.value)}
                    />
                    <label className="block text-gray-700 text-sm mb-1">Question Text:</label>
                    <textarea
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={q.question}
                      onChange={(e) => updateQuestionField(idx, "question", e.target.value)}
                      rows={4}
                    />
                    <h3 className="font-semibold mt-4 text-blue-700">Options:</h3>
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 my-2">
                        <input
                          className="flex-1 bg-gray-50 text-gray-900 border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          value={opt.option_text}
                          onChange={(e) => updateOptionField(idx, i, "option_text", e.target.value)}
                        />
                        <label className="flex items-center gap-1 text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={opt.is_correct}
                            onChange={(e) => updateOptionField(idx, i, "is_correct", e.target.checked)}
                            className="form-checkbox h-5 w-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                    <motion.button
                      onClick={() => handleEvaluateDifficulty(idx)}
                      className="bg-purple-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      disabled={q.evaluating}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {q.evaluating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Evaluating...
                        </>
                      ) : q.evaluated ? (
                        <>
                          <CheckCircle className="w-5 h-5" /> Evaluated
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-5 h-5" /> Evaluate
                        </>
                      )}
                    </motion.button>
                    <label className="block text-gray-700 text-sm mb-1 mt-4">Difficulty Level:</label>
                    <select
                      value={q.difficulty_level}
                      onChange={(e) => updateQuestionField(idx, "difficulty_level", e.target.value)}
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                    <label className="block text-gray-700 text-sm mb-1">Solution:</label>
                    <textarea
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Solution"
                      value={q.solution}
                      onChange={(e) => updateQuestionField(idx, "solution", e.target.value)}
                      rows={4}
                    />
                    <label className="block text-gray-700 text-sm mb-1 mt-4">Topic Suggestion:</label>
                    <input
                      placeholder="Topic (suggested, editable)"
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={q.topic || ""}
                      onChange={(e) => updateQuestionField(idx, "topic", e.target.value)}
                    />

                    <h3 className="font-semibold mt-4 text-blue-700 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Paste or Upload Diagram:
                    </h3>
                    <motion.div
                      tabIndex={0}
                      onPaste={(e) => handleDiagramPaste(e, idx)}
                      className="border-2 border-dashed border-green-500 rounded-lg p-6 text-center mb-2 cursor-pointer hover:bg-green-50 focus:bg-green-50 transition-all duration-200 flex flex-col items-center justify-center gap-2"
                      style={{ minHeight: "100px" }}
                      title="Paste a diagram image here (Ctrl+V)"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Clipboard className="w-6 h-6 text-green-600" />
                      <span className="text-gray-700 text-sm">
                        <b>Paste</b> your diagram here (Ctrl+V or ⌘+V)
                      </span>
                      <span className="text-gray-600 text-xs">
                        or{" "}
                        <label className="inline-flex items-center cursor-pointer text-green-600 hover:text-green-800">
                          <Upload className="w-3 h-3 mr-1" />
                          upload file
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleDiagramUpload(e, idx)}
                            className="hidden"
                          />
                        </label>
                      </span>
                    </motion.div>
                    <label className="block text-gray-700 text-sm mb-1">Diagram URL:</label>
                    <input
                      placeholder="Diagram URL"
                      className="bg-gray-50 text-gray-900 border border-gray-300 p-3 w-full my-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={q.diagramPath}
                      onChange={(e) => updateQuestionField(idx, "diagramPath", e.target.value)}
                    />
                    {(q.diagramPreview || q.diagramPath) && (
                      <motion.div
                        className="mt-4 p-3 bg-gray-100 rounded-md border border-gray-300 relative w-fit"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <img
                          src={q.diagramPreview || q.diagramPath}
                          alt="Diagram preview"
                          className="max-w-full h-auto rounded-md shadow-md border border-gray-400"
                        />
                        <motion.button
                          onClick={() => handleRemoveDiagram(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                          title="Remove image"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                        {q.diagramPath && <p className="text-xs break-all text-gray-600 mt-2">URL: {q.diagramPath}</p>}
                      </motion.div>
                    )}
                    <motion.button
                      className={`px-6 py-3 rounded-md font-semibold mt-6 flex items-center gap-2 ${q.submitted
                          ? "bg-green-300 text-gray-700 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                        } transition-colors duration-200 disabled:opacity-50`}
                      onClick={() => handleCreateQuestion(idx)}
                      disabled={uploading || q.submitted}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {q.submitted ? (
                        <>
                          <CheckCircle className="w-5 h-5" /> Submitted
                        </>
                      ) : uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" /> Submit Question
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Page
