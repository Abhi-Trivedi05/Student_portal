import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaUser } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000';
const Step1Registration = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [studentData, setStudentData] = useState({
    name: "",
    student_id: "",
    programme: "",
    department: "",
    current_semester: "",
    cpi: "",
    batch: "",  // This represents both batch and academic_year_id
    faculty_advisor_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Only editable fields - Note: Based on the backend, these would typically be updated in student_details
  const [editableFields, setEditableFields] = useState({
    phone: "",
    email: "",
    emergency_contact: "",
    address: ""
  });

  // Get authentication info
  const getAuthHeaders = () => {
    const studentId = localStorage.getItem("studentId") || localStorage.getItem("userId");
    return {
      'Role': 'student',
      'StudentId': studentId,
      'Authorization': `Bearer ${localStorage.getItem("token")}`
    };
  };
  
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Get student ID from localStorage based on login data
        const studentId = localStorage.getItem("studentId") || localStorage.getItem("userId");
        
        if (!studentId) {
          setError("No student ID found. Please login again.");
          setLoading(false);
          return;
        }
        
        // Set headers with authentication information
        const headers = getAuthHeaders();
        
        // Fetch student profile and details in parallel
        const [profileResponse, detailsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/student/${studentId}`, { headers }),
          axios.get(`${API_BASE_URL}/api/student/details/${studentId}`, { headers }).catch(err => {
            console.error("Error fetching student details:", err);
            return { data: null };
          })
        ]);
        
        if (profileResponse.data) {
          // Make sure batch is treated as academic_year_id too
          const profile = profileResponse.data;
          
          // Store the batch as academic_year_id in sessionStorage for later use
          if (profile.batch) {
            sessionStorage.setItem("academic_year_id", profile.batch);
          }
          
          setStudentData(profile);
        }

        if (detailsResponse.data) {
          setEditableFields(detailsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, []);

  const handleContinue = () => {
    // Store current student data in localStorage
    localStorage.setItem("studentProfile", JSON.stringify(studentData));
    
    // Explicitly store academic_year_id (same as batch) for course registration
    localStorage.setItem("academic_year_id", studentData.batch);
    
    navigate("/student/step-2");
  };

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

  const updateProfile = async () => {
    try {
      const studentId = localStorage.getItem("studentId") || localStorage.getItem("userId");
      
      if (!studentId) {
        alert("No student ID found. Please login again.");
        navigate("/login");
        return;
      }
      
      const headers = getAuthHeaders();
      
      await axios.put(
        `${API_BASE_URL}/api/student/update-profile`, 
        editableFields, 
        { headers }
      );
      
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-xl text-[#49196c]">Loading student information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <div className="mt-4">
            <button 
              onClick={() => navigate("/login")} 
              className="bg-[#49196c] text-white px-4 py-2 rounded"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  let name = studentData.name ? studentData.name.toUpperCase() : "";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen relative">
        {/* Logo and College Name - Top Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <img src="/logo.jpg" alt="IIITV-ICD Logo" className="h-20 w-20" />
            <span className="text-sm font-bold text-right">
              Indian Institute of Information Technology Vadodara International Campus Diu
            </span>
          </div>
          
          <nav className="mt-10">
            <ul className="space-y-5">
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/dashboard")}> Home</li>
              <li className="cursor-pointer hover:text-gray-300 font-bold" onClick={() => navigate("/student/step-1-registration")}>Registration</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/mycourses")}>My Courses</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/academic-calendar")}>Academic Calendar</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/announcements")}>Announcements</li>
            </ul>
          </nav>
        </div>
        
        {/* Profile Section - Bottom */}
        <div className="mt-auto relative">
          <div 
            className="flex items-center cursor-pointer p-2 hover:bg-[#5d2a87] rounded-lg transition"
            onClick={() => setShowLogout(!showLogout)}
          >
            <div className="bg-gray-200 h-10 w-10 rounded-full flex items-center justify-center mr-3">
              <FaUser className="text-[#49196c]" />
            </div>
            <span className="text-sm font-medium">{studentData.name || "Student"}</span>
          </div>
          
          {showLogout && (
            <div className="absolute bottom-16 left-0 w-full bg-[#3b1456] rounded-lg shadow-lg p-2 border border-gray-700">
              <button 
                className="w-full text-left py-2 px-3 hover:bg-[#5d2a87] rounded transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-10 bg-gray-100 flex flex-col items-center justify-center">
        {/* Welcome Message */}
        <h1 className="text-4xl font-bold text-[#49196c] mb-6 self-start">WELCOME BACK, {name}!!!</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-10 w-3/4 border-2 border-purple-600">
          <p className="text-lg font-semibold text-gray-700 text-center mb-6">VERIFY YOUR DETAILS</p>
          
          {/* Student Details Box - Non-editable fields */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md grid grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Student ID</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.student_id}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Name</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.name}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Programme</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.programme}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Department</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.department}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">CPI</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.cpi}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Current Semester</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.current_semester}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Batch / Academic Year</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.batch}
              </div>
            </div>
            
            <div className="flex flex-col">
              <label className="text-gray-800 font-semibold">Faculty Advisor ID</label>
              <div className="border border-gray-300 rounded-lg p-2 bg-white">
                {studentData.faculty_advisor_id}
              </div>
            </div>
          </div>
          
          {/* Editable personal details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md mt-4">
            <h3 className="text-lg font-semibold text-[#49196c] mb-4">Personal Information (Editable)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-gray-800 font-semibold">Phone</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
                  <input 
                    type="text" 
                    value={editableFields.phone || ''} 
                    onChange={(e) => setEditableFields({...editableFields, phone: e.target.value})} 
                    className="w-full bg-transparent outline-none"
                  />
                  <FaEdit className="text-[#49196c] cursor-pointer ml-2" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-gray-800 font-semibold">Email</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
                  <input 
                    type="email" 
                    value={editableFields.email || ''} 
                    onChange={(e) => setEditableFields({...editableFields, email: e.target.value})} 
                    className="w-full bg-transparent outline-none"
                  />
                  <FaEdit className="text-[#49196c] cursor-pointer ml-2" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-gray-800 font-semibold">Emergency Contact</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
                  <input 
                    type="text" 
                    value={editableFields.emergency_contact || ''} 
                    onChange={(e) => setEditableFields({...editableFields, emergency_contact: e.target.value})} 
                    className="w-full bg-transparent outline-none"
                  />
                  <FaEdit className="text-[#49196c] cursor-pointer ml-2" />
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-gray-800 font-semibold">Address</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
                  <input 
                    type="text" 
                    value={editableFields.address || ''} 
                    onChange={(e) => setEditableFields({...editableFields, address: e.target.value})} 
                    className="w-full bg-transparent outline-none"
                  />
                  <FaEdit className="text-[#49196c] cursor-pointer ml-2" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                onClick={updateProfile}
              >
                Update Personal Info
              </button>
            </div>
          </div>
          
          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-[#49196c] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3b1456] transition"
              onClick={handleContinue}
            >
              CONTINUE TO COURSE REGISTRATION
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Step1Registration;