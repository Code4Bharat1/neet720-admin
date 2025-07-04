"use client";
import React from "react";

import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import PaperInstruction1_mobile from "@/components/paperinstruction1/paperinstruction1_mobile";
import PaperInstruction1 from "@/components/paperinstruction1/paperinstruction1";


function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Container for Desktop and Mobile view */}
      <div className="md:flex ">

        {/* Desktop Sidebar Section (visible on md+) */}
        <div className="md:w-1/6 bg-[#007AFF]">
          <Sidebar />
        </div>

        {/* Desktop content Section */}
        <div className="w-full md:w-5/6 h-screen bg-white">
          {/* Desktop Navbar (hidden on mobile) */}
          <DesktopNavbar />

          {/* Page Content (Desktop View) */}
          <main className="hidden md:block">
            <PaperInstruction1 />
          </main>

          {/* Mobile View */}
          <div className="block md:hidden mb-20">
            {/* Mobile Navbar */}
            <MobileNavbar />
            <PaperInstruction1_mobile/>
            <MobilebottomNavbar />

            {/* Mobile Bottom Navbar */}
            

            {/* Page Content */}
            {/* <PaperInstruction1 /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
