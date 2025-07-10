"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt, FaUserAlt } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
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

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`,
          {
            id: adminId,
          }
        );

        if (response.data.success) {
          const color = response.data.colors.navbarColor;
          if (color) {
            if (color.startsWith("from-")) {
              setNavbarColor(color); // gradient classes
            } else {
              setNavbarColor(color); // solid color
            }
          }
        }
        console.log(
          "Navbar color fetched successfully:",
          response.data.colors.navbarColor,
          navbarColor
        );
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

  // Convert Tailwind gradient classes to hex colors
  const tailwindToHex = {
    "from-blue-200": "#bfdbfe",
    "to-yellow-100": "#fef08a",
    // add more as needed
  };
  let style = {};
  if (navbarColor && navbarColor.startsWith("from-")) {
    const [from, to] = navbarColor.split(" ");
    style.background = `linear-gradient(to right, ${
      tailwindToHex[from] || from
    }, ${tailwindToHex[to] || to})`;
  } else if (navbarColor && /^#([0-9A-F]{3}){1,2}$/i.test(navbarColor)) {
    style.backgroundColor = navbarColor;
  } else {
    style.backgroundColor = "#ffffff";
  }

  return (
    <div
      className="hidden md:flex h-[80px] p-4 items-center justify-end"
      style={style}
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
