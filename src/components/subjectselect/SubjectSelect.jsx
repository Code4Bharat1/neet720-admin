"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
const SelectSubjectPage = () => {
  const router = useRouter();
  // ========================================
  // STATE DECLARATIONS
  // ========================================
  const [difficulty, setDifficulty] = useState("Medium");
  const [marks, setMarks] = useState([]);
  const [testName, setTestName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("");
  const [questionTypeCounts, setQuestionTypeCounts] = useState({});

  console.log(difficulty);
  console.log(questionTypeCounts);

  // ========================================
  // CONSTANTS AND DATA
  // ========================================
  const allQuestionTypes = ["MCQ", "True/False", "Statement Based"];

  const defaultCountsByDifficulty = {
    Easy: {
      MCQ: 10,
      "True/False": 5,
      "Short Answer": 2,
      "Statement Based": 0,
    },
    Medium: {
      MCQ: 8,
      "True/False": 4,
      "Statement Based": 2,
    },
    Hard: {
      MCQ: 4,
      "True/False": 2,
      "Statement Based": 3,
    },
  };

  const subjectsData = [
    { name: "Physics", img: "⚛️" },
    { name: "Chemistry", img: "🧪" },
    { name: "Biology", img: "🧬" },
  ];

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  const saveMarksToLocalStorage = (positive, negative, difficulty) => {
    const marksData = {
      positiveMarks: positive,
      negativeMarks: negative,
      difficultyLevel: difficulty,
    };
    // Note: localStorage is not available in this environment, using state instead
    console.log("Would save to localStorage:", marksData);
  };

  // ========================================
  // EVENT HANDLERS
  // ========================================
  const handleSubjectChange = (subjectOrSubjects) => {
    setSelectedSubjects((prev) => {
      let updatedSubjects;
      const subjects = Array.isArray(subjectOrSubjects)
        ? subjectOrSubjects
        : [subjectOrSubjects];
      
      const allSelected = subjects.every((s) => prev.includes(s));
      if (allSelected) {
        updatedSubjects = prev.filter((s) => !subjects.includes(s));
      } else {
        updatedSubjects = [...new Set([...prev, ...subjects])];
      }
      
      console.log("Selected subjects:", updatedSubjects);
      return updatedSubjects;
    });
  };

  const handleMarksChange = (marksOption) => {
    setMarks((prev) => {
      let updatedMarks;
      if (prev.includes(marksOption)) {
        updatedMarks = prev.filter((m) => m !== marksOption);
      } else {
        updatedMarks = [...prev, marksOption];
      }
      console.log("Selected marks:", updatedMarks);
      return updatedMarks;
    });
  };

  const handlePositiveMarksChange = (e) => {
    const value = e.target.value;
    setPositiveMarks(value);
    saveMarksToLocalStorage(value, negativeMarks, difficulty);
  };

  const handleNegativeMarksChange = (e) => {
    const value = e.target.value;
    setNegativeMarks(value);
    saveMarksToLocalStorage(positiveMarks, value, difficulty);
  };

  const handleTestNameChange = (e) => {
    const value = e.target.value;
    setTestName(value);
    console.log("Test name:", value);
  };

  const handleDifficultyChange = (e) => {
    const newDifficulty = e.target.value;
    setDifficulty(newDifficulty);

    const defaultCounts = defaultCountsByDifficulty[newDifficulty];
    setQuestionTypeCounts(defaultCounts);

    saveMarksToLocalStorage(positiveMarks, negativeMarks, newDifficulty);
  };

  const handleQuestionTypeCountChange = (type, value) => {
    const updatedCounts = {
      ...questionTypeCounts,
      [type]: Number.parseInt(value || 0, 10),
    };
    setQuestionTypeCounts(updatedCounts);
  };

  const handleContinueClick = () => {
    if (!testName.trim()) {
      alert("Test name is required!");
      return;
    }
    if (selectedSubjects.length > 0) {
      const subject = selectedSubjects[0].toLowerCase();
      router.push(`/select_chapters_${subject}`);
    } else {
      alert("Please select at least one subject!");
    }
  };

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    const defaultCounts = defaultCountsByDifficulty["Medium"];
    setQuestionTypeCounts(defaultCounts);
  }, []);

  // ========================================
  // RENDER COMPONENTS
  // ========================================
  const renderTestNameSection = () => (
    <div className="text-center mb-6 px-4">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-black mb-4">
        Create Test
      </h3>
      <input
        type="text"
        placeholder="Enter Test Name"
        value={testName}
        onChange={handleTestNameChange}
        className="w-full max-w-md px-4 py-3 border-none rounded-xl bg-blue-100 text-black font-bold text-base md:text-lg placeholder:text-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderDifficultySection = () => (
    <div className="mb-6">
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">Select Difficulty</h3>
      <p className="text-sm md:text-base text-gray-600 mb-4">Select at least 1 difficulty for each subject</p>
      <div className="relative">
        <select
          value={difficulty}
          onChange={handleDifficultyChange}
          className="w-full p-3 md:p-4 rounded-2xl bg-blue-500 text-white appearance-none text-base md:text-lg outline-none focus:ring-2 focus:ring-blue-600 shadow-lg cursor-pointer"
        >
          <option value="Easy" className="bg-white text-black">Easy</option>
          <option value="Medium" className="bg-white text-black">Medium</option>
          <option value="Hard" className="bg-white text-black">Hard</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" size={20} />
      </div>
    </div>
  );

  const renderSubjectsSection = () => (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg md:text-xl font-semibold">Select Subjects</h3>
        <button
          className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg cursor-pointer text-sm md:text-base transition-colors duration-200 self-start sm:self-auto"
          onClick={() => handleSubjectChange(["Physics", "Chemistry", "Biology"])}
        >
          Select All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {subjectsData.map((subject) => (
          <div
            key={subject.name}
            onClick={() => handleSubjectChange(subject.name)}
            className={`cursor-pointer p-4 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              selectedSubjects.includes(subject.name)
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-white text-black shadow-md hover:shadow-lg"
            } flex items-center justify-start gap-4 font-bold`}
          >
            <span className="text-2xl">{subject.img}</span>
            <span className="text-base md:text-lg">{subject.name}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex justify-center items-center mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 flex justify-center items-center text-white font-bold text-sm">
          1
        </div>
        <div className="w-8 md:w-12 h-1 bg-blue-500"></div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-400 flex justify-center items-center text-white font-bold text-sm">
          2
        </div>
        <div className="w-8 md:w-12 h-1 bg-gray-400"></div>
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-400 flex justify-center items-center text-white font-bold text-sm">
          3
        </div>
      </div>
    </div>
  );

  const renderProgressCards = () => (
    <div className="grid grid-cols-1 gap-4 mb-6">
      <div className="bg-blue-500 rounded-3xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">Choose Subjects</h3>
            <p className="text-sm md:text-base opacity-90">Select the Subjects and Difficulty</p>
          </div>
          <span className="text-3xl md:text-4xl">📚</span>
        </div>
      </div>

      <div className="bg-yellow-400 rounded-3xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-semibold mb-2">
              Please select chapters and other Details
            </h3>
            <p className="text-sm md:text-base opacity-90">
              You can select chapters of different subjects and select dedicated questions of each chapter
            </p>
          </div>
          <span className="text-3xl md:text-4xl ml-4">📖</span>
        </div>
      </div>

      <div className="bg-green-500 rounded-3xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-2">Completed!!</h3>
            <p className="text-sm md:text-base opacity-90">Woah you have created a new Test</p>
          </div>
          <span className="text-3xl md:text-4xl">🎉</span>
        </div>
      </div>
    </div>
  );

  const renderQuestionTypesSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6">
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-6 text-gray-800">
        Set Number of Questions per Type
      </h3>
      <div className="space-y-4">
        {allQuestionTypes.map((type) => (
          <div key={type} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <label className="text-gray-700 font-medium text-sm md:text-base">{type}</label>
            <input
              type="number"
              min="0"
              value={questionTypeCounts[type] || 0}
              onChange={(e) => handleQuestionTypeCountChange(type, e.target.value)}
              className="w-full sm:w-24 md:w-28 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMarksSection = () => (
    <div className="bg-yellow-400 rounded-3xl p-4 md:p-6 shadow-lg">
      <h2 className="text-lg md:text-xl lg:text-2xl font-medium text-center text-white mb-6">
        Select Marks per Question
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm md:text-lg font-light text-white mb-2">
            Positive marks (per question)
          </label>
          <input
            type="text"
            value={positiveMarks}
            onChange={handlePositiveMarksChange}
            className="w-full p-3 border border-white rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter positive marks"
          />
        </div>

        <div>
          <label className="block text-sm md:text-lg font-light text-white mb-2">
            Negative marks (per question)
          </label>
          <input
            type="text"
            value={negativeMarks}
            onChange={handleNegativeMarksChange}
            className="w-full p-3 border border-white rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter negative marks"
          />
        </div>
      </div>
    </div>
  );

  const renderContinueButton = () => (
    <div className="flex justify-center md:justify-end px-4">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 md:px-8 rounded-full flex items-center gap-2 text-base md:text-lg font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
        onClick={handleContinueClick}
      >
        Continue
        <ArrowRight size={20} />
      </button>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Test Name Section */}
        {renderTestNameSection()}

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Progress Cards */}
        <div className="mb-8">
          {renderProgressCards()}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Left Section - Controls */}
          <div className="lg:col-span-1 xl:col-span-1">
            {renderDifficultySection()}
            {renderSubjectsSection()}
          </div>

          {/* Right Section - Question Types and Marks */}
          <div className="lg:col-span-1 xl:col-span-2 space-y-6">
            {renderQuestionTypesSection()}
            {renderMarksSection()}
          </div>
        </div>

        {/* Continue Button */}
        {renderContinueButton()}
      </div>
    </div>
  );
};

export default SelectSubjectPage;