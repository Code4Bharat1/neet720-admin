"use client";

import BioFirstPart from "@/components/select_chapters_bio/biofirstpart/firstpart";
import BiologyChapterList from "@/components/select_chapters_bio/biochapterlist/ChapterList";
import BioLastnavDesktop from "@/components/select_chapters_bio/biolastnav/lastnav";
import LayoutWithNav from "../mainLayout";
import React from "react";

export default function Home() {
  return (
    <LayoutWithNav>
      <BioFirstPart />
      <BiologyChapterList />
      <BioLastnavDesktop />
    </LayoutWithNav>
  );
}
