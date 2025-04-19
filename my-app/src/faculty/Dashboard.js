import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaUser } from "react-icons/fa";
import axios from "axios";
import { User, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
  const [expandedApplication, setExpandedApplication] = useState(null);
  const [notification, setNotification] = useState(null);
  
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
  // Assume faculty ID is stored in localStorage after login
  const facultyId = localStorage.getItem('facultyId') || 1; // Default to 1 for testing

  useEffect(() => {
    // Fetch applications data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications - update endpoint to match backend
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        setApplications(applicationsRes.data);
        
        // Fetch statistics - update endpoint to match backend
        const statsRes = await axios.get(`/api/faculty/${facultyId}/application-stats`);
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

  // Function to handle application approval
  const handleApprove = async (id, feeStatus) => {
    try {
      if (feeStatus !== 'Approved') {
        setNotification({
          type: 'error',
          message: 'Cannot approve registration when fee status is pending'
        });
        setTimeout(() => setNotification(null), 5000);
        return;
      }
      
      // Update endpoint to match backend API structure
      await axios.put(`/api/faculty/applications/${id}`, { status: 'Completed' });
      
      // Update local state
      setApplications(
        applications.map(app => 
          app.id === id ? {...app, status: "Completed"} : app
        )
      );
      
      // Update statistics
      setStats({
        ...stats,
        pending: stats.pending - 1,
        approved: stats.approved + 1
      });
      
      setNotification({
        type: 'success',
        message: 'Application approved successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error approving application:", err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve application. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Function to handle application rejection
  const handleReject = async (id) => {
    try {
      // Update endpoint to match backend API structure
      await axios.put(`/api/faculty/applications/${id}`, { status: 'Failed' });
      
      // Update local state
      setApplications(
        applications.map(app => 
          app.id === id ? {...app, status: "Failed"} : app
        )
      );
      
      // Update statistics
      setStats({
        ...stats,
        pending: stats.pending - 1,
        rejected: stats.rejected + 1
      });
      
      setNotification({
        type: 'success',
        message: 'Application rejected successfully'
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error rejecting application:", err);
      setNotification({
        type: 'error',
        message: 'Failed to reject application. Please try again.'
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Toggle expanded view of an application
  const toggleExpandedView = (id) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  // Filter applications by status
  const pendingApplications = applications.filter(app => app.status === "In Progress");
  const approvedApplications = applications.filter(app => app.status === "Completed");
  const rejectedApplications = applications.filter(app => app.status === "Failed");

  // Fee status color mapping
  const getFeeStatusColor = (status) => {
    const colors = {
      "Approved": { bg: '#dcfce7', text: '#166534' },
      "Pending": { bg: '#fee2e2', text: '#991b1b' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  // Status color mapping
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
        {/* <div style={{ position: 'relative' }}>
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
            <div style={{
              height: '24px',
              width: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#e5e7eb'
            }}>
              <User size={16} color="#374151" />
            </div>
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
                onClick={() => {
                  localStorage.removeItem('facultyId');
                  navigate("/");
                }}
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
        </div> */}
        <div className="relative">
                    <div 
                      className="flex items-center cursor-pointer space-x-3"
                      onClick={() => setShowLogout(!showLogout)}
                    >
                      <div className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                        <FaUser className="text-[#49196c]" />
                      </div>
                    </div>
                    
                    {showLogout && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
                        <button 
                          className="w-full text-left py-2 px-3 text-gray-700 hover:bg-gray-100 rounded transition"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          padding: '12px 16px',
          borderRadius: '6px',
          zIndex: 1100,
          backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: notification.type === 'success' ? '#166534' : '#991b1b',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {notification.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

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
            Registration Applications
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
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Programme</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Batch</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fee Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Registration Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? (
                  applications.map((app) => {
                    const feeStatusColors = getFeeStatusColor(app.feeStatus);
                    const statusColors = getStatusColor(app.status);
                    const isExpanded = expandedApplication === app.id;
                    
                    return (
                      <React.Fragment key={app.id}>
                        <tr style={{ 
                          borderBottom: '1px solid #e5e7eb',
                          transition: 'background-color 0.2s',
                          backgroundColor: isExpanded ? '#f9fafb' : 'transparent'
                        }}
                        onMouseEnter={(e) => !isExpanded && (e.target.parentElement.style.backgroundColor = '#f9fafb')}
                        onMouseLeave={(e) => !isExpanded && (e.target.parentElement.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '12px 16px' }}>{app.name}</td>
                          <td style={{ padding: '12px 16px' }}>{app.registrationId}</td>
                          <td style={{ padding: '12px 16px' }}>{app.course}</td>
                          <td style={{ padding: '12px 16px' }}>{app.batch}</td>
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
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => toggleExpandedView(app.id)}
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
                                {isExpanded ? 'Hide Courses' : 'View Courses'}
                              </button>
                              
                              {app.status === 'In Progress' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(app.id, app.feeStatus)}
                                    disabled={app.feeStatus !== 'Approved'}
                                    style={{
                                      backgroundColor: app.feeStatus !== 'Approved' ? '#d1d5db' : '#166534',
                                      color: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: 'none',
                                      cursor: app.feeStatus !== 'Approved' ? 'not-allowed' : 'pointer',
                                      fontSize: '12px',
                                      transition: 'background-color 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      if (app.feeStatus === 'Approved') {
                                        e.target.style.backgroundColor = '#14532d';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (app.feeStatus === 'Approved') {
                                        e.target.style.backgroundColor = '#166534';
                                      }
                                    }}
                                    title={app.feeStatus !== 'Approved' ? 'Cannot approve when fee is pending' : 'Approve application'}
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
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="8" style={{ backgroundColor: '#f9fafb', padding: '0' }}>
                              <div style={{ padding: '16px', borderTop: '1px dashed #e5e7eb' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#49196c' }}>
                                  Selected Courses
                                </h4>
                                {app.selectedCourses && app.selectedCourses.length > 0 ? (
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                      <tr>
                                        <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>Course Code</th>
                                        <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>Course Name</th>
                                        <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>Credits</th>
                                        <th style={{ padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}>Type</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {app.selectedCourses.map((course, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                          <td style={{ padding: '8px 16px' }}>{course.course_code}</td>
                                          <td style={{ padding: '8px 16px' }}>{course.course_name}</td>
                                          <td style={{ padding: '8px 16px' }}>{course.credits}</td>
                                          <td style={{ padding: '8px 16px' }}>
                                            <span style={{
                                              backgroundColor: course.is_elective ? '#dbeafe' : '#f3e8ff',
                                              color: course.is_elective ? '#1e40af' : '#6b21a8',
                                              padding: '2px 8px',
                                              borderRadius: '4px',
                                              fontSize: '12px',
                                            }}>
                                              {course.is_elective ? 'Elective' : 'Core'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No courses selected</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                      <BookOpen size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                      <p>No applications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'white',
        padding: '16px 0',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          &copy; {new Date().getFullYear()} University Registration System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default FacultyAdvisorDashboard;