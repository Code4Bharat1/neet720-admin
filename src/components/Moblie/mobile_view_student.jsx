"use client";
import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { IoDownloadOutline, IoPersonAddOutline, IoCloudUploadOutline, IoSchoolOutline, IoEyeOutline, IoWarningOutline, IoCloseOutline } from "react-icons/io5";
import axios from 'axios';
import * as XLSX from "xlsx";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Link from "next/link";

const Mobile_desktop_student = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLimitExceededModalOpen, setIsLimitExceededModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const importButtonRef = useRef(null);
  const fileInputRef = useRef(null);
  const [students, setStudents] = useState([]);
  const [localAdmin, setLocalAdmin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const STUDENT_LIMIT = 100; // Set student limit

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

        const processedStudents = json.map(student => {
          const firstName = student["STUDENT NAME"] || "";
          const dob = student["DOB "] || "";
          const yearOfBirth = dob ? (dob instanceof Date ? dob.getFullYear() : new Date(dob).getFullYear()) : "";

          const password = `${firstName.charAt(0)}${yearOfBirth}`;

          return {
            firstName: firstName,
            emailAddress: student["EMAIL"] || "",
            mobileNumber: student["PHONE NUMBER"] || "",
            gender: student["GENDER"] || "",
            dateOfBirth: dob || "",
            password: password, // Auto-generated password
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
          setStudents(response.data.studentInfo);
        }
  
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
  
    fetchStudentData(); 
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openAddStudentModal = () => setIsAddStudentModalOpen(true);
  const closeAddStudentModal = () => setIsAddStudentModalOpen(false);
  const openViewModal = (student) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };
  const closeViewModal = () => setIsViewModalOpen(false);
  const openLimitExceededModal = () => setIsLimitExceededModalOpen(true);
  const closeLimitExceededModal = () => setIsLimitExceededModalOpen(false);

  //to send the admin to the userprofile page
  const handleStudentClick = (studentId) => {
    // Save the student ID to localStorage
    localStorage.setItem('studentId', studentId);
  
    // Redirect to the desktopuserprofile page
    window.location.href = '/desktopuserprofile';  // This will navigate the user to the profile page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const firstName = formData.get("name");
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
          duration: 5000
        });
        setIsSubmitting(false);
        return;
      }
    }
  
    // Validate if all required fields are present
    if (!email || !firstName || !dateOfBirth || !phoneNumber || !gender) {
      toast.error("All fields are required", {
        duration: 5000
      });
      setIsSubmitting(false);
      return;
    }
  
    // Prevent adding more students if the limit is reached
    if (students.length >= STUDENT_LIMIT) {
      toast.error("Student limit of 100 has been reached. Cannot add more students.", {
        duration: 5000
      });
      openLimitExceededModal();
      closeAddStudentModal();
      setIsSubmitting(false);
      return;
    }
  
    // Validate email format
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format", {
        duration: 5000
      });
      setIsSubmitting(false);
      return;
    }
  
    const birthYear = new Date(dateOfBirth).getFullYear();
    const password = `${firstName.charAt(0)}${birthYear}`;
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/save`, {
        email,
        password, 
        firstName,
        dateOfBirth,
        phoneNumber,
        gender,
        addedByAdminId,  
      });

      setIsSubmitting(false);
  
      if (response.status === 201) {
        await sendEmail(email, password);
        setStudents((prevStudents) => [...prevStudents, response.data.student]);
        toast.success("Student added successfully and email sent!", {
          duration: 5000
        });
        
        closeAddStudentModal();
      }
    } catch (error) {
      console.error("Error saving student data:", error);
      setIsSubmitting(false);
      toast.error("Error saving student data", {
        duration: 5000
      });
    }
  };

  const sendEmail = async (email, password) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/email`, {
        to: email,
        subject: 'Congratulations, you were added to the Exam Portal',
        text: `Hello, \n\nCongratulations! You have been successfully added to the Exam Portal.\nYour login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nBest regards,\nThe Exam Portal Team`
      });

      if (response.status === 200) {
        console.log('Email sent successfully');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Define the headers
    const headers = ["STUDENT NAME", "EMAIL", "PHONE NUMBER", "GENDER", "DOB"];
    
    // Create example data (one row with empty cells)
    const data = [headers, ["", "", "", "", ""]];
    
    // Create a worksheet from the data
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // Generate the Excel file
    XLSX.writeFile(wb, "student_template.xlsx");
  };

  const handleExport = () => {
    const headers = ["Sr.No,Student Name,Email,Phone Number,Gender,DOB,Status"];
    const rows = students.map(student =>
      `${student.id},${student.fullName || "N/A"},${student.email || "N/A"},${student.phoneNumber || "N/A"},${student.gender || "N/A"},${student.dateOfBirth || "N/A"},${student.status || "N/A"}`
    );
    const csvContent = [...headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
  
    try {
      const currentCount = students.length;
      const spaceLeft = STUDENT_LIMIT - currentCount;
  
      if (spaceLeft <= 0) {
        toast.error("Student limit of 100 has been reached. Cannot upload more students.", {
          duration: 5000,
        });
        openLimitExceededModal();
        return;
      }
  
      let studentsToAdd = students.slice(0, spaceLeft);
  
      if (students.length > spaceLeft) {
        toast.success(`Only ${spaceLeft} students were added. Student limit of 100 reached.`, {
          duration: 5000,
        });
      }
  
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/studentdata/bulk-save`,
        { students: studentsToAdd }
      );
  
      const existingEmails = response.data.existingEmails || [];
  
      // If there are existing emails, display them in the toast message
      if (existingEmails.length > 0) {
        toast.error(
          `Some students were not added due to existing emails: ${existingEmails.join(', ')}`,
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
      closeModal();
  
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error occurred while uploading students.", {
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4 relative">
      <Head>
        <title>Student Management</title>
        <meta name="description" content="Student management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Student Navigation Button */}
      <div className="flex justify-center mb-6">
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <button className="flex items-center justify-center gap-2 h-12 w-32 text-gray-700 text-sm py-2 px-4 font-medium">
            <IoSchoolOutline className="text-yellow-500 text-lg" />
            <span>Student</span>
          </button>
        </div>
      </div>

      {/* Main content with blur effect when modals are open */}
      <div className={`transition-all duration-300 ${
        isModalOpen || isAddStudentModalOpen || isViewModalOpen || isLimitExceededModalOpen 
        ? "blur-sm" 
        : ""
      }`}>
        <main className="mx-auto">
          {/* Template Download Button */}
          <div className="mb-4">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-white shadow-sm border border-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm w-full"
            >
              <IoDownloadOutline className="text-blue-500 text-lg" />
              <span>Download Excel Template</span>
            </button>
          </div>

          {/* Student Counter and Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
              <span className="text-xs text-yellow-700">{students.length}/{STUDENT_LIMIT}</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={openAddStudentModal}
                disabled={students.length >= STUDENT_LIMIT || isSubmitting}
                className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm shadow-sm ${
                  students.length >= STUDENT_LIMIT || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              >
                <IoPersonAddOutline className="text-lg" />
                <span>Add</span>
              </button>
              
              <button 
                onClick={openModal}
                disabled={students.length >= STUDENT_LIMIT}
                className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm shadow-sm ${
                  students.length >= STUDENT_LIMIT
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <IoCloudUploadOutline className="text-lg" />
                <span>Import</span>
              </button>
              
              <button 
                onClick={handleExport}
                className="flex items-center gap-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 text-sm shadow-sm"
              >
                <IoDownloadOutline className="text-lg" />
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white mt-4 shadow-md border rounded-xl overflow-hidden">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-b uppercase text-xs font-medium">
                  <th className="py-3 px-3 text-left">Sr.No</th>
                  <th className="py-3 px-3 text-left">Name</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs divide-y divide-gray-100">
                {students.length > 0 ? (
                  students.map((student, index) => (
                    <tr key={student.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-800 font-medium">{index + 1}</td>
                      <td 
                        className="py-3 px-3 truncate max-w-[150px] cursor-pointer text-blue-600"
                        onClick={() => handleStudentClick(student.id)}
                      >
                        {student.fullName || "N/A"}
                        <div className="text-gray-400 text-xxs truncate">{student.email || "N/A"}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <span className={`px-2 py-0.5 rounded-full text-xxs ${
                            student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status || "N/A"}
                          </span>
                          <button 
                            onClick={() => openViewModal(student)}
                            className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded-md hover:bg-yellow-500 text-xs"
                          >
                            <IoEyeOutline className="text-xs" />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <IoSchoolOutline className="text-gray-300 text-4xl mb-2" />
                        <p className="text-gray-500 mb-1">No students found</p>
                        <p className="text-gray-400 text-xs">Add students individually or import from Excel</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Import Excel Modal - with blur background */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-11/12 max-w-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Import Students</h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <label className="w-full bg-gradient-to-r from-green-50 to-blue-50 border-2 border-dashed border-green-200 text-gray-700 py-6 px-4 rounded-xl mb-5 flex flex-col items-center space-y-2 cursor-pointer hover:border-green-400 transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                  <IoCloudUploadOutline className="h-6 w-6 text-green-500" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Select Excel File</span>
                <span className="text-xs text-gray-500 text-center">Click to browse files</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv, .xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
              
              <div className="w-full flex space-x-3 justify-end">
                <button 
                  onClick={closeModal} 
                  className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleFileUpload} 
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 text-sm"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-11/12 max-w-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Student Details</h2>
              <button 
                onClick={closeViewModal} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Student ID</div>
                <div className="font-medium">{selectedStudent.id || "N/A"}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Full Name</div>
                <div className="font-medium">{selectedStudent.fullName || "N/A"}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500">Email Address</div>
                <div className="font-medium">{selectedStudent.email || "N/A"}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium">{selectedStudent.phoneNumber || "N/A"}</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Gender</div>
                  <div className="font-medium">{selectedStudent.gender || "N/A"}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="font-medium">{selectedStudent.dateOfBirth || "N/A"}</div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className={`font-medium ${
                    selectedStudent.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {selectedStudent.status || "N/A"}
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={closeViewModal}
              className="mt-5 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2.5 rounded-lg hover:from-yellow-500 hover:to-yellow-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-11/12 max-w-sm border border-gray-100">
            <div className="relative mb-5">
              <div className="bg-[#007AFF] inset-0 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-lg"></div>
              <h2 className="relative text-lg font-semibold text-center py-3 text-gray-800">
                Add New Student
              </h2>
              <button 
                onClick={closeAddStudentModal}
                className="bg-[#007AFF] top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="bg-[#007AFF] inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter student's name"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="bg-[#007AFF] inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="dob" className="block text-xs font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="bg-[#007AFF] inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="bg-[#007AFF] inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <div className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      className="form-radio h-3 w-3 text-blue-500 focus:ring-blue-500"
                      required
                    />
                    <span className="ml-2 text-xs text-gray-700">Male</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      className="form-radio h-3 w-3 text-pink-500 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Female</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Other"
                      className="form-radio h-3 w-3 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">Other</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAddStudentModal}
                  className="w-full py-2.5 px-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-2.5 px-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-colors text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Student'}
                </button>
              </div>
              
              <div className="text-center text-xxs text-gray-500 mt-2">
                Student will receive login credentials via email
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limit Exceeded Modal */}
      {isLimitExceededModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-11/12 max-w-sm border border-red-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <IoWarningOutline className="h-8 w-8 text-red-500" />
              </div>
              
              <h2 className="text-lg font-semibold text-red-600 mb-2">Student Limit Reached</h2>
              
              <p className="text-gray-600 text-sm mb-5">
                You've reached the maximum limit of {STUDENT_LIMIT} students. To add more students, please upgrade your plan or contact support.
              </p>
              
              <button
                onClick={closeLimitExceededModal}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors text-sm"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add a text-xxs utility class for extra small text */}
      <style jsx>{`
        .text-xxs {
          font-size: 0.65rem;
          line-height: 1rem;
        }
      `}</style>
    </div>
  );
};

export default Mobile_desktop_student;