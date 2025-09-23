"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  UserCog,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Pencil,
  Save,
  X,
  IdCard,
} from "lucide-react";

/* ---------- helpers to read token if your API uses it ---------- */
function getAuthToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("adminAuthToken") ||
    sessionStorage.getItem("adminAuthToken")
  );
}

const toInputDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminDetailsPage() {
  const router = useRouter();
  const { adminId } = useParams(); // /admin-details/[adminId]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState(null); // edit form state
  const [error, setError] = useState(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const getStatusTag = (expiryDate) => {
    if (!expiryDate)
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <Clock className="w-3 h-3 mr-1.5" />
          No Expiry
        </span>
      );

    const today = new Date();
    const exp = new Date(expiryDate);
    return exp > today ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3 h-3 mr-1.5" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3 mr-1.5" />
        Expired
      </span>
    );
  };

  const daysLeft = useMemo(() => {
    if (!admin?.ExpiryDate) return null;
    const diff = new Date(admin.ExpiryDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [admin]);

  const initFormFromAdmin = (a) => ({
    AdminId: a?.AdminId || adminId,
    name: a?.name || "",
    Email: a?.Email || "",
    mobileNumber: a?.mobileNumber || "",
    whatsappNumber: a?.whatsappNumber || "",
    address: a?.address || "",
    role: a?.role || "admin",
    Course: a?.Course || "",
    HodName: a?.HodName || "",
    StartDate: toInputDate(a?.StartDate) || "",
    ExpiryDate: toInputDate(a?.ExpiryDate) || "",
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // If your route is /superadmin/getadmin/:adminId
      const res = await axios.get(`${apiBase}/superadmin/getadmin/${adminId}`, {
        headers,
      });

      const data = res.data?.data || res.data;
      if (!data) {
        setError("Admin not found");
        setAdmin(null);
        return;
      }
      setAdmin(data);
      setForm(initFormFromAdmin(data));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load admin details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const startEdit = () => {
    setForm(initFormFromAdmin(admin));
    setEditMode(true);
  };

  const cancelEdit = () => {
    setForm(initFormFromAdmin(admin));
    setEditMode(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // keep only digits for phone fields, max 10
    if (name === "mobileNumber" || name === "whatsappNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((s) => ({ ...s, [name]: digits }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.Email.trim()) return "Email is required.";
    if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email))
      return "Enter a valid email.";
    if (form.mobileNumber && form.mobileNumber.length !== 10)
      return "Mobile number must be 10 digits.";
    if (form.StartDate && form.ExpiryDate) {
      const s = new Date(form.StartDate);
      const e = new Date(form.ExpiryDate);
      if (s > e) return "Expiry Date must be after Start Date.";
    }
    return null;
  };

  const saveEdit = async () => {
    const errMsg = validateForm();
    if (errMsg) {
      toast.error(errMsg);
      return;
    }

    try {
      setSaving(true);

      const token = getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // 🔧 Adjust to your backend. Two common patterns:
      // 1) PUT /superadmin/updateadmin/:AdminId
      // 2) PUT /superadmin/updateadmin (with AdminId in body)
      const payload = {
        AdminId: adminId,
        name: form.name,
        Email: form.Email,
        mobileNumber: form.mobileNumber,
        whatsappNumber: form.whatsappNumber,
        address: form.address,
        role: form.role,
        Course: form.Course,
        HodName: form.HodName,
        StartDate: form.StartDate || null,
        ExpiryDate: form.ExpiryDate || null,
      };

      console.log("Updating admin with payload:", payload);
      const res = await axios.put(
        `${apiBase}/superadmin/updateAdmin/${adminId}`,
        payload,
        { headers }
      );

      const updated = res.data?.data || payload;
      setAdmin((prev) => ({ ...prev, ...updated }));
      setEditMode(false);
      toast.success("Admin updated successfully.");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      <div className="pt-2 sm:pt-4 md:pt-6 lg:pt-10">
        {/* Header */}
        <div className="sticky top-0">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between h-auto sm:h-16 py-2 sm:py-0">
              {/* Left Section */}
              <div className="flex items-center space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    Staff Member Details
                  </h1>
                  {/* <p className="text-xs sm:text-sm text-gray-500">
                    Detailed information for Staff Member ID:{" "}
                    <span className="font-semibold">{adminId}</span>
                  </p> */}
                </div>
              </div>
              {/* Right Section */}
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <Link
                  href="/remove-staff"
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Back
                </Link>
                {!loading && !error && admin && !editMode && (
                  <button
                    onClick={startEdit}
                    className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                    Edit
                  </button>
                )}
                {!loading && !error && admin && editMode && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 disabled:opacity-60"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 disabled:opacity-60"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Main */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-4 sm:px-8 py-6 sm:py-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                {/* Left Section: Avatar + Name + Role + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white break-words">
                        {admin?.name || (editMode ? "—" : "—")}
                      </h2>
                      {admin && (
                        <div className="mt-1 sm:mt-0">
                          {getStatusTag(admin?.ExpiryDate)}
                        </div>
                      )}
                    </div>
                    <p className="text-blue-100 mt-1 sm:mt-0 text-sm sm:text-base">
                      <span className="font-medium">
                        {admin?.role || "admin"}
                      </span>
                      {admin?.Course ? ` • ${admin.Course}` : ""}
                    </p>
                  </div>
                </div>

                {/* Right Section: Staff ID */}
                <div className="flex flex-col sm:items-end gap-1 text-white/90 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-sm sm:text-base justify-start sm:justify-end">
                    <IdCard className="w-4 h-4 sm:w-4 sm:h-4" />
                    <span>Staff Member ID</span>
                  </div>
                  <div className="text-lg sm:text-lg font-semibold truncate">
                    {admin?.AdminId || adminId}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {loading ? (
                <div className="py-24 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">
                    Loading staff member details…
                  </p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              ) : !admin ? (
                <div className="py-16 text-center text-gray-600">
                  No data available for this admin.
                </div>
              ) : (
                <>
                  {/* When not editing: show cards. When editing: show form fields. */}
                  {!editMode ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Contact Card */}
                      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Mail className="w-5 h-5 text-blue-600 mr-2" />
                            Contact Information
                          </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div className="text-xs uppercase text-gray-500 mb-1">
                              Email
                            </div>
                            <div className="flex items-center text-gray-900 font-medium">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.Email || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-gray-500 mb-1">
                              Mobile
                            </div>
                            <div className="flex items-center text-gray-900 font-medium">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.mobileNumber || "—"}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase text-gray-500 mb-1">
                              WhatsApp
                            </div>
                            <div className="flex items-center text-gray-900 font-medium">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.whatsappNumber || "—"}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-xs uppercase text-gray-500 mb-1">
                              Address
                            </div>
                            <div className="flex items-start text-gray-900 font-medium">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                              {admin.address || "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Meta Card */}
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <UserCog className="w-5 h-5 text-indigo-600 mr-2" />
                            Staff Member Meta
                          </h3>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Role</span>
                            <span className="font-semibold">
                              {admin.role || "admin"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">
                              Course / Dept.
                            </span>
                            <span className="font-semibold flex items-center">
                              <Building className="w-4 h-4 mr-2 text-gray-400" />
                              {admin.Course || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">HOD</span>
                            <span className="font-semibold">
                              {admin.HodName || "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Created By</span>
                            <span className="font-semibold">
                              {admin.created_by_admin_id || "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Dates Card */}
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm lg:col-span-3">
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <Calendar className="w-5 h-5 text-green-600 mr-2" />
                            Validity & Dates
                          </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-green-50">
                              <Calendar className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">
                                Start Date
                              </div>
                              <div className="font-semibold text-gray-900">
                                {admin.StartDate
                                  ? new Date(
                                      admin.StartDate
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-red-50">
                              <Calendar className="w-5 h-5 text-red-700" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">
                                Expiry Date
                              </div>
                              <div className="font-semibold text-gray-900">
                                {admin.ExpiryDate
                                  ? new Date(
                                      admin.ExpiryDate
                                    ).toLocaleDateString()
                                  : "—"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-50">
                              <Clock className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">
                                Days Left
                              </div>
                              <div className="font-semibold text-gray-900">
                                {admin.ExpiryDate ? `${daysLeft} days` : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // -------- EDIT MODE FORM --------
                    <form
                      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveEdit();
                      }}
                    >
                      {/* Left: Identity & Contact */}
                      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <User className="w-5 h-5 text-blue-600 mr-2" />
                            Edit Admin
                          </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form?.name || ""}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Email
                            </label>
                            <input
                              type="email"
                              name="Email"
                              value={form?.Email || ""}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Mobile (10 digits)
                            </label>
                            <input
                              type="tel"
                              name="mobileNumber"
                              value={form?.mobileNumber || ""}
                              onChange={handleChange}
                              maxLength={10}
                              inputMode="numeric"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              WhatsApp (10 digits)
                            </label>
                            <input
                              type="tel"
                              name="whatsappNumber"
                              value={form?.whatsappNumber || ""}
                              onChange={handleChange}
                              maxLength={10}
                              inputMode="numeric"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Address
                            </label>
                            <textarea
                              name="address"
                              value={form?.address || ""}
                              onChange={handleChange}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Right: Meta & Dates */}
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                        <div className="p-6 border-b border-gray-100">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <UserCog className="w-5 h-5 text-indigo-600 mr-2" />
                            Meta & Validity
                          </h3>
                        </div>
                        <div className="p-6 space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Role
                            </label>
                            <select
                              name="role"
                              value={form?.role || "admin"}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="batchmanager">
                                Batch Manager
                              </option>
                              <option value="teacher">Teacher</option>
                              <option value="supporter">Supporter</option>
                              <option value="content_manager">
                                Content Creator
                              </option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Course / Department
                            </label>
                            <input
                              type="text"
                              name="Course"
                              value={form?.Course || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              HOD Name
                            </label>
                            <input
                              type="text"
                              name="HodName"
                              value={form?.HodName || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              name="StartDate"
                              value={form?.StartDate || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <input
                              type="date"
                              name="ExpiryDate"
                              value={form?.ExpiryDate || ""}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="lg:col-span-3 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => router.back()}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-60"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium transition disabled:opacity-60"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
