"use client";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import {
  IoDownloadOutline,
  IoPersonAddOutline,
  IoCloudUploadOutline,
  IoDocumentTextOutline,
  IoSchoolOutline,
  IoSearchOutline,
} from "react-icons/io5";
import axios from "axios";
import * as XLSX from "xlsx";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Link from "next/link";
import { CiUser, CiMail, CiPhone, CiCalendar } from "react-icons/ci";
import crypto from "crypto";

const Desktop_student = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [studentToUpdate, setStudentToUpdate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const importButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [localAdmin, setLocalAdmin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search
  const STUDENT_LIMIT = 100; // Set student limit

  // Filter students based on search term - FIXED
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      // Convert student.id to string before using includes
      (student.id && student.id.toString().includes(searchLower)) ||
      (student.firstName &&
        student.firstName.toLowerCase().includes(searchLower)) ||
      (student.lastName &&
        student.lastName.toLowerCase().includes(searchLower)) ||
      (student.fullName &&
        student.fullName.toLowerCase().includes(searchLower)) ||
      (student.email && student.email.toLowerCase().includes(searchLower)) ||
      (student.phoneNumber &&
        student.phoneNumber.toLowerCase().includes(searchLower)) ||
      (student.gender && student.gender.toLowerCase().includes(searchLower)) ||
      (student.dateOfBirth &&
        student.dateOfBirth.toLowerCase().includes(searchLower)) ||
      (student.status && student.status.toLowerCase().includes(searchLower))
    );
  });

  const confirmDeleteStudent = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  const openUpdateModal = (student) => {
    setStudentToUpdate(student); // Set the student to be updated
    setIsUpdateModalOpen(true); // Open the modal
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false); // Close the modal
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target.result;
      try {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        const processedStudents = json.map((student) => {
          const firstNameRaw = student["FIRST NAME"] || "";
          const lastNameRaw = student["LAST NAME"] || "";
          const firstName = cleanName(firstNameRaw);
          const lastName = cleanName(lastNameRaw);
          const fullName = `${firstName} ${lastName}`.trim();
          const dob = student["DOB "] || "";
          const year = dob
            ? dob instanceof Date
              ? dob.getFullYear()
              : new Date(dob).getFullYear()
            : "";
          const password = `${firstName.charAt(0) || "X"}${year || "0000"}`;
          return {
            firstName,
            lastName,
            fullName,
            emailAddress: student["EMAIL"] || "",
            mobileNumber: student["PHONE NUMBER"] || "",
            gender: student["GENDER"] || "",
            dateOfBirth: dob || "",
            password,
            addedByAdminId: localAdmin,
          };
        });
        console.log(processedStudents);
        setStudents(processedStudents);
      } catch (error) {
        console.error("Error processing the Excel file:", error);
      }
    };
    reader.readAsBinaryString(file);
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get the admin token from localStorage
        const token = localStorage.getItem("adminAuthToken");
        if (!token) {
          console.error("No token found in localStorage.");
          return;
        }
        // Decode the token to extract the admin ID
        const decodedToken = jwtDecode(token);
        const addedByAdminId = decodedToken.id;
        console.log(addedByAdminId);
        setLocalAdmin(addedByAdminId);
        // Send the addedByAdminId in the request body
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/info`,
          {
            addedByAdminId: addedByAdminId, // Send the addedByAdminId in the request body
          }
        );
        if (response.data.studentInfo) {
          console.log(response.data.studentInfo);
          const sanitized = response.data.studentInfo.map((s) => ({
            ...s,
            fullName: cleanName(s.fullName, s.firstName, s.lastName),
          }));
          setStudents(sanitized);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchStudentData();
  }, []);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const updatedStudent = {
      id: studentToUpdate.id,
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      dateOfBirth: formData.get("dob"),
      phoneNumber: formData.get("phone"),
      gender: formData.get("gender"),
    };
    // Optimistically update the UI by updating the student data in state
    setStudents((prevStudents) =>
      prevStudents.map((s) =>
        s.id === updatedStudent.id ? { ...s, ...updatedStudent } : s
      )
    );
    try {
      // API request to update the student data
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/update`, // API endpoint for updating
        updatedStudent
      );
      setIsSubmitting(false);
      if (response.status === 200) {
        // If the API response is successful, update the student with the server response
        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.id === updatedStudent.id ? { ...s, ...response.data.student } : s
          )
        );
        toast.success("Student updated successfully", {
          duration: 5000,
        });
        closeUpdateModal();
      } else {
        toast.error("Failed to update student", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      setIsSubmitting(false);
      // In case of failure, revert the optimistic update
      setStudents((prevStudents) =>
        prevStudents.map((s) => (s.id === updatedStudent.id ? { ...s } : s))
      );
      toast.error("Error updating student data", {
        duration: 5000,
      });
    }
  };

  // Remove literal "null"/"undefined"/"n/a" tokens, collapse spaces, fallback to "Unknown"
  const cleanName = (...parts) => {
    const raw = parts
      .map((s) => (s ?? "").toString().trim())
      .filter(Boolean)
      .join(" ");
    const cleaned = raw
      .replace(/\b(null|undefined|n\/a|na)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "Unknown";
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openAddStudentModal = () => setIsAddStudentModalOpen(true);
  const closeAddStudentModal = () => setIsAddStudentModalOpen(false);
  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);

  //to send the admin to the userprofile page
  const handleStudentClick = (studentId) => {
    // Save the student ID to localStorage
    localStorage.setItem("studentId", studentId);
    // Redirect to the desktopuserprofile page
    window.location.href = "/desktopuserprofile"; // This will navigate the user to the profile page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.target);
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const email = formData.get("email");
    const dateOfBirth = formData.get("dob");
    const phoneNumber = formData.get("phone");
    const gender = formData.get("gender");
    // Get the JWT token from localStorage
    const token = localStorage.getItem("adminAuthToken");
    // Decode the token to extract the admin ID
    let addedByAdminId = null;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        addedByAdminId = decodedToken.id;
        // Assuming the admin ID is stored in the "id" field of the token
      } catch (error) {
        console.error("Error decoding token:", error);
        toast.error("Invalid token", {
          duration: 5000,
        });
        return;
      }
    }
    // Validate if all required fields are present
    if (
      !email ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !phoneNumber ||
      !gender
    ) {
      toast.error("All fields are required", {
        duration: 5000,
      });
      setIsSubmitting(false); // Reset loading state
      return;
    }
    // Prevent adding more students if the limit is reached
    if (students.length >= STUDENT_LIMIT) {
      toast.error(
        "Student limit of 100 has been reached. Cannot add more students.",
        {
          duration: 5000,
        }
      );
      setIsSubmitting(false); // Reset loading state
      return;
    }
    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format", {
        duration: 5000,
      });
      setIsSubmitting(false); // Reset loading state
      return;
    }
    // ✅ Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error(
        "Invalid phone number. It must be 10 digits and start with 6, 7, 8, or 9.",
        {
          duration: 5000,
        }
      );
      setIsSubmitting(false); // Reset loading state
      return;
    }
    const birthYear = new Date(dateOfBirth).getFullYear();
    const passowrdGenerate = (firstName, studentId) => {
      // Take first 3 letters of name (or fallback to "STU")
      const prefix = (firstName || "STU").substring(0, 3).toUpperCase();

      // Random part: 6 chars (hex = strong randomness)
      const randomPart = crypto.randomBytes(3).toString("hex"); // e.g. "a9f4d2"

      // Timestamp part (last 4 digits of ms timestamp)
      const timePart = Date.now().toString().slice(-4); // e.g. "3842"

      // Final password format: ABC-a9f4d2-3842
      return `${prefix}-${randomPart}-${timePart}`;
    };

    const password = passowrdGenerate(firstName, Date.now());
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/save`,
        {
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          phoneNumber,
          gender,
          addedByAdminId,
        }
      );
      setIsSubmitting(false);
      if (response.status === 201) {
        await sendEmail(email, password);
        setStudents((prevStudents) => [...prevStudents, response.data.student]);
        toast.success("Student added successfully and email sent!", {
          duration: 5000,
        });
        window.location.reload(); // Reload the page to reflect changes
        closeAddStudentModal();
      }
      console.log(response);
      if (response.status === 200) {
        toast.error(JSON.parse(response.request.response).message, {
          duration: 5000,
        });
        setIsSubmitting(false); // Reset loading state
        return;
      }
    } catch (error) {
      console.error("Error saving student data:", error);
      setIsSubmitting(false);
      toast.error("Error saving student data", {
        duration: 5000,
      });
    }
  };

  const deleteStudent = async (student) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/delete`,
        {
          data: { id: student.id },
        }
      );
      if (response.status === 200) {
        setStudents((prevStudents) =>
          prevStudents.filter((s) => s.id !== student.id)
        );
        toast.success("Student deleted successfully", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Error deleting student", {
        duration: 5000,
      });
    }
  };

  const sendEmail = async (email, password) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/email`,
        {
          to: email,
          subject: "Congratulations, you were added to the Exam Portal",
          text: `Hello, \n\nCongratulations! You have been successfully added to the Exam Portal.\nYour login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nBest regards,\nThe Exam Portal Team`,
        }
      );
      if (response.status === 200) {
        console.log("Email sent successfully");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Define the headers - UPDATED to include first and last name
    const headers = [
      "FIRST NAME",
      "LAST NAME",
      "EMAIL",
      "PHONE NUMBER",
      "GENDER",
      "DOB",
    ];
    // Create example data (one row with empty cells)
    const data = [headers, ["", "", "", "", "", ""]];
    // Create a worksheet from the data
    const ws = XLSX.utils.aoa_to_sheet(data);
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    // Generate the Excel file
    XLSX.writeFile(wb, "student_template.xlsx");
  };

  const handleExport = () => {
    const headers = [
      "Sr.No,First Name,Last Name,Email,Phone Number,Gender,DOB,Status",
    ];
    const rows = students.map(
      (student) =>
        `${student.id},${student.firstName || ""},${student.lastName || ""},${
          student.email
        },${student.phoneNumber},${student.gender},${student.dateOfBirth},${
          student.status
        }`
    );
    const csvContent = [...headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_export_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    closeModal();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      const currentCount = students.length;
      const spaceLeft = STUDENT_LIMIT - currentCount;
      if (spaceLeft <= 0) {
        toast.error(
          "Student limit of 100 has been reached. Cannot upload more students.",
          {
            duration: 5000,
          }
        );
        return;
      }
      let studentsToAdd = students.slice(0, spaceLeft);
      if (students.length > spaceLeft) {
        toast.success(
          `Only ${spaceLeft} students were added. Student limit of 100 reached.`,
          {
            duration: 5000,
          }
        );
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/bulk-save`,
        { students: studentsToAdd }
      );
      const existingEmails = response.data.existingEmails || [];
      // If there are existing emails, display them in the toast message
      if (existingEmails.length > 0) {
        toast.error(
          `Some students were not added due to existing emails: ${existingEmails.join(
            ", "
          )}`,
          {
            duration: 10000,
          }
        );
      } else {
        toast.success("Students added successfully!", {
          duration: 5000,
        });
      }
      setStudents((prev) => [...prev, ...studentsToAdd]); // Update state
      console.log("Backend Response:", response.data);
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error occurred while uploading students.", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-white to-gray-50 p-6 relative max-sm:text-center overflow-x-hidden">
      <Head>
        <title>Student Management</title>
        <meta name="description" content="Student management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Top navigation button */}
      <div className="flex justify-center mb-4 sm:mb-8">
        <div className="bg-white rounded-2xl overflow-hidden">
          <button
            onClick={() => {
              /* Add navigation logic here */
            }}
            className="flex items-center justify-center gap-2 sm:gap-4 h-12 sm:h-14 w-full sm:w-fit text-gray-700 text-lg sm:text-2xl py-2 sm:py-3 px-4 sm:px-8 font-medium transition-all hover:bg-gray-50"
          >
            <IoSchoolOutline className="text-yellow-500 text-xl sm:text-2xl" />
            <span>STUDENTS</span>
          </button>
        </div>
      </div>
      <main className="max-w-6xl mx-auto w-full h-fit">
        {/* Template download button */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={handleDownloadTemplate}
            className="flex flex-row items-center gap-3 bg-white shadow-md border border-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:shadow-lg transition-all cursor-pointer"
          >
            <IoDocumentTextOutline className="text-blue-500 text-2xl mb-0" />
            <div className="flex flex-col items-start">
              <span className="font-medium text-base">
                Download Excel Template
              </span>
              <span className="text-xs text-gray-500">
                Contains: FIRST NAME, LAST NAME, EMAIL, PHONE NUMBER, GENDER,
                DOB
              </span>
            </div>
          </button>
        </div>
        {/* Title and action buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800">
              Student Management
            </h1>
            <div className="ml-0 sm:ml-4 mt-2 sm:mt-0 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
              <span className="text-xs sm:text-base text-yellow-700">
                {students.length}/{STUDENT_LIMIT} Students
              </span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={openAddStudentModal}
              disabled={students.length >= STUDENT_LIMIT || isSubmitting}
              className={`cursor-pointer flex items-center gap-2 py-2 px-4 sm:py-2.5 sm:px-5 rounded-xl shadow-sm transition-all w-full sm:w-auto ${
                students.length >= STUDENT_LIMIT
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow"
              }`}
              style={{ minWidth: 0 }}
            >
              <IoPersonAddOutline className="text-base sm:text-xl" />
              <span className="text-sm sm:text-base">Add Student</span>
            </button>
            <button
              ref={importButtonRef}
              onClick={openModal}
              disabled={students.length >= STUDENT_LIMIT}
              className={`cursor-pointer flex items-center gap-2 py-2 px-4 sm:py-2.5 sm:px-5 rounded-xl shadow-sm transition-all w-full sm:w-auto ${
                students.length >= STUDENT_LIMIT
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600 hover:shadow"
              }`}
              style={{ minWidth: 0 }}
            >
              <IoCloudUploadOutline className="text-base sm:text-xl" />
              <span className="text-sm sm:text-base">Import Excel</span>
            </button>
            {students.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 text-xs sm:text-base text-gray-600 hover:text-gray-800 bg-white py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all w-full sm:w-auto"
              >
                <IoDownloadOutline className="text-base sm:text-xl" />
                <span>Export Student List</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <IoSearchOutline className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, email, phone, gender, DOB or status..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>
      </main>

      {/* Students Table with Enhanced Borders */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full table-auto border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-b-2 border-gray-200 uppercase text-xs font-semibold tracking-wider">
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Sr.No
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Student Name
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Email
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Phone Number
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Gender
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  DOB
                </th>
                <th className="py-4 px-6 text-left border-r border-gray-200">
                  Status
                </th>
                <th className="py-4 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr
                    key={student.id || index}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-200"
                  >
                    <td className="py-4 px-6 text-gray-800 font-medium border-r border-gray-200">
                      {index + 1}
                    </td>
                    <td
                      className="py-4 px-6 cursor-pointer text-blue-600 hover:text-blue-800 hover:underline font-medium border-r border-gray-200"
                      onClick={() => handleStudentClick(student.id)}
                    >
                      {student.firstName || "N/A"} {student.lastName || "N/A"}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      {student.email || "N/A"}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      {student.phoneNumber || "N/A"}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                          student.gender === "Male"
                            ? "bg-blue-100 text-blue-800"
                            : student.gender === "Female"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {student.gender || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200 whitespace-nowrap">
                      {student.dateOfBirth || "N/A"}
                    </td>
                    <td className="py-4 px-6 border-r border-gray-200">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => confirmDeleteStudent(student)}
                        className="text-red-500 hover:text-red-700 text-[12px] font-medium  p-1 ml-2 rounded-full"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => openUpdateModal(student)}
                        className="text-blue-500 hover:text-blue-700 text-[12px] font-medium p-1 ml-2 rounded-full"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <IoSchoolOutline className="text-gray-300 text-5xl mb-3" />
                      <p className="text-gray-500 mb-1">
                        {searchTerm
                          ? "No students match your search"
                          : "No students found"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {searchTerm
                          ? "Try a different search term"
                          : "Add students individually or import from Excel"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 transition-all">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md border border-gray-100 transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Import Students
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col items-center">
              <label className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-200 text-gray-700 py-10 px-6 rounded-xl mb-6 flex flex-col items-center space-y-3 cursor-pointer hover:border-green-400 transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <IoCloudUploadOutline className="h-8 w-8 text-green-500" />
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  Select Excel File
                </span>
                <span className="text-sm text-gray-500 text-center">
                  Click to browse or drag and drop your file here
                </span>
                <input
                  id="importFileInput"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleExcelUpload}
                  style={{ display: "none" }}
                />
              </label>
              <div className="w-full flex space-x-4 justify-end">
                <button
                  onClick={closeModal}
                  className="bg-white border border-gray-200 text-gray-700 py-2.5 px-5 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-5 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal - with blur background and fixed gender options */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative">
            {/* Modal Header */}
            <div className="mb-6 relative text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add New Student
              </h2>
              <button
                onClick={closeAddStudentModal}
                className="absolute top-0 right-0 text-2xl text-gray-400 hover:text-gray-600 px-3 py-1"
              >
                &times;
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* first name */}
                <div className="relative">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <CiUser className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* last name */}
                <div className="relative">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <CiUser className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <CiMail className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Date of Birth */}
                <div className="relative">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <CiCalendar className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Phone Number */}
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <CiPhone className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <div className="flex items-center space-x-6 bg-gray-50 p-3 rounded-lg">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-500"
                        required
                      />
                      <span className="ml-2 text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  type="button"
                  onClick={closeAddStudentModal}
                  className="w-1/2 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 py-3 text-white rounded-lg transition-all shadow-sm ${
                    isSubmitting
                      ? "bg-yellow-400 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                  }`}
                >
                  {isSubmitting ? "Adding Student..." : "Add Student"}
                </button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-4">
                A welcome email with login credentials will be sent to the
                student.
              </p>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delete Student
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">{studentToDelete.firstName} {studentToDelete.lastName == "none" ? "" : studentToDelete.lastName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteStudent(studentToDelete);
                  setIsDeleteModalOpen(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* this is the update model */}
      {isUpdateModalOpen && studentToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 relative">
            {/* Modal Header */}
            <div className="mb-6 relative text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                Update Student Details
              </h2>
              <button
                onClick={closeUpdateModal}
                className="absolute top-0 right-0 text-2xl text-gray-400 hover:text-gray-600 px-3 py-1"
              >
                &times;
              </button>
            </div>
            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="relative">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  {/* <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label> */}
                  <CiUser className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="text"
                    id="firtName"
                    name="firstName"
                    placeholder="Enter first name"
                    defaultValue={studentToUpdate.firstName}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                  {/* <input
                    type="text"
                    id="lastName"
                    name="LastName"
                    placeholder="Enter last name"
                    defaultValue={studentToUpdate.lastName}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  /> */}
                </div>
                <div className="relative">
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="LastName"
                    placeholder="Enter last name"
                    defaultValue={studentToUpdate.lastName}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Email */}
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <CiMail className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    defaultValue={studentToUpdate.email}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Date of Birth */}
                <div className="relative">
                  <label
                    htmlFor="dob"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <CiCalendar className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    defaultValue={studentToUpdate.dateOfBirth}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
                {/* Phone Number */}
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <CiPhone className="absolute left-3 top-10 text-gray-400 text-lg" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="Enter phone number"
                    defaultValue={studentToUpdate.phoneNumber}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
              {/* Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <div className="flex items-center space-x-6 bg-gray-50 p-3 rounded-lg">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        className="form-radio h-4 w-4 text-blue-500 focus:ring-blue-500"
                        defaultChecked={studentToUpdate.gender === gender}
                        required
                      />
                      <span className="ml-2 text-gray-700">{gender}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="w-1/2 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-1/2 py-3 text-white rounded-lg transition-all shadow-sm ${
                    isSubmitting
                      ? "bg-yellow-400 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600"
                  }`}
                >
                  {isSubmitting ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desktop_student;
