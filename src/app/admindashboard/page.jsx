import React from "react";
import AdminDashboard from "@/components/home/adminDashboard";
import LayoutWithNav from "../mainLayout";
export default function page() {
  return (
    <div>
      <LayoutWithNav>
        <AdminDashboard />
      </LayoutWithNav>
    </div>
  );
}
