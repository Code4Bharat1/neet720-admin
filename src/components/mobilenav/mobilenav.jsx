"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Menu, ChevronLeft, LogOut, UserCircle, Shield, User as UserIcon } from "lucide-react";
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
  const [userName, setUserName] = useState("");
  const [permissions, setPermissions] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminAuthToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setRole(decoded?.role || decoded?.userRole || null);
      setUserName(decoded?.name || decoded?.username || "Admin");
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
    return <UserIcon className="w-3 h-3" />;
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
    <div className="bg-white relative w-full flex items-center justify-between md:hidden">
      {/* Top Bar */}
      <div className="flex justify-between items-center w-full px-4 py-3 bg-white shadow-sm border-b border-gray-200">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        
        <h1 className="text-lg font-bold text-gray-800">NEET720</h1>
        
        {/* Profile Avatar */}
        <button
          onClick={() => router.push("/adminprofile")}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm"
        >
          {getInitials(userName)}
        </button>
      </div>

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Drawer Header with Profile */}
        <div className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 mt-2">
            {/* Profile Icon Circle */}
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
              <UserCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{userName || "Admin User"}</p>
              {role && (
                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-medium border mt-1 bg-white/20 border-white/30 text-white`}>
                  {getRoleIcon(role)}
                  <span className="capitalize">{role.replace("_", " ")}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Menu Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-2 px-2">
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 w-full text-left transition-colors group"
                  >
                    <span className="text-gray-600 text-lg group-hover:text-blue-600 transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-gray-700 text-sm font-medium group-hover:text-blue-700 transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50">
          <button
            onClick={() => {
              router.push("/adminprofile");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 w-full transition-colors"
          >
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm">View Profile</span>
          </button>
          
          <button
            onClick={() => {
              localStorage.removeItem("adminAuthToken");
              router.push("/");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 w-full transition-colors"
          >
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-red-600 font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default MobileNavbar;