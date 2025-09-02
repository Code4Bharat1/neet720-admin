"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUserAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import {
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Shield,
} from "lucide-react";

const DesktopNavbar = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [navbarColor, setNavbarColor] = useState("#3B82F6");
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    router.push("/adminprofile");
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    router.push("/");
  };

  // useEffect(() => {
  //   const fetchNavbarColor = async () => {
  //     try {
  //       const token = localStorage.getItem("adminAuthToken");
  //       if (!token) return;

  //       const decoded = jwtDecode(token);
  //       const adminId = decoded?.id;
  //       const role = decoded?.role || decoded?.userRole || "";
  //       const name = decoded?.name || decoded?.username || "";

  //       if (!adminId) return;

  //       setUserRole(role);
  //       setUserName(name);

  //       const response = await axios.post(
  //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`,
  //         {
  //           id: adminId,
  //         }
  //       );

  //       // if (response.data.success) {
  //       //   const color = response.data.colors.navbarColor;
  //       //   if (color) {
  //       //     setNavbarColor(color); // solid color
  //       //   }
  //       // }
  //       // console.log(
  //       //   "Navbar color fetched successfully:",
  //       //   response.data.colors.navbarColor,
  //       //   navbarColor
  //       // );
  //     } catch (error) {
  //       console.error("Error fetching navbar color:", error);
  //     }
  //   };

  //   fetchNavbarColor();
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Convert Tailwind gradient classes to hex colors
  const tailwindToHex = {
    "from-blue-200": "#bfdbfe",
    "to-yellow-100": "#fef08a",
    "from-blue-400": "#60a5fa",
    "to-purple-500": "#a855f7",
    "from-slate-200": "#e2e8f0",
    "to-gray-100": "#f3f4f6",
  };

  let style = {};
  if (navbarColor && navbarColor.startsWith("from-")) {
    const [from, to] = navbarColor.split(" ");
    style.background = `linear-gradient(135deg, ${
      tailwindToHex[from] || from
    }, ${tailwindToHex[to] || to})`;
  } else if (navbarColor && /^#([0-9A-F]{3}){1,2}$/i.test(navbarColor)) {
    style.backgroundColor = navbarColor;
  } else {
    style.background = "linear-gradient(135deg, #f8fafc, #e2e8f0)";
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700",
      teacher: "bg-blue-100 text-blue-700",
      batchmanager: "bg-green-100 text-green-700",
      content_manager: "bg-purple-100 text-purple-700",
      default: "bg-gray-100 text-gray-700",
    };
    return colors[role] || colors.default;
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <Shield className="w-3 h-3" />;
    if (role === "teacher") return <User className="w-3 h-3" />;
    return <User className="w-3 h-3" />;
  };

  return (
    <div
      className="hidden md:flex h-20 px-8 py-4 items-center justify-end shadow-lg backdrop-blur-sm border-b border-white/20"
      style={style}
    >
      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-3 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-2xl hover:bg-white/40 transition-all duration-200 border border-white/30 shadow-lg"
        >
          <img
            src="/neet720_logo.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-xl object-cover border-2 border-white/50"
          />
          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-gray-800">
              {userName || "Admin User"}
            </p>
            {userRole && (
              <div className="flex items-center space-x-1">
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    userRole
                  )}`}
                >
                  {getRoleIcon(userRole)}
                  <span className="capitalize">{userRole}</span>
                </span>
              </div>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <img
                  src="/neet720_logo.jpg"
                  alt="Profile"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {userName || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userRole && (
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                          userRole
                        )}`}
                      >
                        {getRoleIcon(userRole)}
                        <span className="capitalize">{userRole}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <ul className="py-2">
              <li>
                <button
                  className="w-full px-4 py-3 hover:bg-gray-50 text-gray-700 cursor-pointer flex items-center space-x-3 transition-colors duration-200"
                  onClick={handleProfileClick}
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaUserAlt className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">View Profile</p>
                    <p className="text-xs text-gray-500">Account settings</p>
                  </div>
                </button>
              </li>

              <li className="border-t border-gray-100 mt-2 pt-2">
                <button
                  className="w-full px-4 py-3 hover:bg-red-50 text-red-600 cursor-pointer flex items-center space-x-3 transition-colors duration-200"
                  onClick={handleLogoutClick}
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Sign Out</p>
                    <p className="text-xs text-red-500">End your session</p>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;
