"use client";
import React, { useEffect, useState } from "react";

// Desktop Components
import GenerateTestButton from "@/components/generatepreview/generatetestbutton";
import ImageComponent from "@/components/generatepreview/imagecomponent";
import PhysicsCard from "@/components/generatepreview/physicscard";
import ChemistryCard from "@/components/generatepreview/chemistrycard";
import BiologyCard from "@/components/generatepreview/biologycard"; // ✅ Imported BiologyCard
import Scheduletest from "@/components/generatepreview/scheduletest"; // this main create test 

// Navigation Components
import DesktopNavbar from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import MobileNavbar from "@/components/mobilenav/mobilenav";

// Mobile Components
import GenerateTestButton_mobile from "@/components/generatepreview/generatetestbutton_mobile";
import ImageComponent_mobile from "@/components/generatepreview/imagecomponenet_mobile";
import PhysicsCard_mobile from "@/components/generatepreview/physicscard_mobile";
import ChemistryCard_mobile from "@/components/generatepreview/chemistrycard_mobile";
import Scheduletest_mobile from "@/components/generatepreview/scheduletest_mobile";

function Page() {
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  function toProperCase(subject) {
    return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
  }


  useEffect(() => {
    let stored = localStorage.getItem("selectedSubjects");
    let subjectsArr = [];
    if (stored) {
      try {
        subjectsArr = JSON.parse(stored).map(toProperCase);
      } catch (error) {
        console.error("Invalid selectedSubjects JSON in localStorage");
        subjectsArr = ["Physics", "Chemistry", "Biology"]; // Fallback default
      }
    } else {
      subjectsArr = ["Physics", "Chemistry", "Biology"]; // Default if not set
    }
    // Save normalized subjects back if needed
    localStorage.setItem("selectedSubjects", JSON.stringify(subjectsArr));
    setSelectedSubjects(subjectsArr);
  }, []);


  return (
    <div className="min-h-screen md:flex bg-white overflow-x-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-1/6">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-5/6 flex flex-col h-screen">
        {/* Desktop Navbar */}
        <div className="hidden md:block">
          <DesktopNavbar />
        </div>

        {/* Desktop Content */}
        <main className="hidden md:block flex-1 overflow-y-auto p-4">
          <GenerateTestButton />
          <div className="flex justify-end">
            <ImageComponent />
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-4xl mx-auto">
            {selectedSubjects.includes("Physics") && <PhysicsCard />}
            {selectedSubjects.includes("Chemistry") && <ChemistryCard />}
            {selectedSubjects.includes("Biology") && <BiologyCard />}
          </div>

          <Scheduletest />
        </main>

        {/* Mobile Content */}
        <main className="block md:hidden">
          <MobileNavbar />

          <div className="p-4 space-y-4 pb-20">
            <GenerateTestButton_mobile />
            <ImageComponent_mobile />
            <PhysicsCard_mobile />
            <ChemistryCard_mobile />
            <Scheduletest_mobile />
          </div>

          <MobilebottomNavbar />
        </main>
      </div>
    </div>
  );
}

export default Page;
