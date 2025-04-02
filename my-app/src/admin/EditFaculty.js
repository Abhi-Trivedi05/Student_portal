import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyData, setFacultyData] = useState({
    name: "",
    department: "",
    qualifications: "",
    email: "",
    phone_number: "",
    password: "",
    status: "active"
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  // Fetch all faculty members on component mount
  useEffect(() => {
    fetchAllFaculty();
  }, []);

  const fetchAllFaculty = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
        headers: { Role: "admin" }
      });
      
      // Set faculty list from the response
      if (response.data && response.data.faculty) {
        setFacultyList(response.data.faculty);
      } else {
        setError("No faculty data found");
      }
    } catch (error) {
      console.error("Error fetching faculty list:", error);
      setError("Failed to load faculty list: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFaculty = async (id) => {
    if (!id) {
      setSelectedFaculty(null);
      setFacultyData({
        name: "",
        department: "",
        qualifications: "",
        email: "",
        phone_number: "",
        password: "",
        status: "active"
      });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/admin/faculty/${id}`, {
        headers: { Role: "admin" }
      });
      
      if (response.data) {
        setFacultyData({
          name: response.data.name || "",
          department: response.data.department || "",
          qualifications: response.data.qualifications || "",
          email: response.data.email || "",
          phone_number: response.data.phone_number || "",
          password: "",  // Leave password empty for security
          status: response.data.status || "active"
        });
        setSelectedFaculty(id);
        setMessage("");  // Clear any previous messages
      }
    } catch (error) {
      console.error("Error fetching faculty data:", error);
      setMessage("Failed to load faculty data: " + (error.response?.data?.message || error.message));
      setMessageType("error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFacultyData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage("");
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-faculty/${selectedFaculty}`, 
        facultyData,
        { headers: { Role: "admin" } }
      );
      
      setMessage(response.data.message || "Faculty updated successfully");
      setMessageType("success");
      
      // Refresh the faculty list
      fetchAllFaculty();
    } catch (error) {
      console.error("Error updating faculty:", error);
      setMessage("Failed to update faculty: " + (error.response?.data?.message || error.message));
      setMessageType("error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFaculty(null);
    setMessage("");
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Faculty Management</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Faculty Selection Section */}
        <div className="w-full md:w-1/3">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center p-4">
              <p className="text-gray-600">Loading faculty data...</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Faculty to Edit
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedFaculty || ""}
                  onChange={(e) => handleSelectFaculty(e.target.value)}
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      ID: {faculty.id} - {faculty.name} ({faculty.department})
                    </option>
                  ))}
                </select>
              </div>

              {facultyList.length === 0 && !loading && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-gray-600">No faculty members found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Faculty Edit Section */}
        <div className="w-full md:w-2/3">
          {selectedFaculty ? (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4">Edit Faculty Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={facultyData.name} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    value={facultyData.department} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                  <input 
                    type="text" 
                    name="qualifications" 
                    value={facultyData.qualifications} 
                    onChange={handleChange} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={facultyData.email} 
                    onChange={handleChange} 
                    required 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone_number" 
                    value={facultyData.phone_number} 
                    onChange={handleChange} 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password" 
                    name="password"  
                    value={facultyData.password} 
                    onChange={handleChange} 
                    placeholder="Leave blank to keep current password" 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  />
                  <p className="mt-1 text-sm text-gray-500">Leave blank to keep the current password</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={facultyData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button 
                    type="submit" 
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
                    disabled={updateLoading}
                  >
                    {updateLoading ? "Saving..." : "Save Changes"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={handleCancel} 
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                Select a faculty member from the dropdown to edit their details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditFaculty;