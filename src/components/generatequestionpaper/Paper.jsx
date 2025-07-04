"use client";

import { useEffect, useState, useRef } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaPrint, FaEye, FaDownload,FaClipboardList  } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Paper() {
  const [formData, setFormData] = useState({
    duration: "",
    marks: "",
    date: "",
    instruction: "",
    batch: "",
    title: "Question Paper",
  });

  const router = useRouter();

  const [logoFile, setLogoFile] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [footerText, setFooterText] = useState("");
  const [questionsBySubject, setQuestionsBySubject] = useState({});
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const printContentRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const testid = localStorage.getItem("testid");
      if (!testid) return;

      try {
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
      }
    };

    fetchQuestions();
  }, []);

  const handleLogoUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);
  };

  const handleProceed = () => {
    setIsPreviewReady(true);
    setTimeout(() => {
      document.getElementById("previewSection")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };


  const handleOMRSheet = () => {
    router.push("/print-omr")
};


const handlePrint = () => {
  const printWindow = window.open("", "_blank");

  // New renderQuestions uses the grouped object
const renderQuestions = (questionsBySubject) => {
  let output = "";
  let serial = 1; // Serial number starts at 1
  Object.entries(questionsBySubject).forEach(([subject, questions]) => {
    output += `<div class="subject-header">${subject}</div>`;
    questions.forEach((q) => {
      const optionLayout = q.options.some((opt) => opt.length > 50)
        ? "single"
        : "double";
      const optionsHTML =
        optionLayout === "double"
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
              ${q.options
                .map(
                  (opt, i) =>
                    `<div class="option"><strong>${String.fromCharCode(
                      65 + i
                    )})</strong> ${opt}</div>`
                )
                .join("")}
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
        }
        .page {
          page-break-after: always;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          text-transform: uppercase;
        }
        .logo {
          max-width: 100px;
          max-height: 100px;
        }
        .info {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 10pt;
        }
        .instructions {
          border: 1px solid #000;
          padding: 10px;
          background: #f0f0f0;
          margin: 10px 0;
          text-align: left;
        }
        .question-columns {
          column-count: 2;
          column-gap: 40px;
          column-rule: 2px solid #000;
        }
        .question {
          break-inside: avoid;
          margin-bottom: 16px;
        }
        .question-number {
          font-weight: bold;
          margin-bottom: 6px;
        }
        .options-single {
          margin-left: 20px;
        }
        .options-double {
          margin-left: 20px;
        }
        .options-double .row {
          display: flex;
          justify-content: space-between;
        }
        .options-double .option {
          flex: 1;
        }
        .footer {
          text-align: center;
          font-size: 10pt;
          margin-top: 30px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          color: #444;
        }
        .subject-header {
          background: #ede9fe;
          color: #5b21b6;
          font-weight: bold;
          font-size: 13pt;
          text-transform: uppercase;
          border-bottom: 1px solid #a78bfa;
          margin-top: 24px;
          margin-bottom: 10px;
          padding: 8px 8px 4px 0;
          break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="title">${formData.title || "Question Paper"}</div>
          ${
            logoBase64
              ? `<img src="${logoBase64}" class="logo" alt="Logo" />`
              : ""
          }
        </div>
        <div class="info">
          <div>
            <div><strong>Duration:</strong> ${formData.duration} min</div>
            <div><strong>Date:</strong> ${formData.date || "N/A"}</div>
          </div>
          <div>
            <div><strong>Total Marks:</strong> ${formData.marks}</div>
            <div><strong>Batch:</strong> ${formData.batch || "N/A"}</div>
          </div>
        </div>
        ${
          formData.instruction
            ? `<div class="instructions"><strong>Instructions:</strong> ${formData.instruction}</div>`
            : ""
        }
        <div class="question-columns">
          ${renderQuestions(questionsBySubject)}
        </div>
        ${
          footerText
            ? `<div class="footer">${footerText}</div>`
            : ""
        }
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


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Question Paper Configuration</h1>

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            className="border p-3 rounded-lg"
          />
          <input
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Duration (min)"
            type="number"
            className="border p-3 rounded-lg"
          />
          <input
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            placeholder="Total Marks"
            type="number"
            className="border p-3 rounded-lg"
          />
          <input
            name="date"
            value={formData.date}
            onChange={handleChange}
            type="date"
            className="border p-3 rounded-lg"
          />
          <select
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="">Select Batch</option>
            <option value="Batch A">Batch A</option>
            <option value="Batch B">Batch B</option>
            <option value="Batch C">Batch C</option>
          </select>

          <input
            type="file"
            accept="image/*"
            className="border p-3 rounded-lg"
            onChange={(e) => handleLogoUpload(e.target.files[0])}
          />
        </div>

        <textarea
          name="instruction"
          value={formData.instruction}
          onChange={handleChange}
          placeholder="Instructions for candidates"
          className="border p-3 rounded-lg w-full min-h-[100px]"
        />

        <input
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
          placeholder="Footer Text (e.g. All the best!)"
          className="border p-3 rounded-lg w-full"
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
  <button
    onClick={handleProceed}
    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
  >
    <FaEye /> Preview
  </button>
  <button
    onClick={handlePrint}
    className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
  >
    <FaPrint /> Print
  </button>
  <button
    onClick={handleOMRSheet}
    className="bg-purple-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
  >
    <FaClipboardList /> OMR Sheet
  </button>
</div>

      </div>

      {/* Preview */}
      {isPreviewReady && (
        <div id="previewSection" className="mt-10 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h2 className="text-2xl font-bold uppercase">{formData.title}</h2>
            </div>
            {logoFile && (
              <img
                src={URL.createObjectURL(logoFile)}
                alt="Logo"
                className="w-24 h-24 object-contain rounded-md border"
              />
            )}
          </div>

          <div className="grid grid-cols-2 text-sm mb-4">
            <div>
              <p><strong>Duration:</strong> {formData.duration} min</p>
              <p><strong>Date:</strong> {formData.date}</p>
            </div>
            <div className="text-right">
              <p><strong>Marks:</strong> {formData.marks}</p>
              <p><strong>Batch:</strong> {formData.batch}</p>
            </div>
          </div>

          {formData.instruction && (
            <div className="border p-4 bg-gray-50 text-left mb-6">
              <strong>Instructions:</strong>
              <p>{formData.instruction}</p>
            </div>
          )}

          {allQuestions.map((q) => (
            <div key={q.number} className="mb-4">
              <p className="font-semibold">{q.number}. {q.question}</p>
              <ul className="ml-6 list-disc">
                {q.options.map((opt, i) => (
                  <li key={i}>{String.fromCharCode(65 + i)}) {opt}</li>
                ))}
              </ul>
              <div className="text-sm text-right italic mt-1">[{q.marks} Marks]</div>
            </div>
          ))}

          {footerText && (
            <div className="text-center mt-8 pt-4 border-t text-sm text-gray-600">
              {footerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
