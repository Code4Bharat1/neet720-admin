"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

import { AiOutlineEye, AiOutlineFileText } from "react-icons/ai";
import { BiSolidDashboard } from "react-icons/bi";
import { GiTestTubes } from "react-icons/gi";
import { LuFileInput } from "react-icons/lu";
import { PiStudent, PiBook } from "react-icons/pi";
import { Scan, Layers, UserCircle } from "lucide-react";
import { LuScanText } from "react-icons/lu";
import { IoIosPeople } from "react-icons/io";

const Sidebar = () => {
  const pathname = usePathname();

  const [adminId, setAdminId] = useState(null);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const id = decoded?.adminId;
        const tokenRole = decoded?.role || decoded?.userRole || null;
        const tokenPerms = decoded?.permissions || [];
        const name = decoded?.name || decoded?.username || "";

        if (id) setAdminId(id);
        if (tokenRole) setRole(tokenRole);
        if (name) setUserName(name);
        if (Array.isArray(tokenPerms)) setPermissions(tokenPerms);
      } catch (err) {
        console.error("Sidebar bootstrap error:", err);
      }
    };

    bootstrap();
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
        items: [
          {
            label: "Dashboard",
            icon: <BiSolidDashboard className="text-xl" />,
            href: "/admindashboard",
            allowedRoles: ["admin", "teacher", "content_manager", "batchmanager"],
          },
          {
            label: "View Students",
            icon: <AiOutlineEye className="text-xl" />,
            href: "/view_student",
            allowedRoles: ["admin", "teacher", "batchmanager"],
          },
          {
            label: "Batches",
            icon: <PiStudent className="text-xl" />,
            href: "/batches",
            allowedRoles: ["batchmanager", "admin", "teacher"],
          },
        ],
      },
      {
        section: "Testing",
        items: [
          {
            label: "Practice Test",
            icon: <AiOutlineFileText className="text-xl" />,
            href: "/Practisetest",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Customized Test",
            icon: <GiTestTubes className="text-xl" />,
            href: "/Customize",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Generate Test",
            icon: <LuFileInput className="text-xl" />,
            href: "/generatetest",
            allowedRoles: ["admin", "teacher"],
          },
          {
            label: "Test Series",
            icon: <Layers className="text-xl" />,
            href: "/test-series",
            allowedRoles: ["admin", "teacher", "content_manager"],
          },
        ],
      },
      {
        section: "Content",
        items: [
          {
            label: "Post Notice",
            icon: <PiBook className="text-xl" />,
            href: "/notice",
            allowedRoles: ["admin", "content_manager", "teacher"],
          },
          {
            label: "Scan OMR",
            icon: <Scan className="text-xl" />,
            href: "/scan-omr",
            allowedRoles: ["admin", "content_manager", "teacher"],
          },
          {
            label: "Scan & Add Questions",
            icon: <LuScanText className="text-xl" />,
            href: "/chapterwisequestion",
            allowedRoles: ["admin", "content_manager"],
          },
        ],
      },
      {
        section: "Management",
        items: [
          {
            label: "Manage Staff",
            icon: <IoIosPeople className="text-xl" />,
            href: "/add-staff",
            allowedRoles: ["admin"],
          },
        ],
      },
    ],
    [role, permissions]
  );

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="hidden w-72 md:flex md:flex-col h-screen fixed top-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm">
      {/* Header Section */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-gray-200">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/neet720_logo.jpg"
            alt="NEET720 Logo"
            className="w-20 h-16 rounded-lg object-cover shadow-sm"
          />
          <div className="text-center">
            <h2 className="text-base font-bold text-gray-800">NEET720</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 px-3">
              {section.section}
            </p>
            <nav className="space-y-1">
              {section.items.filter(hasAccess).map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`${
                        isActive ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer Section - User Info */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 px-3 py-2">
          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <UserCircle className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {userName || "Admin User"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {role ? role.replace("_", " ") : "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 5px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;