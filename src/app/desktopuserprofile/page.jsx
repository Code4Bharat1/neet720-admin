"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import LayoutWithNav from "@/app/mainLayout";
import AttendanceComponent from "@/components/desktopuserprofile/AttendanceComponent";
import ModeSwitcheruserProfile from "@/components/desktopuserprofile/ModeSwitcher";
import ProfileCard from "@/components/desktopuserprofile/ProfileCard";
import StatsCarddesktop from "@/components/desktopuserprofile/StatsCards";
import ModeSwitcherChart from "@/components/desktopuserprofile/Subjectwiseperformance";
import ChapterWisePerformance from "@/components/desktopuserprofile/ChapterWisePerformance";
import TestResultDownload from "@/components/desktopuserprofile/testresultdownload";
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

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/test-result`,
          {
            studentId,
          }
        );

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
    <LayoutWithNav>
      <ModeSwitcheruserProfile
        selectedMode={selectedMode}
        setSelectedMode={handleModeChange}
      />
      <section className="mt-10 p-6 space-y-8">
      <ProfileCard />
      <StatsCarddesktop />
      <AttendanceComponent selectedMode={selectedMode} />
      <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 w-full">
        {/* On mobile, stack vertically with ModeSwitcherChart on top */}
        <ModeSwitcherChart
          selectedMode={selectedMode}
          subjectTotals={subjectTotals}
        />

        <TestResultDownload />
      </div>
      </section>
    </LayoutWithNav>
  );
}
