"use client";

import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import PhysicsChapterList from "@/components/select_chapters_physics/physicschapterlist/ChapterList";
import MobilephysicsChapterList from "@/components/select_chapters_physics/physicschapterlist/mobilechapterlist";
import PhysicsFirstPart from "@/components/select_chapters_physics/physicsfirstpart/firstpart";
import MobilePhysicsFirstPart from "@/components/select_chapters_physics/physicsfirstpart/mobilefirstpart";
import PhysicsLastnav from "@/components/select_chapters_physics/physicslastnav/lastnav";
import PhysicsLastnavmobile from "@/components/select_chapters_physics/physicslastnav/mobilelastnav";

import React from "react";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Section */}
      <div className="md:w-1/6">
        <Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="w-full md:w-5/6 md:flex-1 h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="flex-shrink-0">
          <DesktopNavbar />
        </div>
        <div>
          <MobileNavbar />
        </div>
        <div>
          <MobilebottomNavbar />
        </div>
        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto block">
          <PhysicsFirstPart />
          <PhysicsChapterList />
          <PhysicsLastnav />
          
        <div className="md:hidden">
            <MobilePhysicsFirstPart />
            <MobilephysicsChapterList />
            <PhysicsLastnavmobile />
          </div>
        </div>
      </div>
    </div>
  );
}
