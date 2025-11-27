"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function EditTestPage() {
  const { testId } = useParams();
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testData, setTestData] = useState({
    testName: "",
    subject: "",
    visibility: "assigned_only",
    durationMinutes: "",
    openDate: "",
    closeDate: "",
    isPublished: false,
  });

  useEffect(() => {
    if (!testId) return;

    const fetchDetails = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/test-series/test-series-test/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminAuthToken")}`,
            },
          }
        );

        if (res.data.success) {
          const t = res.data.data;
          setTestData({
            testName: t.testName,
            subject: t.subject,
            visibility: t.visibility,
            durationMinutes: t.durationMinutes,
            openDate: t.openDate ? t.openDate.split("T")[0] : "",
            closeDate: t.closeDate ? t.closeDate.split("T")[0] : "",
            isPublished: t.isPublished,
          });
        }
      } catch (error) {
        toast.error("Failed to load test details");
      }
      setLoading(false);
    };

    fetchDetails();
  }, [testId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem("adminAuthToken");

      const res = await axios.put(
        `${API_BASE}/test-series/test-series-test/edit/${testId}`,
        testData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Test Updated Successfully");
        router.push(`/test-series/${testId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading UI...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Heading */}
        <div className="flex justify-center mt-8 mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Test Details
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-3xl mx-auto">

          <div className="space-y-8">

            {/* Test Name */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Test Name
              </label>
              <input
                type="text"
                name="testName"
                value={testData.testName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={testData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={testData.durationMinutes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="text-gray-700 font-semibold mb-2 block">
                Visibility
              </label>
              <select
                name="visibility"
                value={testData.visibility}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="assigned_only">Assigned Only</option>
                <option value="public">Public</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-700 font-semibold mb-2 block">
                  Open Date
                </label>
                <input
                  type="date"
                  name="openDate"
                  value={testData.openDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold mb-2 block">
                  Close Date
                </label>
                <input
                  type="date"
                  name="closeDate"
                  value={testData.closeDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            {/* Publish */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPublished"
                checked={testData.isPublished}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label className="text-gray-700 font-medium">Published</label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-3 rounded-xl text-white font-semibold shadow-md transition-all ${
                saving
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
