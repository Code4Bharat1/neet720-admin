import { useEffect, useState } from "react";
import axios from "axios";

const TopPerformersTablemobile = ({ selectedMode }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl =
          selectedMode === "Practice"
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/topperformance`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/dashboard/topperformancecustomize`;

        const response = await axios.get(apiUrl);
        setData(response.data.results);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMode]);

  const safeJoin = (array) => {
    return Array.isArray(array) ? array.join(" ") : "N/A";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rounded-xl mt-10 shadow-lg">
      {/* Title and Previous Test Button */}
      <div className="flex justify-between items-center bg-blue-200 p-4 rounded-t-xl shadow-lg">
        <h2 className="text-lg font-semibold text-blue-700">Top Performers</h2>
        <button className="bg-white text-blue-500 px-4 py-2 rounded-md text-sm font-bold cursor-pointer border-blue-500 hover:bg-blue-500 hover:text-white">
          Previous Test
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto mt-0 rounded-t-xl">
          <thead>
            <tr className="bg-[#F5F5F5] text-gray-700">
              <th className="p-3 text-left text-sm md:text-base">Rank</th>
              <th className="p-3 text-left text-sm md:text-base">Student ID</th>
              <th className="p-3 text-left text-sm md:text-base">Name</th>
              <th className="p-3 text-left text-sm md:text-base">Subject</th>
              <th className="p-3 text-left text-sm md:text-base">Test Name</th>
              <th className="p-3 text-left text-sm md:text-base">Test Count</th>
              <th className="p-3 text-left text-sm md:text-base">Accuracy</th>
              <th className="p-3 text-left text-sm md:text-base">Marks</th>
            </tr>
          </thead>
          <tbody>
            {data.map((performer) => (
              <tr key={performer.rank} className="border-b border-gray-200">
                <td className="p-3 text-sm md:text-base">{performer.rank}</td>
                <td className="p-3 text-sm md:text-base">{performer.studentId}</td>
                <td className="p-3 text-sm md:text-base">{performer.fullName}</td>
                <td className="p-3 text-sm md:text-base">
                  {safeJoin(performer.subjectWisePerformance)}
                </td>
                <td className="p-3 text-sm md:text-base">
                  {safeJoin(performer.testNames)}
                </td>
                <td className="p-3 text-sm md:text-base">{performer.testsTaken}</td>
                <td className="p-3 text-sm md:text-base">{performer.accuracy}%</td>
                <td className="p-3 text-sm md:text-base">{performer.averageMarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPerformersTablemobile;
