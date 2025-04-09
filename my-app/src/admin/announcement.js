// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Announcements = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     formLink: "",
//     expiryDate: "",
//     visibility: "All",
//     importance: "Normal"
//   });
//   const [announcements, setAnnouncements] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   // Fetch existing announcements on component mount
//   useEffect(() => {
//     fetchAnnouncements();
//   }, []);

//   // Use the API base URL - adjust this based on your environment
//   // In development, we'll use a proxy, in production it might be different
//   const API_BASE_URL = process.env.NODE_ENV === 'production' 
//     ? '/api' 
//     : 'http://localhost:5000/api'; // Adjust the port as needed

//   const fetchAnnouncements = async () => {
//     setIsLoading(true);
//     try {
//       console.log(`Starting fetch request to ${API_BASE_URL}/announcements`);
//       const response = await axios.get(`${API_BASE_URL}/announcements`);
//       console.log("Response received:", response);
      
//       if (response.status !== 200) {
//         // const errorText = await response.data;
//         throw new Error(`API error: ${response.status} - ${"Error fetching announcements"}`);
//       }
      
//       const data = await response.data;
//       console.log("Successfully parsed as JSON:", data);
//       setAnnouncements(data);
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(`Fetch error: ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     try {
//       const response = await fetch(`${API_BASE_URL}/announcements`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           title: formData.title,
//           description: formData.description,
//           form_link: formData.formLink,
//           expiry_date: formData.expiryDate,
//           visibility: formData.visibility,
//           importance: formData.importance,
//           // In a real app, you would get this from authentication context
//           admin_id: 1 
//         })
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API error: ${response.status} - ${errorText}`);
//       }

//       // Reset form and show success message
//       setFormData({
//         title: "",
//         description: "",
//         formLink: "",
//         expiryDate: "",
//         visibility: "All",
//         importance: "Normal"
//       });
//       setSuccessMessage("Announcement created successfully!");
//       fetchAnnouncements(); // Refresh the list
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteAnnouncement = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this announcement?")) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
//         method: "DELETE"
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API error: ${response.status} - ${errorText}`);
//       }

//       setSuccessMessage("Announcement deleted successfully!");
//       fetchAnnouncements(); // Refresh the list
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage("");
//       }, 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">Manage Announcements</h1>
//           <button 
//             onClick={() => navigate("/admin")} 
//             className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
//           >
//             Back to Dashboard
//           </button>
//         </div>

//         {/* Create Announcement Form */}
//         <div className="bg-white p-6 rounded-lg shadow-md mb-8">
//           <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
          
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//               {error}
//             </div>
//           )}
          
//           {successMessage && (
//             <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
//               {successMessage}
//             </div>
//           )}

//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
//                 Title *
//               </label>
//               <input
//                 type="text"
//                 id="title"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
//                 Description *
//               </label>
//               <textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 rows="4"
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               ></textarea>
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="formLink">
//                 Form Link (Optional)
//               </label>
//               <input
//                 type="url"
//                 id="formLink"
//                 name="formLink"
//                 value={formData.formLink}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="https://example.com/form"
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-gray-700 font-medium mb-2" htmlFor="expiryDate">
//                 Expiry Date (Optional)
//               </label>
//               <input
//                 type="datetime-local"
//                 id="expiryDate"
//                 name="expiryDate"
//                 value={formData.expiryDate}
//                 onChange={handleChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//               <div>
//                 <label className="block text-gray-700 font-medium mb-2" htmlFor="visibility">
//                   Visibility
//                 </label>
//                 <select
//                   id="visibility"
//                   name="visibility"
//                   value={formData.visibility}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="All">All</option>
//                   <option value="Faculty">Faculty Only</option>
//                   <option value="Students">Students Only</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-gray-700 font-medium mb-2" htmlFor="importance">
//                   Importance
//                 </label>
//                 <select
//                   id="importance"
//                   name="importance"
//                   value={formData.importance}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="Normal">Normal</option>
//                   <option value="Important">Important</option>
//                   <option value="Urgent">Urgent</option>
//                 </select>
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
//               disabled={isLoading}
//             >
//               {isLoading ? "Creating..." : "Create Announcement"}
//             </button>
//           </form>
//         </div>

//         {/* Announcements List */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Existing Announcements</h2>
          
//           {isLoading && <p className="text-gray-500">Loading announcements...</p>}
          
//           {!isLoading && announcements.length === 0 && (
//             <p className="text-gray-500">No announcements found.</p>
//           )}
          
//           {announcements.map((announcement) => (
//             <div 
//               key={announcement.id} 
//               className={`border-l-4 p-4 mb-4 rounded shadow-sm ${
//                 announcement.importance === 'Urgent' 
//                   ? 'border-red-500 bg-red-50' 
//                   : announcement.importance === 'Important' 
//                   ? 'border-yellow-500 bg-yellow-50' 
//                   : 'border-blue-500 bg-blue-50'
//               }`}
//             >
//               <div className="flex justify-between">
//                 <h3 className="font-bold text-lg">{announcement.title}</h3>
//                 <div className="flex gap-2">
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     announcement.visibility === 'All' 
//                       ? 'bg-green-100 text-green-800' 
//                       : announcement.visibility === 'Faculty' 
//                       ? 'bg-purple-100 text-purple-800' 
//                       : 'bg-blue-100 text-blue-800'
//                   }`}>
//                     {announcement.visibility}
//                   </span>
//                   <span className={`px-2 py-1 text-xs rounded-full ${
//                     announcement.importance === 'Urgent' 
//                       ? 'bg-red-100 text-red-800' 
//                       : announcement.importance === 'Important' 
//                       ? 'bg-yellow-100 text-yellow-800' 
//                       : 'bg-gray-100 text-gray-800'
//                   }`}>
//                     {announcement.importance}
//                   </span>
//                 </div>
//               </div>
              
//               <p className="my-2">{announcement.description}</p>
              
//               {announcement.form_link && (
//                 <a 
//                   href={announcement.form_link} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline inline-block mb-2"
//                 >
//                   Open Form Link
//                 </a>
//               )}
              
//               <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
//                 <div>
//                   <span>Published: {new Date(announcement.publication_date).toLocaleString()}</span>
//                   {announcement.expiry_date && (
//                     <span className="ml-3">
//                       Expires: {new Date(announcement.expiry_date).toLocaleString()}
//                     </span>
//                   )}
//                 </div>
                
//                 <button 
//                   onClick={() => handleDeleteAnnouncement(announcement.id)}
//                   className="text-red-600 hover:text-red-800"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Announcements;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Announcements = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // Sample announcements for UI design
  const sampleAnnouncements = [
    {
      id: 1,
      title: "Mid Semester Examination Schedule",
      content: "Mid semester examinations for all B.Tech programs will commence from April 15th, 2024. The detailed schedule will be shared soon.",
      priority: "urgent",
      target_audience: "All Students",
      created_at: "2024-03-20T10:30:00",
      created_by: "Academic Section"
    },
    {
      id: 2,
      title: "Campus Maintenance Notice",
      content: "The campus wifi network will be under maintenance on Sunday, March 24th, from 2 PM to 5 PM.",
      priority: "important",
      target_audience: "All",
      created_at: "2024-03-19T15:45:00",
      created_by: "IT Department"
    },
    {
      id: 3,
      title: "Cultural Club Meeting",
      content: "Monthly meeting for all cultural club representatives will be held in Seminar Hall at 5 PM on Friday.",
      priority: "normal",
      target_audience: "Club Members",
      created_at: "2024-03-18T09:15:00",
      created_by: "Student Affairs"
    }
  ];

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

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "important":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "normal":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        <div className="max-w-4xl mx-auto">
          {/* Create Announcement Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-6">Create New Announcement</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter announcement content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="all">All</option>
                    <option value="students">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#49196c] text-white rounded-lg hover:bg-[#5d2a87] transition-colors"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>

          {/* Existing Announcements Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Existing Announcements</h3>
              <div className="flex gap-4">
                <select className="p-2 border border-gray-300 rounded">
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="important">Important</option>
                  <option value="normal">Normal</option>
                </select>
                <select className="p-2 border border-gray-300 rounded">
                  <option value="all">All Audience</option>
                  <option value="students">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {sampleAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold">{announcement.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{announcement.content}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Target: {announcement.target_audience}</span>
                        <span>By: {announcement.created_by}</span>
                        <span>Posted: {formatDate(announcement.created_at)}</span>
                      </div>
                    </div>
                    <button className="text-red-500 hover:text-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;