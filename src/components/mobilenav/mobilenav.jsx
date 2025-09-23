"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronLeft, LogOut, User } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { BiSolidDashboard } from "react-icons/bi";
import { AiOutlineEye, AiOutlineFileText } from "react-icons/ai";
import { GiTestTubes } from "react-icons/gi";
import { LuFileInput, LuScanText } from "react-icons/lu";
import { PiStudent, PiBook } from "react-icons/pi";
import { Scan, Layers } from "lucide-react";
import { IoIosPeople } from "react-icons/io";

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setRole(decoded?.role || decoded?.userRole || null);
      if (Array.isArray(decoded?.permissions))
        setPermissions(decoded.permissions);
    } catch (e) {
      console.error("Token decode error:", e);
    }
  }, []);

  const hasAccess = (item) => {
    if (item.allowedRoles?.length) {
      if (!role || !item.allowedRoles.includes(role)) return false;
    }
    if (item.perm) {
      if (!Array.isArray(permissions) || !permissions.includes(item.perm))
        return false;
    }
    return true;
  };

  const menuItems = useMemo(
    () => [
      {
        section: "Main",
        links: [
          {
            label: "Dashboard",
            icon: <BiSolidDashboard />,
            href: "/admindashboard",
            allowedRoles: [
              "admin",
              "teacher",
              "content_manager",
              "batchmanager",
            ],
          },
          {
            label: "View Students",
            icon: <AiOutlineEye />,
            href: "/view_student",
            allowedRoles: ["admin", "teacher", "batchmanager"],
          },
          {
            label: "Batches",
            icon: <PiStudent />,
            href: "/batches",
            allowedRoles: ["batchmanager", "admin", "teacher"],
          },
        ],
      },
      {
        section: "Testing",
        links: [
          {
            label: "Practice Test",
            icon: <AiOutlineFileText />,
            href: "/Practisetest",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Customized Test",
            icon: <GiTestTubes />,
            href: "/Customize",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Generate Test",
            icon: <LuFileInput />,
            href: "/generatetest",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Test Series",
            icon: <Layers />,
            href: "/test-series",
            allowedRoles: ["admin", "teacher", "content_manager"],
          },
        ],
      },
      {
        section: "Content",
        links: [
          {
            label: "Post Notice",
            icon: <PiBook />,
            href: "/notice",
            allowedRoles: ["admin", "content_manager", "teacher"],
          },
          {
            label: "Scan OMR",
            icon: <Scan />,
            href: "/scan-omr",
            allowedRoles: ["admin", "content_manager", "teacher"],
          },
          {
            label: "Scan & Add Questions",
            icon: <LuScanText />,
            href: "/chapterwisequestion",
            allowedRoles: ["admin", "content_manager"],
          },
        ],
      },
      {
        section: "Management",
        links: [
          {
            label: "Manage Staff",
            icon: <IoIosPeople />,
            href: "/add-staff",
            allowedRoles: ["admin"],
          },
        ],
      },
    ],
    [role, permissions]
  );

  return (
    <div className="bg-white relative w-full flex items-center justify-between md:hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full p-4 bg-white shadow-md">
        <button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-blue-700">Neet720</h1>
        <img
          src="/neet720_logo.jpg"
          alt="Profile"
          className="w-10 h-10 rounded-full shadow-md cursor-pointer"
          onClick={() => router.push("/adminprofile")}
        />
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 rounded-r-2xl transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-blue-700">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2">
                {section.section}
              </p>
              <div className="space-y-1">
                {section.links.filter(hasAccess).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      router.push(item.href);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-blue-50 w-full text-left transition-all group"
                  >
                    <span className="text-gray-700 text-lg group-hover:text-blue-600">
                      {item.icon}
                    </span>
                    <span className="text-gray-900 text-sm font-medium group-hover:text-blue-700">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 space-y-2 bg-gray-50 rounded-2xl">
          <button
            onClick={() => {
              router.push("/adminprofile");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 w-full transition-all"
          >
            <User className="w-5 h-5 text-gray-700" />
            <span className="text-gray-900">Profile</span>
          </button>
          {/* 🔴 Logout button */}
          <button
            onClick={() => {
              // ✅ Clear specific keys first
              localStorage.removeItem("adminAuthToken");
              router.push("/");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-100 w-full transition-all"
          >
            <LogOut className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Softer Overlay with Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MobileNavbar;
