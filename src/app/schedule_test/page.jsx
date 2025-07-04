"use client";

//import MobileNavbar from "C:/Users/user/Desktop/EP_Admin_Frontend/src/components/moblieadminnav/nav.jsx";

import React, { useState } from "react";


import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Sidebar from "@/components/desktopsidebar/sidebar";
import DesktopNavbar from "@/components/desktopnav/nav";
import Schedule_test from "@/components/Schedule_test/Schedule_test";
import Mobile_schedule_test from "@/components/Moblie/moblie_schedule_test";
import MobileNavbar from "@/components/Moblieadminnav/nav";


const Page = () => {
  const [selectedMode, setSelectedMode] = useState("Practice"); // State to track selected mode


  return (
    <div className="min-h-screen md:flex bg-white">
    <div className="md:hidden block">
      
      <MobileNavbar/>
      <Mobile_schedule_test/>
      <MobilebottomNavbar/>
     
    </div>  

      {/* Sidebar Section */}
      <div className="md:w-1/6 bg-[#007AFF]">
        <Sidebar/>
      </div>
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        {/* Navigation Bar */}
        <DesktopNavbar/>
        

        <main className="hidden md:block">
          
            <Schedule_test/>
          
        </main>

    
    </div>
    </div>
  );
};

export default Page;