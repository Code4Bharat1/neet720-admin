"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Papa from "papaparse"; // To parse CSV files

const UpdateBatchForm = () => {

  
  const [batchId, setBatchId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [noOfStudents, setNoOfStudents] = useState(""); 
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("update"); // "update" or "add"

  const handleBatchIdChange = (e) => setBatchId(e.target.value);
  const handleBatchNameChange = (e) => setBatchName(e.target.value);
  const handleNoOfStudentsChange = (e) => setNoOfStudents(e.target.value);
  const handleFileChange = (e) => setFile(e.target.files[0]);


  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedBatchId = localStorage.getItem("batchId");
        const savedBatchName = localStorage.getItem("batchName");
        const savedNoOfStudents = localStorage.getItem("noOfStudents");
  
        if (savedBatchId) setBatchId(savedBatchId);
        if (savedBatchName) setBatchName(savedBatchName);
        if (savedNoOfStudents) setNoOfStudents(savedNoOfStudents);
      } catch (error) {
        console.error("Error accessing localStorage:", error);
      }
    }
  }, []);

  const resetForm = () => {
    setBatchId("");
    setBatchName("");
    setNoOfStudents("");
    setFile(null);
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validate the fields
    if (!batchId || !batchName || !noOfStudents) {
      setError("Batch ID, Batch Name, and Number of Students are required");
      setIsLoading(false);
      return;
    }

    if (!file) {
      setError("Please select a CSV file");
      setIsLoading(false);
      return;
    }

    // Read the CSV file
    Papa.parse(file, {
      complete: async (result) => {
        const emailAddresses = result.data.map((row) => row[0]); // Assuming email is in the first column of the CSV

        if (emailAddresses.length === 0) {
          setError("No email addresses found in the CSV file");
          setIsLoading(false);
          return;
        }

        try {
          // Send the emails, batchId, and batchName to the backend
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/update`, {
            emails: emailAddresses,
            batchId: batchId,
            batchName: batchName,
          });

          setSuccessMessage(response.data.message); // Assuming backend sends a message in response
          setTimeout(() => resetForm(), 3000); // Reset form after 3 seconds
        } catch (error) {
          const errorMessage = error.response?.data?.message || error.message || "Error updating batch";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
      header: false, // We don't expect headers in the CSV
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      }
    });
  };

  // Adding a batch with just batchId, batchName, and noOfStudents
  const handleAddBatch = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validate if batch details are provided
    if (!batchId || !batchName || !noOfStudents) {
      setError("Batch ID, Batch Name, and Number of Students are required");
      setIsLoading(false);
      return;
    }

    try {
      let token = "";
      if (typeof window !== "undefined") {
        token=localStorage.getItem("adminAuthToken");
      }
      // Send the batch details to the backend to create a new batch
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/batch`,
        {
          batchId: batchId,
          batchName: batchName,
          no_of_students: noOfStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      

      setSuccessMessage(response.data.message); // Assuming backend sends a message in response
      setTimeout(() => resetForm(), 3000); // Reset form after 3 seconds
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error creating batch";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and download template Excel file
  const downloadTemplate = () => {
    // Create CSV content
    const csvContent = "Email Address\n"; // Header
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    
    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "student_email_template.csv");
    document.body.appendChild(link);
    
    // Start download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white border border-gray-200 rounded-lg shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Batch Management</h2>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none ${
            activeTab === "update" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("update")}
        >
          Update Existing Batch
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm focus:outline-none ${
            activeTab === "add" 
              ? "border-b-2 border-blue-600 text-blue-600" 
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("add")}
        >
          Add New Batch
        </button>
      </div>

      <form onSubmit={activeTab === "update" ? handleSubmit : handleAddBatch}>
        {/* Batch ID */}
        <div className="mb-5">
          <label htmlFor="batchId" className="block text-sm font-medium text-gray-700 mb-1">Batch ID</label>
          <input
            type="text"
            id="batchId"
            name="batchId"
            value={batchId}
            onChange={handleBatchIdChange}
            required
            placeholder="Enter batch ID"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Batch Name */}
        <div className="mb-5">
          <label htmlFor="batchName" className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
          <input
            type="text"
            id="batchName"
            name="batchName"
            value={batchName}
            onChange={handleBatchNameChange}
            required
            placeholder="Enter batch name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Number of Students */}
        <div className="mb-5">
          <label htmlFor="noOfStudents" className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
          <input
            type="number"
            id="noOfStudents"
            name="noOfStudents"
            value={noOfStudents}
            onChange={handleNoOfStudentsChange}
            required
            placeholder="Enter number of students"
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* File Upload - Only show in Update tab */}
        {activeTab === "update" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">Upload CSV File</label>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Template
              </button>
            </div>
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">CSV file with student emails</p>
                </div>
                <input 
                  id="file" 
                  type="file" 
                  aaccept=".csv,text/csv"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 text-white font-medium rounded-lg text-center ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : activeTab === "update" 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-green-600 hover:bg-green-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              activeTab === "update" ? "focus:ring-blue-500" : "focus:ring-green-500"
            } transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : activeTab === "update" ? (
              "Update Batch"
            ) : (
              "Add New Batch"
            )}
          </button>
        </div>
      </form>

      {/* Messages */}
      {error && (
        <div className="mt-6 p-4 border-l-4 border-red-500 bg-red-50 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mt-6 p-4 border-l-4 border-green-500 bg-green-50 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Fill in all required fields: Batch ID, Batch Name, and Number of Students.</li>
          <li>For batch updates, upload a CSV file containing student email addresses.</li>
          <li>You can download a template CSV file by clicking on "Download Template".</li>
          <li>Each email address should be on a separate row in the CSV file.</li>
        </ul>
      </div>
    </div>
  );
};

export default UpdateBatchForm;