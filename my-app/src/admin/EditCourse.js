// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const EditCourse = () => {
//   const [courseId, setCourseId] = useState("");
//   const [courseData, setCourseData] = useState({
//     course_code: "",
//     course_name: "",
//     credits: "",
//     department: "",
//     faculty_id: "",
//     semester: "",
//     batch: ""
//   });
  
//   const [facultyList, setFacultyList] = useState([]);
//   const [courseList, setCourseList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const [found, setFound] = useState(false);
//   const navigate = useNavigate();
  
//   // Fetch faculty list for dropdown
//   useEffect(() => {
//     const fetchFaculties = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
//           headers: { Role: "admin" }
//         });
        
//         if (response.data && response.data.faculty) {
//           setFacultyList(response.data.faculty);
//         }
//       } catch (error) {
//         console.error("Error fetching faculty list:", error);
//         setMessage("Failed to fetch faculty list. " + (error.response?.data?.message || error.message));
//         setMessageType("error");
//       }
//     };
    
//     fetchFaculties();
//   }, []);
  
//   // Fetch course list for dropdown
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/admin/get-courses", {
//           headers: { Role: "admin" }
//         });
        
//         if (response.data && response.data.courses) {
//           setCourseList(response.data.courses);
//         }
//       } catch (error) {
//         console.error("Error fetching course list:", error);
//         setMessage("Failed to fetch course list. " + (error.response?.data?.message || error.message));
//         setMessageType("error");
//       }
//     };
    
//     fetchCourses();
//   }, []);
  
//   const handleCourseSelect = async (e) => {
//     const selectedId = e.target.value;
//     setCourseId(selectedId);
    
//     if (!selectedId) {
//       setCourseData({
//         course_code: "",
//         course_name: "",
//         credits: "",
//         department: "",
//         faculty_id: "",
//         semester: "",
//         batch: ""
//       });
//       setFound(false);
//       return;
//     }
    
//     setFetchLoading(true);
//     setMessage("");
    
//     try {
//       const response = await axios.get(`http://localhost:5000/api/admin/course/${selectedId}`, {
//         headers: { Role: "admin" }
//       });
      
//       if (response.data) {
//         // Map the response data to our form structure
//         setCourseData({
//           course_code: response.data.course_code || "",
//           course_name: response.data.course_name || "",
//           credits: response.data.credits || "",
//           department: response.data.department || "",
//           faculty_id: response.data.faculty_id || "",
//           semester: response.data.semester || "",
//           batch: response.data.batch || ""
//         });
//         setFound(true);
//       }
//     } catch (error) {
//       console.error("Error fetching course data:", error);
//       if (error.response?.status === 404) {
//         setMessage("Course not found with ID: " + selectedId);
//       } else {
//         setMessage("Error: " + (error.response?.data?.message || error.message));
//       }
//       setMessageType("error");
//       setFound(false);
//     } finally {
//       setFetchLoading(false);
//     }
//   };
  
//   const handleChange = (e) => {
//     setCourseData({ ...courseData, [e.target.name]: e.target.value });
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");
    
//     // Form validation
//     if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
//       setMessage("Please fill all required fields");
//       setMessageType("error");
//       setLoading(false);
//       return;
//     }
    
//     try {
//       const response = await axios.put(
//         `http://localhost:5000/api/admin/edit-course/${courseId}`, 
//         courseData,
//         { headers: { Role: "admin" } }
//       );
      
//       setMessage(response.data.message || "Course updated successfully");
//       setMessageType("success");
//     } catch (error) {
//       console.error("Error updating course:", error);
//       setMessage("Failed to update course: " + (error.response?.data?.message || error.message));
//       setMessageType("error");
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="p-4 max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      
//       {message && (
//         <div className={`mb-4 p-2 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//           {message}
//         </div>
//       )}
      
//       {/* Course Selection Dropdown */}
//       <div className="mb-6 p-4 border rounded-md bg-gray-50">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">Select Course to Edit</label>
//           <select 
//             value={courseId} 
//             onChange={handleCourseSelect} 
//             className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//           >
//             <option value="">-- Select a Course --</option>
//             {courseList.map((course) => (
//               <option key={course.id} value={course.id}>
//                 {course.course_code} - {course.course_name}
//               </option>
//             ))}
//           </select>
//         </div>
//         {fetchLoading && <p className="mt-2 text-sm text-blue-600">Loading course data...</p>}
//       </div>
      
//       {/* Course Edit Form - Only shown after a course is selected */}
//       {found && (
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Course Code</label>
//             <input 
//               type="text" 
//               name="course_code" 
//               value={courseData.course_code} 
//               onChange={handleChange} 
//               required 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Course Name</label>
//             <input 
//               type="text" 
//               name="course_name" 
//               value={courseData.course_name} 
//               onChange={handleChange} 
//               required 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Credits</label>
//             <input 
//               type="number" 
//               name="credits" 
//               value={courseData.credits} 
//               onChange={handleChange} 
//               required 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Department</label>
//             <input 
//               type="text" 
//               name="department" 
//               value={courseData.department} 
//               onChange={handleChange} 
//               required 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Faculty</label>
//             <select 
//               name="faculty_id" 
//               value={courseData.faculty_id} 
//               onChange={handleChange} 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             >
//               <option value="">Select Faculty</option>
//               {facultyList.map((faculty) => (
//                 <option key={faculty.id} value={faculty.id}>
//                   {faculty.name}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Semester</label>
//             <input 
//               type="number" 
//               name="semester" 
//               value={courseData.semester} 
//               onChange={handleChange} 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Batch</label>
//             <input 
//               type="text" 
//               name="batch" 
//               value={courseData.batch} 
//               onChange={handleChange} 
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//             />
//           </div>
          
//           <div className="flex space-x-4">
//             <button 
//               type="submit" 
//               className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
//               disabled={loading}
//             >
//               {loading ? "Updating..." : "Update Course"}
//             </button>
            
//             <button 
//               type="button" 
//               onClick={() => navigate(-1)} 
//               className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };

// export default EditCourse;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const EditCourse = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  
  // State for the course ID input phase
  const [courseId, setCourseId] = useState("");
  const [idSubmitted, setIdSubmitted] = useState(false);
  
  // State for course data and editing
  const [courseData, setcourseData] = useState({
    course_code: "",
    course_name: "",
    credits: "",
    department: "",
    faculty_id: "",
    semester: "",
    batch: ""
  });
  
  // State for field selection
  const [fieldsToEdit, setFieldsToEdit] = useState({
    course_code: false,
    course_name: false,
    credits: false,
    department: false,
    faculty_id: false,
    semester: false,
    batch: false
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [courseList, setCourseList] = useState([]);

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

  // Fetch faculty list for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
          headers: { Role: "admin" }
        });
        
        if (response.data && response.data.faculty) {
          setFacultyList(response.data.faculty);
        }
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to fetch faculty list: " + (error.response?.data?.message || error.message));
        setMessageType("error");
      }
    };
    
    fetchFaculties();
  }, []);
  
  // Fetch course list for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-courses", {
          headers: { Role: "admin" }
        });
        
        if (response.data && response.data.courses) {
          setCourseList(response.data.courses);
        }
      } catch (error) {
        console.error("Error fetching course list:", error);
        setMessage("Failed to fetch course list: " + (error.response?.data?.message || error.message));
        setMessageType("error");
      }
    };
    
    fetchCourses();
  }, []);

  // Fetch course data after ID is submitted
  useEffect(() => {
    const fetchCourseData = async () => {
      if (courseId && idSubmitted) {
        try {
          setLoading(true);
          setMessage("");
          const response = await axios.get(`http://localhost:5000/api/admin/course/${courseId}`, {
            headers: { 'Role': 'admin' }
          });
          
          setcourseData({
            course_code: response.data.course_code || "",
            course_name: response.data.course_name || "",
            credits: response.data.credits || "",
            department: response.data.department || "",
            faculty_id: response.data.faculty_id || "",
            semester: response.data.semester || "",
            batch: response.data.batch || ""
          });
          setMessageType("success");
        } catch (error) {
          console.error("Full error object:", error);
          if (error.response) {
            console.error("Error response data:", error.response.data);
          }
          setMessage("Failed to fetch course data: " + (error.response?.data?.message || error.message));
          setMessageType("error");
          setIdSubmitted(false);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchCourseData();
  }, [courseId, idSubmitted]);

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (courseId.trim() === "") {
      setMessage("Please enter a course ID");
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
    setcourseData({
      ...courseData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create update data including only the fields selected for editing
    const updateData = {};
    
    Object.keys(fieldsToEdit).forEach(field => {
      if (fieldsToEdit[field]) {
        updateData[field] = courseData[field];
      }
    });
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      setMessage("Please select at least one field to update");
      setMessageType("error");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-course/${courseId}`, 
        updateData,
        {
          headers: { 'Role': 'admin' }
        }
      );
      setMessage(response.data.message || "Course updated successfully");
      setMessageType("success");
      
      // Reset form state after successful update
      setTimeout(() => {
        setIdSubmitted(false);
        setCourseId("");
        setFieldsToEdit({
          course_code: false,
          course_name: false,
          credits: false,
          department: false,
          faculty_id: false,
          semester: false,
          batch: false
        });
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update course");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIdSubmitted(false);
    setCourseId("");
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
              onClick={() => navigate("/")}
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
          <h3 className="text-xl font-semibold mb-4">Edit Course Details</h3>
          
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
            // Step 1: Enter Course ID or select from dropdown
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="font-medium mb-1 block">Select Course to Edit *</label>
                <select 
                  value={courseId} 
                  onChange={(e) => setCourseId(e.target.value)} 
                  className="p-2 border border-gray-300 rounded w-full"
                >
                  <option value="">-- Select a Course --</option>
                  {courseList.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Fetch Course Data"}
              </button>
            </form>
          ) : (
            // Step 2: Edit Course Data
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#f4f0f9] p-4 rounded-md">
                <h3 className="font-medium mb-2">Course Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">ID:</span> {courseId}</p>
                  <p><span className="font-medium">Course Code:</span> {courseData.course_code}</p>
                  <p><span className="font-medium">Course Name:</span> {courseData.course_name}</p>
                  <p><span className="font-medium">Department:</span> {courseData.department}</p>
                </div>
              </div>
              
              {/* Field Selection Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3">Select Fields to Edit</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editCourseCode"
                      name="course_code"
                      checked={fieldsToEdit.course_code}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editCourseCode">Course Code</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editCourseName"
                      name="course_name"
                      checked={fieldsToEdit.course_name}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editCourseName">Course Name</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editCredits"
                      name="credits"
                      checked={fieldsToEdit.credits}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editCredits">Credits</label>
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
                      id="editFacultyId"
                      name="faculty_id"
                      checked={fieldsToEdit.faculty_id}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editFacultyId">Faculty</label>
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
                </div>
              </div>
              
              {/* Edit Fields Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium mb-3">Edit Selected Fields</h3>
                <div className="grid grid-cols-2 gap-4">
                  {fieldsToEdit.course_code && (
                    <div>
                      <label className="font-medium mb-1 block">Course Code</label>
                      <input
                        type="text"
                        name="course_code"
                        value={courseData.course_code}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.course_name && (
                    <div>
                      <label className="font-medium mb-1 block">Course Name</label>
                      <input
                        type="text"
                        name="course_name"
                        value={courseData.course_name}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.credits && (
                    <div>
                      <label className="font-medium mb-1 block">Credits</label>
                      <input
                        type="number"
                        name="credits"
                        value={courseData.credits}
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
                        value={courseData.department}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.faculty_id && (
                    <div>
                      <label className="font-medium mb-1 block">Faculty</label>
                      <select
                        name="faculty_id"
                        value={courseData.faculty_id}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      >
                        <option value="">Select Faculty</option>
                        {facultyList.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {fieldsToEdit.semester && (
                    <div>
                      <label className="font-medium mb-1 block">Semester</label>
                      <input
                        type="number"
                        name="semester"
                        value={courseData.semester}
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
                        value={courseData.batch}
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
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Course"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCourse;