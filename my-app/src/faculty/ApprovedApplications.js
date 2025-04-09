// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const ApprovedApplications = () => {
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Assume faculty ID is stored in localStorage after login
//   const facultyId = localStorage.getItem('facultyId') || 1; // Default to 1 for testing

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch applications
//         const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
//         // Filter only approved applications (status = Completed)
//         const approvedApps = applicationsRes.data.filter(app => app.status === "Completed");
//         setApplications(approvedApps);
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load approved applications. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [facultyId]);

//   // Fee status color mapping
//   const getFeeStatusColor = (status) => {
//     switch(status) {
//       case "Paid": return "bg-green-200 text-green-800";
//       case "Unpaid": return "bg-red-200 text-red-800";
//       case "Partial": return "bg-yellow-200 text-yellow-800";
//       default: return "bg-gray-200 text-gray-800";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-2xl">Loading...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="text-xl text-red-600">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
//       <div className="w-full max-w-6xl">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-3xl font-bold">Approved Applications</h2>
//           <button 
//             onClick={() => navigate('/faculty/dashboard')}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>

//       {applications.length === 0 ? (
//         <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6 text-center">
//           <p className="text-xl">No approved applications found.</p>
//         </div>
//       ) : (
//         <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
//           <h3 className="text-xl font-bold mb-4">
//             Approved Student Applications <span className="text-green-600">({applications.length})</span>
//           </h3>
          
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50">
//                   <th className="border p-2 text-left">Name</th>
//                   <th className="border p-2 text-left">Registration ID</th>
//                   <th className="border p-2 text-left">Course</th>
//                   <th className="border p-2 text-left">Fee Status</th>
//                   <th className="border p-2 text-left">Fee Amount</th>
//                   <th className="border p-2 text-left">Application Date</th>
//                   <th className="border p-2 text-left">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {applications.map((app) => (
//                   <tr key={app.id} className="hover:bg-gray-50">
//                     <td className="border p-2">{app.name}</td>
//                     <td className="border p-2">{app.registrationId}</td>
//                     <td className="border p-2">{app.course}</td>
//                     <td className="border p-2">
//                       <span className={`px-2 py-1 rounded text-sm ${getFeeStatusColor(app.feeStatus)}`}>
//                         {app.feeStatus}
//                       </span>
//                     </td>
//                     <td className="border p-2">{app.feeAmount}</td>
//                     <td className="border p-2">{app.applicationDate}</td>
//                     <td className="border p-2">
//                       <button
//                         onClick={() => navigate(`/faculty/application-details/${app.id}`)}
//                         className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
//                       >
//                         View Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
//             <h4 className="font-bold text-green-800 mb-2">Approval Summary</h4>
//             <p className="text-green-700 mb-2">
//               Total Approved Applications: <span className="font-bold">{applications.length}</span>
//             </p>
//             <p className="text-green-700 mb-2">
//               Fully Paid Applications: <span className="font-bold">
//                 {applications.filter(app => app.feeStatus === "Paid").length}
//               </span>
//             </p>
//             <p className="text-green-700">
//               Applications with Pending Fees: <span className="font-bold">
//                 {applications.filter(app => app.feeStatus !== "Paid").length}
//               </span>
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ApprovedApplications;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronDown } from "lucide-react";

const ApprovedApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [activeSection, setActiveSection] = useState("approved");
  
  const facultyId = localStorage.getItem('facultyId') || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        const approvedApps = applicationsRes.data.filter(app => app.status === "Completed");
        setApplications(approvedApps);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load approved applications. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [facultyId]);

  const getFeeStatusColor = (status) => {
    const colors = {
      "Paid": { bg: '#dcfce7', text: '#166534' },
      "Unpaid": { bg: '#fee2e2', text: '#991b1b' },
      "Partial": { bg: '#fef9c3', text: '#854d0e' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const navItems = [
    {
      title: "Applications",
      submenu: [
        { label: "Pending Applications", path: "/faculty/pending-applications", status: "pending" },
        { label: "Approved Applications", path: "/faculty/approved-applications", status: "approved" },
        { label: "Rejected Applications", path: "/faculty/rejected-applications", status: "rejected" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen">
        <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
          <SidebarContent 
            navItems={navItems} 
            activeDropdown={activeDropdown} 
            setActiveDropdown={setActiveDropdown}
            navigate={navigate}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen">
        <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
          <SidebarContent 
            navItems={navItems} 
            activeDropdown={activeDropdown} 
            setActiveDropdown={setActiveDropdown}
            navigate={navigate}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        <SidebarContent 
          navItems={navItems} 
          activeDropdown={activeDropdown} 
          setActiveDropdown={setActiveDropdown}
          navigate={navigate}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#efeaf2] overflow-y-auto p-8">
        {/* Title */}
        <div className="max-w-[1200px] mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approved Applications</h1>
        </div>

        {/* Applications Table */}
        <div className="max-w-[1200px] mx-auto mb-8">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">No approved applications found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Registration ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Course</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Fee Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Fee Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => {
                        const feeStatusColors = getFeeStatusColor(app.feeStatus);
                        return (
                          <tr 
                            key={app.id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">{app.name}</td>
                            <td className="py-3 px-4">{app.registrationId}</td>
                            <td className="py-3 px-4">{app.course}</td>
                            <td className="py-3 px-4">
                              <span
                                style={{
                                  backgroundColor: feeStatusColors.bg,
                                  color: feeStatusColors.text,
                                }}
                                className="px-2 py-1 rounded-full text-sm font-medium"
                              >
                                {app.feeStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4">{app.feeAmount}</td>
                            <td className="py-3 px-4">{app.applicationDate}</td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => navigate(`/faculty/application-details/${app.id}`)}
                                className="px-3 py-1 bg-[#49196c] text-white text-sm rounded hover:bg-[#3b1456] transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Approval Summary</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-800 mb-1">Total Approved</p>
                    <p className="text-2xl font-bold text-purple-900">{applications.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800 mb-1">Fully Paid</p>
                    <p className="text-2xl font-bold text-green-900">
                      {applications.filter(app => app.feeStatus === "Paid").length}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <p className="text-sm text-yellow-800 mb-1">Pending Fees</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {applications.filter(app => app.feeStatus !== "Paid").length}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="max-w-[120px] mx-auto flex justify-end">
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-[#49196c] text-white rounded-lg hover:bg-[#3b1456] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ 
  navItems, 
  activeDropdown, 
  setActiveDropdown,
  navigate,
  activeSection,
  setActiveSection
}) => {
  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleNavigation = (path, status) => {
    setActiveSection(status);
    navigate(path);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
        </div>
        <div className="text-right text-sm font-bold">
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
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  activeDropdown === item.title ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === item.title && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => handleNavigation(subItem.path, subItem.status)}
                    className={`w-full flex items-center p-2 text-sm rounded transition-colors ${
                      activeSection === subItem.status
                        ? "bg-[#7e57c2]"
                        : "bg-[#5d2a87] hover:bg-[#7e57c2]"
                    }`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-[#5d2a87]">
        <div className="text-sm text-gray-300">
          © 2024 IIITV-ICD. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default ApprovedApplications;