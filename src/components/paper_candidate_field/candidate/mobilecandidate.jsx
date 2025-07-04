"use client";
import { useState } from "react";
import { SlPlus } from "react-icons/sl";

const MobileCandidateTable = () => {
  const [tables, setTables] = useState([1]);

  const addNewTable = () => {
    setTables([...tables, tables.length + 1]);
  };

  return (
    <div className="flex flex-col justify-center items-center p-4 mt-2 space-y-4 w-full md:hidden">
      <div className="p-4 bg-white shadow-[1px_1px_5px_lightgray] rounded-lg w-full">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4 w-full">
          <h2 className="text-sm font-Open Sans font-normal">Candidate Field</h2>
          <button
            onClick={addNewTable}
            className="flex items-center bg-[#007AFF] text-white font-Open Sans px-3 py-1 rounded-md transition text-xs"
          >
            <SlPlus className="text-lg mr-2" />
            Add New Candidate
          </button>
        </div>

        {/* Render All Tables */}
        <div className="flex flex-col space-y-3 w-full">
          {tables.map((tableId) => (
            <div key={tableId} className="overflow-x-auto border border-gray-400 w-full">
              <table className="w-full text-xs font-Nunito Sans font-normal">
                <thead>
                  <tr className="bg-[#F3F3F3]">
                    <th className="px-3 py-2 w-12 whitespace-nowrap font-Nunito Sans font-medium">
                      Sr. No
                    </th>
                    <th className="px-2 py-2 font-Nunito Sans font-medium">Field</th>
                    <th className="px-2 py-2 font-Nunito Sans font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="text-center font-Nunito Sans">
                  {[
                    { id: 1, field: "Name", status: "Added" },
                    { id: 2, field: "Standard", status: "Added" },
                    { id: 3, field: "Batch", status: "Added" },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 text-center">{row.id}</td>
                      <td className="px-2 py-2 text-center">{row.field}</td>
                      <td className="px-2 py-2 text-center">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileCandidateTable;
