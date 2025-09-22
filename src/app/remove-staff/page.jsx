import RemoveStaffPage from "@/components/controll-staff/RemoveStaffPage";
import React from "react";
import LayoutWithNav from "../mainLayout";
export default function page() {
  return (
    <div>
      <LayoutWithNav>
        <RemoveStaffPage />
      </LayoutWithNav>
    </div>
  );
}
