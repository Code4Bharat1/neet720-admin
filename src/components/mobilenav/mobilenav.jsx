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
    Scan,
    BookText
  } from "lucide-react";
  import { PiBook } from "react-icons/pi";


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
      <div className="bg-white/20 relative w-full flex items-center justify-between md:hidden lg:hidden xl:hidden">
        {/* Top Navbar */}
        <div className="flex justify-between items-center w-full p-4 bg-white shadow-md">
          <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-blue-700">Neet720</h1>
          <img
            src="/neet720_logo.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full shadow-md cursor-pointer"
            onClick={() => handleNavigation("/adminprofile")}
          />
        </div>

        {/* Sidebar Navigation */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          {/* Back Icon */}
          <div className="top-4 right-0 bg-white">
            <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
              <ChevronLeft className="w-6 h-6 text-gray-900 font-bold" />
            </button>
          </div>

          {/* Logo and Title */}
          <div className="flex flex-col justify-center items-center p-4 mt-2">
            <img
              src="/neet720_logo.jpg"
              alt="Profile"
              className="w-16 h-16 rounded-full drop-shadow-lg"
            />
            <h2 className="text-xl font-bold mt-2">Neet720</h2>
          </div>

          <nav className="flex flex-col gap-2 px-4">
            <button
              onClick={() => handleNavigation("/Practisetest")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <FileText className="w-5 h-5 text-gray-700 " />
              <span className="text-gray-900">Practise Test</span>
            </button>

            <button
              onClick={() => handleNavigation("/Customize")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <Edit className="w-5 h-5 text-gray-700 " />
              <span className="text-gray-900 ">Customized Test</span>
            </button>

            {/* Paper Generator Dropdown */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-700 " />
                  <span className="text-gray-900 ">Paper Generator</span>
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
                    className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
                  >
                    <File className="w-5 h-5 text-gray-700 " />
                    <span className="text-gray-900 ">Tests</span>
                  </button>
                  <button
                    onClick={() => handleNavigation("/batches")}
                    className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
                  >
                    <Archive className="w-5 h-5 text-gray-700 " />
                    <span className="text-gray-900 ">Batches</span>
                  </button>
                </div>
              )}
            </div>

              <button
              onClick={() => handleNavigation("/scan-omr")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <Scan className="w-5 h-5 text-xl"/>
              <span className="text-gray-900 ">Scan OMR</span>
            </button>

            <button
              onClick={() => handleNavigation("/notice")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <PiBook className="w-5 h-5 text-xl" />
              <span className="text-gray-900 ">Post Notice</span>
            </button>

            <button
              onClick={() => handleNavigation("/test-series")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <BookText className="w-5 h-5 text-xl" />
              <span className="text-gray-900 ">Test Series</span>
            </button>

            <button
              onClick={() => handleNavigation("/paper_candidate_field")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <Settings className="w-5 h-5 text-gray-700 " />
              <span className="text-gray-900 ">Settings</span>
            </button>

            <button
              onClick={() => handleNavigation("/adminprofile")}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <User className="w-5 h-5 text-gray-700 " />
              <span className="text-gray-900 ">Profile</span>
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                handleNavigation("/");
              }}
              className="flex items-center gap-3 p-2 rounded-lg group transition-all hover:bg-gray-300 cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-red-600 " />
              <span className="text-red-600 ">Logout</span>
            </button>
          </nav>
        </div>

        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  };

  export default MobileNavbar;
