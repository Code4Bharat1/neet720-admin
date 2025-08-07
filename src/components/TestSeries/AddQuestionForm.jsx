"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams , useRouter } from "next/navigation";

export default function AddQuestionForm() {
  const { testId } = useParams();
  const router = useRouter()
  const [formData, setFormData] = useState({
    testId: testId,
    questionText: "",
    options: ["", "", "", ""], // default 4 empty options
    correctAnswer: "",
    explanation: "",
    marks: "",
    negativeMarks: "",
    difficulty: "medium",
    questionType: "MCQ",
  });
  const [loading, setLoading] = useState(false);

  // Handle text and select inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle options array
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  // Add new option field
  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index) => {
    const updatedOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: updatedOptions });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!formData.testId || !formData.questionText || !formData.marks) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/test-series/test-series/question/create`,
        {
          ...formData,
          marks: Number(formData.marks),
          negativeMarks: formData.negativeMarks
            ? Number(formData.negativeMarks)
            : 0,
        }
      );
      if (res.status === 201) {
        toast.success("Question added successfully");
        setFormData({
          testId: testId,
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          explanation: "",
          marks: "",
          negativeMarks: "",
          difficulty: "medium",
          questionType: "MCQ",
        });
      }
    } catch (err) {
      console.error("Error adding question:", err);
      toast.error(err.response?.data?.error || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => router.push(`/test-series/test/${testId}`)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors flex-shrink-0 mt-1 sm:mt-0"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                Add New Question
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Create a new question for your test series
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Form Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Question Details
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Fill in the information below to create a new question
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Question Text *
                    </label>
                    <textarea
                      name="questionText"
                      value={formData.questionText}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                      placeholder="Enter your question here. Be clear and specific..."
                    />
                    <p className="text-xs text-gray-500">
                      Write a clear and concise question that students can easily understand
                    </p>
                  </div>
                </div>

                {/* Options Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Answer Options
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {formData.options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium text-slate-600 flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                          placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors flex-shrink-0"
                          >
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm sm:text-base"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Another Option
                    </button>
                  </div>
                </div>

                {/* Correct Answer & Explanation Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0"
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
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Answer & Explanation
                    </h3>
                  </div>

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Correct Answer *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
                      </div>
                      <input
                        type="text"
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleChange}
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                        placeholder="Enter the exact correct option text"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter the exact text of the correct option as it appears above
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Explanation
                    </label>
                    <textarea
                      name="explanation"
                      value={formData.explanation}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 resize-none text-sm sm:text-base"
                      placeholder="Provide a detailed explanation for the correct answer (optional)..."
                    />
                    <p className="text-xs text-gray-500">
                      Help students understand why this is the correct answer
                    </p>
                  </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Question Configuration
                    </h3>
                  </div>

                  {/* Marks & Negative Marks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Marks *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 sm:w-9 sm:h-9 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v8m-4-4h8"
                            />
                          </svg>
                        </div>
                        <input
                          type="number"
                          name="marks"
                          value={formData.marks}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                          placeholder="e.g., 4"
                          min="0"
                          step="0.5"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Points awarded for correct answer
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Negative Marks
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 12H4"
                            />
                          </svg>
                        </div>
                        <input
                          type="number"
                          name="negativeMarks"
                          value={formData.negativeMarks}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                          placeholder="e.g., 1"
                          min="0"
                          step="0.25"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Points deducted for wrong answer (optional)
                      </p>
                    </div>
                  </div>

                  {/* Difficulty & Question Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Difficulty Level
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <select
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm sm:text-base"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Question Type
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                        </div>
                        <select
                          name="questionType"
                          value={formData.questionType}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm sm:text-base"
                        >
                          <option value="MCQ">Multiple Choice Question</option>
                          <option value="true_false">True/False</option>
                          <option value="statement_based">Statement Based</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-slate-300 text-gray-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm sm:text-base order-2 sm:order-1"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !formData.testId.trim() ||
                      !formData.questionText.trim() ||
                      !formData.marks
                    }
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <span className="hidden sm:inline">Adding Question...</span>
                        <span className="sm:hidden">Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add Question
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Tips for Creating Quality Questions
                </h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>
                    • Write clear, unambiguous question text that students can easily understand
                  </li>
                  <li>
                    • Ensure all options are plausible but only one is definitively correct
                  </li>
                  <li>
                    • Use the exact text from options when specifying the correct answer
                  </li>
                  <li>
                    • Provide explanations to help students learn from their mistakes
                  </li>
                  <li>
                    • Set appropriate marks and difficulty levels for balanced assessment
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
