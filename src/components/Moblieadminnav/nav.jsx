/*moblie nav bar*/

import { useState } from "react";
import {
  Menu,
  ChevronLeft,
  X,
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

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="relative w-full">
      {/* Top Navbar */}
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <button onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-blue-700">Dashboard</h1>
        <img
          src="/mobilenavprofile.png"
          alt="Logo"
          className="w-10 h-10 rounded-full shadow-md"
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
            alt="Nexcore Logo"
            className="w-16 h-16 rounded-full drop-shadow-lg"
          />
          <h2 className="text-xl font-bold mt-2">Nexcore</h2>
        </div>

        <nav className="flex flex-col gap-2 px-4">
          <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-700 font-semibold transition-all">
            <FileText className="w-5 h-5" />
            Practise Test
          </button>
          <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-700 font-semibold transition-all">
            <Edit className="w-5 h-5" />
            Customized Test
          </button>

          {/* Paper Generator Dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-700 font-semibold transition-all"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5" />
                Paper Generator
              </div>
              {isDropdownOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {isDropdownOpen && (
              <div className="ml-8 flex flex-col gap-2">
                <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-100 transition-all">
                  <File className="w-5 h-5" />
                  Tests
                </button>
                <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-100 transition-all">
                  <Archive className="w-5 h-5" />
                  Batches
                </button>
              </div>
            )}
          </div>

          <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-700 font-semibold transition-all">
            <Settings className="w-5 h-5" />
            Settings
          </button>
          <button className="flex items-center gap-3 p-2 rounded-lg hover:text-yellow-700 hover:bg-yellow-700 font-semibold transition-all">
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="flex items-center gap-3 p-2 rounded-lg text-red-600 hover:text-zinc-900 hover:bg-red-700 font-semibold transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}