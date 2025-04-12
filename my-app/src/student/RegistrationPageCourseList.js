import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegistrationPageCourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({ isRegistering: false, message: "", success: false });

  // Get student ID from local storage or context
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile data
        const studentResponse = await axios.get(`/api/student/${studentId}`);
        setStudentData(studentResponse.data);
        
        // Fetch available courses with student headers
        const coursesResponse = await axios.get('/api/student/registration/available-courses', {
          headers: {
            'Role': 'student',
            'StudentId': studentId
          }
        });
        
        setCourses(coursesResponse.data.courses || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load course data. Please try again.");
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [studentId, navigate]);

  const handleRegisterCourse = async (offeringId) => {
    try {
      setRegistrationStatus({ isRegistering: true, message: "Registering for course...", success: false });
      
      const response = await axios.post('/api/student/register-course', 
        { offeringId }, 
        {
          headers: {
            'Role': 'student',
            'StudentId': studentId
          }
        }
      );
      
      setRegistrationStatus({ 
        isRegistering: false, 
        message: response.data.message, 
        success: true 
      });
      
      // Refresh course list after successful registration
      const coursesResponse = await axios.get('/api/student/registration/available-courses', {
        headers: {
          'Role': 'student',
          'StudentId': studentId
        }
      });
      
      setCourses(coursesResponse.data.courses || []);
    } catch (err) {
      console.error("Error registering for course:", err);
      setRegistrationStatus({
        isRegistering: false,
        message: err.response?.data?.message || "Failed to register for course. Please try again.",
        success: false
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading available courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        {/* Institute Logo & Name */}
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10">
            <ul className="space-y-5">
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-homepage")}>
                Home
              </li>
              <li className="cursor-pointer font-bold">Registration</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-activities")}>
                Activities
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-courses")}>
                My Courses
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/academic-calendar")}>
                Academic Calendar
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/announcements")}>
                Announcements
              </li>
            </ul>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-3 border-t border-gray-500 pt-4">
          <img src="/profile-icon.png" alt="Profile" className="h-10 w-10 rounded-full border border-gray-300" />
          <span className="text-sm font-medium">{studentData?.name || "Student"}</span>
        </div>
      </aside>

      {/* Course List */}
      <main className="flex-1 p-8 bg-gray-100 w-full">
        <h1 className="text-2xl font-bold mb-6">Available Courses for Registration</h1>
        
        {/* Registration Status Message */}
        {registrationStatus.message && (
          <div className={`mb-6 p-4 rounded-lg ${registrationStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {registrationStatus.message}
          </div>
        )}
        
        {courses.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <p className="text-lg text-gray-600">No courses available for registration at this time.</p>
            <p className="mt-2 text-gray-500">Check back later or contact your academic advisor for assistance.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {courses.map((course) => (
              <div key={course.id} className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-lg font-bold">{course.course_name}</h2>
                <p className="text-gray-600">Faculty: {course.faculty_name}</p>
                <p className="text-gray-600">Code: {course.course_code}</p>
                <p className="text-gray-600">Department: {course.department}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs bg-[#efeaf2] text-[#49196c] py-1 px-2 rounded">
                    {course.credits} Credits
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 py-1 px-2 rounded">
                    {course.available_seats} Seats Available
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    Registration Deadline: {new Date(course.registration_deadline).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="mt-4 w-full bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
                  onClick={() => handleRegisterCourse(course.offering_id)}
                  disabled={registrationStatus.isRegistering}
                >
                  {registrationStatus.isRegistering ? "Registering..." : "Register for Course"}
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Finalize Registration Button */}
        {courses.length > 0 && (
          <button
            className="fixed bottom-8 right-8 bg-[#49196c] text-white py-3 px-6 rounded-lg text-lg font-semibold shadow-lg hover:bg-[#3b1456] transition"
            onClick={() => navigate("/finalize-registration")}
          >
            Finalize Registration
          </button>
        )}
      </main>
    </div>
  );
};

export default RegistrationPageCourseList;