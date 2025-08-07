"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function OMRSheetGenerator() {
  const { testId } = useParams();
  const [testData, setTestData] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/test-series/test-series-question/${testId}`
        );
        if (res.data.success) {
          const questions = res.data.data;
          setQuestionCount(questions.length);
          setTestData({
            testName: res.data.testDetails?.testName || "Test",
            batchName: res.data.testDetails?.batchName || "Batch",
            questions: questions
          });
        }
      } catch (err) {
        console.error("Failed to fetch test data", err);
        setError("Failed to fetch test data");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, API_BASE]);

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

    // Get test details
    const paperTitle = testData?.testName || "Test";
    const batchName = testData?.batchName || "Batch";

    // Build question list
    const allQuestions = Array.from({ length: questionCount }, (_, i) => ({
      number: i + 1,
    }));

    // Calculate columns (4 columns with equal distribution)
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

    // Generate HTML for OMR sheet
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
  <div class="omr-page">
    <div class="qr-code-box">
      <!-- QR code placeholder -->
      <div style="width:100%;height:100%;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;font-size:8pt;color:#888;">QR CODE</div>
    </div>
    
    <div class="omr-header">
      <div class="omr-box">
        <h1 class="omr-title">OMR ANSWER SHEET</h1>
        <p class="omr-subtitle">${paperTitle} - ${batchName}</p>
        <div class="omr-info">
          <div>Name: <span class="info-line">${studentName}</span></div>
          <div>Roll No: <span class="info-line">${rollNumber}</span></div>
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

  const handleGenerateBlankOMR = () => {
    if (!questionCount || questionCount < 1) {
      alert("Please enter a valid question count.");
      return;
    }
    handlePrintOMR();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OMR Sheet Generator
          </h1>
          <p className="text-gray-600">
            Generate OMR answer sheets for your test
          </p>
        </div>

        {/* Test Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name
              </label>
              <p className="text-lg font-medium text-blue-600">
                {testData?.testName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name
              </label>
              <p className="text-lg font-medium text-green-600">
                {testData?.batchName || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Questions
              </label>
              <p className="text-lg font-medium text-purple-600">
                {questionCount}
              </p>
            </div>
          </div>
        </div>

        {/* Student Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Student Information (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter student name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter roll number (optional)"
              />
            </div>
          </div>
        </div>

        {/* Manual Question Count Override */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Question Count Override</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Question Count
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                min="1"
                max="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter number of questions"
              />
            </div>
            <button
              onClick={handleGenerateBlankOMR}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Generate Custom OMR
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Override the question count if needed. Current test has {testData?.questions?.length || 0} questions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePrintOMR}
            disabled={!questionCount}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Generate OMR Sheet
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Instructions:</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• The OMR sheet will be automatically formatted for {questionCount} questions</li>
            <li>• Questions are distributed across 4 columns for optimal layout</li>
            <li>• Each question has options A, B, C, D with circular bubbles</li>
            <li>• Student information fields are included at the top</li>
            <li>• Alignment markers are included for scanning purposes</li>
            <li>• The sheet is formatted for A4 paper size</li>
          </ul>
        </div>
      </div>
    </div>
  );
}