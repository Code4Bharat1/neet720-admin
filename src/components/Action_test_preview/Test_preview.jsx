"use client";
import Head from "next/head";
import { FaEye, FaQuestionCircle, FaClock, FaArrowLeft, FaCheck, FaTrash } from "react-icons/fa";
import { MdOutlineSchedule, MdQuiz, MdGrade, MdSubject } from "react-icons/md";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../Loading/Loading";
import { IoCloudOffline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import jwt_decode from "jwt-decode";
const TestPreview = () => {
  const router = useRouter();
  const [testData, setTestData] = useState(null);
  const [subjectTopics, setSubjectTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [batches, setBatches] = useState([]);
  const [assignedBatches, setAssignedBatches] = useState([]); // Add this new state
  const [loadingAssignments, setLoadingAssignments] = useState(false); // Add loading state

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

  const fetchAssignedBatches = async () => {
    try {
      setLoadingAssignments(true);
      const testid = localStorage.getItem("testid");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/testInfo/${testid}`
      );
      console.log(response.data)
      setAssignedBatches(response.data.test.batches || []);
    } catch (error) {
      console.error("Failed to fetch assigned batches:", error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    const testid = localStorage.getItem("testid");

    if (!testid) {
      setError("No test ID found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchTestData = async () => {
      try {
        const token = localStorage.getItem('adminAuthToken')
        const [header, payload, signature] = token.split('.');
        // Decode the Base64 encoded payload
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const decodedToken = JSON.parse(decodedPayload);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-data-by-id`,
          { testid }
        );
        setTestData(response.data.test);

        if (response.data.test.question_ids) {
          try {
            const questionData = JSON.parse(response.data.test.question_ids);
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
            setError("Failed to parse question distribution data.");
          }
        }



        // Fetch batches for assignment
        const batchResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/${decodedToken.id}`);
        console.log("res :", batchResponse.data)
        setBatches(batchResponse.data.batches);

        // Fetch assigned batches - ADD THIS LINE HERE
        await fetchAssignedBatches();

      } catch (err) {
        console.log(err)
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

  const deleteTest = async () => {
    try {
      const testid = testData.id; // Assuming the testData contains the test ID

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/delete-test/${testid}`
      );

      // Handle success response
      if (response.status === 200) {
        alert("Test deleted successfully!");
        router.push("/tests"); // Redirect to the tests list page
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Failed to delete the test.");
    }
  };

  const assignTestToBatch = async () => {
    try {
      const testid = localStorage.getItem("testid"); // Assuming the testData contains the test ID
      const batchId = selectedBatch; // Replace with the actual batch ID you want to assign

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/${testid}/assign-batches`,
        { batchIds : [batchId] }
      );

      // Handle success response
      if (response.status === 200) {
        alert("Test assigned successfully to batch!");
      }
    } catch (error) {
      console.error("Error assigning test:", error);
      alert("Failed to assign the test.");
    }
  };


  const removeTestFromBatch = async (batchId) => {
    try {
      console.log(batchId)
      const testid = localStorage.getItem("testid");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/test/${testid}/remove-batches`,
        {
        data: {  batchIds :  [batchId]  }

         } 
      );

      if (response.status === 200) {
        alert("Test removed from batch successfully!");
        fetchAssignedBatches(); // Refresh the list
      }
    } catch (error) {
      alert("Failed to remove test from batch.");
    }
  };

  return (
    <>
      <Head>
        <title>Test Preview</title>
        <meta
          name="description"
          content="Preview test details before proceeding"
        />
      </Head>

      <div className="min-h-screen">
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
        <button
          onClick={() => router.push("/generatetest")}
          className="flex items-center gap-1 mt-5 px-3 py-2 mb-4 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-sm transition"
        >
          <IoIosArrowBack className="text-xl" />
          <span className="text-sm font-medium">Back</span>
        </button>

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
              <IoCloudOffline /> Offline Mode
            </button>
            <button
              onClick={() => router.push("./edit_test")}
              className="bg-green-600 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <FaRegEdit /> Edit Test
            </button>
            <button
              onClick={deleteTest}
              className="bg-red-600 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
            >
              <FaTrash /> Delete Test
            </button>
            <button
              onClick={() => setBatchModalOpen(true)}
              className="bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <FaCheck /> Assign Test
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
                <div className="px-2 py-5">
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
        {batchModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Manage Test Assignment</h2>
                  <button
                    onClick={() => setBatchModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Currently Assigned Batches Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCheck className="text-green-500" />
                    Currently Assigned To
                  </h3>

                  {loadingAssignments ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading...</span>
                    </div>
                  ) : assignedBatches.length > 0 ? (
                    <div className="space-y-2">
                      {assignedBatches.map((batch) => (
                        <div
                          key={batch.batchId}
                          className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-800">{batch.batchName}</span>
                          </div>
                          <button
                            onClick={() => removeTestFromBatch(batch.batchId)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                            title="Remove from batch"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <IoCloudOffline className="mx-auto text-gray-400 text-2xl mb-2" />
                      <p className="text-gray-500">Not assigned to any batch yet</p>
                    </div>
                  )}
                </div>

                {/* Assign to New Batch Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MdOutlineSchedule className="text-blue-500" />
                    Assign to New Batch
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Batch
                    </label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">-- Choose a batch --</option>
                      {batches
                        .filter(batch => !assignedBatches.some(assigned => assigned.batchId === batch.batchId))
                        .map((batch) => (
                          <option key={batch.batchId} value={batch.batchId}>
                            {batch.batchName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between border-t">
                <button
                  onClick={() => {
                    setBatchModalOpen(false);
                    setSelectedBatch("");
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={assignTestToBatch}
                  disabled={!selectedBatch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FaCheck className="w-4 h-4" />
                  Assign Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TestPreview;
