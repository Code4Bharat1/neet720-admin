"use client";

import LayoutWithNav from "@/app/mainLayout";
import FirstPart from "@/components/paper_candidate_field/firstpart/firstpart";




import FirstPartMobile from "@/components/paper_candidate_field/firstpart/mobilefirstpart";


import React from "react";

export default function Home() {
  return (
    <LayoutWithNav>
      <div className="flex-1 overflow-y-auto">
        <div className="hidden md:block">
          <FirstPart />
        </div>
        <div className="block md:hidden">
          <FirstPartMobile />
        </div>
      </div>
    </LayoutWithNav>
  );
}
