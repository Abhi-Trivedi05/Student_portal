import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  
  // Assume faculty ID is stored in localStorage after login
  const facultyId = localStorage.getItem('facultyId') || 1; // Default to 1 for testing

  useEffect(() => {
    // Fetch applications data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        setApplications(applicationsRes.data);
        
        // Fetch statistics
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
  const handleApprove = async (id) => {
    try {
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
    } catch (err) {
      console.error("Error approving application:", err);
      setError("Failed to approve application. Please try again.");
    }
  };

  // Function to handle application rejection
  const handleReject = async (id) => {
    try {
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
    } catch (err) {
      console.error("Error rejecting application:", err);
      setError("Failed to reject application. Please try again.");
    }
  };

  // Filter applications by status
  const pendingApplications = applications.filter(app => app.status === "In Progress");
  const approvedApplications = applications.filter(app => app.status === "Completed");
  const rejectedApplications = applications.filter(app => app.status === "Failed");

  // Fee status color mapping
  const getFeeStatusColor = (status) => {
    switch(status) {
      case "Paid": return "bg-green-200 text-green-800";
      case "Unpaid": return "bg-red-200 text-red-800";
      case "Partial": return "bg-yellow-200 text-yellow-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-200 text-green-800";
      case "Failed": return "bg-red-200 text-red-800";
      case "In Progress": return "bg-yellow-200 text-yellow-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6">Faculty Advisor Dashboard</h2>
      
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-medium text-gray-600">Total Applications</div>
          <div className="text-3xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-medium text-gray-600">Pending</div>
          <div className="text-3xl font-bold">{stats.pending}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-medium text-gray-600">Approved</div>
          <div className="text-3xl font-bold">{stats.approved}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="text-lg font-medium text-gray-600">Rejected</div>
          <div className="text-3xl font-bold">{stats.rejected}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        <button
          onClick={() => navigate("/faculty/pending-applications")}
          className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
        >
          Pending Applications ({pendingApplications.length})
        </button>
    
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        <button
          onClick={() => navigate("/faculty/approved-applications")}
          className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
        >
          Approved Applications ({approvedApplications.length})
        </button>
    
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mb-8">
        <button
          onClick={() => navigate("/faculty/rejected-applications")}
          className="bg-yellow-500 text-white p-4 rounded-lg shadow-md hover:bg-yellow-600"
        >
          Rejected Applications ({rejectedApplications.length})
        </button>
    
      </div>

      {/* Applications Table */}
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Student Registration Applications</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Registration ID</th>
                <th className="border p-2 text-left">Course</th>
                <th className="border p-2 text-left">Fee Status</th>
                <th className="border p-2 text-left">Fee Amount</th>
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="border p-2">{app.name}</td>
                  <td className="border p-2">{app.registrationId}</td>
                  <td className="border p-2">{app.course}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getFeeStatusColor(app.feeStatus)}`}>
                      {app.feeStatus}
                    </span>
                  </td>
                  <td className="border p-2">{app.feeAmount}</td>
                  <td className="border p-2">{app.applicationDate}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(app.status)}`}>
                      {app.status === 'In Progress' ? 'Pending' : app.status}
                    </span>
                  </td>
                  <td className="border p-2">
                    {app.status === 'In Progress' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => navigate(`/faculty/application-details/${app.id}`)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default FacultyAdvisorDashboard;