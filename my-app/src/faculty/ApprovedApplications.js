import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ApprovedApplications = () => {
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
        // Filter only approved applications (status = Completed)
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
          <h2 className="text-3xl font-bold">Approved Applications</h2>
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
          <p className="text-xl">No approved applications found.</p>
        </div>
      ) : (
        <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            Approved Student Applications <span className="text-green-600">({applications.length})</span>
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Registration ID</th>
                  <th className="border p-2 text-left">Course</th>
                  <th className="border p-2 text-left">Fee Status</th>
                  <th className="border p-2 text-left">Fee Amount</th>
                  <th className="border p-2 text-left">Application Date</th>
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
                      <button
                        onClick={() => navigate(`/faculty/application-details/${app.id}`)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">Approval Summary</h4>
            <p className="text-green-700 mb-2">
              Total Approved Applications: <span className="font-bold">{applications.length}</span>
            </p>
            <p className="text-green-700 mb-2">
              Fully Paid Applications: <span className="font-bold">
                {applications.filter(app => app.feeStatus === "Paid").length}
              </span>
            </p>
            <p className="text-green-700">
              Applications with Pending Fees: <span className="font-bold">
                {applications.filter(app => app.feeStatus !== "Paid").length}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedApplications;