  "use client";

  import React, { useState } from "react";
  import { useRouter } from "next/navigation";
  import {
    Menu,
    ChevronLeft,
    FileText,
    Edit,
    Layers,
    Settings,
    User,
    LogOut,
    ChevronDown,
    ChevronUp,
    File,
    Archive,
  } from "lucide-react";

  /* -------------------------------------------
    MOBILE SIDEBAR NAV
  -------------------------------------------- */
  const MobileNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const router = useRouter();

    const handleNavigation = (path) => {
      router.push(path);
      setIsOpen(false);
    };

    return (
      <div className="relative w-full flex sm:hidden md:hidden lg:hidden xl:hidden">
        {/* Top Navbar */}
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-blue-700">Dashboard</h1>
          <img
            src="/mobilenavprofile.png"
            alt="Profile"
            className="w-10 h-10 rounded-full shadow-md cursor-pointer"
            onClick={() => handleNavigation("/profile")}
          />
        </div>

        {/* Sidebar Navigation */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Back Icon */}
          <div className="bg-[#007AFF] top-4 left-4">
            <button onClick={() => setIsOpen(false)}>
              <ChevronLeft className="w-6 h-6 text-gray-900 font-bold" />
            </button>
          </div>

          {/* Logo and Title */}
          <div className="flex flex-col justify-center items-center p-4 mt-10">
            <img
              src="/mobilenavprofile.png"
              alt="Profile"
              className="w-16 h-16 rounded-full drop-shadow-lg"
            />
            <h2 className="text-xl font-bold mt-2">Nexcore</h2>
          </div>

          <nav className="flex flex-col gap-2 px-4">
            <button
              onClick={() => handleNavigation("/Practisetest")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all"
            >
              <FileText className="w-5 h-5 text-gray-700 group-hover:text-white" />
              <span className="text-gray-900 group-hover:text-white">Practise Test</span>
            </button>

            <button
              onClick={() => handleNavigation("/Customize")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all"
            >
              <Edit className="w-5 h-5 text-gray-700 group-hover:text-white" />
              <span className="text-gray-900 group-hover:text-white">Customized Test</span>
            </button>

            {/* Paper Generator Dropdown */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-3 p-2 rounded-lg group transition-all"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-700 group-hover:text-white" />
                  <span className="text-gray-900 group-hover:text-white">Paper Generator</span>
                </div>
                {isDropdownOpen ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {isDropdownOpen && (
                <div className="ml-8 flex flex-col gap-2">
                  <button
                    onClick={() => handleNavigation("/generatetest")}
                    className="flex items-center gap-3 p-2 rounded-lg group transition-all"
                  >
                    <File className="w-5 h-5 text-gray-700 group-hover:text-white" />
                    <span className="text-gray-900 group-hover:text-white">Tests</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/batches")}
                    className="flex items-center gap-3 p-2 rounded-lg group transition-all"
                  >
                    <Archive className="w-5 h-5 text-gray-700 group-hover:text-white" />
                    <span className="text-gray-900 group-hover:text-white">Batches</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavigation("/paper_candidate_field")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all"
            >
              <Settings className="w-5 h-5 text-gray-700 group-hover:text-white" />
              <span className="text-gray-900 group-hover:text-white">Settings</span>
            </button>

            <button
              onClick={() => handleNavigation("/profile")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all"
            >
              <User className="w-5 h-5 text-gray-700 group-hover:text-white" />
              <span className="text-gray-900 group-hover:text-white">Profile</span>
            </button>
            

            <button
              onClick={() => {
                localStorage.clear();
                handleNavigation("/");
              }}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all"
            >
              <LogOut className="w-5 h-5 text-red-600 group-hover:text-white" />
              <span className="text-red-600 group-hover:text-white">Logout</span>
            </button>
          </nav>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  };

  export default MobileNavbar;
