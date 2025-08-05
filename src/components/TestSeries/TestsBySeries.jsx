"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function TestsBySeries() {
  const router = useRouter();
  const { seriesId } = useParams(); // get seriesId from URL
  const [tests, setTests] = useState([]);
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (!seriesId) return;

    const fetchTests = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/test-series/test-series-test/${seriesId}/tests`
        );
        if (res.data.success) {
          setTests(res.data.data);
          setSeriesDetails(res.data.seriesDetails || null);
        } else {
          setError(res.data.message || "Failed to load tests.");
        }
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError("Error fetching tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [seriesId]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">Loading tests...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      {seriesDetails && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{seriesDetails.name}</h1>
          <p className="text-gray-600">{seriesDetails.description}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tests for this Series</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() =>
            (window.location.href = `/test-series/${seriesId}/create-test`)
          }
        >
          ➕ Create Test
        </button>
      </div>

      {tests.length === 0 ? (
        <p className="text-gray-500">No tests found for this series.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className="p-4 border rounded-lg shadow hover:shadow-md transition bg-white"
            >
              <h2 className="text-lg font-semibold">{test.testName}</h2>
              <p className="text-sm text-gray-600 mb-2">
                Subject: {test.subject || "N/A"}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                Duration: {test.durationMinutes} minutes
              </p>
              <p className="text-xs text-gray-500">
                Open:{" "}
                {test.openDate
                  ? new Date(test.openDate).toLocaleDateString()
                  : "N/A"}{" "}
                <br />
                Close:{" "}
                {test.closeDate
                  ? new Date(test.closeDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <button
                className="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                onClick={() => {
                  router.push(`/test-series/test/${test.id}`);
                }}
              >
                View Test Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
