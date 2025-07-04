"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUserAlt } from "react-icons/fa";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

const DesktopNavbar = () => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [navbarColor, setNavbarColor] = useState("from-blue-200 to-yellow-100");
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    router.push("/adminprofile");
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    router.push("/");
  };

  useEffect(() => {
    const fetchNavbarColor = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const adminId = decoded?.id;

        if (!adminId) return;

        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`, {
          id: adminId,
        });

        if (response.data.success) {
          const color = response.data.colors.navbarColor;
          if (color) {
            setNavbarColor(""); // Remove gradient if solid color is set
            document.documentElement.style.setProperty('--admin-navbar-color', color);
          }
        }
      } catch (error) {
        console.error("Error fetching navbar color:", error);
      }
    };

    fetchNavbarColor();
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

  return (
    <div
      className={`hidden md:flex h-[90px] p-4 items-center justify-end relative ${
        navbarColor ? `bg-gradient-to-r ${navbarColor}` : `bg-[var(--admin-navbar-color)]`
      }`}
    >
      <div className="flex items-center space-x-4 mr-4">
        <img
          src="/profilphoto.png"
          alt="Profile"
          className="w-16 h-16 rounded-2xl border border-gray-300 cursor-pointer"
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-4 top-24 bg-white shadow-lg rounded-lg w-48 py-2 z-50"
          >
            <ul className="text-gray-700">
              <li
                className="px-4 py-2 hover:bg-gray-100 text-[#007AFF] cursor-pointer flex items-center space-x-2"
                onClick={handleProfileClick}
              >
                <FaUserAlt />
                <span>Profile</span>
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 text-[#F02222] cursor-pointer flex items-center space-x-2"
                onClick={handleLogoutClick}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavbar;
