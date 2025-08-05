"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function TestDetails() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      try {
        // ✅ Fetch test details + questions in one call
        const res = await axios.get(`${API_BASE}/test-series/test-series-question/${testId}`);
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

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading test...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  if (!test) {
    return <div className="p-4 text-center text-gray-500">Test not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Test Details */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{test.testName}</h1>
        <p className="text-gray-600">Subject: {test.subject || "N/A"}</p>
        <p className="text-gray-600">Duration: {test.durationMinutes} mins</p>
        <p className="text-gray-600">
          Open: {test.openDate ? new Date(test.openDate).toLocaleDateString() : "N/A"} | 
          Close: {test.closeDate ? new Date(test.closeDate).toLocaleDateString() : "N/A"}
        </p>
      </div>

      {/* Questions List */}
      <h2 className="text-xl font-semibold mb-4">Questions</h2>
      {questions.length === 0 ? (
        <p className="text-gray-500">No questions have been added yet.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <p className="font-medium mb-2">
                {index + 1}. {q.questionText}
              </p>
              <ul className="space-y-1 ml-4">
                {q.options.length > 0 ? (
                  q.options.map((opt, i) => (
                    <li key={i} className="text-sm">
                      {String.fromCharCode(65 + i)}. {opt}
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No options available</li>
                )}
              </ul>
              <p className="mt-2 text-sm text-green-700">
                ✅ Correct Answer: {q.correctAnswer}
              </p>
              {q.explanation && (
                <p className="mt-1 text-sm text-gray-600">💡 {q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
