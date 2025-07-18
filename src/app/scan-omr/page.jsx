"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import Webcam from "react-webcam"
import jsQR from "jsqr"
import {
  Camera,
  Upload,
  FileText,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  Send,
  Scan,
  ImageIcon,
  Trash2,
  QrCode,
  X,
  Zap,
} from "lucide-react"

// QR Scanner Component
const QRScanner = ({ isOpen, onClose, onQRDetected }) => {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [qrData, setQrData] = useState(null)
  const [error, setError] = useState("")

  const scanQRCode = useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          setQrData(code.data)
          onQRDetected(code.data)
          setIsScanning(false)
          setError("")
        }
      }
    }
  }, [onQRDetected])

  useEffect(() => {
    let interval
    if (isScanning) {
      interval = setInterval(scanQRCode, 100)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isScanning, scanQRCode])

  const startScanning = () => {
    setIsScanning(true)
    setQrData(null)
    setError("")
  }

  const stopScanning = () => {
    setIsScanning(false)
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6" />
              <h3 className="text-lg font-bold">QR Code Scanner</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scanner Content */}
        <div className="p-4 space-y-4">
          {/* Webcam Container */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: "environment",
              }}
              className="w-full h-64 object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-purple-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>

                  {/* Scanning Line Animation */}
                  <motion.div
                    className="absolute left-0 right-0 h-0.5 bg-purple-500"
                    animate={{
                      y: [0, 192, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Error Display */}
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-800">Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Position the QR code within the scanning frame</li>
              <li>• Ensure good lighting for better detection</li>
              <li>• Hold the camera steady</li>
              <li>• The scanner will automatically detect QR codes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Mobile Scanner Component
const MobileScanner = ({ onCapture, capturedImages, onRemoveImage }) => {
  const fileInputRef = useRef(null)

  const handleFileCapture = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      onCapture(file)
    })
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileCapture}
        className="hidden"
      />

      {/* Scanner Button */}
      <motion.button
        type="button"
        onClick={triggerFileInput}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center space-x-2">
          <Scan className="w-5 h-5" />
          <span>Scan OMR Sheet</span>
        </div>
      </motion.button>

      {/* Captured Images Grid */}
      {capturedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center">
            <ImageIcon className="w-4 h-4 mr-2" />
            Captured Images ({capturedImages.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {capturedImages.map((img, idx) => (
              <motion.div
                key={idx}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                  <img
                    src={URL.createObjectURL(img) || "/placeholder.svg"}
                    alt={`Captured OMR ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveImage(idx)}
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

// File Upload Component
const FileUploadZone = ({ onFileSelect, files, label, color = "blue", icon: Icon }) => {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    onFileSelect(selectedFiles)
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
    </div>
  )
}

const OMRScannerWithQR = () => {
  const [studentName, setStudentName] = useState("")
  const [testName, setTestName] = useState("")
  const [originalFiles, setOriginalFiles] = useState([])
  const [studentFiles, setStudentFiles] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [capturedImages, setCapturedImages] = useState([])
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [qrData, setQrData] = useState("")

  const webcamRef = useRef(null)

  const scanQRFromFile = async (file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        handleQRDetected(code.data); // ✅ fill form fields
      } else {
        console.warn("QR not found in image");
      }
    };

    img.onerror = () => console.error("Failed to load image for QR scan");
  };


  const handleImageCapture = useCallback((file) => {
    setCapturedImages((prev) => [...prev, file]);
    setStudentFiles((prev) => [...prev, file]);
    scanQRFromFile(file); // ✅ scan QR from uploaded image too
  }, []);


  const handleRemoveImage = useCallback((index) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index))
    setStudentFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const capturePhoto = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const imageBlob = dataURItoBlob(imageSrc);
    const file = new File([imageBlob], `captured_omr_${Date.now()}.jpg`, { type: "image/jpeg" });

    setCapturedImages(prev => [...prev, file]);
    setStudentFiles(prev => [...prev, file]);

    scanQRFromFile(file); // ✅ auto-scan QR after capture
  };


  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1])
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new Blob([ab], { type: mimeString })
  }

  const handleQRDetected = (data) => {
    setQrData(data)
    // Parse QR data if it contains student info
    try {
      const parsed = JSON.parse(data)
      if (parsed.studentEmail) setStudentName(parsed.studentEmail)
      if (parsed.testName) setTestName(parsed.testName)
    } catch (e) {
      // If not JSON, treat as plain text
      if (data.includes("@")) {
        setStudentName(data)
      }
    }
    setShowQRScanner(false)
  }

  const handleEvaluate = async (e) => {
    e.preventDefault()
    if (!studentName || !testName || originalFiles.length === 0 || studentFiles.length === 0) {
      alert("Please fill in all fields and upload both original and student OMR files.")
      return
    }

    const formData = new FormData()
    formData.append("studentName", studentName)
    formData.append("testName", testName)
    originalFiles.forEach((file) => formData.append("original", file))
    studentFiles.forEach((file) => formData.append("student", file))

    try {
      setLoading(true)
      const response = await axios.post("http://localhost:5000/api/evaluate-omr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setResult(response.data)
    } catch (error) {
      console.error("Error evaluating:", error.response?.data || error.message)
      alert("Evaluation failed.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitMarks = async () => {
    if (!result) {
      alert("Please evaluate the OMR first.")
      return
    }

    try {
      setSubmitLoading(true)
      const totalScore = result.totalScore
      const totalQuestions = result.pages.reduce((sum, page) => sum + page.questions.length, 0)
      const allQuestions = result.pages.flatMap((page) => page.questions)
      let correct = 0,
        incorrect = 0,
        unattempted = 0

      const answers = []
      allQuestions.forEach((q) => {
        answers.push(q.studentAnswer ?? null)
        if (q.studentAnswer === null || q.studentAnswer === -1) {
          unattempted++
        } else if (q.status === "correct") {
          correct++
        } else {
          incorrect++
        }
      })

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/omr-marks`, {
        studentemail: studentName,
        testname: testName,
        answers,
        score: totalScore,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unattempted,
        totalquestions: totalQuestions,
        overallMarks: totalScore,
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
      {/* Mobile-first responsive container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <motion.div
          className="mb-6 sm:mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            OMR Scanner with QR
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">Upload and evaluate OMR sheets with QR code integration</p>
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
            {/* Input Fields */}
            <div className="grid gap-4 sm:gap-6">
              {/* Student Email */}
              <motion.div
                className="group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Student Email
                </label>
                <input
                  type="email"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter student email address"
                  required
                />
              </motion.div>

              {/* Test Name */}
              <motion.div
                className="group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Test Name
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter test name"
                  required
                />
              </motion.div>
            </div>

            {/* File Upload Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Original OMR Upload */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <FileUploadZone
                  onFileSelect={(files) => {
                    setStudentFiles(files);
                    files.forEach(scanQRFromFile); // ✅ scan QR from each uploaded image
                  }}
                  files={studentFiles}
                  label="Upload Student OMR Sheets"
                  color="purple"
                  icon={Upload}
                />

              </motion.div>

              {/* Student OMR Upload/Scanner */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <div className="space-y-4">

                  {/* ✅ Mobile Webcam Only */}
                  <div className="block lg:hidden space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Camera className="w-4 h-4 mr-2" />
                      Student OMR Sheets
                    </label>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      screenshotQuality={1}
                      videoConstraints={{ width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "environment" }}
                      className="rounded-xl shadow-md w-full"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture OMR Sheet</span>
                    </button>
                  </div>

                  {/* ✅ Desktop File Upload Only */}
                  <div className="hidden lg:block">
                    <FileUploadZone
                      onFileSelect={setStudentFiles}
                      files={studentFiles}
                      label="Upload Student OMR Sheets"
                      color="purple"
                      icon={Upload}
                    />
                  </div>

                  {/* ✅ Display Captured or Uploaded Images */}
                  {capturedImages.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Captured Images ({capturedImages.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {capturedImages.map((img, idx) => (
                          <motion.div
                            key={idx}
                            className="relative group"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                              <img
                                src={URL.createObjectURL(img) || "/placeholder.svg"}
                                alt={`Captured OMR ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
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
              </motion.div>

            </div>

            {/* Evaluate Button */}
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Evaluating OMR Sheets...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Evaluate OMR Sheets
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
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Evaluation Complete!</h2>
                    <p className="text-green-100 text-sm sm:text-base">OMR sheets have been successfully processed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold">{result.totalScore}</div>
                    <div className="text-lg sm:text-xl opacity-90">/ {result.maxScore}</div>
                    <div className="text-xs sm:text-sm text-green-100">Total Score</div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
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
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl font-bold">
                            {page.score} / {page.maxScore}
                          </div>
                          <div className="text-xs sm:text-sm opacity-90">Page Score</div>
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
                                Correct
                              </th>
                              <th className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-gray-700 font-bold">
                                Student
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
                                className={`transition-colors ${q.status === "correct" ? "bg-green-50 hover:bg-green-100" : "bg-red-50 hover:bg-red-100"}`}
                              >
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-semibold">
                                  {q.question}
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold text-blue-600">
                                  {q.correctAnswer}
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center font-bold">
                                  {q.studentAnswer !== null ? (
                                    <span className={q.status === "correct" ? "text-green-600" : "text-red-600"}>
                                      {q.studentAnswer}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">N/A</span>
                                  )}
                                </td>
                                <td className="border-2 border-gray-300 px-2 sm:px-4 py-2 sm:py-3 text-center">
                                  {q.status === "correct" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Correct</span>
                                      <span className="sm:hidden">✓</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span className="hidden sm:inline">Incorrect</span>
                                      <span className="sm:hidden">✗</span>
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
                transition={{ delay: 0.9 }}
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

export default OMRScannerWithQR
