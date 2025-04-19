import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const AddCourse = () => {
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  const [courseData, setCourseData] = useState({
    course_code: "",
    course_name: "",
    department: "",
    credits: "",
    semester: "",
    batch: "",
    max_seats: 60,
    faculty_id: "",
    description: "",
    academic_year_id: ""
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  // Semester options for dropdown selection
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  // Batch options
  const batchOptions = ["2020-2024", "2021-2025", "2022-2026", "2023-2027", "2024-2028"];

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
  // Fetch academic years when component mounts
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token:", token ? "Token exists" : "No token found");
        
        console.log("Making API request to fetch academic years...");
        const response = await axios.get("http://localhost:5000/api/admin/academic-years", {
          headers: {
            Authorization: `Bearer ${token}`,
            Role: localStorage.getItem("role")
          }
        });
        
        console.log("API Response:", response.data);
        setAcademicYears(response.data.data || []);
      } catch (error) {
        console.error("Error fetching academic years:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
      }
    };
  
    fetchAcademicYears();
  }, []);

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = localStorage.getItem("role");

    if (!role || role !== "admin") {
      setMessageType("error");
      setMessage("Access denied. Admin role required.");
      return;
    }

    // Updated validation according to backend requirements
    if (!courseData.course_code || !courseData.course_name || !courseData.credits || 
        !courseData.department || !courseData.faculty_id || 
        !courseData.semester || !courseData.batch || !courseData.academic_year_id) {
      setMessageType("error");
      setMessage("Please provide all required fields: course code, name, credits, department, faculty ID, semester, batch, and academic year.");
      return;
    }

    try {
      // Convert any numeric strings to numbers before sending
      const dataToSend = {
        ...courseData,
        credits: Number(courseData.credits),
        faculty_id: Number(courseData.faculty_id),
        semester: Number(courseData.semester),
        max_seats: Number(courseData.max_seats),
        academic_year_id: Number(courseData.academic_year_id)
      };

      const response = await axios.post(
        "http://localhost:5000/api/admin/add-course",
        dataToSend,
        {
          headers: {
            Role: role,
          },
        }
      );
      setMessageType("success");
      setMessage(response.data.message);
      // Reset form
      setCourseData({
        course_code: "",
        course_name: "",
        department: "",
        credits: "",
        semester: "",
        batch: "",
        max_seats: 60,
        faculty_id: "",
        description: "",
        academic_year_id: ""
      });
    } catch (error) {
      console.error("Error details:", error);
      setMessageType("error");
      setMessage(
        error.response
          ? `Error: ${error.response.data.message || error.response.statusText}`
          : "Network error: Failed to connect to the server"
      );
    }
  };

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

  const fields = [
    { name: "course_code", label: "Course Code *", placeholder: "e.g., CS101" },
    { name: "course_name", label: "Course Name *", placeholder: "Enter course name" },
    { name: "department", label: "Department *", placeholder: "e.g., CSE, IT" },
    { name: "credits", label: "Credits *", placeholder: "e.g., 3, 4", type: "number" },
    { name: "faculty_id", label: "Faculty ID *", placeholder: "Enter faculty ID", type: "number" },
    { name: "max_seats", label: "Maximum Seats", placeholder: "e.g., 60", type: "number", value: courseData.max_seats },
    { name: "description", label: "Description", placeholder: "Enter course description" }
  ];

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
          <h3 className="text-xl font-semibold mb-4">Add New Course</h3>
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ name, label, placeholder, type, value }, i) => (
                <div key={i} className="flex flex-col">
                  <label className="font-medium mb-1">{label}</label>
                  <input
                    type={type || "text"}
                    name={name}
                    value={value !== undefined ? value : courseData[name]}
                    placeholder={placeholder}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
                    required={label.includes("*")}
                  />
                </div>
              ))}
              
              {/* Semester Selection Dropdown */}
              <div className="flex flex-col">
                <label className="font-medium mb-1">Semester *</label>
                <select
                  name="semester"
                  value={courseData.semester}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Batch Selection Dropdown */}
              <div className="flex flex-col">
                <label className="font-medium mb-1">Batch *</label>
                <select
                  name="batch"
                  value={courseData.batch}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Batch</option>
                  {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Academic Year Selection Dropdown */}
              <div className="flex flex-col">
                <label className="font-medium mb-1">Academic Year *</label>
                <select
                  name="academic_year_id"
                  value={courseData.academic_year_id}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year_name} {year.is_current ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
            >
              Add Course
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;