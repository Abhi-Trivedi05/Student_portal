import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RemoveFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch faculty list on component mount
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        // Add the admin role header based on the backend middleware
        const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        });
        
        if (response.data.success) {
          setFacultyList(response.data.faculty);
        } else {
          setError("Failed to fetch faculty list.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching faculty list.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const handleSelectChange = (e) => {
    setSelectedFacultyId(e.target.value);
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    
    if (!selectedFacultyId) {
      setError("Please select a faculty member to remove.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-faculty/${selectedFacultyId}`,
        {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setError("");
        
        // Remove the faculty from the list immediately
        setFacultyList(facultyList.filter(faculty => faculty.id !== parseInt(selectedFacultyId)));
        
        // Reset selection
        setSelectedFacultyId("");
        
        // Navigate after a delay
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove faculty.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Remove Faculty</h2>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {!loading && facultyList.length === 0 && !error && (
        <p className="text-gray-600">No faculty members found.</p>
      )}

      {facultyList.length > 0 && (
        <form onSubmit={handleRemove} className="space-y-4">
          <div>
            <label htmlFor="faculty-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Faculty Member
            </label>
            <select
              id="faculty-select"
              value={selectedFacultyId}
              onChange={handleSelectChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Select Faculty --</option>
              {facultyList.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name} - {faculty.department} ({faculty.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFacultyId || loading}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                (!selectedFacultyId || loading) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Remove Faculty"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RemoveFaculty;