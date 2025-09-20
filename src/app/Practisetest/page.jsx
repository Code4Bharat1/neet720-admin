"use client";

import React from "react";
import LayoutWithNav from "@/app/mainLayout";
import Practisetest from "@/components/Practisetest/test";

function Page() {
  return (
    <LayoutWithNav>
      <div className="flex items-center justify-center p-4 w-full">
        <Practisetest />
      </div>
    </LayoutWithNav>
  );
}

export default Page;