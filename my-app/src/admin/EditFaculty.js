// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const EditFaculty = () => {
//   const [facultyList, setFacultyList] = useState([]);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [selectedFaculty, setSelectedFaculty] = useState(null);
//   const [facultyData, setFacultyData] = useState({
//     name: "",
//     department: "",
//     qualifications: "",
//     email: "",
//     phone_number: "",
//     password: "",
//     status: "active"
//   });
//   const [updateLoading, setUpdateLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const navigate = useNavigate();

//   // Fetch all faculty members on component mount
//   useEffect(() => {
//     fetchAllFaculty();
//   }, []);

//   const fetchAllFaculty = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
//         headers: { Role: "admin" }
//       });
      
//       // Set faculty list from the response
//       if (response.data && response.data.faculty) {
//         setFacultyList(response.data.faculty);
//       } else {
//         setError("No faculty data found");
//       }
//     } catch (error) {
//       console.error("Error fetching faculty list:", error);
//       setError("Failed to load faculty list: " + (error.response?.data?.message || error.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectFaculty = async (id) => {
//     if (!id) {
//       setSelectedFaculty(null);
//       setFacultyData({
//         name: "",
//         department: "",
//         qualifications: "",
//         email: "",
//         phone_number: "",
//         password: "",
//         status: "active"
//       });
//       return;
//     }

//     try {
//       const response = await axios.get(`http://localhost:5000/api/admin/faculty/${id}`, {
//         headers: { Role: "admin" }
//       });
      
//       if (response.data) {
//         setFacultyData({
//           name: response.data.name || "",
//           department: response.data.department || "",
//           qualifications: response.data.qualifications || "",
//           email: response.data.email || "",
//           phone_number: response.data.phone_number || "",
//           password: "",  // Leave password empty for security
//           status: response.data.status || "active"
//         });
//         setSelectedFaculty(id);
//         setMessage("");  // Clear any previous messages
//       }
//     } catch (error) {
//       console.error("Error fetching faculty data:", error);
//       setMessage("Failed to load faculty data: " + (error.response?.data?.message || error.message));
//       setMessageType("error");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFacultyData(prevData => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setUpdateLoading(true);
//     setMessage("");
    
//     try {
//       const response = await axios.put(
//         `http://localhost:5000/api/admin/edit-faculty/${selectedFaculty}`, 
//         facultyData,
//         { headers: { Role: "admin" } }
//       );
      
//       setMessage(response.data.message || "Faculty updated successfully");
//       setMessageType("success");
      
//       // Refresh the faculty list
//       fetchAllFaculty();
//     } catch (error) {
//       console.error("Error updating faculty:", error);
//       setMessage("Failed to update faculty: " + (error.response?.data?.message || error.message));
//       setMessageType("error");
//     } finally {
//       setUpdateLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setSelectedFaculty(null);
//     setMessage("");
//   };

//   return (
//     <div className="p-4 max-w-6xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Faculty Management</h2>
      
//       {message && (
//         <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//           {message}
//         </div>
//       )}

//       <div className="flex flex-col md:flex-row gap-8">
//         {/* Faculty Selection Section */}
//         <div className="w-full md:w-1/3">
//           {error && (
//             <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
//               {error}
//             </div>
//           )}
          
//           {loading ? (
//             <div className="text-center p-4">
//               <p className="text-gray-600">Loading faculty data...</p>
//             </div>
//           ) : (
//             <div className="bg-white p-4 rounded-lg border border-gray-200">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Faculty to Edit
//                 </label>
//                 <select
//                   className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                   value={selectedFaculty || ""}
//                   onChange={(e) => handleSelectFaculty(e.target.value)}
//                 >
//                   <option value="">-- Select Faculty --</option>
//                   {facultyList.map((faculty) => (
//                     <option key={faculty.id} value={faculty.id}>
//                       ID: {faculty.id} - {faculty.name} ({faculty.department})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {facultyList.length === 0 && !loading && (
//                 <div className="text-center p-4 bg-gray-50 rounded">
//                   <p className="text-gray-600">No faculty members found</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Faculty Edit Section */}
//         <div className="w-full md:w-2/3">
//           {selectedFaculty ? (
//             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//               <h3 className="text-xl font-bold mb-4">Edit Faculty Details</h3>
              
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Name</label>
//                   <input 
//                     type="text" 
//                     name="name" 
//                     value={facultyData.name} 
//                     onChange={handleChange} 
//                     required 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Department</label>
//                   <input 
//                     type="text" 
//                     name="department" 
//                     value={facultyData.department} 
//                     onChange={handleChange} 
//                     required 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Qualifications</label>
//                   <input 
//                     type="text" 
//                     name="qualifications" 
//                     value={facultyData.qualifications} 
//                     onChange={handleChange} 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Email</label>
//                   <input 
//                     type="email" 
//                     name="email" 
//                     value={facultyData.email} 
//                     onChange={handleChange} 
//                     required 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Phone Number</label>
//                   <input 
//                     type="text" 
//                     name="phone_number" 
//                     value={facultyData.phone_number} 
//                     onChange={handleChange} 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Password</label>
//                   <input 
//                     type="password" 
//                     name="password"  
//                     value={facultyData.password} 
//                     onChange={handleChange} 
//                     placeholder="Leave blank to keep current password" 
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   />
//                   <p className="mt-1 text-sm text-gray-500">Leave blank to keep the current password</p>
//                 </div>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">Status</label>
//                   <select
//                     name="status"
//                     value={facultyData.status}
//                     onChange={handleChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
//                   >
//                     <option value="active">Active</option>
//                     <option value="inactive">Inactive</option>
//                   </select>
//                 </div>
                
//                 <div className="flex space-x-4 pt-4">
//                   <button 
//                     type="submit" 
//                     className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
//                     disabled={updateLoading}
//                   >
//                     {updateLoading ? "Saving..." : "Save Changes"}
//                   </button>
                  
//                   <button 
//                     type="button" 
//                     onClick={handleCancel} 
//                     className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           ) : (
//             <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 flex items-center justify-center h-full">
//               <p className="text-gray-500 text-center">
//                 Select a faculty member from the dropdown to edit their details.
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditFaculty;


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const EditFaculty = () => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  
  // State for the faculty ID input phase
  const [facultyId, setFacultyId] = useState("");
  const [idSubmitted, setIdSubmitted] = useState(false);
  
  // State for the faculty data and editing
  const [facultyData, setFacultyData] = useState({
    name: "",
    department: "",
    qualifications: "",
    email: "",
    phone_number: "",
    password: "",
    status: "active"
  });
  
  // State for password change
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State for field selection
  const [fieldsToEdit, setFieldsToEdit] = useState({
    name: false,
    department: false,
    qualifications: false,
    email: false,
    phone_number: false,
    status: false
  });
  
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Fetch faculty data after ID is submitted
  useEffect(() => {
    const fetchFacultyData = async () => {
      if (facultyId && idSubmitted) {
        try {
          setLoading(true);
          setMessage("");
          const response = await axios.get(`http://localhost:5000/api/admin/faculty/${facultyId}`, {
            headers: { 'Role': 'admin' }
          });
          setFacultyData({
            name: response.data.name || "",
            department: response.data.department || "",
            qualifications: response.data.qualifications || "",
            email: response.data.email || "",
            phone_number: response.data.phone_number || "",
            password: "",  // Leave password empty for security
            status: response.data.status || "active"
          });
          setMessageType("success");
        } catch (error) {
          console.error("Full error object:", error);
          if (error.response) {
            console.error("Error response data:", error.response.data);
          }
          setMessage("Failed to fetch faculty data: " + (error.response?.data?.message || error.message));
          setMessageType("error");
          setIdSubmitted(false);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFacultyData();
  }, [facultyId, idSubmitted]);

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (facultyId.trim() === "") {
      setMessage("Please enter a faculty ID");
      setMessageType("error");
      return;
    }
    setIdSubmitted(true);
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

  const handleFieldSelectionChange = (e) => {
    setFieldsToEdit({
      ...fieldsToEdit,
      [e.target.name]: e.target.checked
    });
  };

  const handleChange = (e) => {
    setFacultyData({
      ...facultyData,
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
        updateData[field] = facultyData[field];
      }
    });
    
    // Add password if changing
    if (changePassword) {
      updateData.password = newPassword;
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0 && !changePassword) {
      setMessage("Please select at least one field to update");
      setMessageType("error");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-faculty/${facultyId}`, 
        updateData,
        {
          headers: { 'Role': 'admin' }
        }
      );
      setMessage(response.data.message || "Faculty updated successfully");
      setMessageType("success");
      
      // Reset form state after successful update
      setTimeout(() => {
        setIdSubmitted(false);
        setFacultyId("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePassword(false);
        setFieldsToEdit({
          name: false,
          department: false,
          qualifications: false,
          email: false,
          phone_number: false,
          status: false
        });
        setMessage("");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update faculty");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIdSubmitted(false);
    setFacultyId("");
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
          <h3 className="text-xl font-semibold mb-4">Edit Faculty Details</h3>
          
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
            // Step 1: Enter Faculty ID
            <form onSubmit={handleIdSubmit} className="space-y-4">
              <div>
                <label className="font-medium mb-1 block">Enter Faculty ID *</label>
                <input
                  type="text"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="p-2 border border-gray-300 rounded w-full"
                  placeholder="Enter Faculty ID"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "Fetch Faculty Data"}
              </button>
            </form>
          ) : (
            // Step 2: Edit Faculty Data
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#f4f0f9] p-4 rounded-md">
                <h3 className="font-medium mb-2">Faculty Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">ID:</span> {facultyId}</p>
                  <p><span className="font-medium">Name:</span> {facultyData.name}</p>
                  <p><span className="font-medium">Department:</span> {facultyData.department}</p>
                  <p><span className="font-medium">Status:</span> {facultyData.status}</p>
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
                      id="editQualifications"
                      name="qualifications"
                      checked={fieldsToEdit.qualifications}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editQualifications">Qualifications</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editEmail"
                      name="email"
                      checked={fieldsToEdit.email}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editEmail">Email</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editPhoneNumber"
                      name="phone_number"
                      checked={fieldsToEdit.phone_number}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editPhoneNumber">Phone Number</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editStatus"
                      name="status"
                      checked={fieldsToEdit.status}
                      onChange={handleFieldSelectionChange}
                      className="mr-2 h-4 w-4"
                    />
                    <label htmlFor="editStatus">Status</label>
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
                        value={facultyData.name}
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
                        value={facultyData.department}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.qualifications && (
                    <div>
                      <label className="font-medium mb-1 block">Qualifications</label>
                      <input
                        type="text"
                        name="qualifications"
                        value={facultyData.qualifications}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.email && (
                    <div>
                      <label className="font-medium mb-1 block">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={facultyData.email}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.phone_number && (
                    <div>
                      <label className="font-medium mb-1 block">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={facultyData.phone_number}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      />
                    </div>
                  )}
                  
                  {fieldsToEdit.status && (
                    <div>
                      <label className="font-medium mb-1 block">Status</label>
                      <select
                        name="status"
                        value={facultyData.status}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
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
                  {loading ? "Updating..." : "Update Faculty"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditFaculty;