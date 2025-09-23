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
import LayoutWithNav from "../mainLayout";
import React from "react";

export default function Home() {
  return (
    <LayoutWithNav>
      <PhysicsFirstPart />
      <PhysicsChapterList />
      <PhysicsLastnav />
    </LayoutWithNav>
  );
}
