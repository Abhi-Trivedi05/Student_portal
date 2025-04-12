// // import React, { useState, useEffect } from "react";
// // import axios from "axios";

// // const AddCourse = () => {
// //   const [courseData, setCourseData] = useState({
// //     course_code: "",
// //     course_name: "",
// //     credits: "",
// //     department: "",
// //     faculty_id: "",
// //     semester: "",
// //     batch: "",
// //   });
// //   const [facultyList, setFacultyList] = useState([]);
// //   const [message, setMessage] = useState("");
// //   const [messageType, setMessageType] = useState("error"); // "error" or "success"
// //   const [isLoading, setIsLoading] = useState(false);

// //   useEffect(() => {
// //     const fetchFaculties = async () => {
// //       const role = localStorage.getItem("role");

// //       if (!role || role !== "admin") {
// //         setMessage("Access denied. Admin role required.");
// //         setMessageType("error");
// //         return;
// //       }

// //       setIsLoading(true);
// //       try {
// //         const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
// //           headers: {
// //             'Role': role
// //           }
// //         });
// //         setFacultyList(response.data.faculty);
// //       } catch (error) {
// //         console.error("Failed to fetch faculty list", error);
// //         setMessage(error.response?.data?.message || "Failed to fetch faculty list. Please try again.");
// //         setMessageType("error");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchFaculties();
// //   }, []);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setCourseData({ ...courseData, [name]: value });
// //   };

// //   const validateForm = () => {
// //     // Check required fields based on backend validation
// //     if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
// //       setMessage("Please provide all required fields: course code, name, credits, and department.");
// //       setMessageType("error");
// //       return false;
// //     }
    
// //     // If faculty is selected, ensure semester and batch are provided
// //     if (courseData.faculty_id && (!courseData.semester || !courseData.batch)) {
// //       setMessage("When assigning a faculty, please provide both semester and batch information.");
// //       setMessageType("error");
// //       return false;
// //     }
    
// //     return true;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!validateForm()) {
// //       return;
// //     }

// //     // Admin role check
// //     const role = localStorage.getItem("role");
// //     if (!role || role !== "admin") {
// //       setMessage("Access denied. Admin role required.");
// //       setMessageType("error");
// //       return;
// //     }

// //     // Convert credits to a number if it's a string
// //     const formattedData = {
// //       ...courseData,
// //       credits: Number(courseData.credits)
// //     };
    
// //     // If faculty_id is empty string, set it to null
// //     if (formattedData.faculty_id === "") {
// //       formattedData.faculty_id = null;
// //     } else {
// //       // Make sure faculty_id is a number
// //       formattedData.faculty_id = Number(formattedData.faculty_id);
// //     }
    
// //     // Same for semester
// //     if (formattedData.semester === "") {
// //       formattedData.semester = null;
// //     } else {
// //       formattedData.semester = Number(formattedData.semester);
// //     }

// //     setIsLoading(true);
// //     try {
// //       const response = await axios.post(
// //         "http://localhost:5000/api/admin/add-course", 
// //         formattedData,
// //         {
// //           headers: {
// //             'Role': role,
// //             'Content-Type': 'application/json'
// //           }
// //         }
// //       );
// //       setMessage(response.data.message);
// //       setMessageType("success");
      
// //       // Clear form on success
// //       setCourseData({
// //         course_code: "",
// //         course_name: "",
// //         credits: "",
// //         department: "",
// //         faculty_id: "",
// //         semester: "",
// //         batch: "",
// //       });
// //     } catch (error) {
// //       console.error("Error adding course:", error);
// //       setMessage(
// //         error.response?.data?.message || 
// //         "Failed to add course. Server returned: " + error.message
// //       );
// //       setMessageType("error");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="p-4 max-w-lg mx-auto">
// //       <h2 className="text-2xl font-bold mb-4">Add Course</h2>
      
// //       {message && (
// //         <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
// //           {message}
// //         </div>
// //       )}
      
// //       <form onSubmit={handleSubmit} className="space-y-4">
// //         <div>
// //           <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">Course Code*</label>
// //           <input
// //             id="course_code"
// //             type="text"
// //             name="course_code"
// //             placeholder="e.g., CS101"
// //             value={courseData.course_code}
// //             onChange={handleChange}
// //             required
// //             className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //           />
// //         </div>
        
// //         <div>
// //           <label htmlFor="course_name" className="block text-sm font-medium text-gray-700">Course Name*</label>
// //           <input
// //             id="course_name"
// //             type="text"
// //             name="course_name"
// //             placeholder="e.g., Introduction to Computer Science"
// //             value={courseData.course_name}
// //             onChange={handleChange}
// //             required
// //             className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //           />
// //         </div>
        
// //         <div>
// //           <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Credits*</label>
// //           <input
// //             id="credits"
// //             type="number"
// //             name="credits"
// //             placeholder="e.g., 3"
// //             value={courseData.credits}
// //             onChange={handleChange}
// //             required
// //             min="1"
// //             max="10"
// //             className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //           />
// //         </div>
        
// //         <div>
// //           <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department*</label>
// //           <input
// //             id="department"
// //             type="text"
// //             name="department"
// //             placeholder="e.g., Computer Science"
// //             value={courseData.department}
// //             onChange={handleChange}
// //             required
// //             className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //           />
// //         </div>

// //         <div className="border-t pt-4 mt-4">
// //           <h3 className="text-lg font-medium mb-2">Faculty Assignment (Optional)</h3>
// //           <p className="text-sm text-gray-500 mb-4">If you assign a faculty to this course, you must provide both semester and batch information.</p>
          
// //           <div>
// //             <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">Faculty</label>
// //             <select
// //               id="faculty_id"
// //               name="faculty_id"
// //               value={courseData.faculty_id}
// //               onChange={handleChange}
// //               className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //             >
// //               <option value="">Select Faculty (Optional)</option>
// //               {isLoading ? (
// //                 <option disabled>Loading faculty list...</option>
// //               ) : (
// //                 facultyList.map((faculty) => (
// //                   <option key={faculty.id} value={faculty.id}>
// //                     {faculty.name} - {faculty.department}
// //                   </option>
// //                 ))
// //               )}
// //             </select>
// //           </div>

// //           <div className={courseData.faculty_id ? "" : "opacity-50"}>
// //             <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mt-4">Semester</label>
// //             <input
// //               id="semester"
// //               type="number"
// //               name="semester"
// //               placeholder="e.g., 1"
// //               value={courseData.semester}
// //               onChange={handleChange}
// //               disabled={!courseData.faculty_id}
// //               required={!!courseData.faculty_id}
// //               min="1"
// //               max="12"
// //               className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //             />
// //           </div>

// //           <div className={courseData.faculty_id ? "" : "opacity-50"}>
// //             <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mt-4">Batch</label>
// //             <input
// //               id="batch"
// //               type="text"
// //               name="batch"
// //               placeholder="e.g., 2023-2027"
// //               value={courseData.batch}
// //               onChange={handleChange}
// //               disabled={!courseData.faculty_id}
// //               required={!!courseData.faculty_id}
// //               className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //             />
// //           </div>
// //         </div>

// //         <button
// //           type="submit"
// //           disabled={isLoading}
// //           className={`mt-6 p-3 w-full rounded transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
// //             isLoading 
// //               ? "bg-gray-400 cursor-not-allowed" 
// //               : "bg-green-500 hover:bg-green-600 text-white"
// //           }`}
// //         >
// //           {isLoading ? "Adding Course..." : "Add Course"}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default AddCourse;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { NavLink } from "react-router-dom";

// const AddCourse = () => {
//   const [courseData, setCourseData] = useState({
//     course_code: "",
//     course_name: "",
//     credits: "",
//     department: "",
//     faculty_id: "",
//     semester: "",
//     batch: "",
//   });
//   const [facultyList, setFacultyList] = useState([]);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("error");
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchFaculties = async () => {
//       const role = localStorage.getItem("role");
//       if (!role || role !== "admin") {
//         setMessage("Access denied. Admin role required.");
//         setMessageType("error");
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
//           headers: { Role: role },
//         });
//         setFacultyList(response.data.faculty);
//       } catch (error) {
//         console.error("Failed to fetch faculty list", error);
//         setMessage(error.response?.data?.message || "Failed to fetch faculty list.");
//         setMessageType("error");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFaculties();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCourseData({ ...courseData, [name]: value });
//   };

//   const validateForm = () => {
//     if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
//       setMessage("Please provide all required fields.");
//       setMessageType("error");
//       return false;
//     }
//     if (courseData.faculty_id && (!courseData.semester || !courseData.batch)) {
//       setMessage("Semester and Batch are required when assigning a faculty.");
//       setMessageType("error");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     const role = localStorage.getItem("role");
//     if (!role || role !== "admin") {
//       setMessage("Access denied. Admin role required.");
//       setMessageType("error");
//       return;
//     }

//     const formattedData = {
//       ...courseData,
//       credits: Number(courseData.credits),
//       faculty_id: courseData.faculty_id === "" ? null : Number(courseData.faculty_id),
//       semester: courseData.semester === "" ? null : Number(courseData.semester),
//     };

//     setIsLoading(true);
//     try {
//       const response = await axios.post("http://localhost:5000/api/admin/add-course", formattedData, {
//         headers: {
//           Role: role,
//           "Content-Type": "application/json",
//         },
//       });
//       setMessage(response.data.message);
//       setMessageType("success");
//       setCourseData({
//         course_code: "",
//         course_name: "",
//         credits: "",
//         department: "",
//         faculty_id: "",
//         semester: "",
//         batch: "",
//       });
//     } catch (error) {
//       console.error("Error adding course:", error);
//       setMessage(error.response?.data?.message || "Failed to add course.");
//       setMessageType("error");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gray-900 text-white p-6">
//         <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
//         <nav className="space-y-4">
//           <NavLink to="/dashboard" className="block hover:text-green-400">Dashboard</NavLink>
//           <NavLink to="/add-student" className="block hover:text-green-400">Add Student</NavLink>
//           <NavLink to="/add-faculty" className="block hover:text-green-400">Add Faculty</NavLink>
//           <NavLink to="/add-course" className="block text-green-400 font-semibold">Add Course</NavLink>
//           <NavLink to="/manage" className="block hover:text-green-400">Manage</NavLink>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-10">
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">Add Course</h1>

//         {message && (
//           <div className={`mb-6 p-4 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
//             {message}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md space-y-6 max-w-2xl">
//           <div>
//             <label className="block text-gray-700 mb-1">Course Code*</label>
//             <input type="text" name="course_code" value={courseData.course_code} onChange={handleChange}
//               placeholder="e.g., CS101" required
//               className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
//           </div>

//           <div>
//             <label className="block text-gray-700 mb-1">Course Name*</label>
//             <input type="text" name="course_name" value={courseData.course_name} onChange={handleChange}
//               placeholder="e.g., Data Structures" required
//               className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
//           </div>

//           <div className="flex gap-4">
//             <div className="w-1/2">
//               <label className="block text-gray-700 mb-1">Credits*</label>
//               <input type="number" name="credits" value={courseData.credits} onChange={handleChange}
//                 placeholder="e.g., 4" min="1" max="10" required
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
//             </div>
//             <div className="w-1/2">
//               <label className="block text-gray-700 mb-1">Department*</label>
//               <input type="text" name="department" value={courseData.department} onChange={handleChange}
//                 placeholder="e.g., Computer Science" required
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
//             </div>
//           </div>

//           <hr className="my-4" />

//           <h2 className="text-lg font-semibold text-gray-800">Faculty Assignment (Optional)</h2>
//           <p className="text-sm text-gray-500 mb-3">If assigning a faculty, you must provide both semester and batch.</p>

//           <div>
//             <label className="block text-gray-700 mb-1">Faculty</label>
//             <select name="faculty_id" value={courseData.faculty_id} onChange={handleChange}
//               className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500">
//               <option value="">Select Faculty (Optional)</option>
//               {isLoading ? (
//                 <option disabled>Loading faculty list...</option>
//               ) : (
//                 facultyList.map(faculty => (
//                   <option key={faculty.id} value={faculty.id}>
//                     {faculty.name} - {faculty.department}
//                   </option>
//                 ))
//               )}
//             </select>
//           </div>

//           <div className="flex gap-4">
//             <div className="w-1/2">
//               <label className="block text-gray-700 mb-1 mt-2">Semester</label>
//               <input type="number" name="semester" value={courseData.semester} onChange={handleChange}
//                 placeholder="e.g., 3" min="1" max="12"
//                 disabled={!courseData.faculty_id}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" />
//             </div>
//             <div className="w-1/2">
//               <label className="block text-gray-700 mb-1 mt-2">Batch</label>
//               <input type="text" name="batch" value={courseData.batch} onChange={handleChange}
//                 placeholder="e.g., 2022-2026"
//                 disabled={!courseData.faculty_id}
//                 className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50" />
//             </div>
//           </div>

//           <button type="submit"
//             disabled={isLoading}
//             className={`w-full py-3 mt-6 text-white rounded font-medium transition-colors ${
//               isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
//             }`}>
//             {isLoading ? "Adding Course..." : "Add Course"}
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default AddCourse;
import React, { useState } from "react";
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
    faculty_id: "",
    description: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = localStorage.getItem("role");

    if (!role || role !== "admin") {
      setMessageType("error");
      setMessage("Access denied. Admin role required.");
      return;
    }

    // Validate required fields according to backend requirements
    if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
      setMessageType("error");
      setMessage("Please provide all required fields: course code, name, credits, and department.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add-course",
        courseData,
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
        faculty_id: "",
        description: ""
      });
    } catch (error) {
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
    { name: "semester", label: "Semester", placeholder: "e.g., 1, 2, 3", type: "number" },
    { name: "batch", label: "Batch", placeholder: "e.g., 2023-27" },
    { name: "faculty_id", label: "Faculty ID", placeholder: "Enter faculty ID" },
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
                    required={label.includes("*")}
                  />
                </div>
              ))}
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