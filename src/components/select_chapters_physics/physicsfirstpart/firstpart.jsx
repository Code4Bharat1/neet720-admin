"use client";
import React, { useState } from "react";
import { BsSearch, BsBook, BsGraphUp } from "react-icons/bs";
import { FiChevronDown, FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PhysicsFirstPart() {

  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  // const [selectedSubject, setSelectedSubject] = useState("");

  const handleSubjectClick =(subject) =>{
    console.log(subject);
    if(subject) {
      router.push(`/select_chapters_${subject}`);
    }
  }

  return (
    <section className="font-['Segoe_UI'] bg-gray-50 rounded-xl shadow-sm p-6 mb-6">
      {/* Top Section with Generate Test Button and Title */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition flex items-center gap-2 font-medium"
        >
          <span className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <FiSettings className="text-lg" />
          </span>
          Generate Test
        </motion.button>

        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-gray-800 flex items-center gap-2"
        >
          <span className="bg-blue-500 p-1.5 rounded-full text-white shadow-sm">
            <BsBook className="text-lg" />
          </span>
          Select Physics Chapters
        </motion.h1>

        <div>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </div>
      </div>

      {/* Subject-wise Marks Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
              <BsGraphUp className="text-xl" />
            </div>
            <h2 className="text-lg font-medium text-gray-800">Subject-wise Marks</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="bg-blue-50 cursor-pointer border-2 border-blue-600 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2" onClick={()=> handleSubjectClick("physics")}>
              <span className="bg-blue-600 w-3 h-3 rounded-full"></span>
              Physics
            </div>
            <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border cursor-pointer border-purple-100 font-medium flex items-center gap-2" onClick={()=>handleSubjectClick("chemistry")}>
              <span className="bg-purple-600 w-3 h-3 rounded-full"></span>
              Chemistry 
            </div>
            <div className="bg-green-50 cursor-pointer text-green-700 px-4 py-2 rounded-lg border border-green-100 font-medium flex items-center gap-2">
              <span className="bg-green-600 w-3 h-3 rounded-full"></span>
              Biology 
            </div>
          </div>
        </div>
      </motion.div>

      {/* Select Chapters and Search Bar Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        

        
      </motion.div>
      
     
      
    </section>
  );
}