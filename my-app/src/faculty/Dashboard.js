// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const FacultyAdvisorDashboard = () => {
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     approved: 0,
//     rejected: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Assume faculty ID is stored in localStorage after login
//   const facultyId = localStorage.getItem('facultyId') || 1; // Default to 1 for testing

//   useEffect(() => {
//     // Fetch applications data
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch applications
//         const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
//         setApplications(applicationsRes.data);
        
//         // Fetch statistics
//         const statsRes = await axios.get(`/api/faculty/${facultyId}/application-stats`);
//         setStats(statsRes.data);
        
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError("Failed to load data. Please try again later.");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [facultyId]);

//   // Function to handle application approval
//   const handleApprove = async (id) => {
//     try {
//       await axios.put(`/api/faculty/applications/${id}`, { status: 'Completed' });
      
//       // Update local state
//       setApplications(
//         applications.map(app => 
//           app.id === id ? {...app, status: "Completed"} : app
//         )
//       );
      
//       // Update statistics
//       setStats({
//         ...stats,
//         pending: stats.pending - 1,
//         approved: stats.approved + 1
//       });
//     } catch (err) {
//       console.error("Error approving application:", err);
//       setError("Failed to approve application. Please try again.");
//     }
//   };

//   // Function to handle application rejection
//   const handleReject = async (id) => {
//     try {
//       await axios.put(`/api/faculty/applications/${id}`, { status: 'Failed' });
      
//       // Update local state
//       setApplications(
//         applications.map(app => 
//           app.id === id ? {...app, status: "Failed"} : app
//         )
//       );
      
//       // Update statistics
//       setStats({
//         ...stats,
//         pending: stats.pending - 1,
//         rejected: stats.rejected + 1
//       });
//     } catch (err) {
//       console.error("Error rejecting application:", err);
//       setError("Failed to reject application. Please try again.");
//     }
//   };

//   // Filter applications by status
//   const pendingApplications = applications.filter(app => app.status === "In Progress");
//   const approvedApplications = applications.filter(app => app.status === "Completed");
//   const rejectedApplications = applications.filter(app => app.status === "Failed");

//   // Fee status color mapping
//   const getFeeStatusColor = (status) => {
//     switch(status) {
//       case "Paid": return "bg-green-200 text-green-800";
//       case "Unpaid": return "bg-red-200 text-red-800";
//       case "Partial": return "bg-yellow-200 text-yellow-800";
//       default: return "bg-gray-200 text-gray-800";
//     }
//   };

//   // Status color mapping
//   const getStatusColor = (status) => {
//     switch(status) {
//       case "Completed": return "bg-green-200 text-green-800";
//       case "Failed": return "bg-red-200 text-red-800";
//       case "In Progress": return "bg-yellow-200 text-yellow-800";
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
//       <h2 className="text-3xl font-bold mb-6">Faculty Advisor Dashboard</h2>
      
//       {/* Statistics Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl mb-6">
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <div className="text-lg font-medium text-gray-600">Total Applications</div>
//           <div className="text-3xl font-bold">{stats.total}</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <div className="text-lg font-medium text-gray-600">Pending</div>
//           <div className="text-3xl font-bold">{stats.pending}</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <div className="text-lg font-medium text-gray-600">Approved</div>
//           <div className="text-3xl font-bold">{stats.approved}</div>
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-md">
//           <div className="text-lg font-medium text-gray-600">Rejected</div>
//           <div className="text-3xl font-bold">{stats.rejected}</div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
//         <button
//           onClick={() => navigate("/faculty/pending-applications")}
//           className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
//         >
//           Pending Applications ({pendingApplications.length})
//         </button>
    
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
//         <button
//           onClick={() => navigate("/faculty/approved-applications")}
//           className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
//         >
//           Approved Applications ({approvedApplications.length})
//         </button>
    
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
//         <button
//           onClick={() => navigate("/faculty/rejected-applications")}
//           className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
//         >
//           Rejected Applications ({rejectedApplications.length})
//         </button>
    
//       </div>

//       {/* Applications Table */}
//       <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
//         <h3 className="text-xl font-bold mb-4">Student Registration Applications</h3>
        
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <th className="border p-2 text-left">Name</th>
//                 <th className="border p-2 text-left">Registration ID</th>
//                 <th className="border p-2 text-left">Course</th>
//                 <th className="border p-2 text-left">Fee Status</th>
//                 <th className="border p-2 text-left">Fee Amount</th>
//                 <th className="border p-2 text-left">Date</th>
//                 <th className="border p-2 text-left">Status</th>
//                 <th className="border p-2 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {applications.map((app) => (
//                 <tr key={app.id} className="hover:bg-gray-50">
//                   <td className="border p-2">{app.name}</td>
//                   <td className="border p-2">{app.registrationId}</td>
//                   <td className="border p-2">{app.course}</td>
//                   <td className="border p-2">
//                     <span className={`px-2 py-1 rounded text-sm ${getFeeStatusColor(app.feeStatus)}`}>
//                       {app.feeStatus}
//                     </span>
//                   </td>
//                   <td className="border p-2">{app.feeAmount}</td>
//                   <td className="border p-2">{app.applicationDate}</td>
//                   <td className="border p-2">
//                     <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
//                       {app.status === 'In Progress' ? 'Pending' : app.status}
//                     </span>
//                   </td>
//                   <td className="border p-2">
//                     {app.status === 'In Progress' ? (
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => handleApprove(app.id)}
//                           className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleReject(app.id)}
//                           className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
//                         >
//                           Reject
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         onClick={() => navigate(`/faculty/application-details/${app.id}`)}
//                         className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
//                       >
//                         View Details
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default FacultyAdvisorDashboard;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";

const FacultyAdvisorDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  
  const facultyId = localStorage.getItem('facultyId') || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        const statsRes = await axios.get(`/api/faculty/${facultyId}/application-stats`);
        setApplications(applicationsRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [facultyId]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/faculty/applications/${id}`, { status: 'Completed' });
      setApplications(applications.map(app => 
        app.id === id ? {...app, status: "Completed"} : app
      ));
      setStats({
        ...stats,
        pending: stats.pending - 1,
        approved: stats.approved + 1
      });
    } catch (err) {
      console.error("Error approving application:", err);
      setError("Failed to approve application. Please try again.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/faculty/applications/${id}`, { status: 'Failed' });
      setApplications(applications.map(app => 
        app.id === id ? {...app, status: "Failed"} : app
      ));
      setStats({
        ...stats,
        pending: stats.pending - 1,
        rejected: stats.rejected + 1
      });
    } catch (err) {
      console.error("Error rejecting application:", err);
      setError("Failed to reject application. Please try again.");
    }
  };

  const pendingApplications = applications.filter(app => app.status === "In Progress");
  const approvedApplications = applications.filter(app => app.status === "Completed");
  const rejectedApplications = applications.filter(app => app.status === "Failed");

  const getFeeStatusColor = (status) => {
    const colors = {
      "Paid": { bg: '#dcfce7', text: '#166534' },
      "Unpaid": { bg: '#fee2e2', text: '#991b1b' },
      "Partial": { bg: '#fef9c3', text: '#854d0e' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const getStatusColor = (status) => {
    const colors = {
      "Completed": { bg: '#dcfce7', text: '#166534' },
      "Failed": { bg: '#fee2e2', text: '#991b1b' },
      "In Progress": { bg: '#fef9c3', text: '#854d0e' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div style={{ fontSize: '1.25rem', color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      
      backgroundColor: '#efeaf2',
      margin: 0,
      padding: 0,
      width: '100%',
      overflowX: 'hidden',
    }}>
      {/* Navbar */}
      <nav style={{
        height: '50px',
        width:'100vw',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            height: '32px',
            width: '32px',
            backgroundColor: '#49196c',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
          }}>
            ICD
          </div>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>
            Faculty Dashboard
          </span>
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              padding: '2px',
              cursor: 'pointer',
            }}
          >
            <img
              src="/profile-icon.png"
              alt="Profile"
              style={{
                height: '24px',
                width: '24px',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
              }}
            />
          </button>
          {showLogout && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              width: '192px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '4px',
              zIndex: 1000,
            }}>
              <button
                onClick={() => navigate("/")}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px' }}>
        {/* Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          maxWidth: '1200px',
          margin: '0 auto 24px auto',
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Applications</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#49196c' }}>{stats.total}</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#854d0e' }}>{stats.pending}</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Approved</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>{stats.approved}</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Rejected</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>{stats.rejected}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto 24px auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          <button
            onClick={() => navigate("/faculty/pending-applications")}
            style={{
              backgroundColor: '#49196c',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3b1456'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#49196c'}
          >
            <Clock size={20} />
            Pending Applications ({pendingApplications.length})
          </button>
          <button
            onClick={() => navigate("/faculty/approved-applications")}
            style={{
              backgroundColor: '#49196c',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3b1456'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#49196c'}
          >
            <CheckCircle size={20} />
            Approved Applications ({approvedApplications.length})
          </button>
          <button
            onClick={() => navigate("/faculty/rejected-applications")}
            style={{
              backgroundColor: '#49196c',
              color: 'white',
              padding: '16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3b1456'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#49196c'}
          >
            <XCircle size={20} />
            Rejected Applications ({rejectedApplications.length})
          </button>
        </div>

        {/* Applications Table */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '24px',
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            Recent Applications
          </h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Registration ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Course</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fee Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fee Amount</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const feeStatusColors = getFeeStatusColor(app.feeStatus);
                  const statusColors = getStatusColor(app.status);
                  
                  return (
                    <tr key={app.id} style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>{app.name}</td>
                      <td style={{ padding: '12px 16px' }}>{app.registrationId}</td>
                      <td style={{ padding: '12px 16px' }}>{app.course}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: feeStatusColors.bg,
                          color: feeStatusColors.text,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          {app.feeStatus}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{app.feeAmount}</td>
                      <td style={{ padding: '12px 16px' }}>{app.applicationDate}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}>
                          {app.status === 'In Progress' ? 'Pending' : app.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {app.status === 'In Progress' ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApprove(app.id)}
                              style={{
                                backgroundColor: '#166534',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#14532d'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#166534'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(app.id)}
                              style={{
                                backgroundColor: '#991b1b',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#7f1d1d'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#991b1b'}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate(`/faculty/application-details/${app.id}`)}
                            style={{
                              backgroundColor: '#49196c',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#3b1456'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#49196c'}
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAdvisorDashboard;