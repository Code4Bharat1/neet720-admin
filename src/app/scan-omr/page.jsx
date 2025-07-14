'use client';

import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '@/components/desktopsidebar/sidebar';
import DesktopNavbar from '@/components/desktopnav/nav';
import MobileNavbar from '@/components/mobilenav/mobilenav';
import MobilebottomNavbar from '@/components/mobilenav/MobileBottomNavbar';
import { useRef } from 'react';

const Page = () => {
  const [studentName, setStudentName] = useState('');
  const [testName, setTestName] = useState('');
  const [originalFiles, setOriginalFiles] = useState([]);
  const [studentFiles, setStudentFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleEvaluate = async (e) => {
    e.preventDefault();

    if (!studentName || !testName || originalFiles.length === 0 || studentFiles.length === 0) {
      alert("Please fill in all fields and upload both original and student OMR files.");
      return;
    }

    const formData = new FormData();
    formData.append('studentName', studentName);
    formData.append('testName', testName);
    originalFiles.forEach(file => formData.append('original', file));
    studentFiles.forEach(file => formData.append('student', file));

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/evaluate-omr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data);
    } catch (error) {
      console.error('Error evaluating:', error.response?.data || error.message);
      alert('Evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMarks = async () => {
    if (!result) {
      alert("Please evaluate the OMR first.");
      return;
    }

    try {
      setSubmitLoading(true);

      const totalScore = result.totalScore;
      const totalQuestions = result.pages.reduce((sum, page) => sum + page.questions.length, 0);
      const allQuestions = result.pages.flatMap(page => page.questions);

      let correct = 0, incorrect = 0, unattempted = 0;
      const answers = [];

      allQuestions.forEach(q => {
        answers.push(q.studentAnswer ?? null);
        if (q.studentAnswer === null || q.studentAnswer === -1) {
          unattempted++;
        } else if (q.status === 'correct') {
          correct++;
        } else {
          incorrect++;
        }
      });

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/omr-marks`, {
        studentemail: studentName,
        testname: testName,
        answers,
        score: totalScore,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        unattempted,
        totalquestions: totalQuestions,
        overallMarks: totalScore
      });

      alert("Result saved successfully!");

    } catch (error) {
      console.error('Error saving marks:', error.response?.data || error.message);
      alert('Saving marks failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Sidebar/>
      <div className="hidden max-sm:block relative top-0 left-0 w-full h-16 bg-white shadow-md z-50">
        <MobileNavbar />
        <MobilebottomNavbar />
      </div>
      <div>
        <div className="">
          <DesktopNavbar/>
          <div className='ml-65 p-8 max-md:ml-0 max-sm:p-3'>
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                OMR Scanner
              </h1>
              <p className="text-gray-600">Upload and evaluate OMR sheets with advanced scanning technology</p>
            </div>

            {/* Main Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 w-full rounded-full mb-6"></div>
              
              <form onSubmit={handleEvaluate} className="space-y-8">
                {/* Student Email Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Student Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-4 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter student email address"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Test Name Input */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    Test Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 p-4 rounded-xl transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
                      placeholder="Enter test name"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Original OMR Upload */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                      Upload Original OMR Sheets
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setOriginalFiles([...e.target.files])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-gray-600 font-medium">Click to upload original OMR sheets</p>
                        <p className="text-sm text-gray-400 mt-1">Or drag and drop files here</p>
                        {originalFiles.length > 0 && (
                          <p className="text-blue-600 font-semibold mt-2">{originalFiles.length} file(s) selected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student OMR Upload */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-purple-600 transition-colors">
                      Upload Student OMR Sheets
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => setStudentFiles([...e.target.files])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-300 hover:border-purple-400 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-8 text-center transition-all duration-300 hover:shadow-lg">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <p className="text-gray-600 font-medium">Click to upload student OMR sheets</p>
                        <p className="text-sm text-gray-400 mt-1">Or drag and drop files here</p>
                        {studentFiles.length > 0 && (
                          <p className="text-purple-600 font-semibold mt-2">{studentFiles.length} file(s) selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evaluate Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Evaluating OMR Sheets...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Evaluate OMR Sheets
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-2xl p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Evaluation Complete!</h2>
                      <p className="text-green-100">OMR sheets have been successfully processed</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">{result.totalScore}</div>
                      <div className="text-xl opacity-90">/ {result.maxScore}</div>
                      <div className="text-sm text-green-100">Total Score</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Results */}
                <div className="space-y-6">
                  {result.pages.map((page, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                      {/* Page Header */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold">Page {page.page}</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{page.score} / {page.maxScore}</div>
                            <div className="text-sm opacity-90">Page Score</div>
                          </div>
                        </div>
                      </div>

                      {/* Questions Table */}
                      <div className="p-6">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <th className="border-2 border-gray-300 px-4 py-3 text-gray-700 font-bold">Question #</th>
                                <th className="border-2 border-gray-300 px-4 py-3 text-gray-700 font-bold">Correct Answer</th>
                                <th className="border-2 border-gray-300 px-4 py-3 text-gray-700 font-bold">Student Answer</th>
                                <th className="border-2 border-gray-300 px-4 py-3 text-gray-700 font-bold">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {page.questions.map((q, i) => (
                                <tr key={i} className={`transition-colors ${q.status === 'correct' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'}`}>
                                  <td className="border-2 border-gray-300 px-4 py-3 text-center font-semibold">{q.question}</td>
                                  <td className="border-2 border-gray-300 px-4 py-3 text-center font-bold text-blue-600">{q.correctAnswer}</td>
                                  <td className="border-2 border-gray-300 px-4 py-3 text-center font-bold">
                                    {q.studentAnswer !== null ? (
                                      <span className={q.status === 'correct' ? 'text-green-600' : 'text-red-600'}>
                                        {q.studentAnswer}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">Not Attempted</span>
                                    )}
                                  </td>
                                  <td className="border-2 border-gray-300 px-4 py-3 text-center">
                                    {q.status === 'correct' ? (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Correct
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Incorrect
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    onClick={handleSubmitMarks}
                    disabled={submitLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {submitLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Results...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Marks to Database
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;