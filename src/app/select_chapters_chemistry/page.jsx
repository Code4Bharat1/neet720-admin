"use client";

import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import ChemistryChapterList from "@/components/select_chapters_chemistry/chemchapterlist/ChapterList";
import MobilechemistryChapterList from "@/components/select_chapters_chemistry/chemchapterlist/mobilechapterlist";
import ChemistryFirstPart from "@/components/select_chapters_chemistry/chemfirstpart/firstpart";
import MobileChemistryFirstPart from "@/components/select_chapters_chemistry/chemfirstpart/mobilefirstpart";
import ChemLastnav from "@/components/select_chapters_chemistry/chemlastnav/lastnav";
import ChemLastnavMobile from "@/components/select_chapters_chemistry/chemlastnav/mobilelastnav";



import React from "react";

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
          <ChemistryFirstPart/>
          <ChemistryChapterList/>
          <ChemLastnav/>
     
      <div className=" block md:hidden">
      <MobileChemistryFirstPart/>
      <MobilechemistryChapterList/>
      <ChemLastnavMobile/>

      </div> 
      </div>
    </div>
</div>
  );
}
