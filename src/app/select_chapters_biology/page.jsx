"use client";

import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";

import BioFirstPart from "@/components/select_chapters_bio/biofirstpart/firstpart";
import MobileBioFirstPart from "@/components/select_chapters_bio/biofirstpart/mobilefirstpart";
import BiologyChapterList from "@/components/select_chapters_bio/biochapterlist/ChapterList";
import MobileBiologyChapterList from "@/components/select_chapters_bio/biochapterlist/mobilechapterlist";
import BioLastnavDesktop from "@/components/select_chapters_bio/biolastnav/lastnav";


import React from "react";
import BioLastnavMobile from "@/components/select_chapters_bio/biolastnav/mobilelastnav";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Section */}
      <div className="md:w-1/6 bg-[#007AFF]">
        <Sidebar/>
      </div>

      {/* Main Content Section */}
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="flex-shrink-0">
          <DesktopNavbar />
        </div>
        <div>
          <MobileNavbar/>
        </div>
        <div>
          <MobilebottomNavbar />
        </div>
        <div >
        
        </div>
        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto  ">
          <BioFirstPart/>
          <BiologyChapterList/>
          <BioLastnavDesktop/>
     
      <div className=" block md:hidden">
      <MobileBioFirstPart/>
      <MobileBiologyChapterList/>
      <BioLastnavMobile/>
      </div> 
      </div>
    </div>
</div>
  );
}
