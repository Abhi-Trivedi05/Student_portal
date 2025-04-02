import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditStudent = () => {
  const navigate = useNavigate();
  
  // State for the student ID input phase
  const [studentId, setStudentId] = useState("");
  const [idSubmitted, setIdSubmitted] = useState(false);
  
  // State for the student data and editing - updated to match database schema
  const [studentData, setStudentData] = useState({
    name: "",
    programme: "", // Changed from email to match database
    roll_number: "",
    department: "",
    semester: "",
    batch: "",
    cpi: "", // Added to match database
    faculty_advisor_id: "", // Added to match database
    password: "",
  });
  
  // State for password change
  const [changePassword, setChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State for field selection - updated to match database schema
  const [fieldsToEdit, setFieldsToEdit] = useState({
    name: false,
    programme: false, // Changed from email to match database
    roll_number: false,
    department: false,
    semester: false,
    batch: false,
    cpi: false, // Added to match database
    faculty_advisor_id: false, // Added to match database
  });
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch student data after ID is submitted - updated with Role header
  useEffect(() => {
    const fetchStudentData = async () => {
      if (studentId && idSubmitted) {
        try {
          setError("");
          const response = await axios.get(`http://localhost:5000/api/admin/student/${studentId}`, {
            headers: { 'Role': 'admin' }
          });
          setStudentData(response.data);
        } catch (error) {
          console.error("Full error object:", error);
          if (error.response) {
            console.error("Error response data:", error.response.data);
          }
          setError("Failed to fetch student data: " + (error.response?.data?.message || error.message));
          setIdSubmitted(false);
        }
      }
    };
    
    fetchStudentData();
  }, [studentId, idSubmitted]);

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (studentId.trim() === "") {
      setError("Please enter a student ID");
      return;
    }
    setIdSubmitted(true);
  };

  const handleFieldSelectionChange = (e) => {
    setFieldsToEdit({
      ...fieldsToEdit,
      [e.target.name]: e.target.checked
    });
  };

  const handleChange = (e) => {
    setStudentData({
      ...studentData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordCheckbox = (e) => {
    setChangePassword(e.target.checked);
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password if changing
    if (changePassword) {
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }
    
    // Create update data including only the fields selected for editing
    const updateData = {};
    
    Object.keys(fieldsToEdit).forEach(field => {
      if (fieldsToEdit[field]) {
        updateData[field] = studentData[field];
      }
    });
    
    // Add password if changing
    if (changePassword) {
      updateData.password = newPassword;
    }
    
    // Only proceed if there's something to update
    if (Object.keys(updateData).length === 0) {
      setError("Please select at least one field to update");
      return;
    }
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-student/${studentId}`, 
        updateData,
        {
          headers: { 'Role': 'admin' }
        }
      );
      setMessage(response.data.message || "Student updated successfully");
      
      // Reset form state after successful update
      setTimeout(() => {
        setIdSubmitted(false);
        setStudentId("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePassword(false);
        setFieldsToEdit({
          name: false,
          programme: false,
          roll_number: false,
          department: false,
          semester: false,
          batch: false,
          cpi: false,
          faculty_advisor_id: false,
        });
        setMessage("");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update student");
    }
  };

  const handleCancel = () => {
    setIdSubmitted(false);
    setStudentId("");
    setError("");
  };

  return (
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Edit Student</h2>
      
      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {!idSubmitted ? (
        // Step 1: Enter Student ID
        <form onSubmit={handleIdSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Student ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Student ID"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600 transition"
          >
            Fetch Student Data
          </button>
        </form>
      ) : (
        // Step 2: Edit Student Data
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium mb-2">Student Information</h3>
            <p><span className="font-medium">ID:</span> {studentId}</p>
            <p><span className="font-medium">Name:</span> {studentData.name}</p>
            <p><span className="font-medium">Programme:</span> {studentData.programme}</p>
            <p><span className="font-medium">CPI:</span> {studentData.cpi || "Not Available"}</p>
          </div>
          
          {/* Password Change Section */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={handlePasswordCheckbox}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="changePassword" className="font-medium">
                Change Password
              </label>
            </div>
            
            {changePassword && (
              <div className="space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    className="border p-2 w-full rounded"
                    placeholder="New Password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className="border p-2 w-full rounded"
                    placeholder="Confirm Password"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Field Selection Section - Updated to match database schema */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Select Fields to Edit</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editName"
                  name="name"
                  checked={fieldsToEdit.name}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editName">Name</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editProgramme"
                  name="programme"
                  checked={fieldsToEdit.programme}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editProgramme">Programme</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editRollNumber"
                  name="roll_number"
                  checked={fieldsToEdit.roll_number}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editRollNumber">Roll Number</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editDepartment"
                  name="department"
                  checked={fieldsToEdit.department}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editDepartment">Department</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editSemester"
                  name="semester"
                  checked={fieldsToEdit.semester}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editSemester">Semester</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editBatch"
                  name="batch"
                  checked={fieldsToEdit.batch}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editBatch">Batch</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editCpi"
                  name="cpi"
                  checked={fieldsToEdit.cpi}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editCpi">CPI</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="editFacultyAdvisorId"
                  name="faculty_advisor_id"
                  checked={fieldsToEdit.faculty_advisor_id}
                  onChange={handleFieldSelectionChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="editFacultyAdvisorId">Faculty Advisor</label>
              </div>
            </div>
          </div>
          
          {/* Edit Fields Section - Updated to match database schema */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Edit Selected Fields</h3>
            <div className="space-y-3">
              {fieldsToEdit.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={studentData.name}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.programme && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Programme</label>
                  <input
                    type="text"
                    name="programme"
                    value={studentData.programme}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.roll_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    name="roll_number"
                    value={studentData.roll_number}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={studentData.department}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.semester && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                  <input
                    type="text"
                    name="semester"
                    value={studentData.semester}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.batch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={studentData.batch}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.cpi && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPI</label>
                  <input
                    type="text"
                    name="cpi"
                    value={studentData.cpi}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
              
              {fieldsToEdit.faculty_advisor_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faculty Advisor ID</label>
                  <input
                    type="text"
                    name="faculty_advisor_id"
                    value={studentData.faculty_advisor_id}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
            >
              Update Student
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditStudent;