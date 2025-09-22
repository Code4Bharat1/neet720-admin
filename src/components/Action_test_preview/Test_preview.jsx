"use client";
import Head from "next/head";
import { FaEye, FaQuestionCircle, FaClock, FaArrowLeft } from "react-icons/fa";
import { MdOutlineSchedule, MdQuiz, MdGrade, MdSubject } from "react-icons/md";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../Loading/Loading";

const TestPreview = () => {
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [subjectTopics, setSubjectTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utility function to format date properly
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Use toLocaleDateString to show date in user's local format
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const testid = localStorage.getItem("testid");
    console.log("testid :", testid);

    if (!testid) {
      setError("No test ID found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchTestData = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-data-by-id`,
          { testid }
        );
        setTestData(response.data.test);
        console.log("response data : ", response.data.test);

        // Process question_ids to get subject-wise topic distribution
        if (response.data.test.question_ids) {
          try {
            const questionData = JSON.parse(response.data.test.question_ids);

            // Group by subject and topic
            const subjectsMap = new Map();

            questionData.forEach((item) => {
              if (!subjectsMap.has(item.subject)) {
                subjectsMap.set(item.subject, {
                  subject: item.subject,
                  topics: [],
                });
              }

              const subjectEntry = subjectsMap.get(item.subject);
              subjectEntry.topics.push({
                topic: item.topic,
                questionCount: item.ids.length,
              });
            });

            setSubjectTopics(Array.from(subjectsMap.values()));
          } catch (parseError) {
            console.error("Error parsing question_ids:", parseError);
            setError("Failed to parse question distribution data.");
          }
        }
      } catch (err) {
        console.error(
          "Error fetching test data:",
          err.response ? err.response.data : err
        );
        setError("Failed to fetch test data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-red-600 text-lg font-medium bg-red-50 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Test Preview</title>
        <meta
          name="description"
          content="Preview test details before proceeding"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        {/* <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center">
            <button
              onClick={() => router.push("/generatetest")}
              className="mr-4 text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
              aria-label="Go back"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Back</h1>
          </div>
        </header> */}

        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {/* <button
              onClick={() => router.push("./test_preview")}
              className="bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <FaEye /> Test Preview
            </button> */}
            <button
              onClick={() => router.push("./offline_mode")}
              className="bg-amber-500 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-amber-600 transition-colors"
            >
              <FaQuestionCircle /> Offline Mode
            </button>
            <button
              onClick={() => router.push("./edit_test")}
              className="bg-green-600 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <MdOutlineSchedule /> Edit Test
            </button>
          </div>

          {/* Test Summary Card */}
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-blue-600 text-white px-6 py-3">
              <h2 className="text-lg font-semibold">Test Summary</h2>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap -mx-3">
                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                      <MdQuiz size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Test Name</p>
                      <p className="font-medium">{testData.testname}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                      <MdGrade size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Difficulty</p>
                      <p className="font-medium">{testData.difficulty}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mr-3">
                      <FaClock size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-medium">{testData.duration} minutes</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full mr-3">
                      <MdGrade size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Marks</p>
                      <p className="font-medium">{testData.marks}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                      <MdQuiz size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Questions</p>
                      <p className="font-medium">{testData.no_of_questions}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 p-3">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                      <MdSubject size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Batch</p>
                      <p className="font-medium">{testData.batch_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Content */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Subject Content
          </h2>

          <div className="space-y-6">
            {subjectTopics.map((subject, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Subject Header */}
                <div className="p-4 flex items-center border-b border-gray-100">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mr-4">
                    <Image
                      src="/Logo.png"
                      alt={subject.subject}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{subject.subject}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subject.topics.reduce(
                          (sum, t) => sum + t.questionCount,
                          0
                        )}{" "}
                        Questions
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {subject.topics.reduce(
                          (sum, t) => sum + t.questionCount * 4,
                          0
                        )}{" "}
                        Marks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Topics Table */}
                <div className="px-4 py-3">
                  <h4 className="font-medium text-gray-700 mb-3">Topics</h4>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16"
                          >
                            No.
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Topic Name
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-28"
                          >
                            Questions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subject.topics.map((topic, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-800">
                              {topic.topic}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right font-medium">
                              {topic.questionCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default TestPreview;
