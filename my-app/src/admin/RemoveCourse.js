import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const RemoveCourse = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  
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
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/get-courses", {
          headers: { Role: "admin" }
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        setMessage("Failed to fetch courses. Please try again.");
        setMessageType("error");
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleCourseChange = (e) => {
    const id = e.target.value;
    setCourseId(id);
    setSelectedCourse(courses.find(course => course.id.toString() === id));
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

  const handleDeleteClick = (e) => {
    e.preventDefault();
    if (!courseId) {
      setMessage("Please select a course to remove.");
      setMessageType("error");
      return;
    }
    setShowConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-course/${courseId}`,
        { headers: { Role: "admin" } }
      );
      
      setMessage(response.data.message);
      setMessageType("success");
      setShowConfirm(false);
      
      // Clear the form and redirect after success
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to remove course.";
      setMessage(errorMsg);
      setMessageType("error");
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const fields = [
    {
      label: "Select Course *",
      render: () => (
        <select
          id="course-select"
          value={courseId}
          onChange={handleCourseChange}
          className="p-2 border border-gray-300 rounded"
          required
        >
          <option value="">-- Select a course --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_code} - {course.course_name}
            </option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
          </div>
          <div className="text-right text-l text-white font-bold">
            Indian Institute of Information Technology Vadodara <br />
            International Campus Diu
          </div>
        </div>
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
          <h3 className="text-xl font-semibold mb-4">Remove Course</h3>
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
          
          {isLoading && !showConfirm ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#49196c]"></div>
            </div>
          ) : (
            <form onSubmit={handleDeleteClick}>
              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ label, render }, i) => (
                  <div key={i} className="flex flex-col">
                    <label className="font-medium mb-1">{label}</label>
                    {render()}
                  </div>
                ))}
              </div>
              
              {selectedCourse && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Course Details:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Course Name:</p>
                      <p className="font-medium">{selectedCourse.course_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Course Code:</p>
                      <p className="font-medium">{selectedCourse.course_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department:</p>
                      <p className="font-medium">{selectedCourse.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Credits:</p>
                      <p className="font-medium">{selectedCourse.credits}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading || !courseId}
                className="mt-6 bg-[#49196c] text-white px-4 py-2 rounded shadow hover:bg-[#49196c] transition-colors "
              >
                {isLoading ? "Processing..." : "Remove Course"}
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to remove the course "{selectedCourse?.course_name}" ({selectedCourse?.course_code})? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {isLoading ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveCourse;