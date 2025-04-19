// import React, { useState } from "react";
// import axios from "axios";

// const AddFaculty = () => {
//   const [facultyData, setFacultyData] = useState({
//     name: "",
//     department: "",
//     qualifications: "",
//     email: "",
//     phone_number: "",
//     password: ""
//   });
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");

//   const handleChange = (e) => {
//     setFacultyData({ ...facultyData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     const role = localStorage.getItem('role');
    
//     if (!role || role !== 'admin') {
//       setMessageType("error");
//       setMessage("Access denied. Admin role required.");
//       return;
//     }
    
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/admin/add-faculty",
//         facultyData,
//         {
//           headers: {
//             'Role': role
//           }
//         }
//       );
//       setMessageType("success");
//       setMessage(response.data.message);
//       // Clear the form on success
//       setFacultyData({
//         name: "",
//         department: "",
//         qualifications: "",
//         email: "",
//         phone_number: "",
//         password: ""
//       });
//     } catch (error) {
//       setMessageType("error");
//       console.error("Error details:", error);
//       setMessage(
//         error.response 
//           ? `Error: ${error.response.data.message || error.response.statusText}` 
//           : "Network error: Failed to connect to the server"
//       );
//     }
//   };

//   return (
//     <div className="p-4 max-w-lg mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Add Faculty</h2>
      
//       {message && (
//         <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//           {message}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Name *</label>
//           <input
//             type="text"
//             name="name"
//             value={facultyData.name}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Department *</label>
//           <input
//             type="text"
//             name="department"
//             value={facultyData.department}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Qualifications</label>
//           <input
//             type="text"
//             name="qualifications"
//             value={facultyData.qualifications}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Email *</label>
//           <input
//             type="email"
//             name="email"
//             value={facultyData.email}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Phone Number</label>
//           <input
//             type="text"
//             name="phone_number"
//             value={facultyData.phone_number}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Password *</label>
//           <input
//             type="password"
//             name="password"
//             value={facultyData.password}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <button
//           type="submit"
//           className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
//         >
//           Add Faculty
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddFaculty;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const AddFaculty = () => {
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  const [facultyData, setFacultyData] = useState({
    faculty_id: "",
    name: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleChange = (e) => {
    setFacultyData({ ...facultyData, [e.target.name]: e.target.value });
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    const role = localStorage.getItem("role");

    if (!role || role !== "admin") {
      setMessageType("error");
      setMessage("Access denied. Admin role required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add-faculty",
        facultyData,
        {
          headers: {
            Role: role,
          },
        }
      );
      setMessageType("success");
      setMessage(response.data.message);
      // Reset form
      setFacultyData({
        faculty_id: "",
        name: "",
        department: "",
        designation: "",
        email: "",
        phone: "",
        password: "",
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
    { name: "faculty_id", label: "Faculty ID *", placeholder: "e.g., fac1" },
    { name: "name", label: "Name *", placeholder: "Enter faculty name" },
    { name: "department", label: "Department *", placeholder: "e.g., CSE, IT" },
    { name: "designation", label: "Designation *", placeholder: "e.g., Professor, Assistant Professor" },
    { name: "email", label: "Email *", placeholder: "Enter email address" },
    { name: "phone", label: "Phone", placeholder: "Enter phone number" },
    { name: "password", label: "Password *", placeholder: "********", type: "password" },
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
          <h3 className="text-xl font-semibold mb-4">Add New Faculty</h3>
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
                    value={facultyData[name]}
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
              Add Faculty
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;