"use client";

import MobileNavbar  from "@/components/mobilenav/mobilenav";
import DesktopNavbar from "@/components/desktopnav/nav";
import Practisetest from "@/components/Practisetest/test";
import Sidebar from "@/components/desktopsidebar/sidebar";
import TestMobile from "@/components/Practisetest/testmobile";

function Page() {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden block min-h-screen bg-white">
        <MobileNavbar /> 
            <Practisetest />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex min-h-screen bg-white">
        {/* Sidebar Section */}
        <div className="md:w-1/6">
          <Sidebar />
        </div>

        {/* Main Content Section */}
        <div className="w-full md:w-5/6 flex-1 bg-white">
          <DesktopNavbar />
          <div className=""> 
            <Practisetest /> 
          </div>
         
        </div>
      </div>
    </>
  );
}

export default Page;
  