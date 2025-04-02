import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ApplicationDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For more complete implementation, you would have an API endpoint to fetch specific application details
        // This is a simplified approach that gets all applications and filters for the one we need
        const facultyId = localStorage.getItem('facultyId') || 1;
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        const foundApp = applicationsRes.data.find(app => app.id.toString() === id);
        
        if (foundApp) {
          setApplication(foundApp);
        } else {
          setError("Application not found");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching application details:", err);
        setError("Failed to load application details. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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

  if (!application) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Application not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Application Details</h2>
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">{application.name}</h3>
            <span className={`px-3 py-1 rounded text-sm ${getStatusColor(application.status)}`}>
              {application.status === 'In Progress' ? 'Pending' : application.status}
            </span>
          </div>
          <p className="text-gray-500">Registration ID: {application.registrationId}</p>
          <p className="text-gray-500">Application Date: {application.applicationDate}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-bold mb-2">Course Information</h4>
            <p className="text-gray-700">Course: {application.course}</p>
          </div>

          <div>
            <h4 className="font-bold mb-2">Fee Information</h4>
            <p className="text-gray-700">
              Status: 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${getFeeStatusColor(application.feeStatus)}`}>
                {application.feeStatus}
              </span>
            </p>
            <p className="text-gray-700">Amount: {application.feeAmount}</p>
          </div>
        </div>

        {/* Add more student info if available */}
        <div className="border-t pt-4">
          <h4 className="font-bold mb-2">Application History</h4>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm">
              <span className="font-medium">Submitted:</span> {application.applicationDate}
            </p>
            {application.status !== 'In Progress' && (
              <p className="text-sm">
                <span className="font-medium">Status updated to {application.status}:</span> Date not available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;