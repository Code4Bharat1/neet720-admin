"use client";
import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import axios from "axios"; // For making API requests
import toast from "react-hot-toast";

function Scheduletest() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [formData, setFormData] = useState({
    duration: "",
    scheduledAt: "",
    endsAt: "",
    showResultsInstantly: "",
    batch: "",
    batchId: "", // Added batchId to formData
  });
  const [batchData, setBatchData] = useState([]); // State to store batch data
  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [adminId, setAdminId] = useState("");

  useEffect(() => {
    const subjects = ["Physics", "Chemistry", "Biology"];
    let totalQ = 0;

    subjects.forEach((subject) => {
      const data = localStorage.getItem(subject);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const count = parsed.reduce((sum, ch) => sum + ch.numQuestions, 0);
          totalQ += count;
        } catch (err) {
          console.error(`Error parsing ${subject}:`, err);
        }
      }
    });

    setTotalQuestions(totalQ);
    setTotalMarks(totalQ * 4);
  }, []);

  useEffect(() => {
    // Fetch batch info from the backend API
    const fetchBatchData = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) {
          console.error("No admin token found");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const adminId = payload.id;

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/batchnames`,
          { adminId } // Send as request body
        );

        const formattedBatchData = response.data.batchData.map((batch) => ({
          batchId: batch.id || batch.batch_id, // Use whichever field exists
          batchName: batch.batchName,
        }));
        console.log("response :", response);
        console.log("batch data : ", formattedBatchData);

        setBatchData(formattedBatchData);
        console.log("Fetched batch data:", formattedBatchData);
      } catch (error) {
        console.error("Error fetching batch data:", error);
        toast.error("Failed to load batches");
      } finally {
        setLoading(false);
      }
    };

    fetchBatchData();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "batch") {
      // Find the selected batch's ID
      const selectedBatch = batchData.find(
        (batch) => batch.batchName === value
      );
      setFormData((prev) => ({
        ...prev,
        batch: value,
        batchId: selectedBatch ? selectedBatch.batchId : "", // Set batchId
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const sendReviewedQuestions = async () => {
    try {
      const token = localStorage.getItem("adminAuthToken");
      if (!token) {
        console.error("No admin token found");
        return;
      }

      // Get the payload from localStorage
      const payload = JSON.parse(atob(token.split(".")[1]));
      const adminId = payload.id;

      // Get the changed questions from localStorage
      const changedQuestions =
        JSON.parse(localStorage.getItem("changedQuestions")) || [];

      if (changedQuestions.length === 0) {
        console.log("No questions to review");
        return;
      }

      // Send each reviewed question to the backend
      const reviewPromises = changedQuestions.map(async (question) => {
        const reviewData = {
          question_Id: question.questionId,
          question_Text: question.questionText,
          subject_Name: question.subjectName,
          admin_Id: adminId,
          chapter_Name: question.chapterName,
        };

        return axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/review/`, // Adjust this endpoint as needed
          reviewData
        );
      });

      await Promise.all(reviewPromises);
      console.log("All questions reviewed successfully");
    } catch (error) {
      console.error("Error sending reviewed questions:", error);
      throw error;
    }
  };

  const handleCreateTest = async () => {
    const token = localStorage.getItem("adminAuthToken");
    setAdminId(token);
    const testName = localStorage.getItem("testName");

    try {
      // First send the reviewed questions
      await sendReviewedQuestions();

      // Then proceed with test creation
      const subjects = ["Physics", "Chemistry", "Biology"];
      let formattedQuestionData = [];
      let formattedTopicNames = [];

      subjects.forEach((subject) => {
        const data = localStorage.getItem(subject);
        if (data) {
          try {
            const chapters = JSON.parse(data);

            // Prepare question IDs
            chapters.forEach((chapter) => {
              const ids = chapter.questions.map((q) => q.id);
              formattedQuestionData.push({
                subject: subject,
                topic: chapter.chapterName,
                ids: ids,
              });
            });

            // Prepare topic names
            const topicNames = chapters.map((chapter) => chapter.chapterName);
            formattedTopicNames.push({
              subject: subject,
              topic_names: topicNames,
            });
          } catch (err) {
            console.error(`Error parsing ${subject} data:`, err);
          }
        }
      });

      const payload = {
        addedByAdminId: token,
        testname: testName,
        difficulty: "Medium",
        subject: "Physics, Chemistry, Biology",
        marks: totalMarks,
        positivemarks: "4",
        negativemarks: "1",
        correctanswer: [],
        question_ids: formattedQuestionData,
        unitName: "Full Syllabus",
        topic_name: formattedTopicNames,
        no_of_questions: totalQuestions,
        question_id: null,
        duration: formData.duration,
        exam_start_date: formData.scheduledAt || "2025-05-01T10:00:00Z",
        exam_end_date: formData.endsAt || "2025-05-01T13:00:00Z",
        instruction:
          "Attempt all questions carefully. Negative marking applies.",
        batch_name: formData.batch,
        batchId: formData.batchId, // Added batchId to payload
        status: "Active",
      };

      console.log("payload :", payload);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/admintest`,
        payload
      );

      toast.success("Test created successfully!", {
        duration: 5000,
      });

      localStorage.removeItem("changedQuestions");
      router.push("/generatetest");
    } catch (error) {
      console.error("Error in test creation process:", error);
      toast.error("Failed to create test.", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="relative overflow-hidden py-2">
      <div className="flex justify-between items-center sm:mx-8 mt-10rem mb-15rem">
        <button className="flex items-center px-8 py-2 bg-[#FFBB38] text-white rounded-full hover:bg-[#FFBB38] transition">
          <FaArrowLeft className="mr-2 font-bold" onClick={()=>{router.back()}} /> Back
        </button>
        <button
          onClick={openModal}
          className="flex items-center px-8 py-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition"
        >
          Create <FaArrowRight className="ml-2 text-bold" />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          <div className="relative bg-white p-6 border-[#848080] rounded-xl shadow-lg max-w-screen-sm sm:max-w-lg md:max-w-4xl w-full mx-4 sm:mx-8 overflow-hidden">
            <h2 className="text-2xl font-semibold mb-4 mt-1">
              Schedule test for Batch
            </h2>
            <div className="border-b border-gray-300 mb-3"></div>

            <div className="flex space-x-4 mb-4 ml-2">
              <div className="bg-blue-400 text-white text-sm px-4 py-2 rounded-sm">
                Total Questions: {totalQuestions}
              </div>
              <div className="bg-blue-400 text-white text-sm px-4 py-2 rounded-sm">
                Total Marks: {totalMarks}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2">
              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">
                  Test Duration (in Minutes):
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm bg-[#D9D9D9]"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">
                  Scheduled at:
                </label>
                <input
                  type="date"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm bg-[#D9D9D9] text-gray-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">Ends at:</label>
                <input
                  type="date"
                  name="endsAt"
                  value={formData.endsAt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm bg-[#D9D9D9] text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">
                  Show Test Results Instantly:
                </label>
                <select
                  name="showResultsInstantly"
                  value={formData.showResultsInstantly}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm bg-[#D9D9D9]"
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[#535353] font-medium">
                  Select Batch:
                </label>
                <select
                  name="batch"
                  value={formData.batch}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-sm bg-[#D9D9D9]"
                >
                  <option value="">Select a Batch</option>
                  {loading ? (
                    <option value="">Loading batches...</option>
                  ) : (
                    batchData.map((batch) => (
                      <option key={batch.batchId} value={batch.batchName}>
                        {batch.batchName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={closeModal}
                className="bg-[#CEDFFC] text-[#000000] py-2 px-9 rounded-full"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTest}
                className="bg-[#EB3D3C] text-white py-2 px-8 rounded-full"
              >
                Create Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scheduletest;
