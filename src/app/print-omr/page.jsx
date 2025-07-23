"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function QrGenerator() {
  const [testId, setTestId] = useState("");
  const [studentIds, setStudentIds] = useState("");
  const [qrImages, setQrImages] = useState([]);
  const [questionCount, setQuestionCount] = useState(null);
  const [students, setStudents] = useState([]); // New state for student data
  const [loading, setLoading] = useState(true); // Loading state

  // For student mode
  const [validStudents, setValidStudents] = useState([]); // [{id, fullName}]
  const [invalidStudentIds, setInvalidStudentIds] = useState([]);
  const [evaluated, setEvaluated] = useState(false);

  /* ------------------------------------------------------------------
     1. FETCH TEST ID & QUESTION COUNT ON MOUNT
  ------------------------------------------------------------------ */
  useEffect(() => {
    const fetchTestIdAndCount = async () => {
      const storedTestId = localStorage.getItem("testid");
      if (!storedTestId) {
        alert("Test ID not found in localStorage.");
        return;
      }
      setTestId(storedTestId);
      try {
        const res = await axios.post(
          "http://localhost:3085/api/qr/question-count",
          { testid: storedTestId },
          { headers: { "Content-Type": "application/json" } }
        );
        setQuestionCount(res.data.count);
      } catch (err) {
        console.error("Failed to fetch question count", err);
      }
    };
    fetchTestIdAndCount();
    fetchStudentData();
  }, []);

  /* ------------------------------------------------------------------
     2. HELPER FUNCTIONS
  ------------------------------------------------------------------ */
  const getAdminIdFromToken = () => {
    try {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) return null;
      const decoded = jwtDecode(token);
      return decoded.admin_id || decoded.id || null;
    } catch (error) {
      console.error("JWT decoding failed", error);
      return null;
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const batchId = localStorage.getItem("batchId");
      if (!batchId) {
        alert("Batch ID not found in localStorage.");
        return;
      }

      const res = await axios.post(
        "http://localhost:3085/api/batches/batch-students",
        { batchId: batchId },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Full API response:", res.data); // For debugging

      // Access the students array from the data property
      if (
        res.data &&
        res.data.success &&
        res.data.data &&
        Array.isArray(res.data.data)
      ) {
        const studentsData = res.data.data;

        setStudents(studentsData);

        // Auto-evaluate the students
        setValidStudents(
          studentsData.map((student) => ({
            id: student.id,
            fullName:
              student.fullName ||
              `${student.firstName || ""} ${student.lastName || ""}`.trim(),
          }))
        );
        setEvaluated(true);
        console.log("Processed validStudents:", validStudents); // Verify the data
      } else {
        console.error("Invalid response format:", res.data);
        alert("No students found in this batch");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Failed to fetch student data");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------------
     3. STUDENT MODE: VERIFY IDS
  ------------------------------------------------------------------ */
  const handleEvaluate = async () => {
    setEvaluated(false);
    setValidStudents([]);
    setInvalidStudentIds([]);
    const admin_id = getAdminIdFromToken();
    if (!admin_id) {
      alert("Admin not authenticated");
      return;
    }
    const rawIds = studentIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (rawIds.length === 0) {
      alert("Please enter at least one student ID.");
      return;
    }

    try {
      const verifyRes = await axios.post(
        "http://localhost:3085/api/qr/verify-students",
        {
          student_ids: rawIds,
          admin_id,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setValidStudents(verifyRes.data.validStudentIds || []);
      setInvalidStudentIds(verifyRes.data.invalidStudentIds || []);
      setEvaluated(true);
    } catch (err) {
      console.error("Failed to evaluate student IDs", err);
      alert("Failed to check student IDs.");
    }
  };

  // Add this function to handle generating OMR sheets directly
  const handleGenerateOMRSheets = async () => {
    try {
      // First generate QR codes if not already generated
      // if (qrImages.length === 0) {
      //   await handleGenerateQR();
      // }

      // Then print the OMR sheets
      handlePrintOMR();
    } catch (error) {
      console.error("Error generating OMR sheets:", error);
      alert("Failed to generate OMR sheets");
    }
  };

  /* ------------------------------------------------------------------
     4. GENERATE QR CODES (student-mode)
  ------------------------------------------------------------------ */
  const handleGenerateQR = async () => {
    const admin_id = getAdminIdFromToken();
    if (!admin_id) {
      alert("Admin not authenticated");
      return;
    }

    if (!evaluated || validStudents.length === 0) {
      alert("Please evaluate and check student IDs first.");
      return;
    }

    try {
      const validIds = validStudents.map((s) => s.id);

      const res = await axios.post(
        "http://127.0.0.1:5000/api/student",
        {
          test_id: testId,
          student_ids: validIds,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const qrImagesWithName = res.data.qr_images.map((img) => ({
        ...img,
        fullName: validStudents.find((s) => s.id === img.label)?.fullName || "",
      }));

      setQrImages(qrImagesWithName);
    } catch (err) {
      console.error("Error generating QR codes:", err);
      alert("Something went wrong while generating QR codes.");
    }
  };

  /* ------------------------------------------------------------------
     5. PRINT OMR (added black alignment square)
  ------------------------------------------------------------------ */
  const handlePrintOMR = () => {
    if (!questionCount || questionCount < 1) {
      alert("Invalid or missing question count.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print OMR sheets.");
      return;
    }

    // Get test details from localStorage or state
    const paperTitle = localStorage.getItem("testName") || "Test";
    const batchName = localStorage.getItem("batchName") || "Batch";

    // Build question list
    const allQuestions = Array.from({ length: questionCount }, (_, i) => ({
      number: i + 1,
    }));

    // Calculate columns (4 columns with equal distribution)
    const questionsPerPage = 180; // Adjust based on your layout needs
    const questionsPerColumn = Math.ceil(questionCount / 4);
    const columns = [
      allQuestions.slice(0, questionsPerColumn),
      allQuestions.slice(questionsPerColumn, questionsPerColumn * 2),
      allQuestions.slice(questionsPerColumn * 2, questionsPerColumn * 3),
      allQuestions.slice(questionsPerColumn * 3),
    ];

    // Column renderer
    const renderColumn = (columnQuestions) =>
      columnQuestions
        .map(
          (q) => `
      <div class="question-row">
        <div class="question-number">${q.number}.</div>
        <div class="options-bubbles">
          ${["A", "B", "C", "D"]
            .map((opt) => `<div class="bubble-option">${opt}</div>`)
            .join("")}
        </div>
      </div>`
        )
        .join("");

    // Generate HTML for all students
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>OMR Answer Sheet - ${paperTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      background: white;
      color: #000;
    }
    .omr-page {
      page-break-after: always;
      padding: 0;
    }
    .qr-code-box {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 92px;
      height: 92px;
      border: 2px solid #000;
      box-sizing: border-box;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .alignment-marker {
      width: 14px;
      height: 14px;
      background: #000;
      border: 1px solid #000;
      margin: 6px 0 10px 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .alignment-marker-1 {
      margin-left: 42px;
    }
    .omr-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .omr-box {
      border: 2px solid #000;
      padding: 12px;
      display: inline-block;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
    }
    .omr-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin: 4px 0;
    }
    .omr-subtitle {
      font-size: 11pt;
      color: #444;
      text-align: center;
      margin-bottom: 10px;
    }
    .omr-info {
      display: flex;
      justify-content: space-between;
      padding: 0 30px;
      font-size: 10pt;
    }
    .omr-info div {
      flex: 1;
    }
    .info-line {
      display: inline-block;
      border-bottom: 1px solid #000;
      width: 120px;
      margin-left: 5px;
    }
    .omr-table {
      display: flex;
      justify-content: space-between;
      gap: 12px;
    }
    .column {
      flex: 1;
      border: 1px solid black;
      padding: 10px;
    }
    .question-row {
      display: flex;
      align-items: center;
      margin-bottom: 3px;
      font-size: 6pt;
    }
    .question-number {
      min-width: 20px;
      font-weight: bold;
      font-size: 7pt;
    }
    .options-bubbles {
      display: flex;
      gap: 10px;
      margin-left: 10px;
    }
    .bubble-option {
      width: 14px;
      height: 14px;
      border: 1px solid #000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6pt;
      font-weight: bold;
      line-height: 1;
      text-align: center;
      padding: 0;
    }
    .instructions {
      font-size: 9pt;
      text-align: center;
      margin: 10px 0;
      color: #555;
    }
  </style>
</head>
<body>
  ${
    validStudents.length > 0
      ? validStudents
          .map((student) => {
            const studentName = student.fullName || "Student";
            const studentId = student.id || "";
            const qrCode = qrImages.find((qr) => qr.label === studentId);

            return `
      <div class="omr-page">
        ${
          qrCode
            ? `
        <div class="qr-code-box">
          <img src="${qrCode.img}" 
               style="width:100%;height:100%;object-fit:contain;" 
               alt="QR code for ${studentId}">
        </div>`
            : ""
        }
        
        <div class="omr-header">
          <div class="omr-box">
            <h1 class="omr-title">OMR ANSWER SHEET</h1>
            <p class="omr-subtitle">${paperTitle} - ${batchName}</p>
            <div class="omr-info">
              <div>Name: <span class="info-line">${studentName}</span></div>
              <div>Roll No: <span class="info-line">${studentId}</span></div>
              <div>Date: <span class="info-line"></span></div>
            </div>
          </div>
        </div>
        
        <div class="instructions">
          ** Fill the bubbles completely using black/blue ballpoint pen only **
        </div>
        
        <div style="display: flex;">
          <div class="alignment-marker alignment-marker-1"></div>
          <div class="alignment-marker"></div>
          <div class="alignment-marker"></div>
          <div class="alignment-marker"></div>
        </div>
        
        <div class="omr-table">
          ${columns
            .map(
              (columnQuestions) => `
            <div class="column">
              ${renderColumn(columnQuestions)}
            </div>`
            )
            .join("")}
        </div>
      </div>`;
          })
          .join("")
      : // Fallback if no valid students (use QR images if available)
      qrImages.length > 0
      ? qrImages
          .map(
            (qr) => `
      <div class="omr-page">
        <div class="qr-code-box">
          <img src="${qr.img}" 
               style="width:100%;height:100%;object-fit:contain;" 
               alt="QR code for ${qr.label}">
        </div>
        
        <div class="omr-header">
          <div class="omr-box">
            <h1 class="omr-title">OMR ANSWER SHEET</h1>
            <p class="omr-subtitle">${paperTitle} - ${batchName}</p>
            <div class="omr-info">
              <div>Name: <span class="info-line">${
                qr.fullName || ""
              }</span></div>
              <div>Roll No: <span class="info-line">${qr.label}</span></div>
              <div>Date: <span class="info-line"></span></div>
            </div>
          </div>
        </div>
        
        <div class="instructions">
          ** Fill the bubbles completely using black/blue ballpoint pen only **
        </div>
        
        <div style="display: flex;">
          <div class="alignment-marker alignment-marker-1"></div>
          <div class="alignment-marker"></div>
          <div class="alignment-marker"></div>
          <div class="alignment-marker"></div>
        </div>
        
        <div class="omr-table">
          ${columns
            .map(
              (columnQuestions) => `
            <div class="column">
              ${renderColumn(columnQuestions)}
            </div>`
            )
            .join("")}
        </div>
      </div>
    `
          )
          .join("")
      : // Default OMR sheet if no students or QR codes
        `
    <div class="omr-page">
      <div class="qr-code-box">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAAEiAQAAAAB1xeIbAAABfUlEQVR4nO2aS26EMBBEXwekLBkpB5ijwA1ypCg3MzeC5UhGlQV2Qsgi2fCLuxfItp7kkl00psHE79E//QECp5xyyimnzk5ZihrrRjMY80h3qK4iqFaSNIAClayjkiTpO7W/riKoMXnc7B5RAMysPl5XSZTCWGPdjjM6tYjJ9p6xUCqnlUbACNZqmseWL11nVX9tKq19P3u9AsYX2dr8Z1V/bWrtcUEk3QZH6iqHsm6sgfloX6PANLesO1TX/6aS7/sbBk2s6V8flkzfxON0lUChFDF3B6AdKqWLJIWzqr82NfveaAYZzQB9B+rvEfX3R37gnlX9tSkWpYN2qJR9D3POcd9vR33mnBRpA/J+zE1f+02ope+hElBJoYl4vt+aSmuf6pjZ8q0iCk103+9B5Tom/Q30bs+yt+EEusqiRvssJ1Rev9+Sqld9a4cb6bRpQBuO0VUC9SPfB9LHK4UmH348329CreuY1mqqv2qY5r7fjjL/N8opp5xyqgjqA5wV4JYDCuBjAAAAAElFTkSuQmCC"
             style="width:100%;height:100%;object-fit:contain;"
             alt="Default QR code">
      </div>
      
      <div class="omr-header">
        <div class="omr-box">
          <h1 class="omr-title">OMR ANSWER SHEET</h1>
          <p class="omr-subtitle">${paperTitle} - ${batchName}</p>
          <div class="omr-info">
            <div>Name: <span class="info-line"></span></div>
            <div>Roll No: <span class="info-line"></span></div>
            <div>Date: <span class="info-line"></span></div>
          </div>
        </div>
      </div>
      
      <div class="instructions">
        ** Fill the bubbles completely using black/blue ballpoint pen only **
      </div>
      
      <div style="display: flex;">
        <div class="alignment-marker alignment-marker-1"></div>
        <div class="alignment-marker"></div>
        <div class="alignment-marker"></div>
        <div class="alignment-marker"></div>
      </div>
      
      <div class="omr-table">
        ${columns
          .map(
            (columnQuestions) => `
          <div class="column">
            ${renderColumn(columnQuestions)}
          </div>`
          )
          .join("")}
      </div>
    </div>
    `
  }
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 1000);
  };

  /* ------------------------------------------------------------------
     6. JSX UI (STUDENT MODE ONLY)
  ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Generate QR & Print OMR
              </h1>
              {questionCount !== null && (
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Total Questions in Test:{" "}
                  <span className="font-semibold text-gray-800">
                    {questionCount}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student data...</p>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Students in Batch
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {students.length > 0 ? (
                      <ul className="space-y-2">
                        {students.map((student) => (
                          <li
                            key={student.id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                          >
                            <span className="font-medium">
                              {student.fullName ||
                                `${student.firstName} ${
                                  student.lastName || ""
                                }`}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {student.id}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No students found in this batch
                      </p>
                    )}
                  </div>
                </div>

                {evaluated && validStudents.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-green-800 text-lg">
                        Valid Students ({validStudents.length})
                      </h3>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerateQR}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  validStudents.length > 0
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={validStudents.length === 0}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01"
                    />
                  </svg>
                  Generate QR Codes
                </div>
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleGenerateOMRSheets}
            className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl ${
              students.length > 0
                ? "hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105"
                : "opacity-50 cursor-not-allowed"
            } transition-all duration-200 shadow-lg font-semibold text-lg`}
            disabled={students.length === 0}
          >
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Generate {students.length} OMR Sheets
            </div>
          </button>
        </div>

        {/* QR Results Section */}
        {qrImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generated QR Codes
              </h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {qrImages.length} codes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrImages.map((qr) => (
                <div
                  key={qr.label}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300 text-center group"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {qr.fullName ? qr.fullName : qr.label}
                    </h3>
                    {qr.fullName && (
                      <p className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full inline-block">
                        {qr.label}
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={qr.img}
                      alt={qr.label}
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handlePrintOMR}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-lg"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print OMR Sheets
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
