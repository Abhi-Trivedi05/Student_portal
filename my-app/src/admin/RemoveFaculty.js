// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const RemoveFaculty = () => {
//   const [facultyList, setFacultyList] = useState([]);
//   const [selectedFacultyId, setSelectedFacultyId] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const navigate = useNavigate();

//   // Fetch faculty list on component mount
//   useEffect(() => {
//     const fetchFaculty = async () => {
//       try {
//         // Add the admin role header based on the backend middleware
//         const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
//           headers: {
//             Role: "admin" // Required by the verifyAdmin middleware
//           }
//         });
        
//         if (response.data.success) {
//           setFacultyList(response.data.faculty);
//         } else {
//           setError("Failed to fetch faculty list.");
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || "Error fetching faculty list.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFaculty();
//   }, []);

//   const handleSelectChange = (e) => {
//     setSelectedFacultyId(e.target.value);
//   };

//   const handleRemove = async (e) => {
//     e.preventDefault();
    
//     if (!selectedFacultyId) {
//       setError("Please select a faculty member to remove.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const response = await axios.delete(
//         `http://localhost:5000/api/admin/remove-faculty/${selectedFacultyId}`,
//         {
//           headers: {
//             Role: "admin" // Required by the verifyAdmin middleware
//           }
//         }
//       );

//       if (response.data.success) {
//         setSuccessMessage(response.data.message);
//         setError("");
        
//         // Remove the faculty from the list immediately
//         setFacultyList(facultyList.filter(faculty => faculty.id !== parseInt(selectedFacultyId)));
        
//         // Reset selection
//         setSelectedFacultyId("");
        
//         // Navigate after a delay
//         setTimeout(() => navigate("/admin/dashboard"), 2000);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to remove faculty.");
//       setSuccessMessage("");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     navigate("/admin/dashboard");
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Remove Faculty</h2>
      
//       {loading && <p className="text-gray-600">Loading...</p>}
      
//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//           {error}
//         </div>
//       )}
      
//       {successMessage && (
//         <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
//           {successMessage}
//         </div>
//       )}

//       {!loading && facultyList.length === 0 && !error && (
//         <p className="text-gray-600">No faculty members found.</p>
//       )}

//       {facultyList.length > 0 && (
//         <form onSubmit={handleRemove} className="space-y-4">
//           <div>
//             <label htmlFor="faculty-select" className="block text-sm font-medium text-gray-700 mb-1">
//               Select Faculty Member
//             </label>
//             <select
//               id="faculty-select"
//               value={selectedFacultyId}
//               onChange={handleSelectChange}
//               className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
//               required
//             >
//               <option value="">-- Select Faculty --</option>
//               {facultyList.map((faculty) => (
//                 <option key={faculty.id} value={faculty.id}>
//                   {faculty.name} - {faculty.department} ({faculty.email})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center justify-between mt-6">
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={!selectedFacultyId || loading}
//               className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
//                 (!selectedFacultyId || loading) ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//             >
//               {loading ? "Processing..." : "Remove Faculty"}
//             </button>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };

// export default RemoveFaculty;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const RemoveFaculty = () => {
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
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

  // Fetch faculty list on component mount
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // Add the admin role header based on the backend middleware
        const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        });
        
        if (response.data.success) {
          setFacultyList(response.data.faculty);
        } else {
          setMessage("Failed to fetch faculty list.");
          setMessageType("error");
        }
      } catch (err) {
        setMessage(err.response?.data?.message || "Error fetching faculty list.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
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
    
    if (!selectedFacultyId) {
      setMessage("Please select a faculty member to remove.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-faculty/${selectedFacultyId}`,
        {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        }
      );

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType("success");
        
        // Remove the faculty from the list immediately
        setFacultyList(facultyList.filter(faculty => faculty.id !== parseInt(selectedFacultyId)));
        
        // Reset selection
        setSelectedFacultyId("");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove faculty.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      label: "Select Faculty *",
      name: "selectedFacultyId",
      options: facultyList,
      render: () => (
        <select
          name="selectedFacultyId"
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          className="p-2 border border-gray-300 rounded"
          required
        >
          <option value="">-- Select Faculty --</option>
          {facultyList.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name} - {faculty.department} ({faculty.email})
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
          <h3 className="text-xl font-semibold mb-4">Remove Faculty</h3>
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
              {loading ? "Processing..." : "Remove Faculty"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RemoveFaculty;