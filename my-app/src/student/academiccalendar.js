// import React, { useState, useEffect } from 'react';
// import { ChevronDown, Calendar, Download, Book, BookOpen, Users, Bell } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const StudentAcademicCalendarPage = () => {
//   const [calendars, setCalendars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [activeDropdown, setActiveDropdown] = useState("");
//   const navigate = useNavigate();
  
//   // API base URL - pointing to your backend server
//   const API_BASE_URL = 'http://localhost:5000';
  
//   // Headers for API requests
//   const headers = {
//     'Role': 'student'
//   };
  
//   // Student ID (in a real app, this would come from authentication context)
//   const studentId = localStorage.getItem("userId") || localStorage.getItem("studentId") || 1;

//   // Fetch calendars on component mount
//   useEffect(() => {
//     const fetchCalendars = async () => {
//       try {
//         setLoading(true);
        
//         // Updated fetch URL with the full backend address
//         try {
//           const response = await fetch(`${API_BASE_URL}/api/academic-calendar/calendars`, {
//             headers: headers
//           });
          
//           if (!response.ok) {
//             throw new Error(`HTTP error! Status: ${response.status}`);
//           }
          
//           const data = await response.json();
//           if (data.success) {
//             setCalendars(data.calendars);
//             setLoading(false);
//             return;
//           }
//         } catch (apiError) {
//           console.warn("API fetch failed, using mock data:", apiError);
//           // Fall back to mock data if API call fails
//         }
        
//         // Mock data for demonstration or development
//         const mockCalendars = [
//           {
//             id: 1,
//             title: 'Academic Calendar 2023-2024',
//             academic_year: '2023-2024',
//             file_name: 'calendar_2023_2024.pdf',
//             file_size: '1.2 MB',
//             upload_date: '2023-06-15',
//             uploaded_by: 'Admin User',
//             status: 'active'
//           },
//           {
//             id: 2,
//             title: 'Academic Calendar 2024-2025',
//             academic_year: '2024-2025',
//             file_name: 'calendar_2024_2025.pdf',
//             file_size: '1.4 MB',
//             upload_date: '2024-05-20',
//             uploaded_by: 'Admin User',
//             status: 'active'
//           }
//         ];
        
//         setCalendars(mockCalendars);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load calendars. Please try again later.');
//         setLoading(false);
//         console.error('Error fetching calendars:', err);
//       }
//     };
    
//     fetchCalendars();
//   }, []);

//   // Handle calendar download - updated with full backend URL
//   const downloadCalendar = async (id, fileName) => {
//     try {
//       // First try the actual API with updated URL
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/academic-calendar/download/${id}`, {
//           headers: headers
//         });
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
        
//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = fileName;
//         document.body.appendChild(a);
//         a.click();
//         window.URL.revokeObjectURL(url);
//         a.remove();
//         setSuccess(`Successfully downloaded ${fileName}`);
//         return;
//       } catch (apiError) {
//         console.warn("API download failed:", apiError);
//         // Fall back to alert for demonstration
//       }
      
//       // Simulating download for demonstration
//       alert(`Downloading ${fileName}...`);
//       setSuccess(`Successfully downloaded ${fileName}`);
//     } catch (err) {
//       setError('Failed to download the calendar. Please try again.');
//       console.error('Download error:', err);
//     }
//   };

//   // Clear alerts after 5 seconds
//   useEffect(() => {
//     if (error || success) {
//       const timer = setTimeout(() => {
//         setError(null);
//         setSuccess(null);
//       }, 5000);
      
//       return () => clearTimeout(timer);
//     }
//   }, [error, success]);
  
//   // Navigation items for sidebar with navigation handlers
//   const navItems = [
//     {
//       title: "Dashboard",
//       icon: <BookOpen size={18} className="mr-2" />,
//       path: "/student/dashboard",
//       onClick: () => navigate("/student/dashboard")
//     },
//     {
//       title: "Announcements",
//       icon: <Bell size={18} className="mr-2" />,
//       path: "/student/announcements",
//       onClick: () => navigate("/student/announcements")
//     },
//     {
//       title: "Academic",
//       icon: <Book size={18} className="mr-2" />,
//       submenu: [
//         { label: "Academic Calendar", path: "/student/academic-calendar" },
//         { label: "Course Registration", path: "/student/academic/registration" },
//         { label: "Fee Payment", path: "/student/academic/fee-payment" }
//       ]
//     },
//     {
//       title: "Profile",
//       icon: <Users size={18} className="mr-2" />,
//       path: "/student/profile",
//       onClick: () => navigate("/student/profile")
//     }
//   ];

//   const toggleDropdown = (title) => {
//     setActiveDropdown(activeDropdown === title ? "" : title);
//   };

//   const handleSubMenuClick = (path) => {
//     navigate(path);
//   };

//   return (
//     <div className="flex h-screen w-screen">
//       {/* Sidebar */}
//       <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
//         <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
//           <div className="flex items-center">
//             <img src="/logo.jpg" alt="Logo" className="h-20 w-40 mr-4" />
//           </div>
//           <div className="text-right text-sm text-white font-bold">
//             Indian Institute of Information Technology Vadodara 
//             International Campus Diu
//           </div>
//         </div>

//         <nav className="flex-1 overflow-y-auto p-2">
//           {navItems.map((item, index) => (
//             <div key={index} className="mb-1">
//               {item.submenu ? (
//                 <>
//                   <button
//                     onClick={() => toggleDropdown(item.title)}
//                     className={`w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors ${
//                       activeDropdown === item.title ? "bg-[#5d2a87]" : ""
//                     }`}
//                   >
//                     <div className="flex items-center">
//                       {item.icon}
//                       <span>{item.title}</span>
//                     </div>
//                     <ChevronDown
//                       size={16}
//                       className={`transition-transform ${
//                         activeDropdown === item.title ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>
//                   {activeDropdown === item.title && (
//                     <div className="ml-4 mt-1 space-y-1 py-1">
//                       {item.submenu.map((subItem, subIndex) => (
//                         <button
//                           key={subIndex}
//                           onClick={() => handleSubMenuClick(subItem.path)}
//                           className={`w-full flex items-center p-2 text-sm rounded ${
//                             subItem.label === "Academic Calendar" 
//                               ? "bg-[#7e57c2]" 
//                               : "bg-[#5d2a87] hover:bg-[#7e57c2]"
//                           } transition-colors`}
//                         >
//                           {subItem.label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <button
//                   onClick={item.onClick}
//                   className="w-full flex items-center p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
//                 >
//                   {item.icon}
//                   <span>{item.title}</span>
//                 </button>
//               )}
//             </div>
//           ))}
//         </nav>

//         <div className="mt-auto p-4 border-t border-[#5d2a87] relative group">
//           <div className="text-gray-300 cursor-pointer">👤 Student User</div>
//           <div className="absolute left-4 bottom-12 bg-white text-black shadow rounded w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10">
//             <button 
//               className="w-full text-left px-4 py-2 hover:bg-gray-100"
//               onClick={() => navigate('/student/profile')}
//             >
//               Profile
//             </button>
//             <button 
//               className="w-full text-left px-4 py-2 hover:bg-gray-100"
//               onClick={() => {
//                 localStorage.removeItem("userId");
//                 localStorage.removeItem("studentId");
//                 navigate('/login');
//               }}
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 bg-[#efeaf2] p-8 overflow-y-auto">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="bg-[#49196c] text-white p-6">
//               <h2 className="text-xl font-semibold flex items-center">
//                 <Calendar className="mr-2" size={20} />
//                 Academic Calendar
//               </h2>
//             </div>
            
//             {/* Alert messages */}
//             {error && (
//               <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                   <span>{error}</span>
//                 </div>
//               </div>
//             )}
            
//             {success && (
//               <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4">
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                   <span>{success}</span>
//                 </div>
//               </div>
//             )}
            
//             <div className="p-6">
//               {loading ? (
//                 <div className="text-center py-10">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#49196c] border-t-transparent"></div>
//                   <p className="mt-3 text-gray-600">Loading calendars...</p>
//                 </div>
//               ) : calendars.length === 0 ? (
//                 <div className="text-center py-10">
//                   <Calendar className="mx-auto text-gray-400" size={48} />
//                   <p className="mt-4 text-gray-500">No academic calendars are currently available.</p>
//                 </div>
//               ) : (
//                 <>
//                   <p className="text-gray-600 mb-6">
//                     All the active academic calendars are listed below. You can view or download any calendar by clicking on the download button.
//                   </p>
                  
//                   <div className="grid gap-6 md:grid-cols-2">
//                     {calendars.map((calendar) => (
//                       <div key={calendar.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                         <div className="bg-gray-50 p-4 border-b">
//                           <h3 className="font-medium text-lg text-gray-800">{calendar.title}</h3>
//                           <p className="text-sm text-gray-500">Academic Year: {calendar.academic_year}</p>
//                         </div>
//                         <div className="p-4">
//                           <div className="flex items-center text-sm text-gray-500 mb-2">
//                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
//                             {calendar.file_name} ({calendar.file_size})
//                           </div>
//                           <div className="flex items-center text-sm text-gray-500 mb-4">
//                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                             </svg>
//                             Uploaded on {calendar.upload_date}
//                           </div>
//                           <button
//                             onClick={() => downloadCalendar(calendar.id, calendar.file_name)}
//                             className="w-full flex items-center justify-center px-4 py-2 bg-[#49196c] text-white rounded hover:bg-[#5d2a87] transition-colors"
//                           >
//                             <Download size={16} className="mr-2" />
//                             Download Calendar
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
          
//           {/* Important Dates Section */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
//             <div className="bg-[#49196c] text-white p-4">
//               <h2 className="text-lg font-semibold">Important Upcoming Dates</h2>
//             </div>
//             <div className="p-4">
//               <ul className="divide-y divide-gray-200">
//                 <li className="py-3">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
//                       <Calendar size={16} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Registration for Odd Semester</p>
//                       <p className="text-sm text-gray-500">July 20, 2025</p>
//                     </div>
//                   </div>
//                 </li>
//                 <li className="py-3">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
//                       <Calendar size={16} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Commencement of Classes</p>
//                       <p className="text-sm text-gray-500">July 25, 2025</p>
//                     </div>
//                   </div>
//                 </li>
//                 <li className="py-3">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
//                       <Calendar size={16} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">Mid-Semester Examination</p>
//                       <p className="text-sm text-gray-500">September 15-20, 2025</p>
//                     </div>
//                   </div>
//                 </li>
//                 <li className="py-3">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
//                       <Calendar size={16} className="text-indigo-600" />
//                     </div>
//                     <div>
//                       <p className="font-medium">End-Semester Examination</p>
//                       <p className="text-sm text-gray-500">November 25 - December 5, 2025</p>
//                     </div>
//                   </div>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentAcademicCalendarPage;

import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Download, Book, BookOpen, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';

const StudentAcademicCalendarPage = () => {
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  
  // API base URL - pointing to your backend server
  const API_BASE_URL = 'http://localhost:5000';
  
  // Headers for API requests
  const headers = {
    'Role': 'student'
  };
  
  // Student ID (in a real app, this would come from authentication context)
  const studentId = localStorage.getItem("userId") || localStorage.getItem("studentId") || 1;
  const studentName = localStorage.getItem("studentName") || "Student";

  // Fetch calendars on component mount
  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        setLoading(true);
        
        // Updated fetch URL with the full backend address
        try {
          const response = await fetch(`${API_BASE_URL}/api/academic-calendar/calendars`, {
            headers: headers
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.success) {
            setCalendars(data.calendars);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn("API fetch failed, using mock data:", apiError);
          // Fall back to mock data if API call fails
        }
        
        // Mock data for demonstration or development
        const mockCalendars = [
          {
            id: 1,
            title: 'Academic Calendar 2023-2024',
            academic_year: '2023-2024',
            file_name: 'calendar_2023_2024.pdf',
            file_size: '1.2 MB',
            upload_date: '2023-06-15',
            uploaded_by: 'Admin User',
            status: 'active'
          },
          {
            id: 2,
            title: 'Academic Calendar 2024-2025',
            academic_year: '2024-2025',
            file_name: 'calendar_2024_2025.pdf',
            file_size: '1.4 MB',
            upload_date: '2024-05-20',
            uploaded_by: 'Admin User',
            status: 'active'
          }
        ];
        
        setCalendars(mockCalendars);
        setLoading(false);
      } catch (err) {
        setError('Failed to load calendars. Please try again later.');
        setLoading(false);
        console.error('Error fetching calendars:', err);
      }
    };
    
    fetchCalendars();
  }, []);

  // Handle calendar download - updated with full backend URL
  const downloadCalendar = async (id, fileName) => {
    try {
      // First try the actual API with updated URL
      try {
        const response = await fetch(`${API_BASE_URL}/api/academic-calendar/download/${id}`, {
          headers: headers
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        setSuccess(`Successfully downloaded ${fileName}`);
        return;
      } catch (apiError) {
        console.warn("API download failed:", apiError);
        // Fall back to alert for demonstration
      }
      
      // Simulating download for demonstration
      alert(`Downloading ${fileName}...`);
      setSuccess(`Successfully downloaded ${fileName}`);
    } catch (err) {
      setError('Failed to download the calendar. Please try again.');
      console.error('Download error:', err);
    }
  };

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem("userId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    // Navigate to login page
    navigate("/");
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Updated Sidebar */}
      <aside className="w-1/4 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          {/* Updated header with logo left and college name right-aligned */}
          <div className="flex items-center justify-between">
            <img src="/logo.jpg" alt="IIITV-ICD Logo" className="h-12 w-40" />
            <span className="text-sm font-bold text-right">
              Indian Institute of Information Technology Vadodara International Campus Diu
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10">
          <ul className="space-y-5">
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/dashboard")}> Home</li>
              <li className="cursor-pointer hover:text-gray-300 font-bold" onClick={() => navigate("/student/step-1-registration")}>Registration</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/mycourses")}>My Courses</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/academic-calendar")}>Academic Calendar</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/announcements")}>Announcements</li>
            </ul>
          </nav>
        </div>

        {/* Profile Section with dropdown */}
        <div className="mt-auto relative">
  <div 
    className="flex items-center cursor-pointer p-2 hover:bg-[#5d2a87] rounded-lg transition"
    onClick={handleLogout}
  >
    <div className="bg-gray-200 h-10 w-10 rounded-full flex items-center justify-center mr-3">
      <FaUser className="text-[#49196c]" />
    </div>
    <span className="text-sm font-medium">{"Logout"}</span>
  </div>
  
</div>
      </aside>

      {/* Main Content - kept unchanged */}
      <div className="flex-1 bg-[#efeaf2] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#49196c] text-white p-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="mr-2" size={20} />
                Academic Calendar
              </h2>
            </div>
            
            {/* Alert messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#49196c] border-t-transparent"></div>
                  <p className="mt-3 text-gray-600">Loading calendars...</p>
                </div>
              ) : calendars.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="mx-auto text-gray-400" size={48} />
                  <p className="mt-4 text-gray-500">No academic calendars are currently available.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    All the active academic calendars are listed below. You can view or download any calendar by clicking on the download button.
                  </p>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {calendars.map((calendar) => (
                      <div key={calendar.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 p-4 border-b">
                          <h3 className="font-medium text-lg text-gray-800">{calendar.title}</h3>
                          <p className="text-sm text-gray-500">Academic Year: {calendar.academic_year}</p>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {calendar.file_name} ({calendar.file_size})
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Uploaded on {calendar.upload_date}
                          </div>
                          <button
                            onClick={() => downloadCalendar(calendar.id, calendar.file_name)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-[#49196c] text-white rounded hover:bg-[#5d2a87] transition-colors"
                          >
                            <Download size={16} className="mr-2" />
                            Download Calendar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Important Dates Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
            <div className="bg-[#49196c] text-white p-4">
              <h2 className="text-lg font-semibold">Important Upcoming Dates</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">Registration for Odd Semester</p>
                      <p className="text-sm text-gray-500">July 20, 2025</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">Commencement of Classes</p>
                      <p className="text-sm text-gray-500">July 25, 2025</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">Mid-Semester Examination</p>
                      <p className="text-sm text-gray-500">September 15-20, 2025</p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 rounded p-1 mr-3">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium">End-Semester Examination</p>
                      <p className="text-sm text-gray-500">November 25 - December 5, 2025</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAcademicCalendarPage;