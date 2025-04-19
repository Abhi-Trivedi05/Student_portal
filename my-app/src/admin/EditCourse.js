import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const EditCourse = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [courseData, setCourseData] = useState({
    course_code: "",
    course_name: "",
    department: "",
    credits: "",
    semester: "",
    batch: "",
    max_seats: "",
    faculty_id: "",
    description: "",
    academic_year_id: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  // Semester options for dropdown selection
  const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  // Batch options
  const batchOptions = ["2020-2024", "2021-2025", "2022-2026", "2023-2027", "2024-2028"];

  // Fetch academic years and all courses when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch academic years
        const response = await axios.get("http://localhost:5000/api/admin/academic-years", {
          headers: {
            Authorization: `Bearer`,
            Role: localStorage.getItem("role")
          }
        });
        
        console.log("API Response:", response.data);
        setAcademicYears(response.data.data || []);
        // const academicYearsRes = await axios.get("http://localhost:5000/api/admin/academic-years", {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //     Role: localStorage.getItem("role")
        //   }
        // });
        // setAcademicYears(academicYearsRes.data.academicYears || []);
        
        // Fetch all courses using the provided route
        const coursesRes = await axios.get("http://localhost:5000/api/admin/get-courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Role: localStorage.getItem("role")
          }
        });
        setAllCourses(coursesRes.data.courses || []);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setMessage("Failed to load data. Please refresh the page.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
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

  const handleSelectCourse = async (event) => {
    const courseId = event.target.value;
    if (!courseId) {
      setSelectedCourse(null);
      setCourseData({
        course_code: "",
        course_name: "",
        department: "",
        credits: "",
        semester: "",
        batch: "",
        max_seats: "",
        faculty_id: "",
        description: "",
        academic_year_id: ""
      });
      return;
    }
    
    // Find the selected course from our all courses list
    const course = allCourses.find(c => c.id === parseInt(courseId));
    if (course) {
      setSelectedCourse(course);
      setLoading(true);
      
      // Fetch detailed course information using the updated route
      try {
        const response = await axios.get(
          `http://localhost:5000/api/admin/course/${course.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Role: localStorage.getItem("role")
            }
          }
        );

        // Use the data structure from the updated route
        const courseDetails = response.data;
        
        // Get the semester course offerings separately if needed
        const offeringsResponse = await axios.get(
          `http://localhost:5000/api/admin/course/${course.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              Role: localStorage.getItem("role")
            }
          }
        );
        
        const offering = offeringsResponse.data && offeringsResponse.data.offerings && 
                          offeringsResponse.data.offerings.length > 0 ? 
                          offeringsResponse.data.offerings[0] : null;

        setCourseData({
          course_code: courseDetails.course_code || "",
          course_name: courseDetails.course_name || "",
          department: courseDetails.department || "",
          credits: courseDetails.credits || "",
          semester: courseDetails.semester || "",
          batch: courseDetails.batch || "",
          max_seats: offering?.max_seats || 60,
          faculty_id: courseDetails.faculty_id || "",
          description: courseDetails.description || "",
          academic_year_id: offering?.academic_year_id || ""
        });

        setMessage("");
      } catch (error) {
        console.error("Error fetching course details:", error);
        setMessage("Failed to load course details. Please try again.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCourse) {
      setMessage("Please select a course first");
      setMessageType("error");
      return;
    }

    try {
      // Convert any numeric strings to numbers before sending
      const dataToSend = {
        ...courseData,
        credits: courseData.credits ? Number(courseData.credits) : undefined,
        faculty_id: courseData.faculty_id ? Number(courseData.faculty_id) : undefined,
        semester: courseData.semester ? Number(courseData.semester) : undefined,
        max_seats: courseData.max_seats ? Number(courseData.max_seats) : undefined,
        academic_year_id: courseData.academic_year_id ? Number(courseData.academic_year_id) : undefined
      };

      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-course/${selectedCourse.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Role: localStorage.getItem("role")
          }
        }
      );

      setMessage(response.data.message || "Course updated successfully!");
      setMessageType("success");
      
      // Refresh the courses list
      const coursesRes = await axios.get("http://localhost:5000/api/admin/get-courses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Role: localStorage.getItem("role")
        }
      });
      setAllCourses(coursesRes.data.courses || []);
      
      // Reset selection
      setSelectedCourse(null);
      setCourseData({
        course_code: "",
        course_name: "",
        department: "",
        credits: "",
        semester: "",
        batch: "",
        max_seats: "",
        faculty_id: "",
        description: "",
        academic_year_id: ""
      });
    } catch (error) {
      console.error("Error updating course:", error);
      setMessage(
        error.response?.data?.message ||
        "Failed to update course. Please try again."
      );
      setMessageType("error");
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
        { label: "Add Faculty", path: "/admin/add-faculty" },
        { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Manage Courses",
      submenu: [
        { label: "Add Course", path: "/admin/add-course" },
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
    { name: "course_code", label: "Course Code", placeholder: "e.g., CS101" },
    { name: "course_name", label: "Course Name", placeholder: "Enter course name" },
    { name: "department", label: "Department", placeholder: "e.g., CSE, IT" },
    { name: "credits", label: "Credits", placeholder: "e.g., 3, 4", type: "number" },
    { name: "faculty_id", label: "Faculty ID", placeholder: "Enter faculty ID", type: "number" },
    { name: "max_seats", label: "Maximum Seats", placeholder: "e.g., 60", type: "number" },
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
          <h3 className="text-xl font-semibold mb-4">Edit Course</h3>
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

          {/* Course Dropdown Selection */}
          <div className="mb-6">
            <label className="block font-medium mb-2">Select Course to Edit</label>
            <select
              value={selectedCourse?.id || ""}
              onChange={handleSelectCourse}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={loading}
            >
              <option value="">-- Select a Course --</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
            
            {loading && <p className="mt-2 text-gray-600">Loading courses...</p>}
          </div>

          {/* Edit Form */}
          {selectedCourse && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ name, label, placeholder, type }, i) => (
                  <div key={i} className="flex flex-col">
                    <label className="font-medium mb-1">{label}</label>
                    <input
                      type={type || "text"}
                      name={name}
                      value={courseData[name]}
                      placeholder={placeholder}
                      onChange={handleChange}
                      className="p-2 border border-gray-300 rounded"
                    />
                  </div>
                ))}

                {/* Semester Selection Dropdown */}
                <div className="flex flex-col">
                  <label className="font-medium mb-1">Semester</label>
                  <select
                    name="semester"
                    value={courseData.semester}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
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
                  <label className="font-medium mb-1">Batch</label>
                  <select
                    name="batch"
                    value={courseData.batch}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
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
                  <label className="font-medium mb-1">Academic Year</label>
                  <select
                    name="academic_year_id"
                    value={courseData.academic_year_id}
                    onChange={handleChange}
                    className="p-2 border border-gray-300 rounded"
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
                Update Course
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCourse;