"use client";
//import Home from "@/components/Action_offline_mode/Offline_mode";
//import MobileNavbar from "C:/Users/user/Desktop/EP_Admin_Frontend/src/components/moblieadminnav/nav.jsx";

import React, { useState } from "react";
import Mobile_Offline_mode from "@/components/Moblie/moblie_offline_mode";

import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import Home from "@/components/Action_offline_mode/Offline_mode";

const Page = () => {
  const [selectedMode, setSelectedMode] = useState("Practice"); // State to track selected mode

  return (
    <div className="min-h-screen md:flex bg-white">
      <div className="md:hidden block">
        <MobilebottomNavbar/>
        <Mobile_Offline_mode />
        <MobilebottomNavbar />
      </div>

      {/* Sidebar Section */}
      <div className="md:w-1/6 bg-[#007AFF]">
        <Sidebar/>
      </div>
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        {/* Navigation Bar */}
        <DesktopNavbar />

        <main className="hidden md:block">
          <Home />
        </main>
      </div>
    </div>
  );
};

export default Page;
