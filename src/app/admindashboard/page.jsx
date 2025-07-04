"use client";

import React, { useState, useEffect } from "react";
import { IoArrowUp } from "react-icons/io5";
import { HiOutlineRefresh } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";

// Import components
import ModeSwitcher from "@/components/desktopadmindashboard/modeswitcher";
import StatsCards from "@/components/desktopadmindashboard/statscards";
import TopPerformersTable from "@/components/desktopadmindashboard/TopPerformersTable";
import SpotlightOnImprovementTable from "@/components/desktopadmindashboard/spotlightonImprovementtable";
import StudentLoginStatus from "@/components/desktopadmindashboard/studentLoginStatus";
import TestResultDownload from "@/components/desktopadmindashboard/testresultdownload";
import LoginAttendance from "@/components/desktopadmindashboard/loginattendance";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import ModeSwitchermobile from "@/components/mobileadmindashboard/modeswitcher";
import StatsCardsmobile from "@/components/mobileadmindashboard/statscards";
import TopPerformersTablemobile from "@/components/mobileadmindashboard/TopPerformersTable";
import SpotlightOnImprovementTablemobile from "@/components/mobileadmindashboard/spotlightonImprovementtable";
import TestResultDownloadmobile from "@/components/mobileadmindashboard/testresultdownload";
import StudentActivityCardmobile from "@/components/mobileadmindashboard/studentLoginStatus";

export default function Page() {
  const [selectedMode, setSelectedMode] = useState("Practice");
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dateRange, setDateRange] = useState("week"); // For filtering data

  // Simulate initial loading
  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Refresh dashboard data
  const refreshDashboard = () => {
    setLoading(true);
    // In a real implementation, you would re-fetch all data here
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // If loading, show loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
          <h2 className="text-xl text-gray-700 font-medium">Loading dashboard...</h2>
          <p className="text-gray-500">Preparing your analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex bg-gray-50">
      {/* Desktop Sidebar Section (visible on md+) */}
      <div className="md:w-1/6 bg-[#007AFF]">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-5/6 bg-gray-50 min-h-screen transition-all duration-300">
        {/* Desktop Navbar (hidden on mobile) */}
        <div className="hidden md:block sticky top-0 z-10">
          <DesktopNavbar />
        </div>

        

        {/* Page Content - Desktop */}
        <div className="hidden md:block px-6 pb-20">
          {/* Mode Switcher */}
          <div className="mb-6">
            <ModeSwitcher selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
          </div>

          {/* Stats Cards */}
          <section className="mb-8">
            <StatsCards />
          </section>

          {/* Tables Section */}
          <section className="mb-8">
            <TopPerformersTable selectedMode={selectedMode} />
          </section>
          
          <section className="mb-8">
            <SpotlightOnImprovementTable selectedMode={selectedMode} />
          </section>

          {/* Two Column Layout for Login Status and Test Results */}
          <section className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="w-full lg:w-3/5">
              <StudentLoginStatus />
            </div>
            <div className="w-full lg:w-2/5">
              <TestResultDownload />
            </div>
          </section>

          {/* Attendance Chart */}
          <section className="mb-8">
            <LoginAttendance />
          </section>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          {/* Mobile Navs */}
          <div className="sticky top-0 z-10">
            <MobileNavbar />
          </div>
          
          {/* Refresh Button (Mobile) */}
          <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-gray-200 mb-4">
            <button 
              onClick={refreshDashboard}
              className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
            >
              <HiOutlineRefresh className="text-xl" />
            </button>
            
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
          
          {/* Page Content */}
          <div className="px-4 pb-20">
            <div className="mb-4">
              <ModeSwitchermobile selectedMode={selectedMode} setSelectedMode={setSelectedMode} />
            </div>
            
            <section className="mb-6">
              <StatsCardsmobile />
            </section>
            
            <section className="mb-6">
              <TopPerformersTablemobile selectedMode={selectedMode} />
            </section>
            
            <section className="mb-6">
              <SpotlightOnImprovementTablemobile selectedMode={selectedMode} />
            </section>
            
            <section className="mb-6">
              <StudentActivityCardmobile />
            </section>
            
            <section className="mb-6">
              <TestResultDownloadmobile />
            </section>
          </div>

          {/* Mobile Bottom Nav */}
          <div className="fixed bottom-0 left-0 w-full z-10">
            <MobilebottomNavbar />
          </div>
        </div>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={scrollToTop}
              className="fixed bottom-20 md:bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-20"
              aria-label="Scroll to top"
            >
              <IoArrowUp className="text-xl" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}