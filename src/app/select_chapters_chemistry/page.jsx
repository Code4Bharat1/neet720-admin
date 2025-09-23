"use client";

import ChemistryChapterList from "@/components/select_chapters_chemistry/chemchapterlist/ChapterList";
import ChemistryFirstPart from "@/components/select_chapters_chemistry/chemfirstpart/firstpart";
import ChemLastnav from "@/components/select_chapters_chemistry/chemlastnav/lastnav";
import LayoutWithNav from "../mainLayout";

import React from "react";

export default function Home() {
  return (
    <LayoutWithNav>
      <ChemistryFirstPart />
      <ChemistryChapterList />
      <ChemLastnav />
    </LayoutWithNav>
  );
}
