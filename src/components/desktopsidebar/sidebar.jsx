"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { AiOutlineEye, AiOutlineFileText } from "react-icons/ai";
import { BiSolidDashboard } from "react-icons/bi";
import { GiTestTubes } from "react-icons/gi";
import { LuFileInput } from "react-icons/lu";
import { PiStudent, PiBook } from "react-icons/pi";
import { Scan, Layers, ChevronRight } from "lucide-react";
import { LuScanText } from "react-icons/lu";
import { IoIosPeople } from "react-icons/io";
const Sidebar = () => {
  const pathname = usePathname();

  const [adminId, setAdminId] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [sidebarColor, setSidebarColor] = useState("#0096c7");
  const [textColor, setTextColor] = useState("#fcfeff");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const id = decoded?.adminId;
        const tokenRole = decoded?.role || decoded?.userRole || null;
        const tokenPerms = decoded?.permissions || [];

        if (id) setAdminId(id);
        if (tokenRole) setRole(tokenRole);
        if (Array.isArray(tokenPerms)) setPermissions(tokenPerms);

        // Optional: fetch colors
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`,
            { id }
          );
          
          if (res.data?.success) {
            const colors = res.data.colors || {};
            // setSidebarColor(colors.sidebarColor || "#1e293b");
            // setTextColor(colors.textColor || "#f8fafc");
          }
        } catch (colorError) {
          // Keep default colors if API fails
          console.log("Using default colors");
        }
      } catch (err) {
        console.error("Sidebar bootstrap error:", err);
      }
    };

    bootstrap();
  }, []);

  // Role/permission check
  const hasAccess = (item) => {
    // allowedRoles gate (OR)
    if (item.allowedRoles?.length) {
      if (!role || !item.allowedRoles.includes(role)) return false;
    }
    // permission gate
    if (item.perm) {
      if (!Array.isArray(permissions) || !permissions.includes(item.perm))
        return false;
    }
    return true;
  };

  // Declare your policy per item
  const menuItems = useMemo(
    () => [
      {
        label: "Dashboard",
        icon: <BiSolidDashboard className="text-xl" />,
        href: "/admindashboard",
        allowedRoles: ["admin", "teacher", "content_manager", "batchmanager"],
        description: "Overview & Analytics",
      },
      {
        label: "View Students",
        icon: <AiOutlineEye className="text-xl" />,
        href: "/view_student",
        allowedRoles: ["admin", "teacher", "batchmanager"],
        description: "Student Management",
      },
      {
        label: "Batches",
        icon: <PiStudent className="text-xl" />,
        href: "/batches",
        allowedRoles: ["batchmanager", "admin", "teacher"],
        description: "Batch Operations",
      },
      {
        label: "Practice Test",
        icon: <AiOutlineFileText className="text-xl" />,
        href: "/Practisetest",
        allowedRoles: ["admin", "teacher"],
        description: "Practice Assessments",
      },
      {
        label: "Customized Test",
        icon: <GiTestTubes className="text-xl" />,
        href: "/Customize",
        allowedRoles: ["admin", "teacher"],
        description: "Custom Test Builder",
      },
      {
        label: "Generate Test",
        icon: <LuFileInput className="text-xl" />,
        href: "/generatetest",
        allowedRoles: ["admin", "teacher"],
        description: "Auto Test Generation",
      },
      {
        label: "Post Notice",
        icon: <PiBook className="text-xl" />,
        href: "/notice",
        allowedRoles: ["admin", "content_manager", "teacher"],
        description: "Announcements",
      },
      {
        label: "Scan OMR",
        icon: <Scan className="text-xl" />,
        href: "/scan-omr",
        allowedRoles: ["admin", "content_manager", "teacher"],
        description: "OMR Processing",
      },
      {
        label: "Scan & Add Questions",
        icon: <LuScanText className="text-2xl" />,
        href: "/chapterwisequestion",
        allowedRoles: ["admin", "content_manager"],
        description:
          "Add questions via scan",
      },
      {
        label: "Test Series",
        icon: <Layers className="text-xl" />,
        href: "/test-series",
        allowedRoles: ["admin", "teacher", "content_manager"],
        description: "Series Management",
      },
      {
        label: "Manage Staff",
        icon: <IoIosPeople className="text-2xl" />,
        href: "/add-staff",
        allowedRoles: ["admin"],
        description: "Staff Administration",
      },
    ],
    [role, permissions]
  );

  const visibleItems = useMemo(() => menuItems.filter(hasAccess), [menuItems]);

  return (
    <div
      className="hidden w-72 md:flex md:flex-col h-screen fixed top-0 left-0 z-50 shadow-2xl backdrop-blur-sm"
      style={{
        background: `linear-gradient(180deg, ${sidebarColor} 0%, ${sidebarColor}dd 100%)`,
      }}
    >
      {/* Header Section */}
      <div className="flex-shrink-0 px-6 py-6 border-b border-white/10">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative">
            <img
              src="/neet720_logo.jpg"
              alt="NEET720 Logo"
              className="w-24 h-18 rounded-xl object-cover shadow-lg ring-2 ring-white/20"
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold" style={{ color: textColor }}>
              NEET720
            </h2>
            <p className="text-xs opacity-75" style={{ color: textColor }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-4 overflow-hidden">
        <nav className="h-full overflow-y-auto smooth-scroll transparent-scrollbar space-y-1 pr-2">
          {visibleItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <div key={index} className="relative">
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out ${
                    isActive
                      ? "bg-white/20 shadow-lg backdrop-blur-sm border border-white/30"
                      : "hover:bg-white/10 hover:backdrop-blur-sm hover:translate-x-1"
                  }`}
                  style={{ color: textColor }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-1.5 rounded-lg transition-all duration-300 ${
                        isActive
                          ? "bg-white/20 shadow-md"
                          : "group-hover:bg-white/10"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold truncate">
                        {item.label}
                      </span>
                      {item.description && (
                        <span className="text-xs opacity-60 truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "opacity-100 translate-x-1"
                        : "opacity-0 group-hover:opacity-70 group-hover:translate-x-1"
                    }`}
                  />
                </Link>

                {/* Active Indicator */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-r-full shadow-lg"
                    style={{ backgroundColor: textColor }}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="flex-shrink-0 p-4 border-t border-white/10">
        <div className="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-white/5 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {role?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: textColor }}
            >
              {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
            </p>
            <p
              className="text-xs opacity-60 truncate"
              style={{ color: textColor }}
            >
              ID: {adminId || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        .transparent-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .transparent-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          margin: 8px 0;
        }
        .transparent-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        .transparent-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .transparent-scrollbar::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.6);
        }
        /* Firefox */
        .transparent-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
        }
        /* Smooth scrolling for all elements */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
