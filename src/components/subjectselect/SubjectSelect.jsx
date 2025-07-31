"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Atom,
  Dna,
  Check,
  Plus,
} from "lucide-react";

const SelectSubjectPage = () => {
  const [difficulty, setDifficulty] = useState("Medium");
  const [testName, setTestName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [positiveMarks, setPositiveMarks] = useState("");
  const [negativeMarks, setNegativeMarks] = useState("");
  const [questionTypeCounts, setQuestionTypeCounts] = useState({});

  const allQuestionTypes = [
    { id: "mcq", label: "Multiple Choice", icon: "📝" },
    { id: "true_false", label: "True/False", icon: "✓" },
    { id: "statement_based", label: "Statement Based", icon: "💭" },
    { id: "match_the_following", label: "Match the Following", icon: "🔗" }
  ];

  const defaultCountsByDifficulty = {
    Easy: {
      mcq: 10,
      true_false: 5,
      statement_based: 0,
      match_the_following: 0,
    },
    Medium: {
      mcq: 8,
      true_false: 4,
      statement_based: 1,
      match_the_following: 1,
    },
    Hard: { mcq: 4, true_false: 2, statement_based: 2, match_the_following: 2 },
  };

  const subjects = [
    {
      name: "Physics",
      icon: Atom,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      name: "Chemistry",
      icon: FlaskConical,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      name: "Biology",
      icon: Dna,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  const steps = [
    {
      title: "Choose Subjects",
      description: "Select subjects and difficulty level",
      active: true,
    },
    {
      title: "Select Chapters",
      description: "Choose specific chapters and question details",
      active: false,
    },
    {
      title: "Complete Test",
      description: "Review and create your test",
      active: false,
    },
  ];

  // Initialize with defaults based on difficulty
  useEffect(() => {
    const defaultCounts = defaultCountsByDifficulty[difficulty];
    setQuestionTypeCounts(defaultCounts);
  }, [difficulty]);

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleSelectAll = () => {
    const allSubjectNames = subjects.map((s) => s.name);
    const allSelected = allSubjectNames.every((name) =>
      selectedSubjects.includes(name)
    );

    if (allSelected) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(allSubjectNames);
    }
  };

  const handleContinue = () => {
    if (!testName.trim()) {
      alert("Please enter a test name");
      return;
    }
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject");
      return;
    }
    // Navigate to next page
    console.log("Continuing with:", {
      testName,
      selectedSubjects,
      difficulty,
      questionTypeCounts,
    });
  };

  const allSubjectsSelected = subjects.every((subject) =>
    selectedSubjects.includes(subject.name)
  );

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Test
            </h1>
          </div>

          <div className="max-w-sm mx-auto">
            <input
              type="text"
              placeholder="Enter Test Name"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-4 py-3 text-base font-medium bg-white rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none shadow-sm transition-all duration-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Difficulty Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Select Difficulty
              </h2>

              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl appearance-none cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white pointer-events-none" />
              </div>
            </div>

            {/* Subject Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-7 h-7 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  Select Subjects
                </h2>

                <button
                  onClick={handleSelectAll}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    allSubjectsSelected
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  }`}
                >
                  {allSubjectsSelected ? "Deselect All" : "Select All"}
                </button>
              </div>

              <div className="grid gap-3">
                {subjects.map((subject) => {
                  const IconComponent = subject.icon;
                  const isSelected = selectedSubjects.includes(subject.name);

                  return (
                    <div
                      key={subject.name}
                      onClick={() => handleSubjectToggle(subject.name)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                        isSelected
                          ? `bg-gradient-to-r ${subject.color} text-white border-transparent shadow-lg`
                          : `${subject.bgColor} ${subject.borderColor} hover:shadow-md`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? "bg-white/20" : "bg-white"
                          } shadow-sm`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              isSelected ? "text-white" : "text-slate-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`text-lg font-bold ${
                              isSelected ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {subject.name}
                          </h3>
                        </div>
                        {isSelected && (
                          <div className="p-1 bg-white/20 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Question Types */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Question Distribution
              </h2>

              <div className="grid md:grid-cols-2 gap-3">
                {allQuestionTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="text-xl">{type.icon}</span>
                    <div className="flex-1">
                      <label className="font-medium text-slate-700 text-sm">
                        {type.label}
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={questionTypeCounts[type.id] || 0}
                      onChange={(e) => {
                        setQuestionTypeCounts((prev) => ({
                          ...prev,
                          [type.id]: parseInt(e.target.value) || 0,
                        }));
                      }}
                      className="w-16 px-2 py-1 text-center text-sm border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Marks Configuration */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 shadow-lg text-white">
              <h2 className="text-xl font-bold mb-4">Marks Configuration</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-medium mb-2">
                    Positive Marks (per question)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={positiveMarks}
                    onChange={(e) => setPositiveMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 text-slate-800 rounded-lg border-0 focus:outline-none focus:ring-4 focus:ring-white/50"
                    placeholder="e.g., 4"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-2">
                    Negative Marks (per question)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    className="w-full px-3 py-2 bg-white/90 text-slate-800 rounded-lg border-0 focus:outline-none focus:ring-4 focus:ring-white/50"
                    placeholder="e.g., 1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Actions */}
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Progress
              </h3>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.active
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {step.active ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="font-bold text-sm">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-semibold text-sm ${
                          step.active ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`text-xs ${
                          step.active ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">Test Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-100">Difficulty:</span>
                  <span className="font-semibold">{difficulty}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-indigo-100">Subjects:</span>
                  <span className="font-semibold">
                    {selectedSubjects.length}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-indigo-100">Total Questions:</span>
                  <span className="font-semibold">
                    {Object.values(questionTypeCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </span>
                </div>

                {positiveMarks && (
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-100">Positive Marks:</span>
                    <span className="font-semibold">+{positiveMarks}</span>
                  </div>
                )}

                {negativeMarks && (
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-100">Negative Marks:</span>
                    <span className="font-semibold">-{negativeMarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Continue to Chapters
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectSubjectPage;
