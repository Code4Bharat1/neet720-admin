"use client";

import React from "react";
import LayoutWithNav from "@/app/mainLayout";
import StudentTestTable from "@/components/Customize test/customize";

function Page() {
  return (
    <LayoutWithNav>
      <div className="flex items-center justify-center p-4 w-full">
        <StudentTestTable />
      </div>
    </LayoutWithNav>
  );
}

export default Page;