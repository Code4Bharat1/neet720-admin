"use client";
import React, { useState, useEffect } from "react";
import { Pie, Doughnut } from "react-chartjs-2";
import { BookOpen, Beaker, Radio, Brain, ArrowDown, ArrowUp } from "lucide-react";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from "chart.js";

// Register ChartJS components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const ModeSwitcherChart = ({ selectedMode, subjectTotals }) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [chartType, setChartType] = useState("doughnut"); // Can be "doughnut" or "pie"
  
  // If no data is provided, create a sample dataset for demonstration
  const defaultSubjectTotals = {
    "Physics": 78,
    "Chemistry": 65,
    "Biology": 82,
    "Mathematics": 70
  };
  
  // Use provided data or fallback to default
  const chartSubjects = subjectTotals && Object.keys(subjectTotals).length > 0 
    ? subjectTotals 
    : defaultSubjectTotals;
  
  // Subject icons and colors mapping
  const subjectConfig = {
    "Physics": { icon: <Radio className="h-5 w-5" />, color: "#3b82f6", borderColor: "#2563eb", details: "Mechanics, Electromagnetism, Thermodynamics" },
    "Chemistry": { icon: <Beaker className="h-5 w-5" />, color: "#34d399", borderColor: "#10b981", details: "Organic, Inorganic, Physical Chemistry" },
    "Biology": { icon: <BookOpen className="h-5 w-5" />, color: "#8b5cf6", borderColor: "#6b21a8", details: "Botany, Zoology, Microbiology" },
    "Mathematics": { icon: <Brain className="h-5 w-5" />, color: "#f97316", borderColor: "#ea580c", details: "Algebra, Calculus, Statistics" }
  };
  
  // Get subset of subject config based on available data
  const activeSubjects = Object.keys(chartSubjects).reduce((acc, subject) => {
    if (subjectConfig[subject]) {
      acc[subject] = subjectConfig[subject];
    }
    return acc;
  }, {});
  
  // Prepare chart data
  const chartData = {
    labels: Object.keys(chartSubjects),
    datasets: [
      {
        data: Object.values(chartSubjects),
        backgroundColor: Object.keys(chartSubjects).map(subject => 
          activeSubjects[subject]?.color || "#9ca3af"),
        borderColor: Object.keys(chartSubjects).map(subject => 
          activeSubjects[subject]?.borderColor || "#6b7280"),
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };
  
  // Custom chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue || '';
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.raw / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: chartType === "doughnut" ? '60%' : undefined,
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };
  
  // Handle subject selection
  const handleSubjectClick = (subject) => {
    if (activeSubject === subject) {
      setActiveSubject(null);
    } else {
      setActiveSubject(subject);
    }
  };
  
  // Calculate total and percentages
  const totalMarks = Object.values(chartSubjects).reduce((sum, value) => sum + value, 0);
  
  // Get highest and lowest performing subject
  const performanceData = Object.entries(chartSubjects).map(([subject, marks]) => ({
    subject,
    marks,
    percentage: (marks / totalMarks) * 100
  }));
  
  const highestPerforming = performanceData.reduce((prev, current) => 
    (prev.percentage > current.percentage) ? prev : current);
    
  const lowestPerforming = performanceData.reduce((prev, current) => 
    (prev.percentage < current.percentage) ? prev : current);

  // Determine title based on selected mode
  const title = selectedMode === "Practice" 
    ? "Subject Performance Analysis" 
    : "Customized Subject Performance";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl mx-auto">
      {/* Header with title and chart type switcher */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setChartType("pie")}
            className={`p-2 rounded-md ${chartType === "pie" ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
            title="Pie Chart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" />
              <path d="M12 2v10h10" strokeWidth="2" />
            </svg>
          </button>
          <button 
            onClick={() => setChartType("doughnut")}
            className={`p-2 rounded-md ${chartType === "doughnut" ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
            title="Doughnut Chart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" fill="none" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chart Container */}
        <div className="w-full md:w-1/2 h-64 relative">
          {chartType === "doughnut" ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <Pie data={chartData} options={chartOptions} />
          )}
          
          {/* Center content for doughnut chart */}
          {chartType === "doughnut" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-800">{totalMarks}</div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="w-full md:w-1/2">
          {/* Performance Overview */}
          <div className="mb-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-600 mb-2"
            >
              Performance Overview
              {showDetails ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </button>
            
            {showDetails && (
              <div className="bg-blue-50 p-3 rounded-md text-sm space-y-2 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Strongest Subject:</span>
                  <span className="font-medium text-green-600">{highestPerforming.subject} ({Math.round(highestPerforming.percentage)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Needs Improvement:</span>
                  <span className="font-medium text-red-600">{lowestPerforming.subject} ({Math.round(lowestPerforming.percentage)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Score:</span>
                  <span className="font-medium text-gray-800">{totalMarks} points</span>
                </div>
              </div>
            )}
          </div>

          {/* Subject Legend with Interactive Selection */}
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(chartSubjects).map(([subject, marks], index) => (
              <div 
                key={index}
                onClick={() => handleSubjectClick(subject)}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all ${
                  activeSubject === subject 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-md mr-3 flex items-center justify-center text-white"
                    style={{ backgroundColor: activeSubjects[subject]?.color || "#9ca3af" }}
                  >
                    {activeSubjects[subject]?.icon || ""}
                  </div>
                  <span className="font-medium">{subject}</span>
                </div>
                <div className="text-lg font-semibold">
                  {marks}
                </div>
              </div>
            ))}
          </div>
          
          
        </div>
      </div>
    </div>
  );
};

export default ModeSwitcherChart;