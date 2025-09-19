"use client"
import { useState, useEffect } from "react";
import axios from "axios"
import { FaPrint, FaEye, FaDownload, FaClipboardList, FaFileAlt, FaCog } from "react-icons/fa";
import { MdPreview, MdDescription } from "react-icons/md";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
export default function SimplePaperPrinter() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    duration: "120",
    marks: "100",
    date: "2024-12-01",
    instruction: "Read all questions carefully. Mark your answers clearly on the OMR sheet. Use only blue or black pen.",
    title: "Sample Question Paper",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [footerText, setFooterText] = useState("All the best!");
  const [questionsBySubject, setQuestionsBySubject] = useState({});
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);
  const testid = typeof window !== "undefined" ? localStorage.getItem("testid") : null;
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const testid = localStorage.getItem("testid");
        if (!testid) return;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/get-questions`,
          { testid }
        );

        const data = response.data.data;
        const grouped = {};
        data.forEach((q) => {
          if (!grouped[q.subject]) grouped[q.subject] = [];
          grouped[q.subject].push({
            question: q.question_text,
            options: q.options || [],
            marks: q.marks || 4,
          });
        });

        setQuestionsBySubject(grouped);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Helper to aggregate all questions with numbering
  const getAllQuestions = () => {
    const allQuestions = [];
    let questionCounter = 1;
    Object.entries(questionsBySubject).forEach(([subject, questions]) => {
      questions.forEach((q) => {
        allQuestions.push({
          ...q,
          subject,
          number: questionCounter++,
        });
      });
    });
    return allQuestions;
  };

  const allQuestions = getAllQuestions();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
  };

  const handlePreview = () => {
    setIsPreviewReady(true);
    setTimeout(() => {
      document.getElementById("previewSection")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Question Paper Print Logic
  const handlePrintQuestionPaper = () => {
    const printWindow = window.open("", "_blank");

    const renderQuestions = (questionsBySubject) => {
      let output = "";
      let serial = 1;
      Object.entries(questionsBySubject).forEach(([subject, questions]) => {
        output += `<div class="subject-header">${subject}</div>`;
        questions.forEach((q) => {
          const optionLayout = q.options.some((opt) => opt.length > 50) ? "single" : "double";
          const optionsHTML = optionLayout === "double"
            ? `
            <div class="options-double">
              <div class="row">
                <div class="option"><strong>A)</strong> ${q.options[0] || ""}</div>
                <div class="option"><strong>B)</strong> ${q.options[1] || ""}</div>
              </div>
              <div class="row">
                <div class="option"><strong>C)</strong> ${q.options[2] || ""}</div>
                <div class="option"><strong>D)</strong> ${q.options[3] || ""}</div>
              </div>
            </div>
          `
            : `
            <div class="options-single">
              ${q.options.map((opt, i) =>
              `<div class="option"><strong>${String.fromCharCode(65 + i)})</strong> ${opt}</div>`
            ).join("")}
            </div>
          `;
          output += `
        <div class="question">
          <div class="question-number">${serial++}. ${q.question}</div>
          ${optionsHTML}
        </div>
      `;
        });
      });
      return output;
    };

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${formData.title || "Question Paper"}</title>
      <style>
        @page { size: A4; margin: 1.5cm; }
        body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 0; padding: 0; color: #000; }
        .page { padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 20pt; font-weight: bold; text-transform: uppercase; }
        .logo { max-width: 80px; max-height: 80px; }
        .info { display: flex; justify-content: space-between; margin: 15px 0; font-size: 12pt; }
        .instructions { border: 2px solid #000; padding: 15px; background: #f8f8f8; margin: 15px 0; }
        .instructions strong { font-size: 13pt; }
        .question-columns { column-count: 2; column-gap: 30px; column-rule: 1px solid #ccc; }
        .question { break-inside: avoid; margin-bottom: 20px; }
        .question-number { font-weight: bold; margin-bottom: 8px; font-size: 12pt; }
        .options-single { margin-left: 20px; }
        .options-double { margin-left: 20px; }
        .options-double .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .options-double .option { flex: 1; padding-right: 10px; }
        .options-single .option { margin-bottom: 4px; }
        .footer { text-align: center; font-size: 12pt; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 15px; }
        .subject-header { 
          background: #e0e7ff; 
          color: #1e40af; 
          font-weight: bold; 
          font-size: 14pt; 
          text-transform: uppercase; 
          padding: 10px; 
          margin: 20px 0 15px 0; 
          break-inside: avoid;
          border-left: 4px solid #1e40af;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="title">${formData.title || "Question Paper"}</div>
          ${logoBase64 ? `<img src="${logoBase64}" class="logo" alt="Logo" />` : ""}
        </div>
        <div class="info">
          <div>
            <div><strong>Duration:</strong> ${formData.duration} minutes</div>
            <div><strong>Date:</strong> ${formData.date || "N/A"}</div>
          </div>
          <div>
            <div><strong>Total Marks:</strong> ${formData.marks}</div>
            <div><strong>Total Questions:</strong> ${allQuestions.length}</div>
          </div>
        </div>
        ${formData.instruction ? `<div class="instructions"><strong>Instructions:</strong><br/>${formData.instruction}</div>` : ""}
        <div class="question-columns">
          ${renderQuestions(questionsBySubject)}
        </div>
        ${footerText ? `<div class="footer">${footerText}</div>` : ""}
      </div>
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

  // OMR Sheet Print Logic
  const handlePrintOMRSheet = () => {
    const printWindow = window.open("", "_blank");

    const totalQuestions = allQuestions.length;
    const questionsPerColumn = Math.ceil(totalQuestions / 4); // split into 4 columns

    // Helper function to render one column
    const renderOMRColumn = (start, end) => {
      let columnContent = "";
      for (let i = start; i <= end; i++) {
        if (i > totalQuestions) break;
        columnContent += `
        <div class="question-row">
          <span class="question-number">${i}</span>
          <div class="options-bubbles">
            <div class="bubble-option">A</div>
            <div class="bubble-option">B</div>
            <div class="bubble-option">C</div>
            <div class="bubble-option">D</div>
          </div>
        </div>
      `;
      }
      return columnContent;
    };

    const col1 = renderOMRColumn(1, questionsPerColumn);
    const col2 = renderOMRColumn(questionsPerColumn + 1, questionsPerColumn * 2);
    const col3 = renderOMRColumn(questionsPerColumn * 2 + 1, questionsPerColumn * 3);
    const col4 = renderOMRColumn(questionsPerColumn * 3 + 1, totalQuestions);

    const omrHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>OMR Sheet - ${formData.title || "Question Paper"}</title>
    <style>
      @page { size: A4; margin: 1.5cm; }
      body { font-family: Arial, sans-serif; font-size: 10pt; background: white; color: #000; }
      .omr-page { padding: 0; }
      .omr-flex-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 12px; padding: 2px 10px; border: 1px solid black;
      }
      .omr-left-info { display: flex; flex-direction: column; align-items: flex-start; min-width: 180px; gap: 6px; }
      .logo-omr { max-width: 100px; max-height: 80px; margin-bottom: 6px; border-radius: 5px; border: 1px solid #ddd; background: #fff; }
      .omr-center-title { text-align: center; flex: 1; }
      .omr-title { font-size: 16pt; font-weight: bold; margin-bottom: 4px; }
      .omr-subtitle { font-size: 11pt; color: #444; margin-bottom: 0; }
      .omr-table { display: flex; justify-content: space-between; gap: 12px; }
      .column { flex: 1; border: 1px solid black; padding: 10px; }
      .question-row { display: flex; align-items: center; margin-bottom: 3px; font-size: 7pt; }
      .question-number { min-width: 20px; font-weight: bold; }
      .options-bubbles { display: flex; gap: 10px; margin-left: 10px; }
      .bubble-option { width: 14px; height: 14px; border: 1px solid #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 6pt; font-weight: bold; }
      .info-line { display: inline-block; width: 100px; margin-left: 5px; border-bottom:1px dotted #aaa; min-height:12px; }
    </style>
  </head>
  <body>
    <div class="omr-page">
      <div class="omr-flex-header">
        <div class="omr-left-info">
          <div>Name: <span class="info-line">&nbsp;</span></div>
          <div>Roll No: <span class="info-line">&nbsp;</span></div>
          <div>Date: <span class="info-line">&nbsp;</span></div>
        </div>
        <div class="omr-center-title">
          <div class="omr-title">${formData.title || "OMR QUESTION SHEET"}</div>
          <div class="omr-subtitle">**Do not write anything on the OMR bubbles**</div>
        </div>
        <div style="min-width:80px">
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-omr" />` : ""}
        </div>
      </div>
      <div class="omr-table">
        <div class="column">${col1}</div>
        <div class="column">${col2}</div>
        <div class="column">${col3}</div>
        <div class="column">${col4}</div>
      </div>
    </div>
  </body>
  </html>
  `;

    printWindow.document.write(omrHTML);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700 font-medium">Fetching questions...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <button
          onClick={() => router.push("/offline_mode")}
          className="flex items-center gap-1 px-3 py-2 mb-4 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-sm transition"
        >
          <IoIosArrowBack className="text-xl" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paper & OMR Printer</h1>
              <p className="text-gray-600 mt-1">Print question papers and OMR sheets</p>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
              <MdDescription className="text-blue-600" />
              <span className="text-blue-700 font-medium">{allQuestions.length} Questions</span>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Question Paper Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FaFileAlt className="text-2xl" />
                <h3 className="text-xl font-semibold">Question Paper</h3>
              </div>
              <p className="text-green-100">Print formatted question paper</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Paper Title:</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formData.duration} minutes</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{formData.marks}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{allQuestions.length}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePreview}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FaEye /> Preview
                </button>
                <button
                  onClick={handlePrintQuestionPaper}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaPrint /> Print
                </button>
              </div>
            </div>
          </div>

          {/* OMR Sheet Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <FaClipboardList className="text-2xl" />
                <h3 className="text-xl font-semibold">OMR Sheet</h3>
              </div>
              <p className="text-purple-100">Print OMR sheet</p>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">A4 Size</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{allQuestions.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Options per Q:</span>
                  <span className="font-medium">4 (A, B, C, D)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Pages:</span>
                  <span className="font-medium">{Math.ceil(allQuestions.length / 40)}</span>
                </div>
              </div>

              <button
                onClick={handlePrintOMRSheet}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPrint /> Print OMR Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl shadow-xl">
          <div
            className="p-6 border-b border-gray-200 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          >
            <div className="flex items-center gap-3">
              <FaCog className="text-xl text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900">Paper Configuration</h3>
            </div>
            <div className={`text-xl text-gray-600 transition-transform ${isConfigExpanded ? 'rotate-90' : ''}`}>
              →
            </div>
          </div>

          {isConfigExpanded && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paper Title</label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Question Paper Title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="120"
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Marks</label>
                  <input
                    name="marks"
                    value={formData.marks}
                    onChange={handleChange}
                    placeholder="100"
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
                  <input
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    type="date"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    onChange={(e) => handleLogoUpload(e.target.files[0])}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
                  <input
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="All the best!"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions for Candidates</label>
                <textarea
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleChange}
                  placeholder="Enter instructions for the students..."
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {isPreviewReady && (
          <div id="previewSection" className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <MdPreview className="text-2xl" />
                <h3 className="text-xl font-semibold">Paper Preview</h3>
              </div>
            </div>

            <div className="p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-gray-300">
                <div>
                  <h2 className="text-3xl font-bold uppercase text-gray-900">{formData.title}</h2>
                </div>
                {logoFile && (
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-md border border-gray-200"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <p><strong>Duration:</strong> {formData.duration} minutes</p>
                  <p><strong>Date:</strong> {formData.date}</p>
                </div>
                <div className="space-y-2 text-right">
                  <p><strong>Total Marks:</strong> {formData.marks}</p>
                  <p><strong>Total Questions:</strong> {allQuestions.length}</p>
                </div>
              </div>

              {formData.instruction && (
                <div className="border-2 border-gray-300 p-4 bg-gray-50 text-left mb-6 rounded-lg">
                  <strong className="text-lg">Instructions:</strong>
                  <p className="mt-2">{formData.instruction}</p>
                </div>
              )}

              <div className="space-y-6">
                {allQuestions.map((q) => (
                  <div key={q.number} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold text-lg mb-3">
                      {q.number}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                      {q.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="font-medium text-blue-600">
                            {String.fromCharCode(65 + i)})
                          </span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-right italic mt-2 text-gray-600">
                      [Marks: {q.marks}]
                    </div>
                  </div>
                ))}
              </div>

              {footerText && (
                <div className="text-center mt-12 pt-6 border-t border-gray-300 text-gray-600">
                  <p className="text-lg italic">{footerText}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}