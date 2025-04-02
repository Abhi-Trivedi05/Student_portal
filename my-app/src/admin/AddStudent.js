import React, { useState } from "react";
import axios from "axios";

const AddStudent = () => {
  const [studentData, setStudentData] = useState({
    student_id: "",
    name: "",
    programme: "",
    department: "",
    cpi: "",
    current_semester: "",
    batch: "",
    faculty_advisor_id: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
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
        "http://localhost:5000/api/admin/add-student",
        studentData,
        {
          headers: {
            'Role': role
          }
        }
      );
      setMessageType("success");
      setMessage(response.data.message);
      // Clear the form on success
      setStudentData({
        student_id: "",
        name: "",
        programme: "",
        department: "",
        cpi: "",
        current_semester: "",
        batch: "",
        faculty_advisor_id: "",
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
      <h2 className="text-2xl font-bold mb-4">Add Student</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Student ID *</label>
          <input
            type="text"
            name="student_id"
            value={studentData.student_id}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={studentData.name}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Programme *</label>
          <input
            type="text"
            name="programme"
            value={studentData.programme}
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
            value={studentData.department}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">CPI</label>
          <input
            type="number"
            name="cpi"
            value={studentData.cpi}
            onChange={handleChange}
            step="0.01"
            min="0"
            max="10"
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Current Semester *</label>
          <input
            type="number"
            name="current_semester"
            value={studentData.current_semester}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Batch *</label>
          <input
            type="text"
            name="batch"
            value={studentData.batch}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Faculty Advisor ID</label>
          <input
            type="text"
            name="faculty_advisor_id"
            value={studentData.faculty_advisor_id}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={studentData.password}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>
        
        <button
          type="submit"
          className="bg-green-500 text-white p-2 w-full rounded hover:bg-green-600"
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudent;