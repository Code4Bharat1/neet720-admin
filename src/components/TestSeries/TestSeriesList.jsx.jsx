"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function TestSeriesList() {
  const [testSeries, setTestSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const {seriesId} = useParams()

  // Replace with your API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchTestSeries = async () => {
      try {
        const res = await axios.get(`${API_BASE}/test-series`);
        if (res.data.success) {
          setTestSeries(res.data.data);
        } else {
          setError(res.data.message || "Failed to load test series.");
        }
      } catch (err) {
        console.error("Error fetching test series:", err);
        setError("Error fetching test series.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestSeries();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading test series...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Available Test Series</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => router.push(`/test-series/create`)}
        >
          ➕ Create Test Series
        </button>
      </div>
      {testSeries.length === 0 ? (
        <p className="text-gray-500">No test series found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testSeries.map((series) => (
            <div
              key={series.id}
              className="p-4 border rounded-lg shadow hover:shadow-md transition bg-white"
            >
              <h2 className="text-lg font-semibold">{series.name}</h2>
              <p className="text-gray-600 text-sm mb-2">
                {series.description || "No description available."}
              </p>
              <p className="text-xs text-gray-500">
                Created At: {new Date(series.createdAt).toLocaleDateString()}
              </p>
              <button
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                onClick={() => {
                  // Navigate to TestSeriesDetails page
                  window.location.href = `/test-series/${series.id}`;
                }}
              >
                View Tests
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
