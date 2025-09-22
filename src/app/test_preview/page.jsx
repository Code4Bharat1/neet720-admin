"use client";

import React, { useState } from "react";

import TestPreview from "@/components/Action_test_preview/Test_preview";
import LayoutWithNav from "@/app/mainLayout";

const Page = () => {
  return (
    <LayoutWithNav>
      <TestPreview />
    </LayoutWithNav>
  );
};

export default Page;
