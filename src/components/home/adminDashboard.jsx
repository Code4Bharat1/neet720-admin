"use client";

import React, { useState, useEffect } from "react";
import { IoArrowUp } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation"; // ✅ MUST import this here

import ModeSwitcher from "@/components/desktopadmindashboard/modeswitcher";
import StatsCards from "@/components/desktopadmindashboard/statscards";
import TopPerformersTable from "@/components/desktopadmindashboard/TopPerformersTable";
import SpotlightOnImprovementTable from "@/components/desktopadmindashboard/spotlightonImprovementtable";
import StudentLoginStatus from "@/components/desktopadmindashboard/studentLoginStatus";
import TestResultDownload from "@/components/desktopadmindashboard/testresultdownload";
import LoginAttendance from "@/components/desktopadmindashboard/loginattendance";

export default function AdminDashboard() {
  const router = useRouter(); // ✅ defined here FIRST
  const [selectedMode, setSelectedMode] = useState("Practice");
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ Redirect to login if no valid token found
  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Optional: Check token validity (decode expiry)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("adminAuthToken");
        router.replace("/login");
      }
    } catch (err) {
      localStorage.removeItem("adminAuthToken");
      router.replace("/login");
    }
  }, [router]);

  // Dashboard Loading Animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-To-Top Visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4" />
          <h2 className="text-xl text-gray-700 font-medium">
            Loading dashboard...
          </h2>
          <p className="text-gray-500">Preparing your analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-20">
      <div className="mb-6">
        <ModeSwitcher
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
        />
      </div>

      <section className="mb-8">
        <StatsCards />
      </section>

      <section className="mb-8">
        <TopPerformersTable selectedMode={selectedMode} />
      </section>

      <section className="mb-8">
        <SpotlightOnImprovementTable selectedMode={selectedMode} />
      </section>

      <section className="flex flex-col lg:flex-row gap-6 mb-8">
        <div className="w-full lg:w-3/5">
          <StudentLoginStatus />
        </div>
        <div className="w-full lg:w-2/5">
          <TestResultDownload />
        </div>
      </section>

      <section className="mb-8">
        <LoginAttendance />
      </section>

      {/* Scroll-to-top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-20 md:bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all z-20"
            aria-label="Scroll to top"
          >
            <IoArrowUp className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
