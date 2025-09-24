"use client";

import React from "react";
import LayoutWithNav from "@/app/mainLayout";
import Batches from "@/components/batches/batches";

export default function Page() {
  return (
    <LayoutWithNav>
      <Batches />
    </LayoutWithNav>
  );
}
