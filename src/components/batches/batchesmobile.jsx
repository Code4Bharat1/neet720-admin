"use client";
import React, { useState, useEffect } from "react";
import { CiImageOn } from "react-icons/ci";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import axios from "axios"; // For fetching data from the backend

export default function Batches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [batchData, setBatchData] = useState([]);
  const [error, setError] = useState("");

  // Fetch batches from the backend
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/getbatch`);
        setBatchData(response.data.batchData); // Assuming response contains batchData
      } catch (error) {
        setError("Error fetching batch data: " + (error.response?.data?.message || error.message));
      }
    };
    fetchBatches();
  }, []);

  // Filter batches based on the search query
  const filteredBatches = batchData.filter((batch) =>
    batch.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.batchName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 overflow-hidden">
      {/* Search Bar */}
      <div className="flex justify-center mt-6 mb-4">
        <div className="relative w-full sm:flex-1 max-w-xl">
          <CiSearch className="bg-[#007AFF] left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
          <input
            type="text"
            placeholder="Search by Batch ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update the search query
            className="w-full h-[60px] pl-12 pr-4 border border-[#BBBBBB] rounded-[10px] shadow-[0px_4px_6px_0px_#00000040] focus:outline-none text-gray-700"
          />
        </div>
      </div>

      {/* BATCHES Count */}
      <div className="flex justify-center md:justify-start pt-6">
        <div className="w-[150px] h-[60px] border border-gray-400 rounded-lg shadow-[0px_4px_6px_0px_rgba(0,0,0,0.26)] text-[#979797] text-center flex justify-center items-center font-">
          BATCHES
        </div>
      </div>

      {/* Batches Count Card & New Batch Button */}
      <div className="relative flex flex-wrap items-center justify-between mt-8 px-4">
        {/* Batches Count Card */}
        <div className="w-[200px] sm:w-[250px] bg-white rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-sm sm:text-lg font-semibold text-black flex items-center">
              <CiImageOn className="w-5 h-5 mr-2 text-black" />
              Batches Count
            </h3>
            <span className="bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
              {batchData.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-lg mt-2">
            <img
              src="test.png"
              alt="Test Created"
              className="w-full h-20 sm:h-28 object-cover rounded-lg"
            />
          </div>
        </div>

        {/* New Batch Button */}
        <Link href="/batchesedit">
          <button className="w-[150px] h-[40px] md:w-[200px] md:h-[43px] bg-blue-500 opacity-90 rounded-md flex items-center justify-center text-white font-bold text-sm mt-4 md:mt-0">
            + New Batch
          </button>
        </Link>
      </div>

      {/* Batch Table Component */}
      <BatchTable batches={filteredBatches} />
    </div>
  );
}

// Batch Table Component
function BatchTable({ batches }) {
  return (
    <div className="mt-6 overflow-x-auto w-full">
      <table className="w-full min-w-[400px] border-collapse border border-gray-300 rounded-lg">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm md:text-base">
            <th className="border border-gray-300 px-2 py-2 md:px-4">SR.NO</th>
            <th className="border border-gray-300 px-2 py-2 md:px-4">BATCH ID</th>
            <th className="border border-gray-300 px-2 py-2 md:px-4">BATCH NAME</th>
            <th className="border border-gray-300 px-2 py-2 md:px-4">NO. OF STUDENTS</th>
            <th className="border border-gray-300 px-2 py-2 md:px-4">ACTIONS</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {batches.length > 0 ? (
            batches.map((batch, index) => (
              <tr key={batch.batchId} className="text-center text-sm md:text-base">
                <td className="border border-gray-300 px-2 py-2 md:px-4">{index + 1}</td>
                <td className="border border-gray-300 px-2 py-2 md:px-4">{batch.batchId}</td>
                <td className="border border-gray-300 px-2 py-2 md:px-4">{batch.batchName}</td>
                <td className="border border-gray-300 px-2 py-2 md:px-4">{batch.no_of_students}</td>
                <td className="border border-gray-300 px-2 py-2 md:px-4">
                  <Link href={`/batches_edit/${batch.batchId}`}>
                    <button className="bg-yellow-400 text-white px-3 py-1 rounded-md text-xs md:text-sm">
                      Edit Batch
                    </button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No matching batches found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
