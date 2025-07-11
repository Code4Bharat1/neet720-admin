"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export default function QrGenerator() {
  const [mode, setMode] = useState("batch");
  const [testId, setTestId] = useState("");
  const [batchData, setBatchData] = useState([
    { batch_name: "", batch_id: "", student_ids: "", students: [] },
  ]);
  const [studentIds, setStudentIds] = useState("");
  const [qrImages, setQrImages] = useState([]);
  const [questionCount, setQuestionCount] = useState(null);

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
  }, []);

  /* ------------------------------------------------------------------
     2. HELPER FUNCTIONS
  ------------------------------------------------------------------ */
  const handleBatchChange = (index, field, value) => {
    const newData = [...batchData];
    newData[index][field] = value;
    setBatchData(newData);
  };

  const addBatchEntry = () => {
    setBatchData([
      ...batchData,
      { batch_name: "", batch_id: "", student_ids: "", students: [] },
    ]);
  };

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

  /* ------------------------------------------------------------------
     3. STUDENT‑MODE : VERIFY IDS
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

      // API returns validStudentIds: [{id, fullName}], invalidStudentIds: [id,...]
      setValidStudents(verifyRes.data.validStudentIds || []);
      setInvalidStudentIds(verifyRes.data.invalidStudentIds || []);
      setEvaluated(true);
    } catch (err) {
      console.error("Failed to evaluate student IDs", err);
      alert("Failed to check student IDs.");
    }
  };

  /* ------------------------------------------------------------------
     4. GENERATE QR CODES (batch‑mode & student‑mode)
  ------------------------------------------------------------------ */
  const handleSubmit = async () => {
    const admin_id = getAdminIdFromToken();
    if (!admin_id) return alert("Admin not authenticated");

    try {
      if (mode === "batch") {
        /* PAYLOAD → /api/batch */
        const payload = {
          test_id: testId,
          batch_data: batchData.map((b) => ({
            batch_id: b.batch_id,
            student_ids: b.students.map((s) => s.id),
          })),
        };

        const res = await axios.post(
          "http://127.0.0.1:5000/api/batch",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );

        // enrich with names
        const allStudents = batchData.flatMap((b) => b.students);
        const qrImagesWithName = res.data.qr_images.map((img) => ({
          ...img,
          fullName:
            allStudents.find((s) => String(s.id) === String(img.label))?.fullName || "",
        }));
        setQrImages(qrImagesWithName);
        return qrImagesWithName;
      } else {
        /* STUDENT MODE → /api/student */
        if (!evaluated || validStudents.length === 0) {
          alert("Please evaluate and check student IDs first.");
          return [];
        }
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
        return qrImagesWithName;
      }
    } catch (err) {
      console.error("Error generating QR codes:", err);
      alert("Something went wrong while generating QR codes.");
      return [];
    }
  };

  const handleGenerateQR = async () => {
    const qrList = await handleSubmit();
    if (!qrList || qrList.length === 0) {
      alert("QR code generation failed.");
    }
  };

  /* ------------------------------------------------------------------
     5. PRINT OMR (added black alignment square)
  ------------------------------------------------------------------ */
  const handlePrintOMR = () => {
    if (!qrImages || qrImages.length === 0) {
      alert("Please generate QR codes first.");
      return;
    }
    if (!questionCount || questionCount < 1) {
      alert("Invalid or missing question count.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print OMR sheets.");
      return;
    }

    // Build question list
    const allQuestions = Array.from({ length: questionCount }, (_, i) => ({
      number: i + 1,
    }));

    // Column renderer
    const renderOMRColumn = (columnQuestions) =>
      columnQuestions
        .map((q) => `
          <div class="question-row">
            <div class="question-number">${q.number}.</div>
            <div class="options-bubbles">
              ${["A", "B", "C", "D"]
            .map((opt) => `<div class="bubble-option">${opt}</div>`)
            .join("")}
            </div>
          </div>`)
        .join("");

    /* -------------------------------
       HTML TEMPLATE (with marker)
    --------------------------------*/
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>OMR Sheets</title>
  <style>
    @page { size: A4; margin: 1.5cm; }
    body { font-family: Arial, sans-serif; font-size: 10pt; margin: 0; padding: 0; background: #fff; color: #000; }

    .omr-page       { page-break-after: always; }
    .omr-flex-header{ display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;padding:2px 10px;border:1px solid #000; }
    .omr-left-info  { display:flex;flex-direction:column;min-width:180px;font-size:10pt;gap:6px }
    .omr-center-title{ text-align:center;flex:1 }
    .omr-title      { font-size:16pt;font-weight:bold;margin-bottom:4px }
    .omr-subtitle   { font-size:11pt;color:#444 }
    .omr-right-qr   { display:flex;justify-content:flex-end;min-width:100px }
    .qr-img         { width:80px;height:80px;object-fit:contain;margin-left:10px }

    .alignment-marker{ width:10px;height:10px;background:#000;margin:6px 0 10px 32px; }

    .omr-table      { display:flex;justify-content:space-between;gap:12px }
    .column         { flex:1 }
    .question-row   { display:flex;align-items:center;margin-bottom:3px;font-size:7pt;gap:2px }
    .question-number{ min-width:20px;font-weight:bold }
    .options-bubbles{ display:flex;gap:10px;margin-left:10px }
    .bubble-option  { width:14px;height:14px;border:1px solid #000;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:6pt;font-weight:bold }
    .info-line      { display:inline-block;width:100px;margin-left:5px }
  </style>
</head>
<body>
${qrImages
        .map((qr) => {
          const fullName = qr.fullName || "";
          const col1 = allQuestions.slice(0, 45);
          const col2 = allQuestions.slice(45, 90);
          const col3 = allQuestions.slice(90, 135);
          const col4 = allQuestions.slice(135, 180);

          return `
  <div class="omr-page">
    <div class="omr-flex-header">
      <div class="omr-left-info">
        <div>Name: <span class="info-line">${fullName}</span></div>
        <div>Roll No: <span class="info-line">${qr.label}</span></div>
        <div>Date: <span class="info-line"></span></div>
      </div>
      <div class="omr-center-title">
        <div class="omr-title">OMR Question SHEET</div>
        <div class="omr-subtitle">**Do not write anything on the QR**</div>
      </div>
      <div class="omr-right-qr"><img src="${qr.img}" class="qr-img" /></div>
    </div>

    <!-- alignment square -->
    <div class="alignment-marker"></div>

    <div class="omr-table">
      <div class="column">${renderOMRColumn(col1)}</div>
      <div class="column">${renderOMRColumn(col2)}</div>
      <div class="column">${renderOMRColumn(col3)}</div>
      <div class="column">${renderOMRColumn(col4)}</div>
    </div>
  </div>`;
        })
        .join("")}
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  /* ------------------------------------------------------------------
     6. JSX UI (UNCHANGED)
  ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Generate QR & Print OMR
              </h1>
              {questionCount !== null && (
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Total Questions in Test: <span className="font-semibold text-gray-800">{questionCount}</span>
                </p>
              )}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${mode === "batch"
                  ? "bg-white text-blue-600 shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-800"
                }`}
              onClick={() => {
                setMode("batch");
                setValidStudents([]);
                setInvalidStudentIds([]);
                setEvaluated(false);
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Batch QR
              </div>
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${mode === "student"
                  ? "bg-white text-blue-600 shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-800"
                }`}
              onClick={() => {
                setMode("student");
                setValidStudents([]);
                setInvalidStudentIds([]);
                setEvaluated(false);
              }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student QR
              </div>
            </button>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {mode === "batch" ? (
              <>
                <div className="space-y-6">
                  {batchData.map((entry, index) => (
                    <div key={index} className="relative bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="space-y-4">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Name</label>
                          <input
                            type="text"
                            placeholder="Enter batch name..."
                            value={entry.batch_name}
                            onChange={(e) =>
                              handleBatchChange(index, "batch_name", e.target.value)
                            }
                            required
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const admin_id = getAdminIdFromToken();
                              if (!admin_id) return alert("Admin not authenticated");
                              console.log("Fetching student IDs for batch:", entry.batch_name);
                              console.log("Admin ID:", admin_id);
                              const res = await axios.post(
                                "http://localhost:3085/api/qr/students",
                                {
                                  batchName: entry.batch_name,
                                  admin_id : admin_id,
                                },
                                {
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                }
                              );

                              const updated = [...batchData];
                              updated[index].batch_id = res.data.batchId;
                              updated[index].student_ids = res.data.studentIds.join(", ");
                              updated[index].students = res.data.students || [];
                              setBatchData(updated);
                            } catch (err) {
                              console.error("Failed to fetch student IDs", err);
                            }
                          }}
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          Get Student IDs
                        </button>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch ID</label>
                            <input
                              type="text"
                              placeholder="Auto-filled batch ID"
                              value={entry.batch_id}
                              readOnly
                              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Student IDs</label>
                            <input
                              type="text"
                              placeholder="Comma separated student IDs"
                              value={entry.student_ids}
                              onChange={(e) =>
                                handleBatchChange(index, "student_ids", e.target.value)
                              }
                              required
                              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                            />
                          </div>
                        </div>

                        {/* Show students after fetch */}
                        {entry.students && entry.students.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mt-2">
                            <div className="font-bold text-green-700 mb-1">Students:</div>
                            <ul className="ml-2">
                              {entry.students.map((student) => (
                                <li key={student.id}>
                                  {student.fullName} <span className="text-xs text-gray-500">({student.id})</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addBatchEntry}
                  className="w-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-dashed border-gray-400 py-4 px-6 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-gray-700 font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Another Batch
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Student IDs</label>
                    <textarea
                      placeholder="Enter student IDs separated by commas (e.g., STU001, STU002, STU003)"
                      value={studentIds}
                      onChange={(e) => {
                        setStudentIds(e.target.value);
                        setValidStudents([]);
                        setInvalidStudentIds([]);
                        setEvaluated(false);
                      }}
                      required
                      rows={4}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Evaluate Students
                    </div>
                  </button>

                  {evaluated && (
                    <div className="space-y-4 mt-6">
                      {validStudents.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <h3 className="font-bold text-green-800 text-lg">Valid Students ({validStudents.length})</h3>
                          </div>
                          <div className="grid gap-2">
                            {validStudents.map((s) => (
                              <div key={s.id} className="bg-white p-3 rounded-lg border border-green-200 flex items-center justify-between">
                                <span className="font-medium text-gray-800">{s.fullName}</span>
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{s.id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {invalidStudentIds.length > 0 && (
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <h3 className="font-bold text-red-800 text-lg">Invalid Student IDs ({invalidStudentIds.length})</h3>
                          </div>
                          <div className="grid gap-2">
                            {invalidStudentIds.map((id) => (
                              <div key={id} className="bg-white p-3 rounded-lg border border-red-200">
                                <span className="text-gray-800">{id}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {validStudents.length === 0 && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <p className="text-red-700 font-medium text-lg">No valid students found</p>
                          <p className="text-gray-600 mt-1">Please check the student IDs and try again</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={handleGenerateQR}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${mode === "student"
                  ? evaluated && validStudents.length > 0
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 shadow-lg"
                }`}
              disabled={mode === "student" && (!evaluated || validStudents.length === 0)}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01" />
                </svg>
                Generate QR Codes
              </div>
            </button>
          </form>
        </div>

        {/* QR Results Section */}
        {qrImages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M20 12h.01m-.01 4h.01m-2.01.01h.01M8 16h.01M4 12h.01M4 16h.01M12 8h.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Generated QR Codes</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {qrImages.length} codes
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrImages.map((qr) => (
                <div key={qr.label} className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all duration-300 text-center group">
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
                    <img src={qr.img} alt={qr.label} className="w-32 h-32 mx-auto" />
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
