"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function QuestionPaperGenerator() {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Print options
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [paperTitle, setPaperTitle] = useState("");
  const [duration, setDuration] = useState("3 Hours");
  const [maxMarks, setMaxMarks] = useState("");
  const [examDate, setExamDate] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/test-series/test-series-question/${testId}`
        );
        if (res.data.success) {
          const formattedQuestions = res.data.data.map((q) => ({
            ...q,
            options: JSON.parse(q.options || "[]"),
          }));
          setQuestions(formattedQuestions);
          
          const testDetails = res.data.testDetails;
          setTestData(testDetails);
          setPaperTitle(testDetails?.testName || "Question Paper");
          setMaxMarks(formattedQuestions.length.toString());
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
        setError("Failed to fetch test data");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, API_BASE]);

  const handlePrintQuestionPaper = () => {
    if (!questions.length) {
      alert("No questions available to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print question papers.");
      return;
    }

    // Generate instructions
    const instructionsHTML = showInstructions ? `
      <div class="instructions-section">
        <h2 class="instructions-title">INSTRUCTIONS</h2>
        <ol class="instructions-list">
          <li>Read all questions carefully before attempting.</li>
          <li>All questions are compulsory.</li>
          <li>Each question carries equal marks.</li>
          <li>Use black or blue ballpoint pen only.</li>
          <li>Mobile phones and electronic devices are not allowed.</li>
          <li>Do not write anything on the question paper.</li>
        </ol>
      </div>
    ` : '';

    // Generate questions HTML
    const questionsHTML = questions.map((q, index) => {
      const questionHTML = `
        <div class="question-item">
          <div class="question-header">
            <span class="question-number">Q.${index + 1}</span>
            <span class="question-marks">[1 Mark]</span>
          </div>
          <div class="question-text">${q.questionText}</div>
          <div class="options-container">
            ${q.options.map((opt, i) => `
              <div class="option-item">
                <span class="option-label">(${String.fromCharCode(65 + i)})</span>
                <span class="option-text">${opt}</span>
                ${includeAnswers && q.correctAnswer === String.fromCharCode(65 + i) ? 
                  '<span class="correct-answer-marker">✓</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return questionHTML;
    }).join('');

    // Generate answer key if included
    const answerKeyHTML = includeAnswers ? `
      <div class="answer-key-section">
        <h2 class="answer-key-title">ANSWER KEY</h2>
        <div class="answer-key-grid">
          ${questions.map((q, index) => `
            <div class="answer-key-item">
              <span class="answer-question-number">${index + 1}.</span>
              <span class="answer-correct">${q.correctAnswer || 'N/A'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${paperTitle}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.4;
      margin: 0;
      padding: 0;
      color: #000;
      background: white;
    }
    
    .header-section {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    
    .paper-title {
      font-size: 18pt;
      font-weight: bold;
      margin: 10px 0;
      text-transform: uppercase;
    }
    
    .paper-subtitle {
      font-size: 14pt;
      margin: 5px 0;
      color: #333;
    }
    
    .exam-details {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      font-size: 11pt;
    }
    
    .exam-details div {
      flex: 1;
      text-align: center;
    }
    
    .student-details {
      margin: 20px 0;
      border: 1px solid #000;
      padding: 15px;
    }
    
    .student-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .student-field {
      display: flex;
      align-items: center;
      font-size: 11pt;
    }
    
    .student-field label {
      font-weight: bold;
      min-width: 100px;
    }
    
    .student-field .line {
      border-bottom: 1px solid #000;
      flex: 1;
      height: 20px;
      margin-left: 10px;
    }
    
    .instructions-section {
      margin: 25px 0;
      page-break-inside: avoid;
    }
    
    .instructions-title {
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-decoration: underline;
    }
    
    .instructions-list {
      margin-left: 20px;
      font-size: 11pt;
    }
    
    .instructions-list li {
      margin-bottom: 5px;
    }
    
    .questions-section {
      margin-top: 25px;
    }
    
    .question-item {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .question-number {
      font-weight: bold;
      font-size: 12pt;
    }
    
    .question-marks {
      font-size: 10pt;
      font-style: italic;
      color: #666;
    }
    
    .question-text {
      margin-bottom: 10px;
      font-size: 12pt;
      line-height: 1.5;
    }
    
    .options-container {
      margin-left: 20px;
    }
    
    .option-item {
      margin-bottom: 6px;
      display: flex;
      align-items: flex-start;
      position: relative;
    }
    
    .option-label {
      font-weight: bold;
      min-width: 25px;
      margin-right: 8px;
    }
    
    .option-text {
      flex: 1;
      line-height: 1.4;
    }
    
    .correct-answer-marker {
      color: #008000;
      font-weight: bold;
      font-size: 14pt;
      margin-left: 10px;
    }
    
    .answer-key-section {
      page-break-before: always;
      margin-top: 30px;
    }
    
    .answer-key-title {
      font-size: 16pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
      text-decoration: underline;
    }
    
    .answer-key-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 10px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .answer-key-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      border: 1px solid #ccc;
      background-color: #f9f9f9;
    }
    
    .answer-question-number {
      font-weight: bold;
    }
    
    .answer-correct {
      font-weight: bold;
      color: #008000;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-section">
    <h1 class="paper-title">${paperTitle}</h1>
    ${testData?.batchName ? `<p class="paper-subtitle">${testData.batchName}</p>` : ''}
    
    <div class="exam-details">
      <div><strong>Time:</strong> ${duration}</div>
      <div><strong>Maximum Marks:</strong> ${maxMarks}</div>
      ${examDate ? `<div><strong>Date:</strong> ${examDate}</div>` : '<div></div>'}
    </div>
  </div>
  
  <div class="student-details">
    <div class="student-details-grid">
      <div class="student-field">
        <label>Name:</label>
        <div class="line"></div>
      </div>
      <div class="student-field">
        <label>Roll No:</label>
        <div class="line"></div>
      </div>
      <div class="student-field">
        <label>Class:</label>
        <div class="line"></div>
      </div>
      <div class="student-field">
        <label>Signature:</label>
        <div class="line"></div>
      </div>
    </div>
  </div>
  
  ${instructionsHTML}
  
  <div class="questions-section">
    ${questionsHTML}
  </div>
  
  ${answerKeyHTML}
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1000);
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
            Question Paper Generator
          </h1>
          <p className="text-gray-600">
            Customize and print your question paper
          </p>
        </div>

        {/* Test Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {questions.length}
              </p>
            </div>
          </div>
        </div>

        {/* Paper Customization */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Paper Customization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paper Title
              </label>
              <input
                type="text"
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter paper title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3 Hours"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Marks
              </label>
              <input
                type="text"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total marks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date (Optional)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Print Options */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Print Options</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAnswers"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="includeAnswers" className="ml-2 text-sm font-medium text-gray-700">
                Include Answer Key
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInstructions"
                checked={showInstructions}
                onChange={(e) => setShowInstructions(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showInstructions" className="ml-2 text-sm font-medium text-gray-700">
                Include Instructions Section
              </label>
            </div>
          </div>
          
          {includeAnswers && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Answer key will be printed on a separate page with correct answers marked.
              </p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">{paperTitle}</h3>
              {testData?.batchName && (
                <p className="text-gray-600">{testData.batchName}</p>
              )}
              <div className="flex justify-center gap-8 text-sm text-gray-600 mt-2">
                <span>Time: {duration}</span>
                <span>Max Marks: {maxMarks}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {questions.slice(0, 3).map((q, index) => (
                <div key={q.id} className="border-b border-gray-200 pb-3">
                  <p className="font-medium mb-2">
                    <span className="font-bold">Q.{index + 1}</span> {q.questionText}
                  </p>
                  <div className="ml-4 space-y-1">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center">
                        <span className="font-medium mr-2">({String.fromCharCode(65 + i)})</span>
                        <span>{opt}</span>
                        {includeAnswers && q.correctAnswer === String.fromCharCode(65 + i) && (
                          <span className="ml-2 text-green-600 font-bold">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length > 3 && (
                <p className="text-gray-500 text-center">... and {questions.length - 3} more questions</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handlePrintQuestionPaper}
            disabled={!questions.length}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Question Paper
            {includeAnswers && " + Answer Key"}
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

        {/* Usage Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Features:</h3>
          <ul className="text-blue-700 space-y-2">
            <li>• <strong>Customizable Header:</strong> Edit paper title, duration, and marks</li>
            <li>• <strong>Student Information Fields:</strong> Name, Roll No, Class, and Signature sections</li>
            <li>• <strong>Optional Answer Key:</strong> Toggle to include/exclude answers</li>
            <li>• <strong>Professional Formatting:</strong> Optimized for A4 printing</li>
            <li>• <strong>Instructions Section:</strong> Standard exam instructions (optional)</li>
            <li>• <strong>Preview Mode:</strong> See how your paper will look before printing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}