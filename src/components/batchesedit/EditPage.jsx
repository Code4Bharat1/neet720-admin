"use client";

import { useSearchParams } from "next/navigation";
import MobileNavbar from "@/components/mobilenav/mobilenav";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import Batchesedit from "@/components/batchesedit/batchesedit";

export default function EditClientPage() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get("batchId");

  if (!batchId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No batch selected.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:flex bg-white">
      {/* Mobile nav */}
      <div className="md:hidden block">
        <MobileNavbar />
        <MobilebottomNavbar />
      </div>

      {/* Sidebar */}
      {/* <div className="md:w-1/6">
        <Sidebar />
      </div> */}

      {/* Main content */}
      <div className="w-full md:w-5/6 flex-1 h-screen bg-white">
        {/* <Desktopnav /> */}
        <Batchesedit batchId={batchId} />
      </div>
    </div>
  );
}
