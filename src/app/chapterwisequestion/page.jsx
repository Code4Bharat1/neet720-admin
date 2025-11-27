// "use client";

// import { useState, useRef, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   Upload,
//   Clipboard,
//   CheckCircle,
//   XCircle,
//   Book,
//   Lightbulb,
//   Send,
//   Loader2,
//   PlusCircle,
//   RefreshCw,
//   Eye,
//   Edit3,
// } from "lucide-react";
// import Sidebar from "@/components/desktopsidebar/sidebar";
// import DesktopNavbar from "@/components/desktopnav/nav";
// import toast from "react-hot-toast";
// import { Toaster } from "react-hot-toast";
// import LayoutWithNav from "../mainLayout";
// // Separate Evaluation Step Component
// const EvaluationStep = ({
//   extractedQuestions,
//   setExtractedQuestions,
//   selectedTest,
//   submittedCount,
//   setSubmittedCount,
// }) => {
//   const [editingQuestion, setEditingQuestion] = useState(null);
//   const [editedQuestion, setEditedQuestion] = useState({});

//   // Handle editing a question
//   const handleEditQuestion = (idx) => {
//     setEditingQuestion(idx);
//     setEditedQuestion({
//       question: extractedQuestions[idx].question,
//       options: [...extractedQuestions[idx].options],
//       solution: extractedQuestions[idx].solution || "",
//       difficulty_level: extractedQuestions[idx].difficulty_level || "medium",
//     });
//   };

//   // Save edited question
//   const handleSaveEdit = (idx) => {
//     setExtractedQuestions((prev) => {
//       const updated = [...prev];
//       updated[idx] = {
//         ...updated[idx],
//         question: editedQuestion.question,
//         options: editedQuestion.options,
//         solution: editedQuestion.solution,
//         difficulty_level: editedQuestion.difficulty_level,
//       };
//       return updated;
//     });
//     setEditingQuestion(null);
//     setEditedQuestion({});
//   };

//   // Cancel editing
//   const handleCancelEdit = () => {
//     setEditingQuestion(null);
//     setEditedQuestion({});
//   };

//   // Update option text
//   const handleOptionChange = (optionIdx, value) => {
//     setEditedQuestion((prev) => ({
//       ...prev,
//       options: prev.options.map((opt, i) =>
//         i === optionIdx ? { ...opt, option_text: value } : opt
//       ),
//     }));
//   };

//   // Toggle correct answer
//   const handleCorrectAnswerChange = (optionIdx) => {
//     setEditedQuestion((prev) => ({
//       ...prev,
//       options: prev.options.map((opt, i) => ({
//         ...opt,
//         is_correct: i === optionIdx,
//       })),
//     }));
//   };

//   // Submit a question to backend
//   const handleSubmitQuestion = async (idx) => {
//     if (!selectedTest) {
//       toast("Please select a test first.");
//       return;
//     }

//     const q = extractedQuestions[idx];

//     try {
//       const payload = {
//         testId: selectedTest,
//         questionText: q.question,
//         options: q.options.map((opt) => opt.option_text),
//         correctAnswer: q.options.find((opt) => opt.is_correct)
//           ? String.fromCharCode(
//               65 + q.options.findIndex((opt) => opt.is_correct)
//             )
//           : "",
//         explanation: q.solution || "",
//         marks: 4,
//         negativeMarks: 1,
//         difficulty: q.difficulty_level || "medium",
//         questionType: "MCQ",
//       };

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series/question/create`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) {
//         const errorData = await res.json();
//         throw new Error(errorData.message || "Failed to create question");
//       }

//       toast.success(`✅ Question ${idx + 1} added to test successfully.`);

//       setExtractedQuestions((prev) => {
//         const updated = [...prev];
//         updated[idx].submitted = true;
//         return updated;
//       });

//       setSubmittedCount((c) => {
//         const newCount = c + 1;
//         localStorage.setItem("mcq_submitted_count", newCount.toString());
//         return newCount;
//       });
//     } catch (error) {
//       toast.error(
//         "❌ Error creating question: " + (error.message || "Unknown error")
//       );
//     }
//   };

//   // Submit all questions at once
//   const handleSubmitAllQuestions = async () => {
//     if (!selectedTest) {
//       toast("Please select a test first.");
//       return;
//     }

//     if (extractedQuestions.length === 0) {
//       toast.error(
//         "⚠ No questions available to submit. Please extract questions first."
//       );
//       return;
//     }

//     const unsubmittedQuestions = extractedQuestions.filter((q) => !q.submitted);
//     if (unsubmittedQuestions.length === 0) {
//       toast("All questions have already been submitted.");
//       return;
//     }

//     const confirmSubmit = window.confirm(
//       `Are you sure you want to submit all ${unsubmittedQuestions.length} remaining questions?`
//     );

//     if (!confirmSubmit) return;

//     let successCount = 0;
//     let failCount = 0;

//     for (let i = 0; i < extractedQuestions.length; i++) {
//       if (extractedQuestions[i].submitted) continue;
//       try {
//         await handleSubmitQuestion(i);
//         successCount++;
//       } catch (error) {
//         failCount++;
//       }
//     }

//     toast.success(
//       `✅ ${successCount} questions submitted successfully. ${
//         failCount > 0 ? `❌ ${failCount} failed.` : ""
//       }`
//     );
//   };

//   if (extractedQuestions.length === 0) return null;

//   return (
//     <motion.div
//       className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.3 }}
//     >
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
//           <Eye className="w-5 h-5" />
//           Step 3: Review & Submit Questions ({extractedQuestions.length} found)
//         </h3>
//         <div className="flex gap-2">
//           <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
//             {extractedQuestions.filter((q) => q.submitted).length} submitted
//           </span>
//           {extractedQuestions.some((q) => !q.submitted) && (
//             <button
//               onClick={handleSubmitAllQuestions}
//               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//             >
//               <Send className="w-4 h-4" />
//               Submit All
//             </button>
//           )}
//         </div>
//       </div>

//       <motion.div className="space-y-4 max-h-96 overflow-y-auto">
//         {extractedQuestions.map((q, idx) => (
//           <motion.div
//             key={idx}
//             className={`border rounded-xl p-5 shadow-sm transition-colors duration-300 ${
//               q.submitted
//                 ? "bg-green-50 border-green-200"
//                 : "bg-white border-gray-200 hover:shadow-md"
//             }`}
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: idx * 0.05 }}
//           >
//             {/* Header */}
//             <div className="flex justify-between items-center mb-3">
//               <h4 className="font-semibold text-gray-800 text-lg">
//                 Question {idx + 1}
//               </h4>
//               <span
//                 className={`px-2 py-1 text-xs font-medium rounded-full ${
//                   q.submitted
//                     ? "bg-green-200 text-green-800"
//                     : "bg-yellow-100 text-yellow-800"
//                 }`}
//               >
//                 {q.submitted ? "Submitted" : "Pending"}
//               </span>
//             </div>

//             {editingQuestion === idx ? (
//               // Edit Mode
//               <div className="space-y-4">
//                 <textarea
//                   value={editedQuestion.question}
//                   onChange={(e) =>
//                     setEditedQuestion((prev) => ({
//                       ...prev,
//                       question: e.target.value,
//                     }))
//                   }
//                   className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-400"
//                   rows={3}
//                   placeholder="Edit question text..."
//                 />

//                 <div className="space-y-2">
//                   {editedQuestion.options?.map((opt, i) => (
//                     <div key={i} className="flex items-center gap-2">
//                       <input
//                         type="radio"
//                         name={`correct-${idx}`}
//                         checked={opt.is_correct}
//                         onChange={() => handleCorrectAnswerChange(i)}
//                         className="text-blue-600"
//                       />
//                       <span className="font-medium">
//                         {String.fromCharCode(65 + i)}.
//                       </span>
//                       <input
//                         type="text"
//                         value={opt.option_text}
//                         onChange={(e) => handleOptionChange(i, e.target.value)}
//                         className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
//                         placeholder="Option text"
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 <textarea
//                   value={editedQuestion.solution}
//                   onChange={(e) =>
//                     setEditedQuestion((prev) => ({
//                       ...prev,
//                       solution: e.target.value,
//                     }))
//                   }
//                   className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
//                   rows={2}
//                   placeholder="Solution / Explanation (optional)"
//                 />

//                 <div className="flex justify-between items-center">
//                   <select
//                     value={editedQuestion.difficulty_level}
//                     onChange={(e) =>
//                       setEditedQuestion((prev) => ({
//                         ...prev,
//                         difficulty_level: e.target.value,
//                       }))
//                     }
//                     className="p-2 border rounded-md"
//                   >
//                     <option value="easy">Easy</option>
//                     <option value="medium">Medium</option>
//                     <option value="hard">Hard</option>
//                   </select>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleSaveEdit(idx)}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={handleCancelEdit}
//                       className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               // View Mode
//               <div className="space-y-3">
//                 <p className="text-gray-800">{q.question}</p>
//                 <ul className="space-y-1">
//                   {q.options.map((opt, i) => (
//                     <li
//                       key={i}
//                       className={`flex items-center gap-2 p-2 rounded-md ${
//                         opt.is_correct
//                           ? "bg-green-100 text-green-800 font-medium"
//                           : "text-gray-700"
//                       }`}
//                     >
//                       <span className="font-medium">
//                         {String.fromCharCode(65 + i)}.
//                       </span>
//                       <span>{opt.option_text}</span>
//                       {opt.is_correct && (
//                         <CheckCircle className="w-4 h-4 text-green-600" />
//                       )}
//                     </li>
//                   ))}
//                 </ul>

//                 {q.solution && (
//                   <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded-md">
//                     <strong>Solution:</strong> {q.solution}
//                   </div>
//                 )}

//                 <div className="flex justify-between items-center mt-2">
//                   <span className="text-sm text-gray-500">
//                     Difficulty: {q.difficulty_level || "medium"}
//                   </span>
//                   <div className="flex gap-2">
//                     {!q.submitted && (
//                       <button
//                         onClick={() => handleEditQuestion(idx)}
//                         className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
//                       >
//                         Edit
//                       </button>
//                     )}
//                     <button
//                       onClick={() => handleSubmitQuestion(idx)}
//                       disabled={q.submitted}
//                       className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
//                         q.submitted
//                           ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                           : "bg-green-600 text-white hover:bg-green-700"
//                       }`}
//                     >
//                       {q.submitted ? "Submitted" : "Submit"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </motion.div>
//         ))}
//       </motion.div>
//     </motion.div>
//   );
// };

// // Main Page Component
// const Page = () => {
//   const [submittedCount, setSubmittedCount] = useState(() => {
//     if (typeof window !== "undefined") {
//       return Number.parseInt(
//         localStorage.getItem("mcq_submitted_count") || "0",
//         10
//       );
//     }
//     return 0;
//   });

//   // Floating WhatsApp CTA
//   const FloatingWhatsAppCTA = ({
//     phone = "+91XXXXXXXXXX", // <- your WhatsApp number (with country code, no spaces)
//     message, // string OR () => string
//     label = "We’ll do this for you — WhatsApp us!",
//   }) => {
//     const buildLink = () => {
//       const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
//       const text = typeof message === "function" ? message() : message;
//       return `${base}?text=${encodeURIComponent(
//         text ||
//           "Hi, I want you to extract MCQs, review, and upload them to my test."
//       )}`;
//     };

//     return (
//       <a
//         href={buildLink()}
//         target="_blank"
//         rel="noopener noreferrer"
//         aria-label="Chat on WhatsApp"
//         className="fixed bottom-5 right-5 z-50 group"
//       >
//         <div className="flex items-center gap-3 rounded-full shadow-xl bg-white pr-4 pl-2 py-2 border border-emerald-200 hover:shadow-2xl transition-all">
//           {/* WhatsApp icon bubble */}
//           <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow">
//             <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
//               <path d="M19.11 17.3c-.29-.15-1.68-.83-1.94-.92-.26-.1-.45-.15-.64.15-.19.3-.74.92-.9 1.11-.17.2-.33.22-.62.08-.29-.15-1.23-.45-2.35-1.43-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.61.13-.13.29-.33.43-.49.14-.16.19-.27.29-.46.1-.2.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5l-.55-.01c-.2 0-.5.07-.76.36-.26.3-1 1-1 2.45 0 1.44 1.03 2.83 1.17 3.03.14.2 2.03 3.1 4.92 4.35.69.3 1.22.48 1.63.61.68.22 1.29.19 1.78.11.54-.08 1.68-.69 1.91-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.54-.34zM26.67 5.33C23.8 2.46 20.02 1 16.01 1 7.64 1 1 7.64 1 16.01c0 2.65.69 5.2 1.99 7.46L1 31l7.71-1.97c2.21 1.2 4.7 1.84 7.3 1.84h.01c8.37 0 15.01-6.64 15.01-15.01 0-4-1.56-7.78-4.36-10.53zM16.01 28.79h-.01c-2.33 0-4.6-.63-6.59-1.83l-.47-.28-4.58 1.17 1.22-4.46-.3-.46c-1.22-2-1.86-4.3-1.86-6.93 0-7.12 5.8-12.91 12.93-12.91 3.45 0 6.69 1.34 9.13 3.78 2.44 2.44 3.78 5.68 3.78 9.13 0 7.13-5.8 12.92-12.92 12.92z" />
//             </svg>
//           </span>
//           {/* Label (hidden on very small screens) */}
//           <div className="hidden sm:block">
//             <p className="text-sm font-semibold text-emerald-900">{label}</p>
//             <p className="text-xs text-emerald-700">
//               Fast response on WhatsApp
//             </p>
//           </div>
//         </div>
//       </a>
//     );
//   };

//   // Test Series & Test Dropdown states
//   const [testSeriesList, setTestSeriesList] = useState([]);
//   const [selectedSeries, setSelectedSeries] = useState("");
//   const [testsList, setTestsList] = useState([]);
//   const [selectedTest, setSelectedTest] = useState("");

//   // MCQ Extraction state
//   const [mcqImage, setMcqImage] = useState(null);
//   const [extracting, setExtracting] = useState(false);
//   const [extractError, setExtractError] = useState(null);
//   const [extractedQuestions, setExtractedQuestions] = useState([]);
//   const pasteBoxRef = useRef(null);
//   const evaluationRef = useRef(null);

//   //--fetch test series
// useEffect(() => {
//   const fetchSeries = async () => {
//     try {
//       const token = localStorage.getItem("adminAuthToken");

//       if (!token) {
//         console.error("No admin auth token found");
//         setTestSeriesList([]); // prevent undefined state
//         return;
//       }

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await res.json();

//       if (data.success) {
//         setTestSeriesList(data.data);
//       } else {
//         console.error("Error fetching test series", data.message);
//         setTestSeriesList([]);
//       }
//     } catch (error) {
//       console.error("Failed to load test series", error);
//       setTestSeriesList([]);
//     }
//   };

//   fetchSeries();
// }, []);


//   //--fetch tests for selected series
//   useEffect(() => {
//     if (!selectedSeries) return;
//     const fetchTests = async () => {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series/test-series-test/${selectedSeries}/tests`
//         );
//         const data = await res.json();
//         if (data.success) {
//           setTestsList(data.data);
//         }
//       } catch (error) {
//         console.error("Failed to load tests", error);
//       }
//     };
//     fetchTests();
//   }, [selectedSeries]);

//   // Handle image paste/upload
//   const handlePasteImage = (e) => {
//     const items = e.clipboardData.items;
//     for (let i = 0; i < items.length; i++) {
//       if (items[i].type.indexOf("image") !== -1) {
//         const file = items[i].getAsFile();
//         if (file) {
//           setMcqImage(file);
//           setExtractError(null);
//           break;
//         }
//       }
//     }
//   };

//   const handleMcqImageChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setMcqImage(e.target.files[0]);
//       setExtractError(null);
//     }
//   };

//   const handleExtractMcqs = async () => {
//     if (!mcqImage) {
//       toast("Please paste or upload an image first.");
//       return;
//     }

//     setExtracting(true);
//     setExtractError(null);
//     setExtractedQuestions([]);

//     try {
//       const formData = new FormData();
//       formData.append("image", mcqImage);

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_MCQ_URL}/extract-mcqs`,
//         { method: "POST", body: formData }
//       );

//       // Parse the response
//       const data = await res.json();

//       console.log("Extraction response:", data); // Debug

//       // Check for API success AND that mcqs exist and are not empty
//       if (!res.ok) {
//         throw new Error(data.error || "Failed to extract MCQs");
//       }

//       const mcqs = data.mcqs;

//       if (Array.isArray(mcqs) && mcqs.length > 0) {
//         setExtractedQuestions(
//           mcqs.map((mcq) => ({
//             ...mcq,
//             options: (mcq.options || []).map((opt, i) => ({
//               option_text: opt,
//               is_correct: mcq.answer?.toLowerCase() === "abcd"[i],
//             })),
//             submitted: false,
//           }))
//         );
//       } else {
//         setExtractError("⚠ No MCQs found in the image.");
//         toast.error(
//           "⚠ No questions were extracted from this image. Please check the image or try another one."
//         );
//       }
//     } catch (err) {
//       console.error("MCQ extraction error:", err);
//       setExtractError(
//         "Failed to extract MCQs: " + (err.message || "Unknown error")
//       );
//       toast.error(
//         "❌ Failed to extract MCQs: " + (err.message || "Unknown error")
//       );
//     } finally {
//       setExtracting(false);
//     }
//   };

//   // Framer Motion Variants
//   const containerVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { staggerChildren: 0.1 },
//     },
//   };
//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0 },
//   };

//   return (
//     <LayoutWithNav>
//         <div
//         >
//           <div className="text-center mb-6">
//             <Toaster />
//             <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mt-2">
//               Add Questions to Test Series
//             </h1>
//             <p className="text-gray-600 text-sm sm:text-base mt-1">
//               Scan or upload question images to extract and submit MCQs
//             </p>
//           </div>
//           {/* Step 1: Dropdowns */}
//           <motion.div
//             className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
//             variants={itemVariants}
//           >
//             <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
//               <Book className="w-5 h-5" /> Step 1: Select Test Series & Test
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Test Series
//                 </label>
//                 <select
//                   value={selectedSeries}
//                   onChange={(e) => {
//                     setSelectedSeries(e.target.value);
//                     setSelectedTest("");
//                   }}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Test Series</option>
//                   {testSeriesList.map((series) => (
//                     <option key={series.id} value={series.id}>
//                       {series.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-2">Test</label>
//                 <select
//                   value={selectedTest}
//                   onChange={(e) => setSelectedTest(e.target.value)}
//                   disabled={!selectedSeries}
//                   className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
//                 >
//                   <option value="">Select Test</option>
//                   {testsList.map((test) => (
//                     <option key={test.id} value={test.id}>
//                       {test.testName}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </motion.div>

//           {/* step 2: MCQ Image Upload & Extraction */}
//           <motion.div
//             className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
//             variants={itemVariants}
//           >
//             <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
//               <Lightbulb className="w-5 h-5" /> Step 2: Upload & Extract MCQ
//               Image
//             </h2>

//             <div className="space-y-4">
//               {/* File Upload / Paste Box */}
//               <label
//                 ref={pasteBoxRef}
//                 tabIndex={0}
//                 onPaste={handlePasteImage}
//                 htmlFor="mcq-upload"
//                 className="cursor-pointer border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center gap-4"
//               >
//                 <Clipboard className="w-12 h-12 text-blue-600" />
//                 <div>
//                   <p className="text-lg font-medium text-blue-800">
//                     Paste or Upload MCQ Image
//                   </p>
//                   <p className="text-sm text-blue-600 mt-1">
//                     Paste with Ctrl+V or click to browse files
//                   </p>
//                 </div>
//                 <input
//                   type="file"
//                   id="mcq-upload"
//                   accept="image/*"
//                   onChange={handleMcqImageChange}
//                   className="hidden"
//                 />
//               </label>

//               {/* Show selected file */}
//               {mcqImage && (
//                 <div className="flex flex-col items-center gap-2">
//                   <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
//                     <CheckCircle className="w-5 h-5" />
//                     <span>Image loaded: {mcqImage.name}</span>
//                   </div>
//                   {/* Image Preview */}
//                   <img
//                     src={URL.createObjectURL(mcqImage)}
//                     alt="MCQ Preview"
//                     className="max-h-64 rounded-lg border border-gray-300 mt-2 object-contain"
//                   />
//                 </div>
//               )}

//               {/* Extract button */}
//               <button
//                 onClick={handleExtractMcqs}
//                 disabled={extracting || !mcqImage}
//                 className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
//               >
//                 {extracting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Extracting MCQs...
//                   </>
//                 ) : (
//                   <>
//                     <PlusCircle className="w-4 h-4" />
//                     Extract MCQs
//                   </>
//                 )}
//               </button>

//               {extractError && (
//                 <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
//                   <XCircle className="w-5 h-5" />
//                   <span>{extractError}</span>
//                 </div>
//               )}
//             </div>
//           </motion.div>

//           {/* Step 3: Evaluation Step (Separate Component) */}
//           <motion.div ref={evaluationRef}>
//             <EvaluationStep
//               extractedQuestions={extractedQuestions}
//               setExtractedQuestions={setExtractedQuestions}
//               selectedTest={selectedTest}
//               submittedCount={submittedCount}
//               setSubmittedCount={setSubmittedCount}
//             />
//           </motion.div>

//           {/* Stats */}
//           {submittedCount > 0 && (
//             <motion.div
//               className="bg-green-50 border border-green-200 p-4 rounded-lg"
//               variants={itemVariants}
//             >
//               <div className="flex items-center gap-2 text-green-800">
//                 <CheckCircle className="w-5 h-5" />
//                 <span className="font-medium">
//                   Total Questions Submitted: {submittedCount}
//                 </span>
//               </div>
//             </motion.div>
//           )}
//         </div>
//         {/* <FloatingWhatsAppCTA
//         phone="+91XXXXXXXXXX" // <- replace with your business number
//         message={() => {
//           // Build a helpful, contextual message
//           const series = testSeriesList.find(
//             (s) => String(s.id) === String(selectedSeries)
//           );
//           const seriesName = series?.name || "N/A";

//           const test = testsList.find(
//             (t) => String(t.id) === String(selectedTest)
//           );
//           const testName = test?.testName || "N/A";

//           const totalExtracted = extractedQuestions.length;
//           const totalSubmitted = submittedCount;

//           return [
//             "Hi NEET720 team, I want you to handle MCQ extraction, review, and submission for my test.",
//             `Series: ${seriesName}`,
//             `Test: ${testName}`,
//             `Extracted MCQs: ${totalExtracted}`,
//             `Already Submitted: ${totalSubmitted}`,
//             "Please contact me to proceed.",
//           ].join("\n");
//         }}
//         label="We’ll do this for you — WhatsApp us!"
//       /> */}
//     </LayoutWithNav>
//   );
// };

// export default Page;
















"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Clipboard,
  CheckCircle,
  XCircle,
  Book,
  Lightbulb,
  Send,
  Loader2,
  PlusCircle,
  RefreshCw,
  Eye,
  Edit3,
} from "lucide-react";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import LayoutWithNav from "../mainLayout";
// Separate Evaluation Step Component
const EvaluationStep = ({
  extractedQuestions,
  setExtractedQuestions,
  selectedTest,
  submittedCount,
  setSubmittedCount,
}) => {
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState({});

  // Handle editing a question
  const handleEditQuestion = (idx) => {
    setEditingQuestion(idx);
    setEditedQuestion({
      question: extractedQuestions[idx].question,
      options: [...extractedQuestions[idx].options],
      solution: extractedQuestions[idx].solution || "",
      difficulty_level: extractedQuestions[idx].difficulty_level || "medium",
    });
  };

  // Save edited question
  const handleSaveEdit = (idx) => {
    setExtractedQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        question: editedQuestion.question,
        options: editedQuestion.options,
        solution: editedQuestion.solution,
        difficulty_level: editedQuestion.difficulty_level,
      };
      return updated;
    });
    setEditingQuestion(null);
    setEditedQuestion({});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingQuestion(null);
    setEditedQuestion({});
  };

  // Update option text
  const handleOptionChange = (optionIdx, value) => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === optionIdx ? { ...opt, option_text: value } : opt
      ),
    }));
  };

  // Toggle correct answer
  const handleCorrectAnswerChange = (optionIdx) => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        is_correct: i === optionIdx,
      })),
    }));
  };

  // Submit a question to backend
  const handleSubmitQuestion = async (idx) => {
    if (!selectedTest) {
      toast("Please select a test first.");
      return;
    }

    const q = extractedQuestions[idx];

    try {
      const payload = {
        testId: selectedTest,
        questionText: q.question,
        options: q.options.map((opt) => opt.option_text),
        correctAnswer: q.options.find((opt) => opt.is_correct)
          ? String.fromCharCode(
              65 + q.options.findIndex((opt) => opt.is_correct)
            )
          : "",
        explanation: q.solution || "",
        marks: 4,
        negativeMarks: 1,
        difficulty: q.difficulty_level || "medium",
        questionType: "MCQ",
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series/question/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create question");
      }

      toast.success(`✅ Question ${idx + 1} added to test successfully.`);

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
      toast.error(
        "❌ Error creating question: " + (error.message || "Unknown error")
      );
    }
  };

  // Submit all questions at once
  const handleSubmitAllQuestions = async () => {
    if (!selectedTest) {
      toast("Please select a test first.");
      return;
    }

    if (extractedQuestions.length === 0) {
      toast.error(
        "⚠ No questions available to submit. Please extract questions first."
      );
      return;
    }

    const unsubmittedQuestions = extractedQuestions.filter((q) => !q.submitted);
    if (unsubmittedQuestions.length === 0) {
      toast("All questions have already been submitted.");
      return;
    }

    const confirmSubmit = window.confirm(
      `Are you sure you want to submit all ${unsubmittedQuestions.length} remaining questions?`
    );

    if (!confirmSubmit) return;

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < extractedQuestions.length; i++) {
      if (extractedQuestions[i].submitted) continue;
      try {
        await handleSubmitQuestion(i);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    toast.success(
      `✅ ${successCount} questions submitted successfully. ${
        failCount > 0 ? `❌ ${failCount} failed.` : ""
      }`
    );
  };

  if (extractedQuestions.length === 0) return null;

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-700 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Step 3: Review & Submit Questions ({extractedQuestions.length} found)
        </h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            {extractedQuestions.filter((q) => q.submitted).length} submitted
          </span>
          {extractedQuestions.some((q) => !q.submitted) && (
            <button
              onClick={handleSubmitAllQuestions}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit All
            </button>
          )}
        </div>
      </div>

      <motion.div className="space-y-4 max-h-96 overflow-y-auto">
        {extractedQuestions.map((q, idx) => (
          <motion.div
            key={idx}
            className={`border rounded-xl p-5 shadow-sm transition-colors duration-300 ${
              q.submitted
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200 hover:shadow-md"
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-800 text-lg">
                Question {idx + 1}
              </h4>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  q.submitted
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {q.submitted ? "Submitted" : "Pending"}
              </span>
            </div>

            {editingQuestion === idx ? (
              // Edit Mode
              <div className="space-y-4">
                <textarea
                  value={editedQuestion.question}
                  onChange={(e) =>
                    setEditedQuestion((prev) => ({
                      ...prev,
                      question: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-400"
                  rows={3}
                  placeholder="Edit question text..."
                />

                <div className="space-y-2">
                  {editedQuestion.options?.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${idx}`}
                        checked={opt.is_correct}
                        onChange={() => handleCorrectAnswerChange(i)}
                        className="text-blue-600"
                      />
                      <span className="font-medium">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <input
                        type="text"
                        value={opt.option_text}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
                        placeholder="Option text"
                      />
                    </div>
                  ))}
                </div>

                <textarea
                  value={editedQuestion.solution}
                  onChange={(e) =>
                    setEditedQuestion((prev) => ({
                      ...prev,
                      solution: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-400"
                  rows={2}
                  placeholder="Solution / Explanation (optional)"
                />

                <div className="flex justify-between items-center">
                  <select
                    value={editedQuestion.difficulty_level}
                    onChange={(e) =>
                      setEditedQuestion((prev) => ({
                        ...prev,
                        difficulty_level: e.target.value,
                      }))
                    }
                    className="p-2 border rounded-md"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(idx)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-3">
                <p className="text-gray-800">{q.question}</p>
                <ul className="space-y-1">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-md ${
                        opt.is_correct
                          ? "bg-green-100 text-green-800 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      <span className="font-medium">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{opt.option_text}</span>
                      {opt.is_correct && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </li>
                  ))}
                </ul>

                {q.solution && (
                  <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded-md">
                    <strong>Solution:</strong> {q.solution}
                  </div>
                )}

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Difficulty: {q.difficulty_level || "medium"}
                  </span>
                  <div className="flex gap-2">
                    {!q.submitted && (
                      <button
                        onClick={() => handleEditQuestion(idx)}
                        className="px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleSubmitQuestion(idx)}
                      disabled={q.submitted}
                      className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                        q.submitted
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {q.submitted ? "Submitted" : "Submit"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// Main Page Component
const Page = () => {
  const [submittedCount, setSubmittedCount] = useState(() => {
    if (typeof window !== "undefined") {
      return Number.parseInt(
        localStorage.getItem("mcq_submitted_count") || "0",
        10
      );
    }
    return 0;
  });

  // Floating WhatsApp CTA
  const FloatingWhatsAppCTA = ({
    phone = "+91XXXXXXXXXX", // <- your WhatsApp number (with country code, no spaces)
    message, // string OR () => string
    label = "We’ll do this for you — WhatsApp us!",
  }) => {
    const buildLink = () => {
      const base = `https://wa.me/${phone.replace(/\D/g, "")}`;
      const text = typeof message === "function" ? message() : message;
      return `${base}?text=${encodeURIComponent(
        text ||
          "Hi, I want you to extract MCQs, review, and upload them to my test."
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
          {/* WhatsApp icon bubble */}
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow">
            <svg viewBox="0 0 32 32" className="h-6 w-6 fill-white">
              <path d="M19.11 17.3c-.29-.15-1.68-.83-1.94-.92-.26-.1-.45-.15-.64.15-.19.3-.74.92-.9 1.11-.17.2-.33.22-.62.08-.29-.15-1.23-.45-2.35-1.43-.87-.77-1.46-1.72-1.63-2.01-.17-.3-.02-.46.13-.61.13-.13.29-.33.43-.49.14-.16.19-.27.29-.46.1-.2.05-.36-.02-.5-.07-.15-.64-1.55-.88-2.12-.23-.56-.47-.49-.64-.5l-.55-.01c-.2 0-.5.07-.76.36-.26.3-1 1-1 2.45 0 1.44 1.03 2.83 1.17 3.03.14.2 2.03 3.1 4.92 4.35.69.3 1.22.48 1.63.61.68.22 1.29.19 1.78.11.54-.08 1.68-.69 1.91-1.35.24-.66.24-1.23.17-1.35-.07-.12-.26-.19-.54-.34zM26.67 5.33C23.8 2.46 20.02 1 16.01 1 7.64 1 1 7.64 1 16.01c0 2.65.69 5.2 1.99 7.46L1 31l7.71-1.97c2.21 1.2 4.7 1.84 7.3 1.84h.01c8.37 0 15.01-6.64 15.01-15.01 0-4-1.56-7.78-4.36-10.53zM16.01 28.79h-.01c-2.33 0-4.6-.63-6.59-1.83l-.47-.28-4.58 1.17 1.22-4.46-.3-.46c-1.22-2-1.86-4.3-1.86-6.93 0-7.12 5.8-12.91 12.93-12.91 3.45 0 6.69 1.34 9.13 3.78 2.44 2.44 3.78 5.68 3.78 9.13 0 7.13-5.8 12.92-12.92 12.92z" />
            </svg>
          </span>
          {/* Label (hidden on very small screens) */}
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

  // Test Series & Test Dropdown states
  const [testSeriesList, setTestSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState("");
  const [testsList, setTestsList] = useState([]);
  const [selectedTest, setSelectedTest] = useState("");

  // MCQ Extraction state
  // const [mcqImage, setMcqImage] = useState(null);

  const [mcqImages, setMcqImages] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const pasteBoxRef = useRef(null);
  const evaluationRef = useRef(null);

  //--fetch test series
useEffect(() => {
  const fetchSeries = async () => {
    try {
      const token = localStorage.getItem("adminAuthToken");

      if (!token) {
        console.error("No admin auth token found");
        setTestSeriesList([]); // prevent undefined state
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setTestSeriesList(data.data);
      } else {
        console.error("Error fetching test series", data.message);
        setTestSeriesList([]);
      }
    } catch (error) {
      console.error("Failed to load test series", error);
      setTestSeriesList([]);
    }
  };

  fetchSeries();
}, []);


  //--fetch tests for selected series
  useEffect(() => {
    if (!selectedSeries) return;
    const fetchTests = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series/test-series-test/${selectedSeries}/tests`
        );
        const data = await res.json();
        if (data.success) {
          setTestsList(data.data);
        }
      } catch (error) {
        console.error("Failed to load tests", error);
      }
    };
    fetchTests();
  }, [selectedSeries]);

  // Handle image paste/upload
  // const handlePasteImage = (e) => {
  //   const items = e.clipboardData.items;
  //   for (let i = 0; i < items.length; i++) {
  //     if (items[i].type.indexOf("image") !== -1) {
  //       const file = items[i].getAsFile();
  //       if (file) {
  //         setMcqImage(file);
  //         setExtractError(null);
  //         break;
  //       }
  //     }
  //   }
  // };

  const handlePasteImage = (e) => {
  const items = e.clipboardData.items;
  let newImages = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const file = items[i].getAsFile();
      if (file) newImages.push(file);
    }
  }

  if (newImages.length > 0) {
    setMcqImages((prev) => [...prev, ...newImages]);
    setExtractError(null);
  }
};


  // const handleMcqImageChange = (e) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setMcqImage(e.target.files[0]);
  //     setExtractError(null);
  //   }
  // };

const handleMcqImageChange = (e) => {
  const files = Array.from(e.target.files);

  if (files.length > 0) {
    setMcqImages((prev) => [...prev, ...files]);
    setExtractError(null);
  }
};


  // const handleExtractMcqs = async () => {
  //   if (!mcqImages) {
  //     toast("Please paste or upload an image first.");
  //     return;
  //   }

  //   setExtracting(true);
  //   setExtractError(null);
  //   setExtractedQuestions([]);

  //   try {
  //     const formData = new FormData();
  //     formData.append("image", mcqImage);

  //     const res = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_MCQ_URL}/extract-mcqs`,
  //       { method: "POST", body: formData }
  //     );

  //     // Parse the response
  //     const data = await res.json();

  //     console.log("Extraction response:", data); // Debug

  //     // Check for API success AND that mcqs exist and are not empty
  //     if (!res.ok) {
  //       throw new Error(data.error || "Failed to extract MCQs");
  //     }

  //     const mcqs = data.mcqs;

  //     if (Array.isArray(mcqs) && mcqs.length > 0) {
  //       setExtractedQuestions(
  //         mcqs.map((mcq) => ({
  //           ...mcq,
  //           options: (mcq.options || []).map((opt, i) => ({
  //             option_text: opt,
  //             is_correct: mcq.answer?.toLowerCase() === "abcd"[i],
  //           })),
  //           submitted: false,
  //         }))
  //       );
  //     } else {
  //       setExtractError("⚠ No MCQs found in the image.");
  //       toast.error(
  //         "⚠ No questions were extracted from this image. Please check the image or try another one."
  //       );
  //     }
  //   } catch (err) {
  //     console.error("MCQ extraction error:", err);
  //     setExtractError(
  //       "Failed to extract MCQs: " + (err.message || "Unknown error")
  //     );
  //     toast.error(
  //       "❌ Failed to extract MCQs: " + (err.message || "Unknown error")
  //     );
  //   } finally {
  //     setExtracting(false);
  //   }
  // };


  const handleExtractMcqs = async () => {
  if (mcqImages.length === 0) {
    toast("Please paste or upload at least one image.");
    return;
  }

  setExtracting(true);
  setExtractError(null);
  setExtractedQuestions([]);

  let allMCQs = [];

  try {
    for (const img of mcqImages) {
      const formData = new FormData();
      formData.append("image", img);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_MCQ_URL}/extract-mcqs`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed extraction for:", img.name);
        continue; // skip failed images
      }

      const mcqs = data.mcqs || [];
      allMCQs = [...allMCQs, ...mcqs];
    }

    if (allMCQs.length === 0) {
      setExtractError("⚠ No MCQs found in the images.");
      toast.error("⚠ No MCQs extracted.");
      return;
    }

    // format MCQs
    setExtractedQuestions(
      allMCQs.map((mcq) => ({
        ...mcq,
        options: (mcq.options || []).map((opt, i) => ({
          option_text: opt,
          is_correct: mcq.answer?.toLowerCase() === "abcd"[i],
        })),
        submitted: false,
      }))
    );

    toast.success("✅ MCQs extracted from all images!");
  } catch (err) {
    console.error(err);
    setExtractError("Extraction error: " + err.message);
    toast.error("❌ Error extracting MCQs");
  } finally {
    setExtracting(false);
  }
};


  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <LayoutWithNav>
        <div
        >
          <div className="text-center mb-6">
            <Toaster />
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-700 mt-2">
              Add Questions to Test Series
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">
              Scan or upload question images to extract and submit MCQs
            </p>
          </div>
          {/* Step 1: Dropdowns */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <Book className="w-5 h-5" /> Step 1: Select Test Series & Test
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Test Series
                </label>
                <select
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setSelectedTest("");
                  }}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Test Series</option>
                  {testSeriesList.map((series) => (
                    <option key={series.id} value={series.id}>
                      {series.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Test</label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  disabled={!selectedSeries}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Select Test</option>
                  {testsList.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.testName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* step 2: MCQ Image Upload & Extraction */}
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold mb-4 text-blue-700 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> Step 2: Upload & Extract MCQ
              Image
            </h2>

            <div className="space-y-4">
              {/* File Upload / Paste Box */}
              <label
                ref={pasteBoxRef}
                tabIndex={0}
                onPaste={handlePasteImage}
                htmlFor="mcq-upload"
                className="cursor-pointer border-2 border-dashed border-blue-300 bg-blue-50 p-8 text-center rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center gap-4"
              >
                <Clipboard className="w-12 h-12 text-blue-600" />
                <div>
                  <p className="text-lg font-medium text-blue-800">
                    Paste or Upload MCQ Image
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Paste with Ctrl+V or click to browse files
                  </p>
                </div>
                <input
                  type="file"
                  id="mcq-upload"
                  accept="image/*"
                  onChange={handleMcqImageChange}
                  className="hidden"
                  multiple
                />
              </label>

              {/* Show selected file */}
              {/* {mcqImage && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span>Image loaded: {mcqImage.name}</span>
                  </div>
                 
                  <img
                    src={URL.createObjectURL(mcqImage)}
                    alt="MCQ Preview"
                    className="max-h-64 rounded-lg border border-gray-300 mt-2 object-contain"
                  />
                </div>
              )} */}


              {mcqImages.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {mcqImages.map((image, index) => (
      <div key={index} className="flex flex-col items-center bg-green-50 p-3 rounded-lg border">
        <span className="text-green-700 text-sm">{image.name}</span>
        <img
          src={URL.createObjectURL(image)}
          className="max-h-48 rounded-md border mt-2 object-contain"
        />
      </div>
    ))}
  </div>
)}


              {/* Extract button */}
              <button
                onClick={handleExtractMcqs}
                disabled={extracting || !mcqImages}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting MCQs...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    Extract MCQs
                  </>
                )}
              </button>

              {extractError && (
                <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  <span>{extractError}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Step 3: Evaluation Step (Separate Component) */}
          <motion.div ref={evaluationRef}>
            <EvaluationStep
              extractedQuestions={extractedQuestions}
              setExtractedQuestions={setExtractedQuestions}
              selectedTest={selectedTest}
              submittedCount={submittedCount}
              setSubmittedCount={setSubmittedCount}
            />
          </motion.div>

          {/* Stats */}
          {submittedCount > 0 && (
            <motion.div
              className="bg-green-50 border border-green-200 p-4 rounded-lg"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Total Questions Submitted: {submittedCount}
                </span>
              </div>
            </motion.div>
          )}
        </div>
        {/* <FloatingWhatsAppCTA
        phone="+91XXXXXXXXXX" // <- replace with your business number
        message={() => {
          // Build a helpful, contextual message
          const series = testSeriesList.find(
            (s) => String(s.id) === String(selectedSeries)
          );
          const seriesName = series?.name || "N/A";

          const test = testsList.find(
            (t) => String(t.id) === String(selectedTest)
          );
          const testName = test?.testName || "N/A";

          const totalExtracted = extractedQuestions.length;
          const totalSubmitted = submittedCount;

          return [
            "Hi NEET720 team, I want you to handle MCQ extraction, review, and submission for my test.",
            `Series: ${seriesName}`,
            `Test: ${testName}`,
            `Extracted MCQs: ${totalExtracted}`,
            `Already Submitted: ${totalSubmitted}`,
            "Please contact me to proceed.",
          ].join("\n");
        }}
        label="We’ll do this for you — WhatsApp us!"
      /> */}
    </LayoutWithNav>
  );
};

export default Page;

