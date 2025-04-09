// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

// // const AdminDashboard = () => {
// //   const navigate = useNavigate();

// //   const sections = [
// //     {
// //       title: "Student Management",
// //       description: "Add, edit, and manage student records efficiently.",
// //       icon: <Users className="w-6 h-6" />,
// //       image: "/image1.jpg",
// //       id: "student-management",
// //       path: "/admin/add-student",
// //     },
// //     {
// //       title: "Faculty Management",
// //       description: "Manage faculty information and assignments.",
// //       icon: <User className="w-6 h-6" />,
// //       image: "/image2.jpg",
// //       id: "faculty-management",
// //       path: "/admin/add-faculty",
// //     },
// //     {
// //       title: "Course Management",
// //       description: "Create and manage course offerings and schedules.",
// //       icon: <BookOpen className="w-6 h-6" />,
// //       image: "/image3.jpg",
// //       id: "course-management",
// //       path: "/admin/add-course",
// //     },
// //     {
// //       title: "Announcements",
// //       description: "Create and publish important announcements for students and faculty.",
// //       icon: <Bell className="w-6 h-6" />,
// //       image: "/image1.jpg",
// //       id: "announcements",
// //       path: "/admin/announcements",
// //     },
// //     {
// //       title: "Fee Approvals",
// //       description: "Review and approve student fee details and payment records.",
// //       icon: <FileText className="w-6 h-6" />,
// //       image: "/image2.jpg",
// //       id: "fee-approvals",
// //       path: "/admin/approval/approve-fee-details",
// //     }
// //   ];

// //   return (
// //     <div className="min-h-screen bg-gray-100">
// //       {/* Navbar */}
// //       <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
// //         <div className="flex items-center justify-between py-4 px-6">
// //           {/* Logo */}
// //           <div className="flex items-center space-x-2">
// //             <div className="h-10 w-10 rounded-lg bg-[#49196c] flex items-center justify-center text-white font-bold">
// //               ICD
// //             </div>
// //             <span className="text-lg font-bold text-gray-700">IIITV-ICD</span>
// //           </div>

// //           {/* Navigation Links */}
// //           <nav className="flex space-x-6">
// //             {sections.map((section, index) => (
// //               <button
// //                 key={index}
// //                 // className="text-gray-700 hover:text-[#49196c] focus:outline-none"
// //                 className="text-gray-700 hover:text-[#49196c] focus:outline-none font-medium transition-colors duration-200"
// //                 onClick={() =>
// //                   section.path ? navigate(section.path) : document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
// //                 }
// //               >
// //                 {section.title}
// //               </button>
// //             ))}
// //           </nav>

// //           {/* Profile Icon */}
// //           <div>
// //             <img 
// //               src="/profile-icon.png" 
// //               alt="Profile" 
// //               className="h-8 w-8 rounded-full border border-gray-300"
// //               onError={(e) => {
// //                 e.target.onerror = null;
// //                 e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
// //               }}
// //             />
// //           </div>
// //         </div>
// //       </header>

// //       {/* Banner Image */}
// //       <div className="bg-gray-100 mt-[72px]">
// //         <img 
// //           src="/image1.jpg" 
// //           alt="Banner" 
// //           className="w-full h-64 object-cover"
// //           // onError={(e) => {
// //           //   e.target.onerror = null;
// //           //   e.target.src = "https://via.placeholder.com/1200x400";
// //           // }}
// //         />
// //       </div>

// //       {/* Main Content */}
// //       <main className="py-8 px-4">
// //         {sections.map((section, index) => (
// //           <div
// //             key={index}
// //             id={section.id}
// //             className={`flex items-center bg-[#efeaf2] shadow-lg rounded-lg p-6 mb-6 mx-1 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
// //             style={{ maxWidth: "calc(100% - 16px)" }}
// //           >
// //             {/* Section Image */}
// //             <div className="flex-shrink-0">
// //               <img 
// //                 src={section.image} 
// //                 alt={section.title} 
// //                 className="w-64 h-40 rounded-lg object-cover" 
// //                 onError={(e) => {
// //                   e.target.onerror = null;
// //                   e.target.src = "https://via.placeholder.com/400x300";
// //                 }}
// //               />
// //             </div>

// //             {/* Section Content */}
// //             <div className="ml-6">
             
// //               <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
// //               <p className="text-gray-600 mt-2">{section.description}</p>
              
// //               {/* Section-specific buttons */}
// //               {section.id === "student-management" && (
// //                 <div className="mt-4 flex flex-wrap gap-2">
// //                   <button
// //                     onClick={() => navigate("/admin/add-student")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Add Student
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/edit-student")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Edit Student
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/remove-student")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Remove Student
// //                   </button>
// //                 </div>
// //               )}
              
// //               {section.id === "faculty-management" && (
// //                 <div className="mt-4 flex flex-wrap gap-2">
// //                   <button
// //                     onClick={() => navigate("/admin/add-faculty")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Add Faculty
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/edit-faculty")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Edit Faculty
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/remove-faculty")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Remove Faculty
// //                   </button>
// //                 </div>
// //               )}
              
// //               {section.id === "course-management" && (
// //                 <div className="mt-4 flex flex-wrap gap-2">
// //                   <button
// //                     onClick={() => navigate("/admin/add-course")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Add Course
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/edit-course")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Edit Course
// //                   </button>
// //                   <button
// //                     onClick={() => navigate("/admin/remove-course")}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   >
// //                     Remove Course
// //                   </button>
// //                 </div>
// //               )}
              
// //               {section.id === "announcements" && (
// //                 <button
// //                   onClick={() => navigate("/admin/announcements")}
// //                   className="mt-4 bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                 >
// //                   Manage Announcements
// //                 </button>
// //               )}
              
// //               {section.id === "fee-approvals" && (
// //                 <button
// //                   onClick={() => navigate("/admin/approval/approve-fee-details")}
// //                   className="mt-4 bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                 >
// //                   Approve Fee Details
// //                 </button>
// //               )}
              
// //               {/* Default Go To button if no specific buttons defined */}
// //               {!["student-management", "faculty-management", "course-management", "announcements", "fee-approvals"].includes(section.id) && (
// //                 <button
// //                   className="mt-4 bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
// //                   onClick={() => navigate(section.path)}
// //                 >
// //                   Go to {section.title}
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         ))}
// //       </main>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;


// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

// // const AdminDashboard = () => {
// //   const navigate = useNavigate();
// //   const [showLogout, setShowLogout] = useState(false);

// //   const sections = [
// //     {
// //       title: "Student Management",
// //       description: "Add, edit, and manage student records efficiently.",
// //       icon: <Users className="w-6 h-6" />,
// //       image: "/college-image.jpg",
// //       id: "student-management",
// //       actions: [
// //         { label: "Add Student", path: "/admin/add-student" },
// //         { label: "Edit Student", path: "/admin/edit-student" },
// //         { label: "Remove Student", path: "/admin/remove-student" },
// //       ],
// //     },
// //     {
// //       title: "Faculty Management",
// //       description: "Manage faculty information and assignments.",
// //       icon: <User className="w-6 h-6" />,
// //       image: "/campus-building.jpg",
// //       id: "faculty-management",
// //       actions: [
// //         { label: "Add Faculty", path: "/admin/add-faculty" },
// //         { label: "Edit Faculty", path: "/admin/edit-faculty" },
// //         { label: "Remove Faculty", path: "/admin/remove-faculty" },
// //       ],
// //     },
// //     {
// //       title: "Course Management",
// //       description: "Create and manage course offerings and schedules.",
// //       icon: <BookOpen className="w-6 h-6" />,
// //       image: "/beach.jpg",
// //       id: "course-management",
// //       actions: [
// //         { label: "Add Course", path: "/admin/add-course" },
// //         { label: "Edit Course", path: "/admin/edit-course" },
// //         { label: "Remove Course", path: "/admin/remove-course" },
// //       ],
// //     },
// //     {
// //       title: "Announcements",
// //       description: "Create and publish important announcements for students and faculty.",
// //       icon: <Bell className="w-6 h-6" />,
// //       image: "/image2.jpg",
// //       id: "announcements",
// //       actions: [
// //         { label: "Make Announcement", path: "/admin/announcements" },
// //       ],
// //     },
// //     {
// //       title: "Fee Approvals",
// //       description: "Review and approve student fee details and payment records.",
// //       icon: <FileText className="w-6 h-6" />,
// //       image: "/image3.jpg",
// //       id: "fee-approvals",
// //       actions: [
// //         { label: "Approve Fee", path: "/admin/approval/approve-fee-details" },
// //       ],
// //     },
// //   ];

// //   const handleLogout = () => {
// //     // Add any logout logic here (clearing tokens, etc.)
// //     navigate("/");
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-100">
// //       {/* Fixed Navbar */}
// //       <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
// //       <div className="flex items-center justify-between py-2 px-6">
// //           {/* Logo */}
// //           <div className="flex items-center space-x-2">
// //           <div className="h-8 w-8 rounded-lg bg-[#49196c] flex items-center justify-center text-white font-bold text-sm">
// //               ICD
// //             </div>
// //             <span className="text-lg font-bold text-gray-700">IIITV-ICD</span>
// //           </div>

// //           {/* Navigation Links */}
// //           <nav className="hidden md:flex space-x-6">
// //             {sections.map((section, index) => (
// //               <button
// //                 key={index}
// //                 className="text-gray-700 hover:text-[#49196c] focus:outline-none focus:bg-transparent active:bg-transparent bg-transparent border-none appearance-none font-medium transition-colors duration-200 text-sm py-1"
// //                 onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
// //               >
// //                 {section.title}
// //               </button>
// //             ))}
// //           </nav>

// //           {/* Profile with Logout */}
// //           <div className="relative">
// //             <button
// //               className="flex items-center space-x-2"
// //               onClick={() => setShowLogout(!showLogout)}
// //             >
// //               <img
// //                 src="/profile-icon.png"
// //                 alt="Profile"
// //                 className="h-7 w-7 rounded-full border border-gray-300"
// //                 onError={(e) => {
// //                   e.target.onerror = null;
// //                   e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
// //                 }}
// //               />
// //             </button>
// //             {showLogout && (
// //               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
// //                 <button
// //                   onClick={handleLogout}
// //                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
// //                 >
// //                   Logout
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </header>

// //       {/* Banner Image */}
// //       <div className="bg-gray-100 mt-[48px]">
// //         <img
// //           src="/campus-building.jpg"
// //           alt="Banner"
// //           className="w-full h-64 object-cover"
// //           onError={(e) => {
// //             e.target.onerror = null;
// //             e.target.src = "https://via.placeholder.com/1920x400?text=Campus+Banner";
// //           }}
// //         />
// //       </div>

// //       {/* Main Content */}
// //       <main className="py-6">
// //         {sections.map((section, index) => (
// //           <div
// //             key={index}
// //             id={section.id}
// //             className={`flex items-center bg-[#efeaf2] shadow-lg p-6 mb-6 ${
// //               index % 2 === 0 ? "flex-row" : "flex-row-reverse"
// //             }`}
// //           >
// //             {/* Section Image */}
// //             <div className="flex-shrink-0 w-1/4">
// //               <img
// //                 src={section.image}
// //                 alt={section.title}
// //                 className="w-full h-48 rounded-lg object-cover"
// //                 onError={(e) => {
// //                   e.target.onerror = null;
// //                   e.target.src = "https://via.placeholder.com/800x600?text=" + section.title;
// //                 }}
// //               />
// //             </div>

// //             {/* Section Content */}
// //             <div className={`flex-grow ${index % 2 === 0 ? "ml-6" : "mr-6"}`}>
// //               <div className="flex items-center space-x-3 mb-4">
// //                 <div className="p-2 rounded-lg bg-[#49196c] text-white">
// //                   {section.icon}
// //                 </div>
// //                 <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
// //               </div>
// //               <p className="text-gray-600 text-base mb-4">{section.description}</p>
// //               <div className="flex flex-wrap gap-4">
// //                 {section.actions.map((action, actionIndex) => (
// //                   <button
// //                     key={actionIndex}
// //                     className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition-colors duration-200 flex items-center space-x-2"
// //                     onClick={() => navigate(action.path)}
// //                   >
// //                     {action.label}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         ))}
// //       </main>
// //     </div>
// //   );
// // };

// // export default AdminDashboard;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [showLogout, setShowLogout] = useState(false);

//   const sections = [
//     {
//       title: "Student Management",
//       description: "Add, edit, and manage student records efficiently.",
//       icon: <Users className="w-6 h-6" />,
//       image: "/college-image.jpg",
//       id: "student-management",
//       actions: [
//         { label: "Add Student", path: "/admin/add-student" },
//         { label: "Edit Student", path: "/admin/edit-student" },
//         { label: "Remove Student", path: "/admin/remove-student" },
//       ],
//     },
//     {
//       title: "Faculty Management",
//       description: "Manage faculty information and assignments.",
//       icon: <User className="w-6 h-6" />,
//       image: "/campus-building.jpg",
//       id: "faculty-management",
//       actions: [
//         { label: "Add Faculty", path: "/admin/add-faculty" },
//         { label: "Edit Faculty", path: "/admin/edit-faculty" },
//         { label: "Remove Faculty", path: "/admin/remove-faculty" },
//       ],
//     },
//     {
//       title: "Course Management",
//       description: "Create and manage course offerings and schedules.",
//       icon: <BookOpen className="w-6 h-6" />,
//       image: "/beach.jpg",
//       id: "course-management",
//       actions: [
//         { label: "Add Course", path: "/admin/add-course" },
//         { label: "Edit Course", path: "/admin/edit-course" },
//         { label: "Remove Course", path: "/admin/remove-course" },
//       ],
//     },
//     {
//       title: "Announcements",
//       description: "Create and publish important announcements for students and faculty.",
//       icon: <Bell className="w-6 h-6" />,
//       image: "/image2.jpg",
//       id: "announcements",
//       actions: [
//         { label: "Make Announcement", path: "/admin/announcements" },
//       ],
//     },
//     {
//       title: "Fee Approvals",
//       description: "Review and approve student fee details and payment records.",
//       icon: <FileText className="w-6 h-6" />,
//       image: "/image3.jpg",
//       id: "fee-approvals",
//       actions: [
//         { label: "Approve Fee", path: "/admin/approval/approve-fee-details" },
//       ],
//     },
//   ];

//   const handleLogout = () => {
//     // Add any logout logic here (clearing tokens, etc.)
//     navigate("/");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Fixed Navbar */}
//       <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50 h-14">
//         <div className="flex items-center justify-between py-2 px-6">
//           {/* Logo */}
//           <div className="flex items-center space-x-2">
//             <div className="h-8 w-8 rounded-lg bg-[#49196c] flex items-center justify-center text-white font-bold text-sm">
//               ICD
//             </div>
//             <span className="text-lg font-bold text-gray-700">IIITV-ICD</span>
//           </div>

//           {/* Navigation Links */}
//           <nav className="hidden md:flex space-x-6">
//             {sections.map((section, index) => (
//               <button
//                 key={index}
//                 className="text-gray-700 hover:text-[#49196c] focus:outline-none focus:bg-transparent active:bg-transparent bg-transparent border-none appearance-none font-medium transition-colors duration-200 text-sm py-1"
//                 onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })}
//               >
//                 {section.title}
//               </button>
//             ))}
//           </nav>

//           {/* Profile with Logout */}
//           <div className="relative">
//             <button
//               className="flex items-center space-x-2"
//               onClick={() => setShowLogout(!showLogout)}
//             >
//               <img
//                 src="/profile-icon.png"
//                 alt="Profile"
//                 className="h-7 w-7 rounded-full border border-gray-300"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
//                 }}
//               />
//             </button>
//             {showLogout && (
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                 <button
//                   onClick={handleLogout}
//                   className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                 >
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </header>

//       {/* Banner Image */}
//       <div className="bg-gray-100 pt-14">
//         <img
//           src="/campus-building.jpg"
//           alt="Banner"
//           className="w-full h-64 object-cover"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = "https://via.placeholder.com/1920x400?text=Campus+Banner";
//           }}
//         />
//       </div>

//       {/* Main Content */}
//       <main className="py-8 px-4">
//         {sections.map((section, index) => (
//           <div
//             key={index}
//             id={section.id}
//             className={`flex items-center bg-[#efeaf2] shadow-lg rounded-lg p-6 mb-6 mx-1 ${
//               index % 2 === 0 ? "flex-row" : "flex-row-reverse"
//             }`}
//             style={{ maxWidth: "calc(100% - 16px)" }}
//           >
//             {/* Section Image */}
//             <div className="flex-shrink-0">
//               <img
//                 src={section.image}
//                 alt={section.title}
//                 className="w-64 h-40 rounded-lg object-cover"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "https://via.placeholder.com/800x600?text=" + section.title;
//                 }}
//               />
//             </div>

//             {/* Section Content */}
//             <div className={`${index % 2 === 0 ? "ml-6" : "mr-6"}`}>
//               <div className="flex items-center space-x-3 mb-2">
//                 <div className="p-2 rounded-lg bg-[#49196c] text-white">
//                   {section.icon}
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
//               </div>
//               <p className="text-gray-600 mt-2">{section.description}</p>
//               <div className="mt-4">
//                 {section.actions.length === 3 ? (
//                   <div className="flex flex-col gap-4">
//                     <div className="flex gap-4">
//                       <button
//                         className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition-colors duration-200"
//                         onClick={() => navigate(section.actions[0].path)}
//                       >
//                         {section.actions[0].label}
//                       </button>
//                       <button
//                         className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition-colors duration-200"
//                         onClick={() => navigate(section.actions[1].path)}
//                       >
//                         {section.actions[1].label}
//                       </button>
//                     </div>
//                     <div>
//                       <button
//                         className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition-colors duration-200"
//                         onClick={() => navigate(section.actions[2].path)}
//                       >
//                         {section.actions[2].label}
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex flex-wrap gap-3">
//                     {section.actions.map((action, actionIndex) => (
//                       <button
//                         key={actionIndex}
//                         className="bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition-colors duration-200"
//                         onClick={() => navigate(action.path)}
//                       >
//                         {action.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [showLogout, setShowLogout] = useState(false);

//   const sections = [
//     {
//       title: "Student Management",
//       description: "Add, edit, and manage student records efficiently.",
//       icon: <Users className="w-6 h-6" />,
//       image: "/college-image.jpg",
//       id: "student-management",
//       actions: [
//         { label: "Add Student", path: "/admin/add-student" },
//         { label: "Edit Student", path: "/admin/edit-student" },
//         { label: "Remove Student", path: "/admin/remove-student" },
//       ],
//     },
//     {
//       title: "Faculty Management",
//       description: "Manage faculty information and assignments.",
//       icon: <User className="w-6 h-6" />,
//       image: "/campus-building.jpg",
//       id: "faculty-management",
//       actions: [
//         { label: "Add Faculty", path: "/admin/add-faculty" },
//         { label: "Edit Faculty", path: "/admin/edit-faculty" },
//         { label: "Remove Faculty", path: "/admin/remove-faculty" },
//       ],
//     },
//     {
//       title: "Course Management",
//       description: "Create and manage course offerings and schedules.",
//       icon: <BookOpen className="w-6 h-6" />,
//       image: "/beach.jpg",
//       id: "course-management",
//       actions: [
//         { label: "Add Course", path: "/admin/add-course" },
//         { label: "Edit Course", path: "/admin/edit-course" },
//         { label: "Remove Course", path: "/admin/remove-course" },
//       ],
//     },
//     {
//       title: "Announcements",
//       description: "Create and publish important announcements for students and faculty.",
//       icon: <Bell className="w-6 h-6" />,
//       image: "/image2.jpg",
//       id: "announcements",
//       actions: [
//         { label: "Make Announcement", path: "/admin/announcements" },
//       ],
//     },
//     {
//       title: "Fee Approvals",
//       description: "Review and approve student fee details and payment records.",
//       icon: <FileText className="w-6 h-6" />,
//       image: "/image3.jpg",
//       id: "fee-approvals",
//       actions: [
//         { label: "Approve Fee", path: "/admin/approval/approve-fee-details" },
//       ],
//     },
//   ];

//   const handleLogout = () => {
//     navigate("/");
//   };

//   return (
//     <div style={{ 
//       minHeight: '100vh',
//       backgroundColor: '#f3f4f6',
//       position: 'relative',
//       paddingTop: '80px' // Height of navbar
//     }}>
//       {/* Fixed Navbar */}
//       <div style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         height: '80px',
//         backgroundColor: 'white',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//         zIndex: 1000,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '0 24px'
//       }}>
//         {/* Logo */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//           <div style={{
//             height: '32px',
//             width: '32px',
//             backgroundColor: '#49196c',
//             borderRadius: '8px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: 'white',
//             fontWeight: 'bold'
//           }}>
//             ICD
//           </div>
//           <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>IIITV-ICD</span>
//         </div>

//         {/* Navigation */}
//         <nav style={{ display: 'flex', gap: '24px' }}>
//           {sections.map((section, index) => (
//             <button
//               key={index}
//               onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}
//               style={{
//                 background: 'none',
//                 border: 'none',
//                 color: '#374151',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 cursor: 'pointer',
//                 padding: '4px 8px'
//               }}
//             >
//               {section.title}
//             </button>
//           ))}
//         </nav>

//         {/* Profile */}
//         <div style={{ position: 'relative' }}>
//           <button
//             onClick={() => setShowLogout(!showLogout)}
//             style={{
//               background: 'none',
//               border: '1px solid #e5e7eb',
//               borderRadius: '50%',
//               padding: '2px'
//             }}
//           >
//             <img
//               src="/profile-icon.png"
//               alt="Profile"
//               style={{
//                 height: '28px',
//                 width: '28px',
//                 borderRadius: '50%'
//               }}
//               onError={(e) => {
//                 e.target.onerror = null;
//                 e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
//               }}
//             />
//           </button>
//           {showLogout && (
//             <div style={{
//               position: 'absolute',
//               right: 0,
//               top: '100%',
//               marginTop: '8px',
//               width: '192px',
//               backgroundColor: 'white',
//               borderRadius: '8px',
//               boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
//               padding: '4px'
//             }}>
//               <button
//                 onClick={handleLogout}
//                 style={{
//                   width: '100%',
//                   textAlign: 'left',
//                   padding: '8px 16px',
//                   fontSize: '14px',
//                   color: '#374151',
//                   background: 'none',
//                   border: 'none',
//                   cursor: 'pointer'
//                 }}
//               >
//                 Logout
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Banner Image */}
//       <div style={{   width: '100%', 
//         marginBottom: '32px',
//         marginTop: '-16px'  }}>
//         <img
//           src="/campus-building.jpg"
//           alt="Banner"
//           style={{
//             width: '100%',
//             height: '32px',
//             objectFit: 'cover'
//           }}
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = "https://via.placeholder.com/1920x400?text=Campus+Banner";
//           }}
//         />
//       </div>

//       {/* Main Content */}
//       <main style={{   padding: '32px 16px',
//         maxWidth: '1200px',
//         margin: '0 auto' }}>
//         {sections.map((section, index) => (
//           <div
//             key={index}
//             id={section.id}
//             style={{
//               display: 'flex',
//               flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
//               alignItems: 'center',
//               backgroundColor: '#efeaf2',
//               borderRadius: '8px',
//               padding: '24px',
//               marginBottom: 'px',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               margin: '0 4px'
//             }}
//           >
//             {/* Section Image */}
//             <div style={{ flexShrink: 0 }}>
//               <img
//                 src={section.image}
//                 alt={section.title}
//                 style={{
//                   width: '256px',
//                   height: '160px',
//                   borderRadius: '8px',
//                   objectFit: 'cover'
//                 }}
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "https://via.placeholder.com/800x600?text=" + section.title;
//                 }}
//               />
//             </div>

//             {/* Section Content */}
//             <div style={{ 
//               marginLeft: index % 2 === 0 ? '24px' : 0,
//               marginRight: index % 2 === 0 ? 0 : '24px',
//               flex: 1
//             }}>
//               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                 <div style={{
//                   padding: '8px',
//                   borderRadius: '8px',
//                   backgroundColor: '#49196c',
//                   color: 'white',
//                   marginRight: '12px'
//                 }}>
//                   {section.icon}
//                 </div>
//                 <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
//                   {section.title}
//                 </h2>
//               </div>
//               <p style={{ color: '#4b5563', marginTop: '8px', marginBottom: '16px' }}>
//                 {section.description}
//               </p>
//               <div>
//                 {section.actions.length === 3 ? (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                     <div style={{ display: 'flex', gap: '16px' }}>
//                       <button
//                         onClick={() => navigate(section.actions[0].path)}
//                         style={{
//                           backgroundColor: '#49196c',
//                           color: 'white',
                    
//                           padding: '8px 16px',
//                           borderRadius: '8px',
//                           fontSize: '14px',
//                           fontWeight: '600',
//                           border: 'none',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {section.actions[0].label}
//                       </button>
//                       <button
//                         onClick={() => navigate(section.actions[1].path)}
//                         style={{
//                           backgroundColor: '#49196c',
//                           color: 'white',
//                           padding: '8px 16px',
//                           borderRadius: '8px',
//                           fontSize: '14px',
//                           fontWeight: '600',
//                           border: 'none',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {section.actions[1].label}
//                       </button>
//                     </div>
//                     <div>
//                       <button
//                         onClick={() => navigate(section.actions[2].path)}
//                         style={{
//                           backgroundColor: '#49196c',
//                           color: 'white',
//                           padding: '8px 16px',
//                           borderRadius: '8px',
//                           fontSize: '14px',
//                           fontWeight: '600',
//                           border: 'none',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {section.actions[2].label}
//                       </button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div style={{ display: 'flex', gap: '12px' }}>
//                     {section.actions.map((action, actionIndex) => (
//                       <button
//                         key={actionIndex}
//                         onClick={() => navigate(action.path)}
//                         style={{
//                           backgroundColor: '#49196c',
//                           color: 'white',
//                           padding: '8px 16px',
//                           borderRadius: '8px',
//                           fontSize: '14px',
//                           fontWeight: '600',
//                           border: 'none',
//                           cursor: 'pointer'
//                         }}
//                       >
//                         {action.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Effect for window resize - properly initialized
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student records efficiently.",
      icon: <Users size={20} />,
      image: "/college-image.jpg",
      id: "student-management",
      actions: [
        { label: "Add Student", path: "/admin/add-student" },
        { label: "Edit Student", path: "/admin/edit-student" },
        { label: "Remove Student", path: "/admin/remove-student" },
      ],
    },
    {
      title: "Faculty Management",
      description: "Manage faculty information and assignments.",
      icon: <User size={20} />,
      image: "/campus-building.jpg",
      id: "faculty-management",
      actions: [
        { label: "Add Faculty", path: "/admin/add-faculty" },
        { label: "Edit Faculty", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Course Management",
      description: "Create and manage course offerings and schedules.",
      icon: <BookOpen size={20} />,
      image: "/beach.jpg",
      id: "course-management",
      actions: [
        { label: "Add Course", path: "/admin/add-course" },
        { label: "Edit Course", path: "/admin/edit-course" },
        { label: "Remove Course", path: "/admin/remove-course" },
      ],
    },
    {
      title: "Announcements",
      description: "Create and publish important announcements for students and faculty.",
      icon: <Bell size={20} />,
      image: "/image2.jpg",
      id: "announcements",
      actions: [
        { label: "Make Announcement", path: "/admin/announcements" },
      ],
    },
    {
      title: "Fee Approvals",
      description: "Review and approve student fee details and payment records.",
      icon: <FileText size={20} />,
      image: "/image3.jpg",
      id: "fee-approvals",
      actions: [
        { label: "Approve Fee", path: "/admin/approval/approve-fee-details" },
      ],
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  // Helper to determine if we're on mobile
  const isMobile = windowWidth < 768;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      position: 'relative',
      paddingTop: '60px', // Reduced navbar height
    }}>
      {/* Fixed Navbar - Height reduced */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px', // Reduced from 80px
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px' // Reduced padding
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            height: '28px', // Reduced size
            width: '28px',
            backgroundColor: '#49196c',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px' // Added font size
          }}>
            ICD
          </div>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>IIITV-ICD</span>
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '4px',
          paddingLeft: '8px',
          paddingRight: '8px',
          flex: '1',
          justifyContent: 'center',
          maxWidth: 'calc(100% - 200px)'
        }}>
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                const element = document.getElementById(section.id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                fontSize: '13px', // Reduced font size
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px 6px', // Reduced padding
                whiteSpace: 'nowrap'
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              padding: '2px'
            }}
          >
            <img
              src="/profile-icon.png"
              alt="Profile"
              style={{
                height: '24px', // Reduced size
                width: '24px',
                borderRadius: '50%'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
              }}
            />
          </button>
          {showLogout && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              width: '150px', // Reduced width
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '4px',
              zIndex: 1001 // Ensure it's above other elements
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px', // Reduced padding
                  fontSize: '13px', // Reduced font size
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Image - Reduced height */}
      <div style={{ 
        width: '100%', 
        marginBottom: '20px', // Reduced margin
        marginTop: '0'
      }}>
        <img
          src="/campus-building.jpg"
          alt="Banner"
          style={{
            width: '100%',
            height: '100px', // Reduced from 120px
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/1920x200?text=Campus+Banner";
          }}
        />
      </div>

      {/* Main Content */}
      <main style={{   
        padding: '16px 12px', // Reduced padding
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {sections.map((section, index) => (
          <div
            key={index}
            id={section.id}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : (index % 2 === 0 ? 'row' : 'row-reverse'),
              alignItems: isMobile ? 'flex-start' : 'center',
              backgroundColor: '#efeaf2',
              borderRadius: '8px',
              padding: '16px', // Reduced padding
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '16px' // Reduced margin
            }}
          >
            {/* Section Image */}
            <div style={{
              flexShrink: 0,
              width: isMobile ? '100%' : '180px', // Reduced size on desktop, full width on mobile
              marginBottom: isMobile ? '16px' : '0' // Add bottom margin on mobile
            }}>
              <img
                src={section.image}
                alt={section.title}
                style={{
                  width: '100%',
                  height: isMobile ? '140px' : '120px', // Adjusted height
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x300?text=${section.title.replace(' ', '+')}`;
                }}
              />
            </div>

            {/* Section Content */}
            <div style={{ 
              marginLeft: isMobile ? '0' : (index % 2 === 0 ? '16px' : '0'),
              marginRight: isMobile ? '0' : (index % 2 === 0 ? '0' : '16px'),
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{
                  padding: '6px', // Reduced padding
                  borderRadius: '6px',
                  backgroundColor: '#49196c',
                  color: 'white',
                  marginRight: '10px' // Reduced margin
                }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {section.title}
                </h2>
              </div>
              <p style={{ 
                color: '#4b5563', 
                marginTop: '6px', 
                marginBottom: '12px', 
                fontSize: '14px' // Reduced font size
              }}>
                {section.description}
              </p>
              <div>
                {section.actions.length === 3 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {section.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => navigate(action.path)}
                        style={{
                          backgroundColor: '#49196c',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {section.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => navigate(action.path)}
                        style={{
                          backgroundColor: '#49196c',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;