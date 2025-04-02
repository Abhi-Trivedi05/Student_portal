import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PendingApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assume faculty ID is stored in localStorage after login
  const facultyId = localStorage.getItem('facultyId') || 1; // Default to 1 for testing

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        // Filter only pending applications
        const pendingApps = applicationsRes.data.filter(app => app.status === "In Progress");
        setApplications(pendingApps);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load pending applications. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [facultyId]);

  // Function to handle application approval
  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/faculty/${id}`, { status: 'Completed' });
      
      // Remove the application from the list
      setApplications(applications.filter(app => app.id !== id));
      
    } catch (err) {
      console.error("Error approving application:", err);
      setError("Failed to approve application. Please try again.");
    }
  };

  // Function to handle application rejection
  const handleReject = async (id) => {
    try {
      await axios.put(`/api/faculty/${id}`, { status: 'Failed' });
      
      // Remove the application from the list
      setApplications(applications.filter(app => app.id !== id));
      
    } catch (err) {
      console.error("Error rejecting application:", err);
      setError("Failed to reject application. Please try again.");
    }
  };

  // Fee status color mapping
  const getFeeStatusColor = (status) => {
    switch(status) {
      case "Paid": return "bg-green-200 text-green-800";
      case "Unpaid": return "bg-red-200 text-red-800";
      case "Partial": return "bg-yellow-200 text-yellow-800";
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
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Pending Applications</h2>
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-xl">No pending applications found.</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApplications;