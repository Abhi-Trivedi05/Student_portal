// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const AnnouncementsPage = () => {
//   const navigate = useNavigate();
//   const [announcements, setAnnouncements] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Get student ID from localStorage (assuming it's stored during login)
//   const studentId = localStorage.getItem("studentId") || "";
//   const studentName = localStorage.getItem("studentName") || "Student";

//   useEffect(() => {
//     const fetchAnnouncements = async () => {
//       try {
//         setLoading(true);
//         // Fetch announcements that are active and visible to students or all
//         const response = await axios.get('/api/announcements', {
//           params: {
//             visibility: 'Students,All',
//             status: 'active'
//           }
//         });

//         if (response.data && Array.isArray(response.data)) {
//           setAnnouncements(response.data);
//         } else {
//           throw new Error('Invalid response format');
//         }
//       } catch (err) {
//         console.error("Error fetching announcements:", err);
//         setError("Failed to load announcements. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnnouncements();
//   }, []);

//   // Format date function
//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   // Get importance class for styling
//   const getImportanceClass = (importance) => {
//     switch (importance?.toLowerCase()) {
//       case "urgent":
//         return "border-red-500 bg-red-50";
//       case "important":
//         return "border-orange-500 bg-orange-50";
//       default:
//         return "border-[#49196c]";
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
//         {/* Institute Logo & Name */}
//         <div>
//           <div className="flex flex-col items-start">
//             <img src="/logo.png" alt="IIITV-ICD Logo" className="h-12 w-12" />
//             <span className="text-sm font-bold mt-2">
//               Indian Institute of Information Technology Vadodara <br /> International Campus Diu
//             </span>
//           </div>

//           {/* Navigation Links */}
//           <nav className="mt-10">
//             <ul className="space-y-5">
//               <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/dashboard")}>
//                 Home
//               </li>
//               <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/step-1-registration")}>
//                 Registration
//               </li>
//               <li className="cursor-pointer hover:text-gray-300">Activities</li>
//               <li className="cursor-pointer hover:text-gray-300">My Courses</li>
//               <li className="cursor-pointer hover:text-gray-300">Academic Calendar</li>
//               <li className="cursor-pointer font-bold">Announcements</li>
//             </ul>
//           </nav>
//         </div>

//         {/* Profile Section */}
//         <div className="flex items-center space-x-3 border-t border-gray-500 pt-4">
//           <img src="/profile-icon.png" alt="Profile" className="h-10 w-10 rounded-full border border-gray-300" />
//           <span className="text-sm font-medium">{studentName}</span>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <h1 className="text-3xl font-bold text-[#49196c] mb-6">Announcements</h1>

//         {/* Loading state */}
//         {loading && (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49196c]"></div>
//           </div>
//         )}

//         {/* Error state */}
//         {error && !loading && (
//           <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         {/* Announcements list */}
//         {!loading && !error && (
//           <div className="space-y-6">
//             {announcements.length > 0 ? (
//               announcements.map((announcement) => (
//                 <div 
//                   key={announcement.id} 
//                   className={`bg-white p-6 shadow-md rounded-lg border-l-4 ${getImportanceClass(announcement.importance)}`}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h2 className="text-xl font-semibold">{announcement.title}</h2>
//                       <p className="text-gray-500 text-sm">Posted: {formatDate(announcement.publication_date)}</p>
//                       {announcement.expiry_date && (
//                         <p className="text-gray-500 text-sm">Expires: {formatDate(announcement.expiry_date)}</p>
//                       )}
//                     </div>
//                     {announcement.importance && announcement.importance.toLowerCase() !== "normal" && (
//                       <span className={`px-3 py-1 rounded-full text-sm ${
//                         announcement.importance.toLowerCase() === "urgent" 
//                           ? "bg-red-100 text-red-800" 
//                           : "bg-orange-100 text-orange-800"
//                       }`}>
//                         {announcement.importance}
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-gray-700 mt-4">{announcement.description}</p>
//                   {announcement.form_link && (
//                     <a 
//                       href={announcement.form_link} 
//                       target="_blank" 
//                       rel="noopener noreferrer" 
//                       className="text-blue-600 hover:underline mt-4 inline-block"
//                     >
//                       Related Form →
//                     </a>
//                   )}
//                 </div>
//               ))
//             ) : (
//               <div className="text-center p-12 bg-white rounded-lg shadow-md">
//                 <p className="text-gray-500">No announcements available at this time.</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnnouncementsPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const AnnouncementsPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  
  // Get student ID from localStorage (assuming it's stored during login)
  const studentId = localStorage.getItem("studentId") || "";
  const studentName = localStorage.getItem("studentName") || "Student";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        // Fetch announcements that are active and visible to students or all
        const response = await axios.get('/api/announcements', {
          params: {
            visibility: 'Students,All',
            status: 'active'
          }
        });

        if (response.data && Array.isArray(response.data)) {
          setAnnouncements(response.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get importance class for styling
  const getImportanceClass = (importance) => {
    switch (importance?.toLowerCase()) {
      case "urgent":
        return "border-red-500 bg-red-50";
      case "important":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-[#49196c]";
    }
  };

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    // Navigate to login page
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          {/* Updated header with logo left and college name right-aligned */}
          <div className="flex items-center justify-between">
            <img src="/logo.jpg" alt="IIITV-ICD Logo" className="h-20 w-20" />
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

        {/* Updated Profile Section with dropdown */}
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

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#49196c] mb-6">Announcements</h1>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49196c]"></div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Announcements list */}
        {!loading && !error && (
          <div className="space-y-6">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`bg-white p-6 shadow-md rounded-lg border-l-4 ${getImportanceClass(announcement.importance)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">{announcement.title}</h2>
                      <p className="text-gray-500 text-sm">Posted: {formatDate(announcement.publication_date)}</p>
                      {announcement.expiry_date && (
                        <p className="text-gray-500 text-sm">Expires: {formatDate(announcement.expiry_date)}</p>
                      )}
                    </div>
                    {announcement.importance && announcement.importance.toLowerCase() !== "normal" && (
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        announcement.importance.toLowerCase() === "urgent" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-orange-100 text-orange-800"
                      }`}>
                        {announcement.importance}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mt-4">{announcement.description}</p>
                  {announcement.form_link && (
                    <a 
                      href={announcement.form_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline mt-4 inline-block"
                    >
                      Related Form →
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center p-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">No announcements available at this time.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;