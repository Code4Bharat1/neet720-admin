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
import { Scan, Layers } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();

  const [adminId, setAdminId] = useState(null);
  const [role, setRole] = useState(null);              // ⬅ role from token/API
  const [permissions, setPermissions] = useState([]);  // ⬅ optional granular perms
  const [sidebarColor, setSidebarColor] = useState("#007AFF");
  const [textColor, setTextColor] = useState("#FFFFFF");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const id = decoded?.id;
        const tokenRole = decoded?.role || decoded?.userRole || null;
        const tokenPerms = decoded?.permissions || [];

        if (id) setAdminId(id);
        if (tokenRole) setRole(tokenRole);
        if (Array.isArray(tokenPerms)) setPermissions(tokenPerms);

        // Optional: fetch colors (and role/perms if you prefer server truth)
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`,
          { id }
        );

        if (res.data?.success) {
          const colors = res.data.colors || {};
          setSidebarColor(colors.sidebarColor || "#007AFF");
          setTextColor(colors.textColor || "#FFFFFF");
        }

        // If your API exposes role/permissions, prefer server truth:
        // const me = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/me`, { headers: { Authorization: `Bearer ${token}` }});
        // setRole(me.data?.role ?? tokenRole);
        // setPermissions(me.data?.permissions ?? tokenPerms);

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
      if (!Array.isArray(permissions) || !permissions.includes(item.perm)) return false;
    }
    return true;
  };

  // Declare your policy per item
  const menuItems = useMemo(
    () => [
      // Everyone with an account can see Dashboard
      {
        label: "Dashboard",
        icon: <BiSolidDashboard className="text-xl" />,
        href: "/admindashboard",
        allowedRoles: [ "admin", "teacher", "content_manager", "batchmanager"],
      },
      {
        label: "View Students",
        icon: <AiOutlineEye className="text-xl" />,
        href: "/view_student",
        allowedRoles: [ "admin", "teacher","batchmanager"],
      },
      {
        label: "Batches",
        icon: <PiStudent className="text-xl" />,
        href: "/batches",
        allowedRoles: ["batchmanager", "admin", "teacher"],
      },
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
        allowedRoles: [ "admin", "teacher"],
        // Or use a permission instead of roles:
        // perm: "tests.customize:create"
      },
      {
        label: "Generate Test",
        icon: <LuFileInput className="text-xl" />,
        href: "/generatetest",
        allowedRoles: ["admin", "teacher"],
        // perm: "tests.generate:create"
      },
      {
        label: "Post Notice",
        icon: <PiBook className="text-xl" />,
        href: "/notice",
        allowedRoles: ["admin", "content_manager" , "teacher"],
        // perm: "notice:publish"
      },
      {
        label: "Scan OMR",
        icon: <Scan className="text-xl" />,
        href: "/scan-omr",
        allowedRoles: ["admin","content_manager" , "teacher"],
        // perm: "omr:scan"
      },
      {
        label: "Chapter-wise question",
        icon: <Scan className="text-xl" />,
        href: "/chapterwisequestion",
        allowedRoles: ["admin", "content_manager"],
      },
      {
        label: "Test Series",
        icon: <Layers className="text-xl" />,
        href: "/test-series",
        allowedRoles: ["admin", "teacher","content_manager"],
      },
            {
        label: "Manage Staff",
        icon: <Layers className="text-xl" />,
        href: "/add-staff",
        allowedRoles: ["admin"],
      },
    ],
    [role, permissions]
  );

  const visibleItems = useMemo(() => menuItems.filter(hasAccess), [menuItems]);

  return (
    <div
      className="hidden w-70 md:block h-screen fixed top-0 left-0 z-50 shadow-md mr-10"
      style={{ backgroundColor: sidebarColor, color: textColor }}
    >
      <div className="my-10 flex justify-center items-center">
        <img
          src="/neet720_logo.jpg"
          alt="neet720 logo"
          className="w-40 h-22 rounded-lg object-cover"
        />
      </div>

      <ul className="space-y-1 px-4 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 transparent-scrollbar">
        {visibleItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <li key={index}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-white/80 to-white/0"
                    : "hover:bg-gradient-to-r hover:from-white/80 hover:to-white/0"
                }`}
                style={{ color: textColor }}
              >
                {item.icon}
                <span className="text-lg">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
