"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import {
  AiOutlineEye,
  AiOutlineFileText,
} from "react-icons/ai";
import { BiSolidDashboard } from "react-icons/bi";
import { GiTestTubes } from "react-icons/gi";
import { LuFileInput } from "react-icons/lu";
import { PiStudent, PiBook } from "react-icons/pi";
import { Scan } from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const [adminId, setAdminId] = useState(null);
  const [sidebarColor, setSidebarColor] = useState("#007AFF");
  const [textColor, setTextColor] = useState("#FFFFFF"); // default white text

  useEffect(() => {
    const fetchAdminColors = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) return;

        const decoded = jwtDecode(token);
        const id = decoded?.id;
        if (!id) return;

        setAdminId(id);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/newadmin/colors`,
          { id }
        );

        if (response.data.success) {
          const colors = response.data.colors;
          setSidebarColor(colors.sidebarColor || "#007AFF");
          setTextColor(colors.textColor || "#FFFFFF"); // using otherColor as textColor
        }
      } catch (error) {
        console.error("Error fetching admin colors:", error);
      }
    };

    fetchAdminColors();
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <BiSolidDashboard className="text-xl" />, href: "/admindashboard" },
    { label: "View Students", icon: <AiOutlineEye className="text-xl" />, href: "/view_student" },
    { label: "Batches", icon: <PiStudent className="text-xl" />, href: "/batches" },
    { label: "Practice Test", icon: <AiOutlineFileText className="text-xl" />, href: "/Practisetest" },
    { label: "Customized Test", icon: <GiTestTubes className="text-xl" />, href: "/Customize" },
    { label: "Generate Test", icon: <LuFileInput className="text-xl" />, href: "/generatetest" },
    { label : "Post Notice", icon : <PiBook className="text-xl" />, href : '/notice'},
    { label : "Scan OMR", icon : <Scan className="text-xl"/>, href : "/scan-omr"},
    { label : "Chapter-wise question", icon : <Scan className="text-xl"/>, href : "/chapterwisequestion"}
    
  ];

  return (
    <div
      className="hidden w-70 md:block h-screen fixed top-0 left-0 z-50 shadow-md mr-10 bg-blue-500 text-white"
    >
      <div className="my-10 flex justify-center items-center">
        <img
          src="/neet720_logo.jpg"
          alt="neet720 logo"
          className="w-40 h-22 rounded-lg object-cover"
        />
      </div>

      <ul className="space-y-1 px-4 overflow-y-auto max-h-[calc(100vh-150px)] pr-2 transparent-scrollbar">
        {menuItems.map((item, index) => {
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
