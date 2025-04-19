
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const RemoveStudent = () => {
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
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

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-students", {
          headers: { Role: "admin" },
        });
        if (response.data.students) setStudentList(response.data.students);
        else setMessage("Failed to fetch student list.");
      } catch (err) {
        setMessage(err.response?.data?.message || "Error fetching student list.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

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

  const handleRemove = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setMessageType("error");
      setMessage("Please select a student to remove.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-student/${selectedStudentId}`,
        { headers: { Role: "admin" } }
      );
      if (response.data.success) {
        setMessageType("success");
        setMessage(response.data.message);
        setStudentList((prev) => prev.filter((student) => student.student_id !== selectedStudentId));
        setSelectedStudentId("");
      }
    } catch (err) {
      setMessageType("error");
      setMessage(err.response?.data?.message || "Failed to remove student.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Select Student *",
      name: "selectedStudentId",
      options: studentList,
      render: () => (
        <select
          name="selectedStudentId"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        >
          <option value="">-- Select Student --</option>
          {studentList.map((student) => (
            <option key={student.student_id} value={student.student_id}>
              {student.name} - {student.programme} ({student.student_id})
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
          <h3 className="text-xl font-semibold mb-4">Remove Student</h3>
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
          <form onSubmit={handleRemove}>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ label, render }, i) => (
                <div key={i} className="flex flex-col">
                  <label className="font-medium mb-1">{label}</label>
                  {render()}
                </div>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
            >
              {loading ? "Processing..." : "Remove Student"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RemoveStudent;
