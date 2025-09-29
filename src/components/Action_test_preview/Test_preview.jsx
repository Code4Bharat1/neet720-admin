"use client";
import Head from "next/head";
import {
  FaEye,
  FaQuestionCircle,
  FaClock,
  FaArrowLeft,
  FaCheck,
  FaTrash,
} from "react-icons/fa";
import { MdOutlineSchedule, MdQuiz, MdGrade, MdSubject } from "react-icons/md";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "../Loading/Loading";
import { IoCloudOffline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import toast from "react-hot-toast";
import { MdFormatListBulletedAdd } from "react-icons/md";
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
  const [showConfirm, setShowConfirm] = useState(false);
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
      console.log(response.data);
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
        const token = localStorage.getItem("adminAuthToken");
        const [header, payload, signature] = token.split(".");
        // Decode the Base64 encoded payload
        const decodedPayload = atob(
          payload.replace(/-/g, "+").replace(/_/g, "/")
        );
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
        const batchResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/${decodedToken.id}`
        );
        console.log("res :", batchResponse.data);
        setBatches(batchResponse.data.batches);

        // Fetch assigned batches - ADD THIS LINE HERE
        await fetchAssignedBatches();
      } catch (err) {
        console.log(err);
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/delete-admin-test`,{
          data : {testId : testid}
        }
      );

      // Handle success response
      if (response.status === 200) {
        toast.success("Test deleted successfully!");
        router.push("/generatetest"); // Redirect to the tests list page
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
        { batchIds: [batchId] }
      );

      // Handle success response
      if (response.status === 200) {
        // Find the batch that was just assigned
        const assignedBatch = batches.find((b) => b.batchId === selectedBatch);

        // Immediately update the assignedBatches state
        setAssignedBatches((prev) => [
          ...prev,
          {
            batchId: assignedBatch.batchId,
            batchName: assignedBatch.batchName,
          },
        ]);

        // Clear selection
        setSelectedBatch("");

        // Show success message (if you have a toast notification)
        toast.success("Test assigned successfully!");
      }
    } catch (error) {
      console.error("Error assigning test:", error);
      alert("Failed to assign the test.");
    }
  };

  const removeTestFromBatch = async (batchId) => {
    try {
      const testid = localStorage.getItem("testid");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/batches/test/${testid}/remove-batches`,
        {
          data: { batchIds: [batchId] },
        }
      );

      if (response.status === 200) {
        toast.error("Test removed from batch successfully!");
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
              onClick={()=> setShowConfirm(true)}
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
          <div className="fixed inset-0 bg-gray-500/50 bg-opacity-70 flex justify-center items-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden transform transition-all animate-slideUp">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-xl backdrop-blur-sm">
                      <MdFormatListBulletedAdd className="text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Manage Test Assignment
                    </h2>
                  </div>
                  <button
                    onClick={() => setBatchModalOpen(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200 hover:text-black hover:rotate-90"
                  >
                    <svg
                      className="w-6 h-6"
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
                </div>
              </div>

              <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)]">
                {/* Currently Assigned Batches Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <FaCheck className="text-green-600 w-4 h-4" />
                    </div>
                    <span>Currently Assigned To</span>
                    <span className="ml-auto text-sm font-normal bg-green-100 text-green-700 px-3 py-1 ">
                      {assignedBatches.length}{" "}
                      {assignedBatches.length === 1 ? "Batch" : "Batches"}
                    </span>
                  </h3>

                  {loadingAssignments ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-2xl">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                      <span className="mt-3 text-gray-600 font-medium">
                        Loading assignments...
                      </span>
                    </div>
                  ) : assignedBatches.length > 0 ? (
                    <div className="space-y-3">
                      {assignedBatches.map((batch, index) => (
                        <div
                          key={batch.batchId}
                          className="group flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 animate-slideIn"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                <FaCheck className="text-white w-5 h-5" />
                              </div>
                            </div>
                            <div>
                              <span className="font-semibold text-green-900 block">
                                {batch.batchName}
                              </span>
                              <span className="text-xs text-green-600">
                                Active Assignment
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTestFromBatch(batch.batchId)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-white hover:bg-red-500 p-2.5 rounded-lg transition-all duration-200 hover:scale-110"
                            title="Remove from batch"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                      <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IoCloudOffline className="text-gray-400 text-3xl" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        No batches assigned yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Assign this test to a batch below
                      </p>
                    </div>
                  )}
                </div>

                {/* Assign to New Batch Section */}
                <div className="border-t-2 border-gray-200 pt-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MdOutlineSchedule className="text-blue-600 w-4 h-4" />
                    </div>
                    <span>Assign to New Batch</span>
                  </h3>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Batch
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl p-4 pr-10 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none font-medium text-gray-700 hover:border-gray-400 cursor-pointer"
                      >
                        <option value="">-- Choose a batch --</option>
                        {batches
                          .filter(
                            (batch) =>
                              !assignedBatches.some(
                                (assigned) => assigned.batchId === batch.batchId
                              )
                          )
                          .map((batch) => (
                            <option key={batch.batchId} value={batch.batchId}>
                              {batch.batchName}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-5 h-5 text-gray-400"
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
                    {batches.filter(
                      (batch) =>
                        !assignedBatches.some(
                          (assigned) => assigned.batchId === batch.batchId
                        )
                    ).length === 0 && (
                      <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        All available batches are already assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 flex justify-between items-center border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setBatchModalOpen(false);
                    setSelectedBatch("");
                  }}
                  className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 hover:shadow-md"
                >
                  Close
                </button>
                <button
                  onClick={assignTestToBatch}
                  disabled={!selectedBatch}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 disabled:shadow-none"
                >
                  <FaCheck className="w-4 h-4" />
                  Assign Test
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center  bg-gray-500/50 bg-opacity-70  z-50 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Delete
              </h3>
              <p className="mt-2 text-gray-600">
                Are you sure you want to delete this test? This action cannot be
                undone.
              </p>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={deleteTest}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Yes, Delete"}
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
