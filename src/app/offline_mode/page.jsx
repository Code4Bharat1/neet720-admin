"use client";

import React, { useState } from "react";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import OfflineTestPage from "@/components/Action_offline_mode/Offline_mode";

const Page = () => {
  const [selectedMode, setSelectedMode] = useState("Practice");

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden min-h-screen bg-white">
        <MobileNavbar />
        <main className="p-4">
          <OfflineTestPage />
        </main>
        <MobilebottomNavbar />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen bg-white">
        {/* Sidebar Section */}
        <div className="w-1/6 bg-[#007AFF]">
          <Sidebar />
        </div>

        {/* Main Content Section */}
        <div className="w-5/6 flex flex-col">
          <DesktopNavbar />
          <main className="flex-1 p-6 overflow-auto">
            <OfflineTestPage />
          </main>
        </div>
      </div>
    </>
  );
};

export default Page;
