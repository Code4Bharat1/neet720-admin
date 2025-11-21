"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaMedal, FaChevronRight, FaChevronLeft, FaDownload } from "react-icons/fa";

const TopPerformersTable = ({ selectedMode }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Remove literal "null"/"undefined"/"NA", collapse spaces, fallback to "Unknown"
  const cleanName = (...parts) => {
    const raw = parts
      .map((s) => (s ?? "").toString().trim())
      .filter(Boolean)
      .join(" ");
    const cleaned = raw
      .replace(/\b(null|undefined|n\/a|na)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "Unknown";
  };

 useEffect(() => {
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminAuthToken");

      if (!token) {
        console.error("No admin token found");
        setError("Unauthorized: Please login again.");
        setLoading(false);
        return;
      }

      const apiUrl =
        selectedMode === "Practice"
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/topperformance`
          : `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/topperformancecustomize`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 Correct header
        },
      });

      const sanitized = (response.data.results || []).map((r) => ({
        ...r,
        fullName: cleanName(r.fullName, r.firstName, r.lastName),
      }));

      setData(sanitized);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  fetchData();
  setCurrentPage(1);
}, [selectedMode]);




  const safeJoin = (array) => (Array.isArray(array) ? array.join(", ") : "N/A");

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = data.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(data.length / studentsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getMedalColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-amber-700";
      default:
        return "text-gray-700";
    }
  };

  // ---------- DOWNLOAD: CSV (all rows in `data`) ----------
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = [
      "Rank",
      "Student ID",
      "Name",
      "Subject",
      "Tests Given",
      "Accuracy (%)",
      "Marks",
    ];

    const rows = data.map((p) => [
      p.rank ?? "",
      p.studentId ?? "",
      p.fullName ?? "",
      Array.isArray(p.subjectWisePerformance)
        ? p.subjectWisePerformance.join(" | ")
        : p.subjectWisePerformance ?? "",
      p.testsTaken ?? "",
      p.accuracy ?? "",
      p.averageMarks ?? "",
    ]);

    const escape = (val) => {
      const s = String(val ?? "");
      const needsQuotes = /[",\n]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csv =
      headers.map(escape).join(",") +
      "\n" +
      rows.map((row) => row.map(escape).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `top_performers_${(selectedMode || "all").toLowerCase()}_${date}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 rounded-xl mt-10 shadow-lg flex justify-center items-center h-64 bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 rounded-xl mt-10 shadow-lg bg-red-50 text-red-500 flex justify-center items-center h-64">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 rounded-xl mt-10 shadow-lg bg-white">
      {/* Title + Controls */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-xl shadow-md">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FaMedal className="text-yellow-300" /> Top Performers
        </h2>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            disabled={!data.length}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-white/90 text-blue-700 hover:bg-white"
            title="Download CSV (all)"
          >
            <FaDownload /> Download CSV
          </button>
          <span className="text-white">
            Showing page {currentPage} of {totalPages || 1}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b-2 border-gray-200">
              <th className="p-3 text-left font-semibold">Rank</th>
              <th className="p-3 text-left font-semibold">Student ID</th>
              <th className="p-3 text-left font-semibold">Name</th>
              <th className="p-3 text-left font-semibold">Subject</th>
              <th className="p-3 text-left font-semibold">Tests Given</th>
              <th className="p-3 text-left font-semibold">Accuracy</th>
              <th className="p-3 text-left font-semibold">Marks</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((performer) => (
              <tr
                key={performer.rank}
                className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="p-3">
                  <div className={`flex items-center ${getMedalColor(performer.rank)}`}>
                    {performer.rank <= 3 ? <FaMedal className="mr-1" /> : null}
                    <span className="font-semibold">{performer.rank}</span>
                  </div>
                </td>
                <td className="p-3">{performer.studentId}</td>
                <td className="p-3 font-medium">{performer.fullName}</td>
                <td className="p-3">{safeJoin(performer.subjectWisePerformance)}</td>
                <td className="p-3">{performer.testsTaken}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      performer.accuracy >= 80
                        ? "bg-green-100 text-green-600"
                        : performer.accuracy >= 60
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {performer.accuracy}%
                  </span>
                </td>
                <td className="p-3 font-semibold">{performer.averageMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              <FaChevronLeft />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
              let pageNumber;
              if (totalPages <= 5) pageNumber = index + 1;
              else if (currentPage <= 3) pageNumber = index + 1;
              else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + index;
              else pageNumber = currentPage - 2 + index;

              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-blue-200"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopPerformersTable;
