"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import AttendanceComponent from "@/components/desktopuserprofile/AttendanceComponent";
import ModeSwitcheruserProfile from "@/components/desktopuserprofile/ModeSwitcher";
import ProfileCard from "@/components/desktopuserprofile/ProfileCard";
import StatsCarddesktop from "@/components/desktopuserprofile/StatsCards";
import ModeSwitcherChart from "@/components/desktopuserprofile/Subjectwiseperformance";
import ChapterWisePerformance from "@/components/desktopuserprofile/ChapterWisePerformance";
import TestResultDownload from "@/components/desktopuserprofile/testresultdownload";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import Loading from "@/components/Loading/Loading";

export default function Page() {
  const [selectedMode, setSelectedMode] = useState("Practice");
  const [subjectTotals, setSubjectTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjectTotals = async () => {
      try {
        const studentId = localStorage.getItem("studentId");
        if (!studentId) {
          console.log("Student ID is missing");
          setLoading(false);
          return;
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-result`, {
          studentId,
        });

        setSubjectTotals(response.data.data.subjectTotals || {});
      } catch (error) {
        console.error("Error fetching subject totals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectTotals();
  }, []);

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Sidebar (Desktop Only) */}
      <aside className="hidden md:block md:w-1/6">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full h-full">
        <DesktopNavbar />

        <main className="hidden md:block px-6 py-4">
          <ModeSwitcheruserProfile
            selectedMode={selectedMode}
            setSelectedMode={handleModeChange}
          />

          <section className="max-w-6xl mx-auto bg-white shadow rounded-lg mt-10 p-6 space-y-8">
            <ProfileCard />
            <StatsCarddesktop />
            <AttendanceComponent selectedMode={selectedMode} />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <TestResultDownload />
              <ModeSwitcherChart
                selectedMode={selectedMode}
                subjectTotals={subjectTotals}
              />
            </div>
          </section>
        </main>

        {/* Mobile View */}
        <main className="block md:hidden">
          <MobileNavbar />
          <div className="p-4">
            {/* Add mobile-optimized content if needed */}
          </div>
          <MobilebottomNavbar />
        </main>
      </div>
    </div>
  );
}
