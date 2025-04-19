import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const EditStudent = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  
  // State for the student ID input phase
  const [studentId, setStudentId] = useState("");
  const [idSubmitted, setIdSubmitted] = useState(false);
  
  // State for the student data and editing
  const [studentData, setStudentData] = useState({
    name: "",
    programme: "",
    roll_number: "",
    department: "",
    semester: "",
    batch: "",
    cpi: "",
    faculty_advisor_id: "",
    password: "",
  });
  
  // State for password change
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State for field selection
  const [fieldsToEdit, setFieldsToEdit] = useState({
    name: false,
    programme: false,
    roll_number: false,
    department: false,
    semester: false,
    batch: false,
    cpi: false,
    faculty_advisor_id: false,
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navItems = [
    {
      title: "Manage Students",
      submenu: [
        { label: "Add Student", path: "/admin/add-student" },
        { label: "Edit Student Details", path: "/admin/edit-student" },
        { label: "Remove Student", path: "/admin/remove-student" },
      ],
    },
    {
      title: "Manage Faculty",
      submenu: [
        { label: "Add Faculty", path: "/admin/add-faculty"},
        { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Manage Courses",
      submenu: [
        { label: "Add Course", path :"/admin/add-course"},
        { label: "Edit Course Details", path: "/admin/edit-course" },
        { label: "Remove Course", path: "/admin/remove-course" },
      ],
    },
    {
      title: "Announcements",
      submenu: [{ label: "Make Announcement", path: "/admin/announcements" }],
    },
    {
      title: "Fee Approvals",
      submenu: [{ label: "Approve Fee", path: "/admin/approval/approve-fee-details" }],
    },
  ];

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  // Fetch student data after ID is submitted
  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentId && idSubmitted) {
        try {
          setMessage("");
          // Updated route to match backend implementation
          const response = await axios.get(`http://localhost:5000/api/student/${studentId}`, {
            headers: { 'Role': 'admin' }
          });
          
          // Map backend field names to frontend state
          const studentInfo = response.data;
          setStudentData({
            name: studentInfo.name || "",
            programme: studentInfo.programme || "",
            roll_number: studentInfo.student_id || "", // Using student_id from backend
            department: studentInfo.department || "",
            semester: studentInfo.current_semester || "", // Using current_semester from backend
            batch: studentInfo.batch || "",
            cpi: studentInfo.cpi || "",
            faculty_advisor_id: studentInfo.faculty_advisor_id || "",
          });
          
          setMessageType("success");
        } catch (error) {
          console.error("Full error object:", error);
          if (error.response) {
            console.error("Error response data:", error.response.data);
          }
          setMessage("Failed to fetch student data: " + (error.response?.data?.message || error.message));
          setMessageType("error");
          setIdSubmitted(false);
        }
      }
    };
    
    fetchStudentData();
  }, [studentId, idSubmitted]);

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim() === "") {
      setMessage("Please enter a student ID");
      setMessageType("error");
      return;
    }
    setIdSubmitted(true);
  };

  const handleFieldSelectionChange = (e) => {
    setFieldsToEdit({
      ...fieldsToEdit,
      [e.target.name]: e.target.checked
    });
  };

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordCheckbox = (e) => {
    setChangePassword(e.target.checked);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password if changing
    if (changePassword) {
      if (newPassword !== confirmPassword) {
        setMessage("Passwords don't match");
        setMessageType("error");
        return;
      }
      if (newPassword.length < 6) {
        setMessage("Password must be at least 6 characters long");
        setMessageType("error");
        return;
      }
    }
    
    // Create update data including only the fields selected for editing
    const updateData = {};
    
    Object.keys(fieldsToEdit).forEach(field => {
      if (fieldsToEdit[field]) {
        updateData[field] = studentData[field];
      }
    });
    
    // Add password if changing
    if (changePassword) {
      updateData.password = newPassword;
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      setMessage("Please select at least one field to update");
      setMessageType("error");
      return;
    }
    
    try {
      // Updated route to match backend implementation
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-student/${studentId}`, 
        updateData,
        {
          headers: { 'Role': 'admin' }
        }
      );
      setMessage(response.data.message || "Student updated successfully");
      setMessageType("success");
      
      // Reset form state after successful update
      setTimeout(() => {
        setIdSubmitted(false);
        setStudentId("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePassword(false);
        setFieldsToEdit({
          name: false,
          programme: false,
          roll_number: false,
          department: false,
          semester: false,
          batch: false,
          cpi: false,
          faculty_advisor_id: false,
        });
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update student");
      setMessageType("error");
    }
  };

  const handleLogout = () => {
    // Clear localStorage/sessionStorage data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentProfile");
    localStorage.removeItem("academic_year_id");
    sessionStorage.removeItem("academic_year_id");
    
    // Navigate to login page
    navigate("/");
  };

  const handleCancel = () => {
    setIdSubmitted(false);
    setStudentId("");
    setMessage("");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
          </div>
          <div className="text-right text-l text-white font-bold">
            Indian Institute of Information Technology Vadodara <br />
            International Campus Diu
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item, index) => (
            <div key={index} className="mb-1">
              <button
                onClick={() => toggleDropdown(item.title)}
                className={`w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors ${
                  activeDropdown === item.title ? "bg-[#5d2a87]" : ""
                }`}
              >
                <div className="flex items-center">
                  <span>{item.title}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    activeDropdown === item.title ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Submenu */}
              {activeDropdown === item.title && (
                <div className="ml-4 mt-1 space-y-1 py-1">
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => navigate(subItem.path)}
                      className="w-full flex items-center p-2 text-sm rounded bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer with hover Logout */}
        <div className="mt-auto p-4 border-t border-[#5d2a87] relative group">
          <div className="text-gray-300 cursor-pointer">👤 Admin User</div>
          <div className="absolute left-4 bottom-12 bg-white text-black shadow rounded w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#efeaf2] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Edit Student Details</h3>
          
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
          
          {!idSubmitted ? (
            // Step 1: Enter Student ID
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="font-medium mb-1 block">Enter Student ID *</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="Enter Student ID"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
              >
                Fetch Student Data
              </button>
            </form>
          ) : (
            // Step 2: Edit Student Data
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#f4f0f9] p-4 rounded-md">
                <h3 className="font-medium mb-2">Student Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">ID:</span> {studentId}</p>
                  <p><span className="font-medium">Name:</span> {studentData.name}</p>
                  <p><span className="font-medium">Programme:</span> {studentData.programme}</p>
                  <p><span className="font-medium">CPI:</span> {studentData.cpi || "Not Available"}</p>
                </div>
              </div>
              
              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changePassword}
                    onChange={handlePasswordCheckbox}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="changePassword" className="font-medium">
                    Change Password
                  </label>
                </div>
                
                {changePassword && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="font-medium mb-1 block">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        className="p-2 border border-gray-300 rounded w-full"
                        placeholder="New Password"
                      />
                    </div>
                    <div>
                      <label className="font-medium mb-1 block">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="p-2 border border-gray-300 rounded w-full"
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Field Selection Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3">Select Fields to Edit</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editName"
                      name="name"
                      checked={fieldsToEdit.name}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editName">Name</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editProgramme"
                      name="programme"
                      checked={fieldsToEdit.programme}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editProgramme">Programme</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editRollNumber"
                      name="roll_number"
                      checked={fieldsToEdit.roll_number}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editRollNumber">Roll Number</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editDepartment"
                      name="department"
                      checked={fieldsToEdit.department}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editDepartment">Department</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editSemester"
                      name="semester"
                      checked={fieldsToEdit.semester}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editSemester">Semester</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editBatch"
                      name="batch"
                      checked={fieldsToEdit.batch}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editBatch">Batch</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editCpi"
                      name="cpi"
                      checked={fieldsToEdit.cpi}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editCpi">CPI</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editFacultyAdvisorId"
                      name="faculty_advisor_id"
                      checked={fieldsToEdit.faculty_advisor_id}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editFacultyAdvisorId">Faculty Advisor</label>
                  </div>
                </div>
              </div>
              
              {/* Edit Fields Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3">Edit Selected Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  {fieldsToEdit.name && (
                    <div>
                      <label className="font-medium mb-1 block">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={studentData.name}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.programme && (
                    <div>
                      <label className="font-medium mb-1 block">Programme</label>
                      <input
                        type="text"
                        name="programme"
                        value={studentData.programme}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.roll_number && (
                    <div>
                      <label className="font-medium mb-1 block">Roll Number</label>
                      <input
                        type="text"
                        name="roll_number"
                        value={studentData.roll_number}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.department && (
                    <div>
                      <label className="font-medium mb-1 block">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={studentData.department}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.semester && (
                    <div>
                      <label className="font-medium mb-1 block">Semester</label>
                      <input
                        type="text"
                        name="semester"
                        value={studentData.semester}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.batch && (
                    <div>
                      <label className="font-medium mb-1 block">Batch</label>
                      <input
                        type="text"
                        name="batch"
                        value={studentData.batch}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.cpi && (
                    <div>
                      <label className="font-medium mb-1 block">CPI</label>
                      <input
                        type="text"
                        name="cpi"
                        value={studentData.cpi}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.faculty_advisor_id && (
                    <div>
                      <label className="font-medium mb-1 block">Faculty Advisor ID</label>
                      <input
                        type="text"
                        name="faculty_advisor_id"
                        value={studentData.faculty_advisor_id}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
                >
                  Update Student
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStudent;