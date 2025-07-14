"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Mail, Plus, X, Check, AlertCircle, BookOpen, UserPlus, Edit3, Loader2 } from "lucide-react"

const UpdateBatchForm = () => {
  const [batchId, setBatchId] = useState("")
  const [batchName, setBatchName] = useState("")
  const [noOfStudents, setNoOfStudents] = useState("")
  const [emailAddresses, setEmailAddresses] = useState([""])
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("update")

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedBatchId = localStorage.getItem("batchId")
        const savedBatchName = localStorage.getItem("batchName")
        const savedNoOfStudents = localStorage.getItem("noOfStudents")
        if (savedBatchId) setBatchId(savedBatchId)
        if (savedBatchName) setBatchName(savedBatchName)
        if (savedNoOfStudents) setNoOfStudents(savedNoOfStudents)
      } catch (error) {
        console.error("Error accessing localStorage:", error)
      }
    }
  }, [])

  const resetForm = () => {
    setBatchId("")
    setBatchName("")
    setNoOfStudents("")
    setEmailAddresses([""])
    setError("")
    setSuccessMessage("")
  }

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emailAddresses]
    updatedEmails[index] = value
    setEmailAddresses(updatedEmails)
  }

  const addEmailField = () => {
    setEmailAddresses([...emailAddresses, ""])
  }

  const removeEmailField = (index) => {
    const updatedEmails = emailAddresses.filter((_, i) => i !== index)
    setEmailAddresses(updatedEmails)
  }

  const handleUpdateBatch = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    if (!batchId || !batchName || !emailAddresses.length || emailAddresses.some((e) => e.trim() === "")) {
      setError("All fields including email addresses must be filled")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/update`, {
        emails: emailAddresses,
        batchId,
        batchName,
      })
      setSuccessMessage(response.data.message)
      setTimeout(() => resetForm(), 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error updating batch"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBatch = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    if (!batchId || !batchName || !noOfStudents) {
      setError("Batch ID, Batch Name, and Number of Students are required")
      setIsLoading(false)
      return
    }

    try {
      let token = ""
      if (typeof window !== "undefined") {
        token = localStorage.getItem("adminAuthToken")
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/batch`,
        {
          batchId,
          batchName,
          no_of_students: noOfStudents,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setSuccessMessage(response.data.message)
      setTimeout(() => resetForm(), 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error creating batch"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <motion.div className="max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Batch Management</h1>
          <p className="text-gray-600 text-lg">Manage your student batches efficiently</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          variants={itemVariants}
        >
          {/* Tab Navigation */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
              <button
                className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 relative ${
                  activeTab === "update"
                    ? "text-blue-600 bg-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("update")}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Update Existing Batch</span>
                </div>
                {activeTab === "update" && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" layoutId="activeTab" />
                )}
              </button>
              <button
                className={`flex-1 py-4 px-6 font-semibold text-sm transition-all duration-300 relative ${
                  activeTab === "add" ? "text-blue-600 bg-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("add")}
              >
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Batch</span>
                </div>
                {activeTab === "add" && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" layoutId="activeTab" />
                )}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.form
                key={activeTab}
                onSubmit={activeTab === "update" ? handleUpdateBatch : handleAddBatch}
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Batch ID Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Batch ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter batch ID"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Batch Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Batch Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter batch name"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Conditional Content */}
                {activeTab === "add" ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Number of Students</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        placeholder="Enter number of students"
                        value={noOfStudents}
                        onChange={(e) => setNoOfStudents(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">Student Email Addresses</label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {emailAddresses.length} email{emailAddresses.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      <AnimatePresence>
                        {emailAddresses.map((email, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                placeholder={`Student email ${index + 1}`}
                                value={email}
                                onChange={(e) => handleEmailChange(index, e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                              />
                            </div>
                            {emailAddresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEmailField(index)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      onClick={addEmailField}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add another email</span>
                    </button>
                  </div>
                )}

                {/* Error and Success Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Check className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {activeTab === "update" ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                        <span>{activeTab === "update" ? "Update Batch" : "Create Batch"}</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Additional Info Cards */}
        <motion.div className="grid md:grid-cols-2 gap-6 mt-8" variants={itemVariants}>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Update Batch</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Modify existing batch details and manage student email addresses for seamless communication.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Create Batch</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Set up new student batches with essential information to organize your educational programs.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default UpdateBatchForm
