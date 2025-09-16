"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const TestUpdateForm = ({ testId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    testname: "",
    batch_name: "",
    duration: "",
    exam_start_date: "",
    exam_end_date: "",
    status: "",
  });

  // Fetch test details on mount
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-data-by-id`,
          {
            testid: localStorage.getItem("testid"),
          }
        );

        const test = response.data.test;
        setFormData({
          testname: test.testname || "",
          batch_name: test.batch_name || "",
          duration: test.duration || "",
          exam_start_date: test.exam_start_date || "",
          exam_end_date: test.exam_end_date || "",
          status: test.status || "",
        });
      } catch (err) {
        setError("Failed to fetch test details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestDetails();
  }, [testId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/update-test`,
        {
          testid: localStorage.getItem("testid"),
          ...formData,
        }
      );

      if (response.status === 200) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      }
    } catch (err) {
      setError("Failed to update test");
      console.error(err);
    }
  };

  if (loading)
    return <div className="text-center text-gray-600 py-6">Loading test details...</div>;
  if (error)
    return (
      <div className="bg-red-100 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Update Test Details</h2>
        <button
          onClick={() => router.push("/test_preview")}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>

      {updateSuccess && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-center">
          ✅ Test updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Test Name */}
        <div>
          <label className="block font-medium text-gray-700">Test Name</label>
          <input
            type="text"
            name="testname"
            value={formData.testname}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Batch Name */}
        <div>
          <label className="block font-medium text-gray-700">Batch Name</label>
          <input
            type="text"
            name="batch_name"
            value={formData.batch_name}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block font-medium text-gray-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Exam Start Date */}
        <div>
          <label className="block font-medium text-gray-700">
            Exam Start Date
          </label>
          <input
            type="datetime-local"
            name="exam_start_date"
            value={formData.exam_start_date}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Exam End Date */}
        <div>
          <label className="block font-medium text-gray-700">
            Exam End Date
          </label>
          <input
            type="datetime-local"
            name="exam_end_date"
            value={formData.exam_end_date}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring focus:ring-blue-300"
          >
            <option value="">-- Select Status --</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200"
        >
          Update Test
        </button>
      </form>
    </div>
  );
};

export default TestUpdateForm;
