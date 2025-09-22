import AddStaffPage from "@/components/controll-staff/AddStaffPage";
import React from "react";
import LayoutWithNav from "../mainLayout";
export default function page() {
  return (
    <div>
      <LayoutWithNav>
        <AddStaffPage />
      </LayoutWithNav>
    </div>
  );
}
