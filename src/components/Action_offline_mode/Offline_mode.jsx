import Head from "next/head";
import React from "react";
import { MdOutlineSchedule } from "react-icons/md";
import { CiPen } from "react-icons/ci";
import { LuBookCheck } from "react-icons/lu";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaEye, FaQuestionCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";

const Home = () => {
  const router = useRouter(); 

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>Office Mode - Test Generator</title>
        <meta
          name="description"
          content="Generate and manage tests in office mode"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Header with Back Button */}
      <div className="relative">
        <div className="absolute top-6 left-6 z-10">
          <button 
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-semibold p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            onClick={() => router.back()}
          >
            <IoIosArrowBack size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <LuBookCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Test Generator</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create, manage and schedule tests with our comprehensive testing platform
          </p>
        </div>

        

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div 
            onClick={() => router.push("/test_preview")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors duration-200">
                <FaEye size={24} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Test Preview</h3>
              <p className="text-gray-600 text-sm">Preview your test before publishing</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("/offline_mode")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-200">
                <FaQuestionCircle size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Offline Mode</h3>
              <p className="text-gray-600 text-sm">Work without internet connection</p>
            </div>
          </div>

          <div 
            onClick={() => router.push("./schedule_test")}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-2 border border-gray-100"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-200">
                <MdOutlineSchedule size={24} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Schedule Test</h3>
              <p className="text-gray-600 text-sm">Set up automated test scheduling</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/generatequestionpaper")}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <FaRegCircleQuestion size={18} />
              <span>Generate Question Paper</span>
            </button>
          
            <button 
              onClick={() => router.push("/generateanswerpaper")}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1"
            >
              <CiPen size={20} />
              <span>Generate Answer Key</span>
            </button>
          </div>
        </div>

        {/* Sample Preview */}
        
      </div>
    </div>
  );
};

export default Home;