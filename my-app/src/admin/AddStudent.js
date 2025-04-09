// import React, { useState } from "react";
// import axios from "axios";

// const AddStudent = () => {
//   const [studentData, setStudentData] = useState({
//     student_id: "",
//     name: "",
//     programme: "",
//     department: "",
//     cpi: "",
//     current_semester: "",
//     batch: "",
//     faculty_advisor_id: "",
//     password: ""
//   });
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");

//   const handleChange = (e) => {
//     setStudentData({ ...studentData, [e.target.name]: e.target.value });
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
//         "http://localhost:5000/api/admin/add-student",
//         studentData,
//         {
//           headers: {
//             'Role': role
//           }
//         }
//       );
//       setMessageType("success");
//       setMessage(response.data.message);
//       // Clear the form on success
//       setStudentData({
//         student_id: "",
//         name: "",
//         programme: "",
//         department: "",
//         cpi: "",
//         current_semester: "",
//         batch: "",
//         faculty_advisor_id: "",
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
//       <h2 className="text-2xl font-bold mb-4">Add Student</h2>
      
//       {message && (
//         <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//           {message}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Student ID *</label>
//           <input
//             type="text"
//             name="student_id"
//             value={studentData.student_id}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Name *</label>
//           <input
//             type="text"
//             name="name"
//             value={studentData.name}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Programme *</label>
//           <input
//             type="text"
//             name="programme"
//             value={studentData.programme}
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
//             value={studentData.department}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">CPI</label>
//           <input
//             type="number"
//             name="cpi"
//             value={studentData.cpi}
//             onChange={handleChange}
//             step="0.01"
//             min="0"
//             max="10"
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Current Semester *</label>
//           <input
//             type="number"
//             name="current_semester"
//             value={studentData.current_semester}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Batch *</label>
//           <input
//             type="text"
//             name="batch"
//             value={studentData.batch}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Faculty Advisor ID</label>
//           <input
//             type="text"
//             name="faculty_advisor_id"
//             value={studentData.faculty_advisor_id}
//             onChange={handleChange}
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium mb-1">Password *</label>
//           <input
//             type="password"
//             name="password"
//             value={studentData.password}
//             onChange={handleChange}
//             required
//             className="border p-2 w-full rounded"
//           />
//         </div>
        
//         <button
//           type="submit"
//           className="bg-green-500 text-white p-2 w-full rounded hover:bg-green-600"
//         >
//           Add Student
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddStudent;



// import React, { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import {
//   Users,
//   User,
//   BookOpen,
//   FileText,
//   ChevronDown,
//   PlusCircle,
//   Edit,
//   Trash2,
//   ClipboardList,
//   Megaphone,
//   DollarSign,
// } from "lucide-react"

// const AddStudent = () => {
//   const navigate = useNavigate()
//   const [studentData, setStudentData] = useState({
//     student_id: "",
//     name: "",
//     programme: "",
//     department: "",
//     cpi: "",
//     current_semester: "",
//     batch: "",
//     faculty_advisor_id: "",
//     password: "",
//   })
//   const [message, setMessage] = useState("")
//   const [messageType, setMessageType] = useState("")
//   const [activeDropdown, setActiveDropdown] = useState(null)

//   const toggleDropdown = (menu) => {
//     setActiveDropdown(activeDropdown === menu ? null : menu)
//   }

//   const handleChange = (e) => {
//     setStudentData({ ...studentData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     const role = localStorage.getItem("role")

//     if (!role || role !== "admin") {
//       setMessageType("error")
//       setMessage("Access denied. Admin role required.")
//       return
//     }

//     try {
//       const response = await axios.post("http://localhost:5000/api/admin/add-student", studentData, {
//         headers: { Role: role },
//       })
//       setMessageType("success")
//       setMessage(response.data.message)
//       setStudentData({
//         student_id: "",
//         name: "",
//         programme: "",
//         department: "",
//         cpi: "",
//         current_semester: "",
//         batch: "",
//         faculty_advisor_id: "",
//         password: "",
//       })
//     } catch (error) {
//       setMessageType("error")
//       setMessage(
//         error.response
//           ? `Error: ${error.response.data.message || error.response.statusText}`
//           : "Network error: Failed to connect to the server",
//       )
//     }
//   }

//   const navItems = [
//     {
//       title: "Manage Students",
//       icon: React.createElement(Users, { size: 18 }),
//       submenu: [
//         { label: "Add Student", path: "/admin/add-student", icon: React.createElement(PlusCircle, { size: 16 }) },
//         { label: "Edit Student", path: "/admin/edit-student", icon: React.createElement(Edit, { size: 16 }) },
//         { label: "Remove Student", path: "/admin/remove-student", icon: React.createElement(Trash2, { size: 16 }) },
//       ],
//     },
//     {
//       title: "Manage Faculty",
//       icon: React.createElement(User, { size: 18 }),
//       submenu: [
//         { label: "Add Faculty", path: "/admin/add-faculty", icon: React.createElement(PlusCircle, { size: 16 }) },
//         { label: "Edit Faculty", path: "/admin/edit-faculty", icon: React.createElement(Edit, { size: 16 }) },
//         { label: "Remove Faculty", path: "/admin/remove-faculty", icon: React.createElement(Trash2, { size: 16 }) },
//       ],
//     },
//     {
//       title: "Manage Courses",
//       icon: React.createElement(BookOpen, { size: 18 }),
//       submenu: [
//         { label: "Add Course", path: "/admin/add-course", icon: React.createElement(PlusCircle, { size: 16 }) },
//         { label: "Edit Course", path: "/admin/edit-course", icon: React.createElement(Edit, { size: 16 }) },
//         { label: "Remove Course", path: "/admin/remove-course", icon: React.createElement(Trash2, { size: 16 }) },
//       ],
//     },
//     {
//       title: "Announcements",
//       icon: React.createElement(Megaphone, { size: 18 }),
//       submenu: [
//         {
//           label: "Create Announcement",
//           path: "/admin/create-announcement",
//           icon: React.createElement(PlusCircle, { size: 16 }),
//         },
//         {
//           label: "Manage Announcements",
//           path: "/admin/manage-announcements",
//           icon: React.createElement(ClipboardList, { size: 16 }),
//         },
//       ],
//     },
//     {
//       title: "Fee Approvals",
//       icon: React.createElement(DollarSign, { size: 18 }),
//       submenu: [
//         {
//           label: "Pending Approvals",
//           path: "/admin/fee-pending",
//           icon: React.createElement(ClipboardList, { size: 16 }),
//         },
//         { label: "Approved Records", path: "/admin/fee-approved", icon: React.createElement(FileText, { size: 16 }) },
//       ],
//     },
//   ]

//   return (
//     <div className="flex w-full h-screen bg-gray-50">
//       {/* Sidebar Navigation - 25% width */}
//       <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
//         {/* Header */}
//         <div className="p-4 border-b border-[#5d2a87]">
//           <h2 className="text-xl font-bold flex items-center">
//             <span className="mr-2">IIITV-ICD</span>
//           </h2>
//           <p className="text-sm text-gray-300">Admin Dashboard</p>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-2">
//           {navItems.map((item, index) => (
//             <div key={index} className="mb-1">
//               {/* Main menu button */}
//               <button
//                 onClick={() => toggleDropdown(item.title)}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#5d2a87] transition-colors ${
//                   activeDropdown === item.title ? "bg-[#5d2a87]" : ""
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <span className="mr-3">{item.icon}</span>
//                   <span>{item.title}</span>
//                 </div>
//                 <ChevronDown
//                   size={16}
//                   className={`transition-transform ${activeDropdown === item.title ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {/* Submenu */}
//               {activeDropdown === item.title && (
//                 <div className="ml-8 mt-1 space-y-1 py-1">
//                   {item.submenu.map((subItem, subIndex) => (
//                     <button
//                       key={subIndex}
//                       onClick={() => navigate(subItem.path)}
//                       className="w-full flex items-center p-2 text-sm rounded hover:bg-[#5d2a87] transition-colors"
//                     >
//                       <span className="mr-2">{subItem.icon}</span>
//                       {subItem.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* User info */}
//         <div className="p-4 border-t border-[#5d2a87]">
//           <div className="flex items-center">
//             <div className="h-8 w-8 rounded-full bg-white text-[#49196c] flex items-center justify-center mr-2">
//               <User size={16} />
//             </div>
//             <span>Admin User</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content - 75% width */}
//       <div className="w-3/4 overflow-y-auto ">
//         <div className="p-8 w-full">
//           <div className="w-full bg-white rounded-xl shadow-sm p-6">
//             {/* Title */}
//             <h2 className="text-2xl font-bold mb-6 flex items-center">
//               <Users className="mr-2" size={20} />
//               Add New Student
//             </h2>

//             {/* Message */}
//             {message && (
//               <div
//                 className={`mb-6 p-3 rounded ${
//                   messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {message}
//               </div>
//             )}

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {/* Form fields grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Student ID */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Student ID *</label>
//                   <input
//                     type="text"
//                     name="student_id"
//                     value={studentData.student_id}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="Enter student ID"
//                   />
//                 </div>

//                 {/* Name */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Name *</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={studentData.name}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="Enter student name"
//                   />
//                 </div>

//                 {/* Programme */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Programme *</label>
//                   <input
//                     type="text"
//                     name="programme"
//                     value={studentData.programme}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="e.g., B.Tech, M.Tech"
//                   />
//                 </div>

//                 {/* Department */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Department *</label>
//                   <input
//                     type="text"
//                     name="department"
//                     value={studentData.department}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="e.g., CSE, IT"
//                   />
//                 </div>

//                 {/* CPI */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">CPI</label>
//                   <input
//                     type="number"
//                     name="cpi"
//                     value={studentData.cpi}
//                     onChange={handleChange}
//                     step="0.01"
//                     min="0"
//                     max="10"
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="e.g., 8.5"
//                   />
//                 </div>

//                 {/* Current Semester */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Current Semester *</label>
//                   <input
//                     type="number"
//                     name="current_semester"
//                     value={studentData.current_semester}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="e.g., 1, 2, 3"
//                   />
//                 </div>

//                 {/* Batch */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Batch *</label>
//                   <input
//                     type="text"
//                     name="batch"
//                     value={studentData.batch}
//                     onChange={handleChange}
//                     required
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="e.g., 2023-27"
//                   />
//                 </div>

//                 {/* Faculty Advisor ID */}
//                 <div>
//                   <label className="block text-sm font-medium mb-1">Faculty Advisor ID</label>
//                   <input
//                     type="text"
//                     name="faculty_advisor_id"
//                     value={studentData.faculty_advisor_id}
//                     onChange={handleChange}
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder="Enter faculty advisor ID"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">Password *</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={studentData.password}
//                   onChange={handleChange}
//                   required
//                   className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                   placeholder="Enter password"
//                 />
//               </div>

//               {/* Submit button */}
//               <button
//                 type="submit"
//                 className="w-full bg-[#49196c] text-white py-3 px-4 rounded-lg hover:bg-[#5d2a87] transition-colors shadow-sm hover:shadow-md mt-6"
//               >
//                 Add Student
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AddStudent


// import React, { useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import {
//   Users, User, BookOpen, FileText, ChevronDown, PlusCircle, Edit, Trash2, ClipboardList, Megaphone, DollarSign,
// } from "lucide-react"

// const AddStudent = () => {
//   const navigate = useNavigate()
//   const [student, setStudent] = useState({
//     student_id: "",
//     name: "",
//     programme: "",
//     department: "",
//     cpi: "",
//     current_semester: "",
//     batch: "",
//     faculty_advisor_id: "",
//     password: "",
//   })
//   const [feedback, setFeedback] = useState({ type: "", message: "" })
//   const [activeMenu, setActiveMenu] = useState(null)

//   const toggleMenu = (menu) => setActiveMenu(activeMenu === menu ? null : menu)
//   const handleInput = (e) => setStudent({ ...student, [e.target.name]: e.target.value })

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const role = localStorage.getItem("role")
//     if (role !== "admin") {
//       setFeedback({ type: "error", message: "Access denied. Admin role required." })
//       return
//     }
//     try {
//       const res = await axios.post("http://localhost:5000/api/admin/add-student", student, {
//         headers: { Role: role },
//       })
//       setFeedback({ type: "success", message: res.data.message })
//       setStudent({
//         student_id: "",
//         name: "",
//         programme: "",
//         department: "",
//         cpi: "",
//         current_semester: "",
//         batch: "",
//         faculty_advisor_id: "",
//         password: "",
//       })
//     } catch (err) {
//       const msg = err.response ? `Error: ${err.response.data.message || err.response.statusText}` : "Network error"
//       setFeedback({ type: "error", message: msg })
//     }
//   }

//   const navItems = [
//     {
//       title: "Manage Students",
//       icon: <Users size={18} />,
//       submenu: [
//         { label: "Add Student", path: "/admin/add-student", icon: <PlusCircle size={16} /> },
//         { label: "Edit Student", path: "/admin/edit-student", icon: <Edit size={16} /> },
//         { label: "Remove Student", path: "/admin/remove-student", icon: <Trash2 size={16} /> },
//       ],
//     },
//     {
//       title: "Manage Faculty",
//       icon: <User size={18} />,
//       submenu: [
//         { label: "Add Faculty", path: "/admin/add-faculty", icon: <PlusCircle size={16} /> },
//         { label: "Edit Faculty", path: "/admin/edit-faculty", icon: <Edit size={16} /> },
//         { label: "Remove Faculty", path: "/admin/remove-faculty", icon: <Trash2 size={16} /> },
//       ],
//     },
//     {
//       title: "Manage Courses",
//       icon: <BookOpen size={18} />,
//       submenu: [
//         { label: "Add Course", path: "/admin/add-course", icon: <PlusCircle size={16} /> },
//         { label: "Edit Course", path: "/admin/edit-course", icon: <Edit size={16} /> },
//         { label: "Remove Course", path: "/admin/remove-course", icon: <Trash2 size={16} /> },
//       ],
//     },
//     {
//       title: "Announcements",
//       icon: <Megaphone size={18} />,
//       submenu: [
//         { label: "Create Announcement", path: "/admin/create-announcement", icon: <PlusCircle size={16} /> },
//         { label: "Manage Announcements", path: "/admin/manage-announcements", icon: <ClipboardList size={16} /> },
//       ],
//     },
//     {
//       title: "Fee Approvals",
//       icon: <DollarSign size={18} />,
//       submenu: [
//         { label: "Pending Approvals", path: "/admin/fee-pending", icon: <ClipboardList size={16} /> },
//         { label: "Approved Records", path: "/admin/fee-approved", icon: <FileText size={16} /> },
//       ],
//     },
//   ]

//   return (
//     <div className="flex w-full h-screen bg-gray-50">
//       <aside className="w-1/4 bg-[#49196c] text-white flex flex-col">
//         <div className="p-4 border-b border-[#5d2a87]">
//           <h2 className="text-xl font-bold">IIITV-ICD</h2>
//           <p className="text-sm text-gray-300">Admin Dashboard</p>
//         </div>
//         <nav className="flex-1 overflow-y-auto p-2">
//           {navItems.map(({ title, icon, submenu }) => (
//             <div key={title} className="mb-1">
//               <button
//                 onClick={() => toggleMenu(title)}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#5d2a87] ${activeMenu === title ? "bg-[#5d2a87]" : ""}`}
//               >
//                 <span className="flex items-center gap-2">{icon} {title}</span>
//                 <ChevronDown size={16} className={`transition-transform ${activeMenu === title ? "rotate-180" : ""}`} />
//               </button>
//               {activeMenu === title && (
//                 <div className="ml-8 mt-1 space-y-1 py-1">
//                   {submenu.map(({ label, path, icon }) => (
//                     <button
//                       key={label}
//                       onClick={() => navigate(path)}
//                       className="w-full flex items-center gap-2 p-2 text-sm rounded hover:bg-[#5d2a87]"
//                     >
//                       {icon} {label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>
//         <div className="p-4 border-t border-[#5d2a87]">
//           <div className="flex items-center gap-2">
//             <div className="h-8 w-8 rounded-full bg-white text-[#49196c] flex items-center justify-center">
//               <User size={16} />
//             </div>
//             <span>Admin User</span>
//           </div>
//         </div>
//       </aside>

//       <main className="flex-grow overflow-y-auto p-8">
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//             <Users size={20} /> Add New Student
//           </h2>

//           {feedback.message && (
//             <div className={`mb-6 p-3 rounded ${feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//               {feedback.message}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {[
//                 ["student_id", "Student ID *", "Enter student ID"],
//                 ["name", "Name *", "Enter student name"],
//                 ["programme", "Programme *", "e.g., B.Tech, M.Tech"],
//                 ["department", "Department *", "e.g., CSE, IT"],
//                 ["cpi", "CPI", "e.g., 8.5"],
//                 ["current_semester", "Current Semester *", "e.g., 1, 2, 3"],
//                 ["batch", "Batch *", "e.g., 2023-27"],
//                 ["faculty_advisor_id", "Faculty Advisor ID", "Enter faculty advisor ID"],
//               ].map(([name, label, placeholder]) => (
//                 <div key={name}>
//                   <label className="block text-sm font-medium mb-1">{label}</label>
//                   <input
//                     type={name === "cpi" || name === "current_semester" ? "number" : "text"}
//                     name={name}
//                     value={student[name]}
//                     onChange={handleInput}
//                     required={!["cpi", "faculty_advisor_id"].includes(name)}
//                     className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                     placeholder={placeholder}
//                     step={name === "cpi" ? "0.01" : undefined}
//                     min={name === "cpi" || name === "current_semester" ? "0" : undefined}
//                     max={name === "cpi" ? "10" : undefined}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Password *</label>
//               <input
//                 type="password"
//                 name="password"
//                 value={student.password}
//                 onChange={handleInput}
//                 required
//                 className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
//                 placeholder="Enter password"
//               />
//             </div>
//             <button
//               type="submit"
//               className="w-full bg-[#49146c] text-white py-3 px-4 rounded-lg hover:bg-[#5d2a87] shadow-sm hover:shadow-md mt-6"
//             >
//               Add Student
//             </button>
//           </form>
//         </div>
//       </main>
//     </div>
//   )
// }

// export default AddStudent
// import React from "react";

// const AddStudent = () => {
//   return (
//     <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
//       <div
//         style={{
//           width: "250px",
//           backgroundColor: "#3b0a59",
//           color: "white",
//           padding: "20px",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <h2 style={{ marginBottom: "20px" }}>IIITV-ICD</h2>
//         <p style={{ marginBottom: "30px" }}>Admin Dashboard</p>
//         <button style={btnStyle}>Manage Students</button>
//         <button style={btnStyle}>Manage Faculty</button>
//         <button style={btnStyle}>Manage Courses</button>
//         <button style={btnStyle}>Announcements</button>
//         <button style={btnStyle}>Fee Approvals</button>
//         <div style={{ marginTop: "auto", paddingTop: "20px" }}>👤 Admin User</div>
//       </div>

//       <div
//         style={{
//           flexGrow: 1,
//           backgroundColor: "#f9fafb",
//           padding: "40px",
//           overflowY: "auto",
//         }}
//       >
//         <div
//           style={{
//             maxWidth: "1000px",
//             margin: "0 auto",
//             backgroundColor: "white",
//             padding: "30px",
//             borderRadius: "10px",
//             boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//           }}
//         >
//           <h3 style={{ marginBottom: "20px" }}>Add New Student</h3>

//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "20px",
//             }}
//           >
//             {fields.map(({ label, placeholder, type }, i) => (
//               <div
//                 key={i}
//                 style={{
//                   flex: "1 1 45%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <label style={{ marginBottom: "6px", fontWeight: "600" }}>{label}</label>
//                 <input
//                   type={type || "text"}
//                   placeholder={placeholder}
//                   style={{
//                     padding: "10px",
//                     border: "1px solid #d1d5db",
//                     borderRadius: "5px",
//                   }}
//                 />
//               </div>
//             ))}
//           </div>

//           <button style={submitStyle}>Add Student</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const btnStyle = {
//   backgroundColor: "#3f3f46",
//   color: "white",
//   border: "none",
//   padding: "12px",
//   marginBottom: "10px",
//   textAlign: "left",
//   borderRadius: "5px",
//   cursor: "pointer",
// };

// const submitStyle = {
//   marginTop: "20px",
//   padding: "12px 20px",
//   backgroundColor: "#5b21b6",
//   color: "white",
//   border: "none",
//   borderRadius: "6px",
//   cursor: "pointer",
//   fontSize: "16px",
// };

// const fields = [
//   { label: "Student ID *", placeholder: "e.g., admin1" },
//   { label: "Name *", placeholder: "Enter student name" },
//   { label: "Programme *", placeholder: "e.g., B.Tech, M.Tech" },
//   { label: "Department *", placeholder: "e.g., CSE, IT" },
//   { label: "CPI", placeholder: "e.g., 8.5" },
//   { label: "Current Semester *", placeholder: "e.g., 1, 2, 3" },
//   { label: "Batch *", placeholder: "e.g., 2023-27" },
//   { label: "Faculty Advisor ID", placeholder: "Enter faculty advisor ID" },
//   { label: "Password *", placeholder: "********", type: "password" },
// ];

// export default AddStudent;

// import React, { useState } from "react";

// const AddStudent = () => {
//   const [activeSection, setActiveSection] = useState("");

//   const handleToggle = (section) => {
//     setActiveSection(activeSection === section ? "" : section);
//   };

//   const menuItems = [
//     {
//       title: "Manage Students",
//       buttons: ["Add Student", "Edit Student Details", "Remove Student"],
//     },
//     {
//       title: "Manage Faculty",
//       buttons: ["Add Faculty", "Edit Faculty Details", "Remove Faculty"],
//     },
//     {
//       title: "Manage Courses",
//       buttons: ["Add Course", "Edit Course Details", "Remove Course"],
//     },
//     {
//       title: "Announcements",
//       buttons: ["Make Announcement"],
//     },
//     {
//       title: "Fee Approvals",
//       buttons: ["Approve Fee"],
//     },
//   ];

//   return (
//     <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
//       {/* Sidebar */}
//       <div
//         style={{
//           width: "250px",
//           backgroundColor: "#3b0a59",
//           color: "white",
//           padding: "20px",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         <h2 style={{ marginBottom: "20px" }}>IIITV-ICD</h2>
//         <p style={{ marginBottom: "30px" }}>Admin Dashboard</p>

//         {menuItems.map((item, index) => (
//           <div key={index} style={{ marginBottom: "15px" }}>
//             <button
//               style={btnStyle}
//               onClick={() => handleToggle(item.title)}
//             >
//               {item.title}
//             </button>
//             {activeSection === item.title && (
//               <div style={{ marginLeft: "10px", marginTop: "10px" }}>
//                 {item.buttons.map((btn, i) => (
//                   <button
//                     key={i}
//                     style={{
//                       ...btnStyle,
//                       backgroundColor: "#6b7280",
//                       fontSize: "14px",
//                     }}
//                   >
//                     {btn}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}

//         <div style={{ marginTop: "auto", paddingTop: "20px" }}>👤 Admin User</div>
//       </div>

//       {/* Main Content */}
//       <div
//         style={{
//           flexGrow: 1,
//           backgroundColor: "#f9fafb",
//           padding: "40px",
//           overflowY: "auto",
//         }}
//       >
//         <div
//           style={{
//             maxWidth: "1000px",
//             margin: "0 auto",
//             backgroundColor: "white",
//             padding: "30px",
//             borderRadius: "10px",
//             boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//           }}
//         >
//           <h3 style={{ marginBottom: "20px" }}>Add New Student</h3>

//           <div
//             style={{
//               display: "flex",
//               flexWrap: "wrap",
//               gap: "20px",
//             }}
//           >
//             {fields.map(({ label, placeholder, type }, i) => (
//               <div
//                 key={i}
//                 style={{
//                   flex: "1 1 45%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <label
//                   style={{
//                     marginBottom: "6px",
//                     fontWeight: "600",
//                   }}
//                 >
//                   {label}
//                 </label>
//                 <input
//                   type={type || "text"}
//                   placeholder={placeholder}
//                   style={{
//                     padding: "10px",
//                     border: "1px solid #d1d5db",
//                     borderRadius: "5px",
//                   }}
//                 />
//               </div>
//             ))}
//           </div>

//           <button style={submitStyle}>Add Student</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const btnStyle = {
//   backgroundColor: "#3f3f46",
//   color: "white",
//   border: "none",
//   padding: "12px",
//   width: "100%",
//   textAlign: "left",
//   borderRadius: "5px",
//   cursor: "pointer",
// };

// const submitStyle = {
//   marginTop: "20px",
//   padding: "12px 20px",
//   backgroundColor: "#5b21b6",
//   color: "white",
//   border: "none",
//   borderRadius: "6px",
//   cursor: "pointer",
//   fontSize: "16px",
// };

// const fields = [
//   { label: "Student ID *", placeholder: "e.g., admin1" },
//   { label: "Name *", placeholder: "Enter student name" },
//   { label: "Programme *", placeholder: "e.g., B.Tech, M.Tech" },
//   { label: "Department *", placeholder: "e.g., CSE, IT" },
//   { label: "CPI", placeholder: "e.g., 8.5" },
//   { label: "Current Semester *", placeholder: "e.g., 1, 2, 3" },
//   { label: "Batch *", placeholder: "e.g., 2023-27" },
//   { label: "Faculty Advisor ID", placeholder: "Enter faculty advisor ID" },
//   { label: "Password *", placeholder: "********", type: "password" },
// ];

// export default AddStudent;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronDown } from "lucide-react";

// const AddStudent = () => {
//   const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
//   const navigate = useNavigate();

//   const toggleDropdown = (title) => {
//     setActiveDropdown(activeDropdown === title ? "" : title);
//   };

//   const navItems = [
//     {
//       title: "Manage Students",
//       submenu: [
//         { label: "Add Student", path: "/admin/add-student" },
//         { label: "Edit Student Details", path: "/admin/edit-student" },
//         { label: "Remove Student", path: "/admin/remove-student" },
//       ],
//     },
//     {
//       title: "Manage Faculty",
//       submenu: [
//         { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
//         { label: "Remove Faculty", path: "/admin/remove-faculty" },
//       ],
//     },
//     {
//       title: "Manage Courses",
//       submenu: [
//         { label: "Edit Course Details", path: "/admin/edit-course" },
//         { label: "Remove Course", path: "/admin/remove-course" },
//       ],
//     },
//     {
//       title: "Announcements",
//       submenu: [{ label: "Make Announcement", path: "/admin/announcements" }],
//     },
//     {
//       title: "Fee Approvals",
//       submenu: [{ label: "Approve Fee", path: "/admin/approval/approve-fee-details" }],
//     },
//   ];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Student added successfully!");
//   };

//   const fields = [
//     { label: "Student ID *", placeholder: "e.g., admin1" },
//     { label: "Name *", placeholder: "Enter student name" },
//     { label: "Programme *", placeholder: "e.g., B.Tech, M.Tech" },
//     { label: "Department *", placeholder: "e.g., CSE, IT" },
//     { label: "CPI", placeholder: "e.g., 8.5" },
//     { label: "Current Semester *", placeholder: "e.g., 1, 2, 3" },
//     { label: "Batch *", placeholder: "e.g., 2023-27" },
//     { label: "Faculty Advisor ID", placeholder: "Enter faculty advisor ID" },
//     { label: "Password *", placeholder: "********", type: "password" },
//   ];

//   return (
//     <div className="flex h-screen w-screen">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
//         {/* Header */}
//         <div className="p-4 border-b border-[#5d2a87]">
//           <h2 className="text-xl font-bold">IIITV-ICD</h2>
//           <p className="text-sm text-gray-300">Admin Dashboard</p>
//         </div>

//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-2">
//           {navItems.map((item, index) => (
//             <div key={index} className="mb-1">
//               {/* Main menu button */}
//               <button
//                 onClick={() => toggleDropdown(item.title)}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-[#5d2a87] transition-colors ${
//                   activeDropdown === item.title ? "bg-[#5d2a87]" : ""
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <span>{item.title}</span>
//                 </div>
//                 <ChevronDown
//                   size={16}
//                   className={`transition-transform ${
//                     activeDropdown === item.title ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {/* Submenu */}
//               {activeDropdown === item.title && (
//                 <div className="ml-4 mt-1 space-y-1 py-1">
//                   {item.submenu.map((subItem, subIndex) => (
//                     <button
//                       key={subIndex}
//                       onClick={() => navigate(subItem.path)}
//                       className="w-full flex items-center p-2 text-sm rounded hover:bg-[#5d2a87] transition-colors"
//                     >
//                       {subItem.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

//         {/* Footer */}
//         <div className="mt-auto p-4 border-t border-[#5d2a87]">
//           <p className="text-gray-300">👤 Admin User</p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 bg-[#f9fafb] p-8 overflow-y-auto">
//         <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-2 gap-4">
//               {fields.map(({ label, placeholder, type }, i) => (
//                 <div key={i} className="flex flex-col">
//                   <label className="font-medium mb-1">{label}</label>
//                   <input
//                     type={type || "text"}
//                     placeholder={placeholder}
//                     className="p-2 border border-gray-300 rounded"
//                   />
//                 </div>
//               ))}
//             </div>
//             <button
//               type="submit"
//               className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
//             >
//               Add Student
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddStudent;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ChevronDown } from "lucide-react";

// const AddStudent = () => {
//   const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
//   const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
//   const navigate = useNavigate();

//   const toggleDropdown = (title) => {
//     setActiveDropdown(activeDropdown === title ? "" : title);
//   };

//   const navItems = [
//     {
//       title: "Manage Students",
//       submenu: [
//         { label: "Add Student", path: "/admin/add-student" },
//         { label: "Edit Student Details", path: "/admin/edit-student" },
//         { label: "Remove Student", path: "/admin/remove-student" },
//       ],
//     },
//     {
//       title: "Manage Faculty",
//       submenu: [
//         { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
//         { label: "Remove Faculty", path: "/admin/remove-faculty" },
//       ],
//     },
//     {
//       title: "Manage Courses",
//       submenu: [
//         { label: "Edit Course Details", path: "/admin/edit-course" },
//         { label: "Remove Course", path: "/admin/remove-course" },
//       ],
//     },
//     {
//       title: "Announcements",
//       submenu: [{ label: "Make Announcement", path: "/admin/announcements" }],
//     },
//     {
//       title: "Fee Approvals",
//       submenu: [{ label: "Approve Fee", path: "/admin/approval/approve-fee-details" }],
//     },
//   ];

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Student added successfully!");
//   };

//   const fields = [
//     { label: "Student ID *", placeholder: "e.g., admin1" },
//     { label: "Name *", placeholder: "Enter student name" },
//     { label: "Programme *", placeholder: "e.g., B.Tech, M.Tech" },
//     { label: "Department *", placeholder: "e.g., CSE, IT" },
//     { label: "CPI", placeholder: "e.g., 8.5" },
//     { label: "Current Semester *", placeholder: "e.g., 1, 2, 3" },
//     { label: "Batch *", placeholder: "e.g., 2023-27" },
//     { label: "Faculty Advisor ID", placeholder: "Enter faculty advisor ID" },
//     { label: "Password *", placeholder: "********", type: "password" },
//   ];

//   return (
//     <div className="flex h-screen w-screen">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
//           {/* Header */}
//           <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
//             {/* Logo */}
//             <div className="flex items-center">
//               <img
//                 src="/logo.jpg"
//                 alt="Logo"
//                 className="h-8 w-8 mr-2"
//               />
        
//             </div>
//             {/* Full Form */}
//             <div className="text-right text-l text-white-300 font-bold">
//               Indian Institute of Information Technology Vadodara <br /> International Campus Diu
//             </div>
//           </div>


//         {/* Navigation */}
//         <nav className="flex-1 overflow-y-auto p-2">
//           {navItems.map((item, index) => (
//             <div key={index} className="mb-1">
//               {/* Main menu button */}
//               <button
//                 onClick={() => toggleDropdown(item.title)}
//                 className={`w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors ${
//                   activeDropdown === item.title ? "bg-[#5d2a87]" : ""
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <span>{item.title}</span>
//                 </div>
//                 <ChevronDown
//                   size={16}
//                   className={`transition-transform ${
//                     activeDropdown === item.title ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>

//               {/* Submenu */}
//               {activeDropdown === item.title && (
//                 <div className="ml-4 mt-1 space-y-1 py-1">
//                   {item.submenu.map((subItem, subIndex) => (
//                     <button
//                       key={subIndex}
//                       onClick={() => navigate(subItem.path)}
//                       className="w-full flex items-center p-2 text-sm rounded bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
//                     >
//                       {subItem.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>

        
//              {/* Footer with hover Logout */}
// <div className="mt-auto p-4 border-t border-[#5d2a87] relative group">
//   <div className="text-gray-300 cursor-pointer">👤 Admin User</div>
//   <div className="absolute left-4 bottom-12 bg-[#5d2a87] text-black shadow rounded w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10">
//     <button
//       onClick={() => navigate("/")}
//       className="w-full text-left px-4 py-2 hover:bg-[#5d2a87]-100"
//     >
//       Logout
//     </button>
//   </div>
// </div>

//       </div>

//       {/* Main Content */}
//       <div className="flex-1 bg-[#efeaf2] p-8 overflow-y-auto">
//         <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
//           <form onSubmit={handleSubmit}>
//             <div className="grid grid-cols-2 gap-4">
//               {fields.map(({ label, placeholder, type }, i) => (
//                 <div key={i} className="flex flex-col">
//                   <label className="font-medium mb-1">{label}</label>
//                   <input
//                     type={type || "text"}
//                     placeholder={placeholder}
//                     className="p-2 border border-gray-300 rounded"
//                   />
//                 </div>
//               ))}
//             </div>
//             <button
//               type="submit"
//               className="mt-6 bg-[#5b21b6] text-white px-4 py-2 rounded shadow hover:bg-[#6b3abf] transition-colors"
//             >
//               Add Student
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddStudent;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const AddStudent = () => {
  const [activeDropdown, setActiveDropdown] = useState(""); // Tracks active dropdown
  const [showLogout, setShowLogout] = useState(false); // Tracks logout menu visibility
  const [studentData, setStudentData] = useState({
    student_id: "",
    name: "",
    programme: "",
    department: "",
    cpi: "",
    current_semester: "",
    batch: "",
    faculty_advisor_id: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
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
        "http://localhost:5000/api/admin/add-student",
        studentData,
        {
          headers: {
            Role: role,
          },
        }
      );
      setMessageType("success");
      setMessage(response.data.message);
      // Reset form
      setStudentData({
        student_id: "",
        name: "",
        programme: "",
        department: "",
        cpi: "",
        current_semester: "",
        batch: "",
        faculty_advisor_id: "",
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
    // Sidebar items remain the same as before
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
    { name: "student_id", label: "Student ID *", placeholder: "e.g., admin1" },
    { name: "name", label: "Name *", placeholder: "Enter student name" },
    { name: "programme", label: "Programme *", placeholder: "e.g., B.Tech, M.Tech" },
    { name: "department", label: "Department *", placeholder: "e.g., CSE, IT" },
    { name: "cpi", label: "CPI", placeholder: "e.g., 8.5", type: "number" },
    { name: "current_semester", label: "Current Semester *", placeholder: "e.g., 1, 2, 3", type: "number" },
    { name: "batch", label: "Batch *", placeholder: "e.g., 2023-27" },
    { name: "faculty_advisor_id", label: "Faculty Advisor ID", placeholder: "Enter faculty advisor ID" },
    { name: "password", label: "Password *", placeholder: "********", type: "password" },
  ];

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      {/* <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
          
      </div> */}

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
          <h3 className="text-xl font-semibold mb-4">Add New Student</h3>
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
                    value={studentData[name]}
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
              Add Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;



  