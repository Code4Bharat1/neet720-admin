"use client";

import React, { useState } from "react";

import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import TestPreview from "@/components/Action_test_preview/Test_preview";
import MobileNavbar from "@/components/mobilenav/mobilenav";

const Page = () => {
  const [selectedMode, setSelectedMode] = useState("Practice");

  return (
    <div className="min-h-screen md:flex bg-white">
      {/* Mobile View */}
      <div className="md:hidden block relative">
        <MobileNavbar />
        {/* add bottom padding so content is not hidden behind fixed bottom navbar */}
        <div className="pb-16">
          <TestPreview />
        </div>
        <div className="fixed bottom-0 left-0 w-full">
          <MobilebottomNavbar />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex w-full">
        {/* Sidebar Section */}
        <div className="md:w-1/6">
          <Sidebar />
        </div>
        <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
          <DesktopNavbar />
          <main>
            <TestPreview />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Page;
