"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, Settings, FileText, Eye, Printer, RotateCcw, Download } from "lucide-react";
import axios from "axios";

export default function AnswerPaper() {
  const [showWatermark, setShowWatermark] = useState(false);
  const [showSolutions, setShowSolutions] = useState(true);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [paperTitle, setPaperTitle] = useState("Physics Answer Key");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Transform backend data to match expected format
  const transformQuestionData = (backendData) => {
    return backendData.map((item, index) => {
      // Convert options array to object format
      const optionsObj = {};
      if (item.options && Array.isArray(item.options)) {
        item.options.forEach((option, idx) => {
          const letters = ['a', 'b', 'c', 'd'];
          optionsObj[letters[idx]] = option;
        });
      }

      // Find correct answer key
      let correctAnswerKey = '';
      if (item.correctanswer && item.options) {
        const correctIndex = item.options.findIndex(option => option === item.correctanswer);
        if (correctIndex !== -1) {
          const letters = ['a', 'b', 'c', 'd'];
          correctAnswerKey = letters[correctIndex];
        }
      }

      return {
        id: index + 1,
        question_text: item.question_text || "",
        options: Object.keys(optionsObj).length > 0 ? optionsObj : null,
        correctanswer: correctAnswerKey,
        solution: item.solution || `The correct answer is: ${item.correctanswer}`,
        marks: item.marks || 4,
        subject: item.subject || "General"
      };
    });
  };

  useEffect(() => {
    // Load the backend data
    const loadQuestions = async() => {
      setLoading(true);
      try {
        const testid = localStorage.getItem("testid");
        if (!testid) {
          setError("No test ID found. Please select a test first.");
          return;
        }

        // Sample backend data - replace this with your actual API call
        const data = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/get-questions`, {testid})
        console.log(data.data)
        const transformedData = transformQuestionData(data.data.data);
        setQuestions(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to load questions');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handlePreview = () => {
    setShowPreview(true);
    setTimeout(() => {
      document.getElementById("previewSection")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    const renderQuestions = (questions, showSubjects) => {
      let output = "";
      let lastSubject = null;

      questions.forEach((q, idx) => {
        if (showSubjects && q.subject !== lastSubject) {
          output += `
            <div class="subject-header">
              ${q.subject}
            </div>
          `;
          lastSubject = q.subject;
        }

        output += `
          <div class="question-block">
            <div class="question-number">${idx + 1}.</div>
            <div class="question-main">
              <div class="question-text">${q.question_text.replace(/\n/g, '<br>')}</div>
              ${q.options ? `
                <div class="options-block">
                  ${Object.entries(q.options)
              .map(([key, value]) => `
                      <div class="option-row${q.correctanswer && q.correctanswer.toLowerCase() === key.toLowerCase()
                  ? " correct"
                  : ""
                }">
                        <span class="option-letter">${key.toUpperCase()})</span>
                        <span>${value}</span>
                      </div>
                    `).join("")}
                </div>
              ` : ""}
              ${showMarks ? `
                <div class="marks-label">[${q.marks || 4} Mark${(q.marks || 4) > 1 ? "s" : ""}]</div>
              ` : ""}
              ${showSolutions ? `
                <div class="solution-block">
                  <div class="solution-title">Solution & Answer</div>
                  ${q.correctanswer ? `
                    <div class="correct-answer">
                      <strong>Correct Answer:</strong> ${q.correctanswer.toUpperCase()}) ${q.options ? q.options[q.correctanswer.toLowerCase()] : ''}
                    </div>
                  ` : ""}
                </div>
              ` : ""}
            </div>
          </div>
        `;
      });
      return output;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${paperTitle || "Answer Key"}</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          body {
            font-family: 'Times New Roman', serif;
            font-size: 10pt;
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
            position: relative;
          }
          .header {
            display: flex;
            justify-content: center;
            align-items: center;
            border-bottom: 2px solid #222;
            padding-bottom: 10px;
            margin-bottom: 20px;
            position: relative;
          }
          .title {
            font-size: 20pt;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
          }
          .question-columns {
            column-count: 1;
            column-gap: 30px;
          }
          .subject-header {
            background: #ede9fe;
            color: #5b21b6;
            font-weight: bold;
            font-size: 12pt;
            text-transform: uppercase;
            border-bottom: 2px solid #a78bfa;
            margin: 20px 0 15px 0;
            padding: 10px;
            break-inside: avoid;
          }
          .question-block {
            margin-bottom: 25px;
            break-inside: avoid;
            display: flex;
            gap: 15px;
            border-left: 3px solid #ede9fe;
            padding-left: 15px;
            min-height: 40px;
          }
          .question-number {
            font-weight: bold;
            min-width: 35px;
            color: #222;
            font-size: 11pt;
          }
          .question-main {
            flex: 1;
          }
          .question-text {
            font-weight: 600;
            margin-bottom: 8px;
            line-height: 1.5;
            font-size: 11pt;
          }
          .options-block {
            margin: 8px 0 10px 20px;
          }
          .option-row {
            display: flex;
            align-items: start;
            margin-bottom: 4px;
            padding: 3px 0;
            font-size: 10pt;
          }
          .option-row.correct {
            background: #dcfce7;
            border-left: 3px solid #16a34a;
            border-radius: 4px;
            padding-left: 8px;
            font-weight: 500;
          }
          .option-letter {
            font-weight: bold;
            margin-right: 10px;
            min-width: 25px;
            color: #2563eb;
          }
          .marks-label {
            text-align: right;
            color: #dc2626;
            font-style: italic;
            font-size: 9pt;
            margin: 5px 0;
            font-weight: 500;
          }
          .solution-block {
            background: #f0f9ff;
            border: 1px solid #38bdf8;
            border-radius: 6px;
            padding: 12px;
            margin-top: 10px;
            font-size: 10pt;
          }
          .solution-title {
            font-weight: bold;
            color: #0369a1;
            margin-bottom: 8px;
            border-bottom: 1px solid #bae6fd;
            padding-bottom: 4px;
            font-size: 11pt;
          }
          .correct-answer {
            background: #dcfce7;
            padding: 6px 8px;
            border-radius: 4px;
            margin-bottom: 6px;
            border-left: 3px solid #22c55e;
            font-weight: 500;
          }
          .solution-text {
            color: #374151;
            line-height: 1.4;
            margin-bottom: 4px;
          }
          .footer {
            text-align: center;
            font-size: 10pt;
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
            color: #6b7280;
          }
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 80px;
            color: rgba(91, 33, 182, 0.08);
            font-weight: bold;
            z-index: 0;
            pointer-events: none;
            font-family: Arial, sans-serif;
            user-select: none;
            text-align: center;
            width: 100vw;
          }
        </style>
      </head>
      <body>
        ${showWatermark ? `<div class="watermark">ANSWER KEY</div>` : ""}
        <div class="header">
          <div class="title">${paperTitle}</div>
        </div>
        <div class="question-columns">
          ${renderQuestions(questions, showSubjects)}
        </div>
        <div class="footer">--- End of Answer Key ---</div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  const resetOptions = () => {
    setShowWatermark(false);
    setShowSolutions(true);
    setShowSubjects(false);
    setShowMarks(false);
    setPaperTitle("Physics Answer Key");
    setShowPreview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Questions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-lg">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:shadow-xl transform hover:scale-105">
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <FileText className="text-blue-600" />
              Answer Paper Generator
            </h1>
            <p className="text-gray-600">
              Generate printable answer keys with solutions and explanations
            </p>
            <div className="text-sm text-blue-600 mt-2">
              {questions.length} questions loaded
            </div>
          </div>

          <div className="w-12"></div>
        </div>

        {/* Configuration Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="text-blue-600 mr-3" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              Configuration Options
            </h2>
          </div>

          {/* Paper Title Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Answer Paper Title
            </label>
            <input
              type="text"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="E.g., Physics Answer Key - Final Exam"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-lg"
            />
          </div>

          {/* Display Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 border-b-2 border-blue-200 pb-3">
                Display Options
              </h3>

              <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-gray-800">Show Watermark</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Adds "ANSWER KEY" watermark to prevent copying
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  checked={showSubjects}
                  onChange={(e) => setShowSubjects(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-gray-800">Show Subject Headers</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Groups questions by subject with clear headers
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-700 border-b-2 border-blue-200 pb-3">
                Content Options
              </h3>

              <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  checked={showSolutions}
                  onChange={(e) => setShowSolutions(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-gray-800">Show Solutions</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Includes detailed explanations and solutions
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                  checked={showMarks}
                  onChange={(e) => setShowMarks(e.target.checked)}
                />
                <div>
                  <span className="font-medium text-gray-800">Show Marks</span>
                  <p className="text-sm text-gray-500 mt-1">
                    Displays mark allocation for each question
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-6 border-t-2 border-gray-200">
            <button
              onClick={handlePreview}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Eye size={20} /> Generate Preview
            </button>

            <button
              onClick={resetOptions}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RotateCcw size={20} /> Reset Options
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div id="previewSection" className="mb-10">
            <div className="flex justify-between items-center mb-6 bg-white p-6 rounded-2xl shadow-lg">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Answer Paper Preview
                </h2>
                <p className="text-gray-600 mt-1">
                  Review your answer key before printing • {questions.length} questions
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Printer size={18} /> Print Answer Key
              </button>
            </div>

            <div className="bg-white mx-auto p-10 shadow-xl rounded-2xl max-w-4xl border border-gray-200 relative">
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                  <div className="text-gray-200 text-8xl font-bold transform rotate-[-30deg] select-none opacity-30">
                    ANSWER KEY
                  </div>
                </div>
              )}

              <div className="text-center border-b-2 border-gray-800 pb-6 mb-8 relative z-10">
                <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">
                  {paperTitle}
                </h1>
              </div>

              <div className="questions-container relative z-10">
                {(() => {
                  let currentSubject = null;
                  return questions.map((q, index) => (
                    <div key={q.id || index} className="mb-8 border-l-4 border-blue-200 pl-6 ml-2">
                      {showSubjects && q.subject !== currentSubject && (() => {
                        currentSubject = q.subject;
                        return (
                          <h3 className="text-xl font-bold text-center uppercase border-b-2 border-blue-400 pb-3 mb-6 mt-6 text-blue-700 bg-blue-50 p-4 rounded-lg">
                            {q.subject}
                          </h3>
                        );
                      })()}

                      <div className="flex mb-4 items-start">
                        <span className="font-bold mr-4 mt-1 min-w-[40px] text-gray-800 text-lg">
                          {index + 1}.
                        </span>

                        <div className="flex-1">
                          <div className="font-medium mb-4 leading-relaxed text-lg whitespace-pre-line">
                            {q.question_text}
                          </div>

                          {q.options && (
                            <div className="ml-6 space-y-3 mb-4">
                              {Object.entries(q.options).map(([key, value]) => (
                                <div
                                  key={key}
                                  className={`flex items-start p-3 rounded-lg transition-all duration-200 ${q.correctanswer && q.correctanswer.toLowerCase() === key.toLowerCase()
                                      ? "bg-green-100 border-l-4 border-green-500 shadow-sm"
                                      : "hover:bg-gray-50 border border-gray-200"
                                    }`}
                                >
                                  <span className="font-semibold mr-4 min-w-[30px] text-blue-600">
                                    {key.toUpperCase()})
                                  </span>
                                  <span className="leading-relaxed flex-1">{value}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {showMarks && (
                            <div className="text-right text-sm text-red-600 mb-4 italic font-medium">
                              [{q.marks || 4} Mark{(q.marks || 4) > 1 ? "s" : ""}]
                            </div>
                          )}

                          {showSolutions && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-4">
                              <div className="font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2 text-lg">
                                Solution & Answer
                              </div>

                              {q.correctanswer && (
                                <div className="bg-green-100 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                                  <strong className="text-green-800 text-lg">Correct Answer: </strong>
                                  <span className="ml-2 font-semibold text-green-700 text-lg">
                                    {q.correctanswer.toUpperCase()}) {q.options ? q.options[q.correctanswer.toLowerCase()] : ''}
                                  </span>
                                </div>
                              )}

                              {/* {q.solution && (
                                <div className="text-gray-700 leading-relaxed">
                                  <strong className="text-blue-800">Explanation:</strong>
                                  <p className="mt-2 text-gray-600 leading-loose">
                                    {q.solution}
                                  </p>
                                </div>
                              )} */}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              <div className="text-center mt-8 pt-6 border-t-2 border-gray-300 text-sm text-gray-600 relative z-10 font-medium">
                --- End of Answer Key ---
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}