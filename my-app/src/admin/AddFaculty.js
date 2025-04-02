import React, { useState } from "react";
import axios from "axios";

const AddFaculty = () => {
  const [facultyData, setFacultyData] = useState({
    name: "",
    department: "",
    qualifications: "",
    email: "",
    phone_number: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFacultyData({ ...facultyData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const role = localStorage.getItem('role');
    
    if (!role || role !== 'admin') {
      setMessageType("error");
      setMessage("Access denied. Admin role required.");
      return;
    }
    
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add-faculty",
        facultyData,
        {
          headers: {
            'Role': role
          }
        }
      );
      setMessageType("success");
      setMessage(response.data.message);
      // Clear the form on success
      setFacultyData({
        name: "",
        department: "",
        qualifications: "",
        email: "",
        phone_number: "",
        password: ""
      });
    } catch (error) {
      setMessageType("error");
      console.error("Error details:", error);
      setMessage(
        error.response 
          ? `Error: ${error.response.data.message || error.response.statusText}` 
          : "Network error: Failed to connect to the server"
      );
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Faculty</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={facultyData.name}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Department *</label>
          <input
            type="text"
            name="department"
            value={facultyData.department}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Qualifications</label>
          <input
            type="text"
            name="qualifications"
            value={facultyData.qualifications}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={facultyData.email}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={facultyData.phone_number}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={facultyData.password}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
        >
          Add Faculty
        </button>
      </form>
    </div>
  );
};

export default AddFaculty;