"use client";

import StudentTestTable from "@/components/Customize test/customize";
import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobileNavbar from "@/components/mobilenav/mobilenav";


import React, { useState } from "react";


function page() {
  return (
    <div className="min-h-screen md:flex bg-white">
    <div className="md:hidden block">
      < MobileNavbar />
    </div>  

      {/* Sidebar Section */}
      <div className="md:w-1/6 bg-[#007AFF]">
        
        < Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white">
        {/* Navigation Bar */}

        < StudentTestTable />

      

        
      </div>

      
    </div>
  );
};

export default page;
