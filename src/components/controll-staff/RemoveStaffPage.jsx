"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  UserMinus,
  User,
  Mail,
  Shield,
  AlertTriangle,
  Search,
  ArrowLeft,
  Trash2,
  UserPlus,
  Menu,
  X,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { Pencil } from "lucide-react";

export default function RemoveStaffPage() {
  const [loading, setLoading] = useState(false);
  const [deleteData, setDeleteData] = useState({ AdminId: "", reason: "" });
  const [adminList, setAdminList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function getAuthToken() {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("adminAuthToken") ||
      sessionStorage.getItem("adminAuthToken") ||
      getCookie("adminAuthToken")
    );
  }

  function getCookie(name) {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  function decodeJwtNoVerify(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadB64 = parts[1];
    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4 || 4)) % 4);

    try {
      const json = atob(padded);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  const fetchAdminList = async () => {
    try {
      const token = getAuthToken();
      if (!token) return { token: null, creatorId: null, claims: null };
      const claims = decodeJwtNoVerify(token);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/superadmin/getStaff`,
        { params: { adminId: claims.adminId } }
      );
      setAdminList(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load staff list");
    }
  };

  useEffect(() => {
    fetchAdminList();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeleteData((s) => ({ ...s, [name]: value }));
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteData.AdminId) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove staff member with ID: ${deleteData.AdminId}?`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/superadmin/deleteadmin`,
        { AdminId: deleteData.AdminId, reason: deleteData.reason }
      );

      toast.success("Staff Member Removed Successfully", { duration: 5000 });
      setDeleteData({ AdminId: "", reason: "" });
      fetchAdminList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", {
        duration: 5000,
      });
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const filteredAdmins = useMemo(() => {
    return (adminList || []).filter((admin) => {
      return (
        admin.AdminId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.Email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [adminList, searchTerm]);

  return (
    <div className="">
      <div className="pt-2 sm:pt-4 md:pt-6 lg:pt-10">
        {/* Header */}
        <div className="sticky top-0">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left side - Logo and title */}
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <div className="flex-shrink-0 p-1.5 sm:p-2 bg-red-100 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                    Remove Staff
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    Remove a staff member from your team
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/add-staff"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Staff
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 py-3">
                <div className="space-y-2">
                  <Link
                    href="/add-staff"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Staff
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          {/* Remove Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200/50 overflow-hidden">
            <form onSubmit={handleDelete} className="p-4 sm:p-6 lg:p-8">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center mb-2">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg mr-2 sm:mr-3">
                    <UserMinus className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  Remove Staff Member
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Enter staff ID and reason to remove a team member
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      <Shield className="w-4 h-4 inline mr-2 text-red-600" />
                      Staff ID to Remove
                    </label>
                    <input
                      type="text"
                      name="AdminId"
                      value={deleteData.AdminId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                      placeholder="Enter staff ID to remove"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      <AlertTriangle className="w-4 h-4 inline mr-2 text-red-600" />
                      Reason for Removal
                    </label>
                    <textarea
                      name="reason"
                      value={deleteData.reason}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none bg-gray-50/50 hover:bg-white text-sm sm:text-base"
                      placeholder="Provide a reason for removing this staff member"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 via-red-700 to-pink-700 hover:from-red-700 hover:via-red-800 hover:to-pink-800 text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-red-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 sm:space-x-3 text-base sm:text-lg shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                      <span>Removing Staff...</span>
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span>Remove Staff Member</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Staff List */}
          {/* Desktop Card View */}
          <div className="hidden lg:block">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 border-b border-gray-200/60">
                <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3">
                        <User className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      Your Team Members
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">
                      Manage your staff ({adminList.length}/4 members)
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search staff members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 w-full sm:w-64 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Staff Details
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200">
                    {filteredAdmins.map((admin, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition-all duration-200"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 bg-gray-100 rounded-lg px-3 py-1 inline-block">
                            #{index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                                <User className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {admin.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                ID: {admin.AdminId || "-"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.Email || "-"}
                            </div>
                            {admin.mobileNumber && (
                              <div className="text-xs text-gray-600">
                                Phone: {admin.mobileNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            {admin.role || "admin"}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <Link
                            href={`/edit-staff/${admin.id}`}
                            className="inline-flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200 mr-2"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredAdmins.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center">
                            <div className="p-6 bg-gray-100 rounded-full mb-4">
                              <User className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-xl font-bold mb-2">
                              No staff members found
                            </p>
                            <p className="text-gray-500 text-sm max-w-md">
                              {adminList.length === 0
                                ? "You haven't added any staff members yet."
                                : "No staff members match your search criteria."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="lg:hidden">
                {filteredAdmins.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-6 bg-gray-100 rounded-full mb-4">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg font-bold mb-2">
                        No staff members found
                      </p>
                      <p className="text-gray-500 text-sm max-w-md">
                        {adminList.length === 0
                          ? "You haven't added any staff members yet."
                          : "No staff members match your search criteria."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredAdmins.map((admin, index) => (
                      <div
                        key={index}
                        className="p-4 sm:p-6 hover:bg-blue-50/30 transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                              <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                                    {admin.name || "N/A"}
                                  </h4>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                    {admin.role || "admin"}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  ID: {admin.AdminId || "-"}
                                </p>
                                <div className="space-y-1">
                                  <div className="text-sm text-gray-900 flex items-center">
                                    <Mail className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">
                                      {admin.Email || "-"}
                                    </span>
                                  </div>
                                  {admin.mobileNumber && (
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <Phone className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                                      {admin.mobileNumber}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Link
                                href={`/edit-staff/${admin.id}`}
                                className="inline-flex items-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block lg:hidden">
            {filteredAdmins.length === 0 ? (
              <div className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-5 bg-gray-100 rounded-full">
                    <User className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-lg font-semibold">
                    No staff members found
                  </p>
                  <p className="text-gray-500 text-sm max-w-xs">
                    {adminList.length === 0
                      ? "You haven't added any staff members yet."
                      : "No staff members match your search criteria."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-2 sm:px-4">
                {filteredAdmins.map((admin, index) => (
                  <div
                    key={index}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                          <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            {admin.name || "N/A"}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                            {admin.role || "admin"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-1 truncate">
                          ID: {admin.AdminId || "-"}
                        </p>

                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center truncate">
                            <Mail className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                            <span className="truncate">
                              {admin.Email || "-"}
                            </span>
                          </div>
                          {admin.mobileNumber && (
                            <div className="text-sm text-gray-600 flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-2 text-gray-400 flex-shrink-0" />
                              {admin.mobileNumber}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex justify-end">
                          <Link
                            href={`/edit-staff/${admin.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50/90 backdrop-blur-sm border-2 border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center">
                <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg mr-3 sm:mr-4">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="text-red-800 font-bold text-base sm:text-lg">
                    Error Occurred
                  </h4>
                  <p className="text-red-700 text-sm sm:text-base mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
