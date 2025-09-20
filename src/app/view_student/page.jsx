"use client";

import React from "react";
import LayoutWithNav from "@/app/mainLayout";
import Desktop_student from "@/components/student/view_student";

const Page = () => {
  return (
    <LayoutWithNav>
      <div className="flex items-center justify-center p-4">
        <Desktop_student />
      </div>
    </LayoutWithNav>
  );
};

export default Page;