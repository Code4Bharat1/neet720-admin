"use client";

import MobileNavbar from "@/components/mobilenav/mobilenav";
import Desktopnav from "@/components/desktopnav/nav";
import Sidebar from "@/components/desktopsidebar/sidebar";
import MobilebottomNavbar from "@/components/mobilenav/MobileBottomNavbar";
import React, { useState } from "react";
import Generatetest from "@/components/generatetest/generate_test";
import Generatetestmobile from "@/components/generatetest/generate_test_mobile";
import LayoutWithNav from "../mainLayout";
export default function page() {
  return (
    <LayoutWithNav>     
        <Generatetest />
    </LayoutWithNav>
  );
}
