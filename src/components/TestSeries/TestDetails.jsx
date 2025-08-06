"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { Edit2Icon } from "lucide-react";

export default function TestDetails() {
  const router = useRouter();
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      try {
        // ✅ Fetch test details + questions in one call
        const res = await axios.get(
          `${API_BASE}/test-series/test-series-question/${testId}`
        );
        console.log("questions data : ", res.data);

        if (res.data.success) {
          setTest(res.data.testDetails || null);

          // Parse options string to array
          const formattedQuestions = res.data.data.map((q) => ({
            ...q,
            options: JSON.parse(q.options || "[]"),
          }));

          setQuestions(formattedQuestions);
        } else {
          setError(res.data.message || "Failed to load test details.");
        }
      } catch (err) {
        console.error("Error fetching test details:", err);
        setError("Error fetching test details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, API_BASE]);

  const startEditing = (question) => {
    setEditingQuestion({ ...question }); // clone to edit safely
  };

  const updateQuestion = async () => {
    try {
      await axios.put(`${API_BASE}/test-series/question/edit`, {
        questionId: editingQuestion.id,
        questionText: editingQuestion.questionText,
        options: editingQuestion.options,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        marks: editingQuestion.marks,
        negativeMarks: editingQuestion.negativeMarks,
        difficulty: editingQuestion.difficulty,
        questionType: editingQuestion.questionType,
      });

      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQuestion.id ? editingQuestion : q))
      );
      setEditingQuestion(null);
    } catch (err) {
      console.error("Error updating question", err);
    }
  };
  // Inside TestDetails component
  const deleteQuestion = async (questionId) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await axios.delete(`${API_BASE}/test-series/question/delete`, {
        data: { questionId },
      });

      // Remove deleted question from state
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      console.error("Error deleting question", err);
      alert("Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-8 bg-slate-200 rounded-lg w-64 mb-2 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-40 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Test Details Skeleton */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 mb-8 animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-80 mb-4"></div>
            <div className="space-y-3">
              <div className="h-5 bg-slate-200 rounded w-60"></div>
              <div className="h-5 bg-slate-200 rounded w-48"></div>
              <div className="h-5 bg-slate-200 rounded w-96"></div>
            </div>
          </div>

          {/* Questions Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>

                <div className="space-y-2 mb-4">
                  {[...Array(4)].map((_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-slate-200 rounded w-2/3"
                    ></div>
                  ))}
                </div>
                <div className="h-4 bg-slate-200 rounded w-48"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md mx-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Error Loading Test
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-md mx-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Test Not Found
          </h3>
          <p className="text-gray-600 text-center">
            The requested test could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Details</h1>
              <p className="text-gray-600 mt-1">
                Review test information and questions
              </p>
            </div>
            <div className="flex justify-end">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                onClick={() =>
                  router.push(`/test-series/test/${testId}/create`)
                }
              >
                <svg
                  className="w-5 h-5"
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
                Create Question
              </button>
            </div>
          </div>
        </div>

        {/* Test Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-8 h-8 text-white"
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
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {test.testName}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Subject
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {test.subject || "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Duration
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {test.durationMinutes} mins
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-amber-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Opens
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {test.openDate
                      ? new Date(test.openDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      Closes
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {test.closeDate
                      ? new Date(test.closeDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Section Header */}
          <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
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
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Test Questions
                  </h2>
                  <p className="text-sm text-gray-600">
                    {questions.length}{" "}
                    {questions.length === 1 ? "question" : "questions"} in this
                    test
                  </p>
                </div>
              </div>
              {questions.length > 0 && (
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-slate-200">
                  <span className="text-2xl font-bold text-gray-900">
                    {questions.length}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">Questions</span>
                </div>
              )}
            </div>
          </div>

          {/* Questions Content */}
          <div className="p-8">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Questions Available
                </h3>
                <p className="text-gray-500">
                  This test doesn't have any questions added yet.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-900 leading-relaxed">
                          {q.questionText}
                        </p>
                      </div>
                      <div className="flex gap-3 ml-auto">
                        <button
                          onClick={() => startEditing(q)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="ml-12 mb-4">
                      {q.options.length > 0 ? (
                        <div className="grid gap-2">
                          {q.options.map((opt, i) => {
                            const optionLetter = String.fromCharCode(65 + i);
                            const isCorrect =
                              q.correctAnswer === optionLetter ||
                              q.correctAnswer === opt;

                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                                    isCorrect
                                      ? "bg-green-100 text-green-700"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {optionLetter}
                                </div>
                                <span
                                  className={
                                    isCorrect
                                      ? "text-green-800 font-medium"
                                      : "text-gray-800"
                                  }
                                >
                                  {opt}
                                </span>
                                {isCorrect && (
                                  <svg
                                    className="w-4 h-4 text-green-600 ml-auto flex-shrink-0"
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
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-500 italic">
                            No options available
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Answer and Explanation */}
                    <div className="ml-12 space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <svg
                          className="w-5 h-5 text-green-600 flex-shrink-0"
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
                        <span className="text-sm font-medium text-green-800">
                          Correct Answer:
                        </span>
                        <span className="text-sm text-green-700 font-medium">
                          {q.correctAnswer}
                        </span>
                      </div>

                      {q.explanation && (
                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <svg
                            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
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
                          <div>
                            <span className="text-sm font-medium text-blue-800">
                              Explanation:
                            </span>
                            <p className="text-sm text-blue-700 mt-1">
                              {q.explanation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {editingQuestion && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                  <h2 className="flex items-center gap-2 text-2xl font-semibold text-gray-800">
                    <Edit2Icon size={24} className="text-blue-500" />
                    Edit Question
                  </h2>

                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="text-gray-500 hover:text-red-500 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      Question
                    </label>
                    <textarea
                      value={editingQuestion.questionText}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          questionText: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
                      rows={3}
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {/* Options */}
                  <div>
                    <label className="block font-semibold mb-3 text-gray-700">
                      Options
                    </label>
                    <div className="space-y-2">
                      {editingQuestion.options.map((opt, i) => (
                        <input
                          key={i}
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...editingQuestion.options];
                            updated[i] = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion,
                              options: updated,
                            });
                          }}
                          className="w-full border border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                          placeholder={`Option ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.correctAnswer}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          correctAnswer: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:border-green-500 focus:ring focus:ring-green-200 outline-none transition"
                      placeholder="Enter correct answer"
                    />
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      Explanation
                    </label>
                    <textarea
                      value={editingQuestion.explanation}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          explanation: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:border-purple-500 focus:ring focus:ring-purple-200 outline-none transition"
                      rows={2}
                      placeholder="Explain the correct answer..."
                    />
                  </div>

                  {/* Marks & Negative Marks */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Marks
                      </label>
                      <input
                        type="number"
                        value={editingQuestion.marks}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            marks: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Negative Marks
                      </label>
                      <input
                        type="number"
                        value={editingQuestion.negativeMarks}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            negativeMarks: Number(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:border-red-500 focus:ring focus:ring-red-200 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Difficulty & Question Type */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Difficulty
                      </label>
                      <select
                        value={editingQuestion.difficulty}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            difficulty: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                      >
                        <option value="">Select Difficulty</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-700">
                        Question Type
                      </label>
                      <select
                        value={editingQuestion.questionType}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            questionType: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:border-indigo-500 focus:ring focus:ring-indigo-200 outline-none transition"
                      >
                        <option value="">Select Type</option>
                        <option value="mcq">MCQ</option>
                        <option value="true_false">True/False</option>
                        <option value="short_answer">Short Answer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 border-t p-6 bg-gray-50 rounded-b-2xl">
                  <button
                    onClick={() => setEditingQuestion(null)}
                    className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateQuestion}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg transition"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
