"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function CreateTestSeries() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    visibility: "public", // default
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/test-series/create-test-series`, {
        ...formData,
      },{
        headers : {
            Authorization : `Bearer ${localStorage.getItem("adminAuthToken")}`
        }
      });

      if (res.data.success) {
        alert("✅ Test Series created successfully!");
        router.push("/test-series"); // go back to list page
      } else {
        setError(res.data.message || "Failed to create test series.");
      }
    } catch (err) {
      console.error("Error creating test series:", err);
      setError(err.response?.data?.message || "Server error while creating test series.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Test Series</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Series Name */}
        <input
          type="text"
          name="name"
          placeholder="Series Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />

        {/* Description */}
        <textarea
          name="description"
          placeholder="Series Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Visibility */}
        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Test Series"}
        </button>
      </form>
    </div>
  );
}
