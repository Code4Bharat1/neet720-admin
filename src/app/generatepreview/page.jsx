"use client";
import React, { useEffect, useState } from "react";

// Desktop Components
import GenerateTestButton from "@/components/generatepreview/generatetestbutton";
import ImageComponent from "@/components/generatepreview/imagecomponent";
import PhysicsCard from "@/components/generatepreview/physicscard";
import ChemistryCard from "@/components/generatepreview/chemistrycard";
import BiologyCard from "@/components/generatepreview/biologycard"; // ✅ Imported BiologyCard
import Scheduletest from "@/components/generatepreview/scheduletest"; // this main create test
import LayoutWithNav from "@/app/mainLayout";
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
    <LayoutWithNav>
      <GenerateTestButton />
      <div className="flex justify-center my-6">
        <ImageComponent />
      </div>

      <div className="grid grid-cols-1 gap-4 w-full max-w-4xl mx-auto">
        {selectedSubjects.includes("Physics") && <PhysicsCard />}
        {selectedSubjects.includes("Chemistry") && <ChemistryCard />}
        {selectedSubjects.includes("Biology") && <BiologyCard />}
      </div>

      <Scheduletest />
    </LayoutWithNav>
  );
}

export default Page;
