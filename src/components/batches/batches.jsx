"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { CiImageOn, CiSearch } from "react-icons/ci";
import {
  IoSchoolOutline,
  IoAddOutline,
  IoPencilOutline,
  IoPersonOutline,
  IoCalendarOutline,
  
} from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";
import { useRouter } from "next/navigation";

export default function Batches() {
  const [testCount, setTestCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [batchData, setBatchData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const [highlightCreateBatch, setHighlightCreateBatch] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash === "#createBatch") {
        setHighlightCreateBatch(true);

        // Optional: remove highlight after a few seconds
        setTimeout(() => setHighlightCreateBatch(false), 3000);
      }
    }
  }, []);

  // Fetch batches from the backend
  useEffect(() => {
    const fetchTestCount = async () => {
      try {
        let token = null;
        if (typeof window !== "undefined") {
          token = localStorage.getItem("adminAuthToken");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admintest/getTestCount`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTestCount(response.data.testCount || 0);
      } catch (error) {
        setError(
          "Error fetching batch data: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBatches = async () => {
      setIsLoading(true);
      try {
        let token = null;
        if (typeof window !== "undefined") {
          token = localStorage.getItem("adminAuthToken");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/getbatch`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Check if batchData exists
        setBatchData(response.data.batchData || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setError("No batches found");
        } else {
          setError(
            "Error fetching batch data: " +
              (error.response?.data?.message || error.message)
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestCount();
    fetchBatches();
  }, []);

  // Add this handler inside your component
  const handleDelete = async (batchId) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;

    try {
      let token = null;
      if (typeof window !== "undefined") {
        token = localStorage.getItem("adminAuthToken");
      }

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/deletebatch/${batchId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI by filtering out deleted batch
      setBatchData((prev) => prev.filter((batch) => batch.batchId !== batchId));
    } catch (error) {
      alert(
        "Error deleting batch: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleIdClick = async (BatchId) => {
    let batchId = null;
    if (typeof window !== "undefined") {
      batchId = localStorage.setItem("batchId", BatchId);
    }

    router.push("/batches/batchesInfo");
  };

  const handleAction = (batchId, batchName, no_of_students) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("batchId", batchId);
      localStorage.setItem("batchName", batchName);
      localStorage.setItem("noOfStudents", no_of_students);
    }
    router.push(`/batchesedit?batchId=${batchId}`);
  };

  const filteredBatches = batchData.filter(
    (batch) =>
      batch.batchId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total students
  const totalStudents = batchData.reduce(
    (sum, batch) => sum + (batch.no_of_students || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl overflow-hidden">
          <button className="flex items-center justify-center gap-4 h-14 w-48 text-gray-700 text-2xl py-3 px-8 font-bold transition-all hover:bg-gray-50">
            <IoSchoolOutline className="text-yellow-500 text-2xl" />
            <span>Batches</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto ">
        {/* Search and Actions Row - Moved to top */}
        <div className="mb-6 bg-white shadow-md rounded-xl p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:w-3/5">
              <CiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search by Batch ID or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700"
              />
            </div>

            {/* New Batch Button */}
            <Link href="/batch-add">
              <button
                id="createBatch"
                className={`cursor-pointer w-full md:w-auto h-12 px-6 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${
                  highlightCreateBatch ? "animate-pulse" : ""
                }`}
              >
                <IoAddOutline className="text-xl" />
                <span className="font-medium">New Batch</span>
              </button>
            </Link>
          </div>
        </div>
        {/* Summary Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Batches Count Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded ICA-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoSchoolOutline className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Batches
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {batchData.length}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Created batches in your account
                </p>
              </div>
            </div>
            <div className="h-1 bg-blue-500"></div>
          </div>

          {/* Students Count Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoPersonOutline className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Students
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalStudents}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Students enrolled across all batches
                </p>
              </div>
            </div>
            <div className="h-1 bg-yellow-500"></div>
          </div>

          {/* Performance Card */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="p-4 flex items-start">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                <IoCalendarOutline className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Active Tests
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {testCount}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Ongoing tests in your account
                </p>
              </div>
            </div>
            <div className="h-1 bg-green-500"></div>
          </div>
        </div>

        {/* Performance Stats Card - Adjusted proportions */}


        {/* Batch Table Component - Improved */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Batch List</h2>
            <span className="text-sm text-gray-500">
              Showing {filteredBatches.length} of {batchData.length} batches
            </span>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent mb-2"></div>
              <p>Loading batch data...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-red-100 rounded-lg border border-red-500 shadow-lg">
              <div className="flex items-center justify-center text-red-500 mb-4">
                <IoSchoolOutline className="text-4xl mr-3" />
                <h3 className="text-xl font-semibold">
                  Oops! Something went wrong
                </h3>
              </div>
              <p className="text-lg font-medium text-gray-700">{error}</p>
              <button
                onClick={() => window.location.reload()} // Reload the page or trigger a retry function
                className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto max-sm:mb-10">
              <table id="summary" className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b-2 border-gray-200 uppercase text-xs font-semibold tracking-wider">
                    <th className="py-4 px-6 text-left border-r border-gray-200">
                      #
                    </th>
                    <th className="py-4 px-6 text-left border-r border-gray-200">
                      Batch ID
                    </th>
                    <th className="py-4 px-6 text-left border-r border-gray-200">
                      Batch Name
                    </th>
                    <th className="py-4 px-6 text-center border-r border-gray-200">
                      Students
                    </th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
                  {filteredBatches.length > 0 ? (
                    filteredBatches.map((batch, index) => (
                      <tr
                        key={batch.batchId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-800 font-medium border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6 border-r border-gray-200">
                          <span
                            className="bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-medium cursor-pointer"
                            onClick={() => handleIdClick(batch.batchId)}
                          >
                            {batch.batchId}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium border-r border-gray-200">
                          {batch.batchName}
                        </td>
                        <td className="py-4 px-6 text-center border-r border-gray-200">
                          <div className="inline-flex items-center justify-center bg-yellow-50 px-3 py-1 rounded-full">
                            <IoPersonOutline className="text-yellow-600 mr-1" />
                            <span className="font-medium text-yellow-700">
                              {batch.no_of_students || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 mx-auto my-2"
                            onClick={() =>
                              handleAction(
                                batch.batchId,
                                batch.batchName,
                                batch.no_of_students
                              )
                            }
                          >
                            <IoPencilOutline className="text-sm" />
                            <span>Edit</span>
                          </button>
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mx-auto my-2"
                            onClick={() =>
                              handleDelete(batch.BatchId)
                            }
                          >
                            <AiFillDelete className="text-sm" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <IoSchoolOutline className="text-gray-300 text-5xl mb-3" />
                          <p className="text-gray-500 mb-2 text-xl font-semibold">
                            No Batches Found
                          </p>
                          <p className="text-gray-400 text-sm mb-4">
                            No batches match your search criteria. You can
                            create a new batch to get started.
                          </p>
                          <Link href="/batch-add">
                            <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all">
                              Create New Batch
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
