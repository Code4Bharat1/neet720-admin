"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const ImageComponent = () => {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);

  useEffect(() => {
    const subjects = ["Physics", "Chemistry", "Biology"];
    let totalQ = 0;

    subjects.forEach((subject) => {
      const data = localStorage.getItem(subject);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const subjectQuestions = parsed.reduce((sum, ch) => sum + ch.numQuestions, 0);
          totalQ += subjectQuestions;
        } catch (err) {
          console.error(`Error parsing ${subject} data:`, err);
        }
      }
    });

    setTotalQuestions(totalQ);
    setTotalMarks(totalQ * 4);
  }, []);

  return (
    <div className="w-fit flex justify-center">
      <div className="flex justify-center space-x-6 bg-white p-4 rounded-xl shadow-md mt-6 mb-8 w-full max-w-2xl">
        {/* Time */}
        <div className="flex flex-col items-center">
          <Image src="/hourglass_6290515.svg" alt="Time" width={35} height={35} />
          <span className="text-black text-lg">{totalQuestions} mins</span>
        </div>

        {/* Questions */}
        <div className="flex flex-col items-center">
          <Image src="/question_13077967.svg" alt="Questions" width={40} height={40} />
          <span className="text-black text-lg">{totalQuestions} Qts</span>
        </div>

        {/* Marks */}
        <div className="flex flex-col items-center">
          <Image src="/gold-medal_5406582.svg" alt="Marks" width={40} height={40} />
          <span className="text-black text-lg">{totalMarks} mks</span>
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
