"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Wifi,
  Calendar,
  HelpCircle,
  Edit3,
  BookOpen,
  Clock,
  Users,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";

const TestGeneratorUI = () => {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState(null);

  const mainFeatures = [
    {
      id: "preview",
      title: "Test Preview",
      description:
        "Preview and review your tests before publishing to ensure quality",
      icon: Eye,
      color: "amber",
      route: "/test_preview",
      stats: "12 drafts",
    },
    {
      id: "offline",
      title: "Offline Mode",
      description: "Create and manage tests without internet connectivity",
      icon: Wifi,
      color: "blue",
      route: "/offline_mode",
      stats: "Always available",
    },
    {
      id: "schedule",
      title: "Schedule Test",
      description: "Set up automated test scheduling and notifications",
      icon: Calendar,
      color: "emerald",
      route: "/schedule_test",
      stats: "5 scheduled",
    },
  ];

  const quickActions = [
    {
      title: "Generate Question Paper",
      description: "Create comprehensive question papers",
      icon: HelpCircle,
      color: "red",
      route: "/generatequestionpaper",
    },
    {
      title: "Generate Answer Key",
      description: "Create detailed answer keys",
      icon: Edit3,
      color: "purple",
      route: "/generateanswerpaper",
    },
  ];

  const additionalFeatures = [
    {
      title: "Analytics",
      description: "View test performance metrics",
      icon: BarChart3,
      color: "indigo",
    },
    {
      title: "Student Management",
      description: "Manage student groups and assignments",
      icon: Users,
      color: "teal",
    },
    {
      title: "Test History",
      description: "Access previous tests and results",
      icon: Clock,
      color: "orange",
    },
    {
      title: "Settings",
      description: "Configure test parameters",
      icon: Settings,
      color: "gray",
    },
  ];

  const getColorClasses = (color, variant = "default") => {
    const colorMap = {
      amber: {
        bg: "bg-amber-50",
        hover: "hover:bg-amber-100",
        icon: "text-amber-600",
        gradient: "from-amber-500 to-amber-600",
        hoverGradient: "hover:from-amber-600 hover:to-amber-700",
      },
      blue: {
        bg: "bg-blue-50",
        hover: "hover:bg-blue-100",
        icon: "text-blue-600",
        gradient: "from-blue-500 to-blue-600",
        hoverGradient: "hover:from-blue-600 hover:to-blue-700",
      },
      emerald: {
        bg: "bg-emerald-50",
        hover: "hover:bg-emerald-100",
        icon: "text-emerald-600",
        gradient: "from-emerald-500 to-emerald-600",
        hoverGradient: "hover:from-emerald-600 hover:to-emerald-700",
      },
      red: {
        bg: "bg-red-50",
        hover: "hover:bg-red-100",
        icon: "text-red-600",
        gradient: "from-red-500 to-red-600",
        hoverGradient: "hover:from-red-600 hover:to-red-700",
      },
      purple: {
        bg: "bg-purple-50",
        hover: "hover:bg-purple-100",
        icon: "text-purple-600",
        gradient: "from-purple-500 to-purple-600",
        hoverGradient: "hover:from-purple-600 hover:to-purple-700",
      },
      indigo: {
        bg: "bg-indigo-50",
        hover: "hover:bg-indigo-100",
        icon: "text-indigo-600",
        gradient: "from-indigo-500 to-indigo-600",
        hoverGradient: "hover:from-indigo-600 hover:to-indigo-700",
      },
      teal: {
        bg: "bg-teal-50",
        hover: "hover:bg-teal-100",
        icon: "text-teal-600",
        gradient: "from-teal-500 to-teal-600",
        hoverGradient: "hover:from-teal-600 hover:to-teal-700",
      },
      orange: {
        bg: "bg-orange-50",
        hover: "hover:bg-orange-100",
        icon: "text-orange-600",
        gradient: "from-orange-500 to-orange-600",
        hoverGradient: "hover:from-orange-600 hover:to-orange-700",
      },
      gray: {
        bg: "bg-gray-50",
        hover: "hover:bg-gray-100",
        icon: "text-gray-600",
        gradient: "from-gray-500 to-gray-600",
        hoverGradient: "hover:from-gray-600 hover:to-gray-700",
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50">
      {/* Navigation Header */}
      {/* <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">Test Generator</h1>
            </div>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header> */}


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push("/test_preview")}
        className="flex items-center gap-1 px-3 py-2 mb-4 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-sm transition"
      >
        <IoIosArrowBack className="text-xl" />
        <span className="text-sm font-medium">Back</span>
      </button>
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Test Generator Suite
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create, manage, and schedule tests with our comprehensive testing
            platform designed for educators
          </p>
        </section>

        {/* Main Features Grid */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature) => {
              const IconComponent = feature.icon;
              const colors = getColorClasses(feature.color);

              return (
                <div
                  key={feature.id}
                  className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:-translate-y-1 ${
                    activeCard === feature.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() =>
                    setActiveCard(activeCard === feature.id ? null : feature.id)
                  }
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 ${colors.bg} ${colors.hover} rounded-2xl flex items-center justify-center transition-colors group-hover:scale-110 transition-transform duration-200`}
                      >
                        <IconComponent size={24} className={colors.icon} />
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {feature.stats}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      {feature.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Get started{" "}
                      <ArrowLeft size={16} className="ml-1 rotate-180" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quick Actions
              </h2>
              <p className="text-gray-600">
                Get started with the most common tasks
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                const colors = getColorClasses(action.color);

                return (
                  <button
                    onClick={() => {
                      router.push(action.route);
                    }}
                    key={index}
                    className={`flex-1 bg-gradient-to-r ${colors.gradient} ${colors.hoverGradient} text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group`}
                  >
                    <IconComponent
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>{action.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        {/* <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">More Features</h2>
            <p className="text-gray-600">Discover additional tools to enhance your testing workflow</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {additionalFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              const colors = getColorClasses(feature.color);
              
              return (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100 hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <IconComponent size={20} className={colors.icon} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section> */}

        {/* Floating Action Button (Mobile) */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <button className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110">
            <Plus size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default TestGeneratorUI;
