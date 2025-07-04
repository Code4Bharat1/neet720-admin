"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function MobilephysicsChapterList() {
  const [chapters, setChapters] = useState([
    { id: 1, name: "Kinematics", unit: "Unit 1", isChecked: false, numQuestions: 0, rows: [] },
    { id: 2, name: "Dynamics", unit: "Unit 2", isChecked: false, numQuestions: 0, rows: [] },
   ]);

  const handleCheckboxChange = (id) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, isChecked: !ch.isChecked, rows: [] } : ch))
    );
  };

  const handleQuestionChange = (id, e) => {
    const value = parseInt(e.target.value) || 0;
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === id
          ? { ...ch, numQuestions: value, rows: Array.from({ length: value }, (_, i) => ({
             id: i + 1,
             subject: "Physics",
             question: "What is Newton's second law of motion?",
       
 })) }
          : ch
      )
    );
  };

  return (
    <div className="flex justify-center mt-2 px-3">
      <div className="bg-white  w-full rounded-lg border-none">
        {chapters.map((chapter, index) => (
          <div key={chapter.id} className="mb-1">
            <div className="overflow-x-auto">
              <table className="w-full text-[10px] text-left font-Poppins text-[#181C32] max-w-3xl mx-auto rounded-2xl">
                <thead className="bg-[#B1CEFB] text-[#181C32] font-Mulish font-semibold">
                  <tr>
                    {["Selected", "Sr.no", "Chapter Name", "Unit", "Questions", "Total Marks"].map((header, i) => (
                      <th key={i} className={`py-1 px-3 text-center ${i === 0 ? "rounded-tl-lg" : ""} ${i === 5 ? "rounded-tr-lg" : ""}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="py-1 px-3 text-center">
                      <div className={`w-4 h-4 flex items-center justify-center rounded cursor-pointer mx-auto ${chapter.isChecked ? "bg-blue-500" : "bg-gray-300"}`} onClick={() => handleCheckboxChange(chapter.id)}>
                        {chapter.isChecked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </td>
                    {[index + 1, chapter.name, chapter.unit].map((item, i) => (
                      <td key={i} className="py-1 px-3 text-center font-Mulish font-medium text-black">{item}</td>
                    ))}
                    <td className="py-1 px-3 text-center">
                      <input type="number" value={chapter.numQuestions} onChange={(e) => handleQuestionChange(chapter.id, e)} className="w-8 h-6 bg-gray-200 text-center font-semibold outline-none rounded mx-auto text-[10px]" min="0" />
                    </td>
                    <td className="py-1 px-3 text-center font-semibold">
                      <div className="w-8 h-6 bg-gray-200 flex items-center justify-center rounded mx-auto">
                        {chapter.numQuestions * 4 || 0}
                      </div>
                    </td>
                  </tr>

                  {chapter.isChecked && (
                    <tr>
                      <td colSpan="7" className="p-1">
                        <div className="rounded-lg shadow w-[90%] ml-4">
                          <table className="w-full text-[10px] text-left font-Poppins text-[#181C32] border-collapse ">
                            <thead className="bg-gray-100 text-black">
                              <tr>
                                {["Q.no", "Subjects", "Question", "Action"].map((header, i) => (
                                  <th key={i} className={`py-1 px-3 text-center font-semibold ${i === 0 ? "rounded-tl-lg" : ""} ${i === 3 ? "rounded-tr-lg" : ""}`}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {chapter.rows.map((row, i) => (
                                <tr key={row.id} className={`hover:bg-gray-50 transition ${i === chapter.rows.length - 1 ? "border-none" : "border-b border-[#E1CFFF]"}`}>
                                  <td className="py-1 px-3 text-center font-bold">{row.id}</td>
                                  <td className="py-1 px-3 text-center font-semibold flex items-center justify-center space-x-1">
                                    <Image src="/physics_logo.png" alt="physics" width={14} height={14} className="w-3 h-3" />
                                    <div className="text-[10px] font-semibold">Physics</div>
                                  </td>
                                  <td className="py-1 px-3 text-center font-semibold">{row.question}</td>
                                  <td className="py-1 px-3 text-center font-semibold">
                                    <div className="flex justify-center space-x-1">
                                      <Image src="/refresh.png" alt="Refresh" width={14} height={14} className="w-3 h-3 cursor-pointer" />
                                      <Image src="/arrow.png" alt="Arrow" width={14} height={14} className="w-3 h-3 cursor-pointer" />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
