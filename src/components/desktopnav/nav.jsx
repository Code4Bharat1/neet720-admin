"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import {
  ChevronDown,
  User,
  LogOut,
  Shield,
  UserCircle,
} from "lucide-react";

const DesktopNavbar = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded?.role || decoded?.userRole || "";
        const name = decoded?.name || decoded?.username || "";
        
        setUserRole(role);
        setUserName(name);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-red-50 text-red-600 border-red-200",
      teacher: "bg-blue-50 text-blue-600 border-blue-200",
      batchmanager: "bg-green-50 text-green-600 border-green-200",
      content_manager: "bg-purple-50 text-purple-600 border-purple-200",
      default: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return colors[role] || colors.default;
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return <Shield className="w-3 h-3" />;
    return <User className="w-3 h-3" />;
  };

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="hidden md:flex h-16 px-6 items-center justify-end bg-white shadow-sm border-b border-gray-200">
      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          {/* Profile Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {getInitials(userName)}
          </div>

          {/* User Info */}
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-gray-700">
              {userName || "Admin User"}
            </p>
            {userRole && (
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border ${getRoleBadgeColor(userRole)}`}>
                {getRoleIcon(userRole)}
                <span className="capitalize">{userRole.replace("_", " ")}</span>
              </span>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
            {/* User Info Header */}
            <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* Profile Icon Circle */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <UserCircle className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {userName || "Admin User"}
                  </p>
                  {userRole && (
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border mt-1 ${getRoleBadgeColor(userRole)}`}>
                      {getRoleIcon(userRole)}
                      <span className="capitalize">{userRole.replace("_", " ")}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                className="w-full px-4 py-3 hover:bg-gray-50 text-gray-700 flex items-center space-x-3 transition-colors duration-150"
                onClick={handleProfileClick}
              >
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">View Profile</p>
                  <p className="text-xs text-gray-500">Account settings</p>
                </div>
              </button>

              <div className="border-t border-gray-100"></div>

              <button
                className="w-full px-4 py-3 hover:bg-red-50 text-red-600 flex items-center space-x-3 transition-colors duration-150"
                onClick={handleLogoutClick}
              >
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-red-500">End your session</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;