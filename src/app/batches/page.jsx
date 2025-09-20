"use client";

import React from "react";
import LayoutWithNav from "@/app/mainLayout";
import Batches from "@/components/batches/batches";

export default function Page() {
  return (
    <LayoutWithNav>
      <div className="flex items-center justify-center p-4 w-full">
        <Batches />
      </div>
    </LayoutWithNav>
  );
}