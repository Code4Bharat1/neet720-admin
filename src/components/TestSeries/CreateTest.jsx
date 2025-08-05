"use client";
import React, { useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function CreateTest() {
  const { seriesId } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    testName: "",
    subject: "",
    testType: "custom",
    durationMinutes: "",
    openDate: "",
    closeDate: "",
    visibility: "assigned_only",
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_BASE}/test-series/create-test-series/test`,
        {
          ...formData,
          seriesId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`,
          },
        }
      );

      if (res.status === 201) {
        alert("✅ Test created successfully!");
        router.push(`/test-series/${seriesId}`);
      }
    } catch (err) {
      console.error("Error creating test:", err);
      setError(err.response?.data?.error || "Failed to create test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Test</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="testName"
          placeholder="Test Name"
          value={formData.testName}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="testType"
          value={formData.testType}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="custom">Custom</option>
          <option value="mock">Mock Test</option>
          <option value="practice">Practice</option>
        </select>

        <input
          type="number"
          name="durationMinutes"
          placeholder="Duration (minutes)"
          value={formData.durationMinutes}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          name="openDate"
          value={formData.openDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="date"
          name="closeDate"
          value={formData.closeDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="public">Public</option>
          <option value="assigned_only">Assigned Only</option>
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
          />
          Publish Test
        </label>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Test"}
        </button>
      </form>
    </div>
  );
}
