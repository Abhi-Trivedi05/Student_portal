import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Step2CourseSelection = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState({
    message: "",
    success: null
  });

  // Get student ID from localStorage (assuming it's stored during login)
  const studentId = localStorage.getItem("studentId") || "";

  // Fetch available courses when component mounts
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/student/registration/available-courses', {
          headers: {
            'Role': 'student',
            'StudentId': studentId
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch available courses');
        }

        const data = await response.json();
        
        // Log the response data to check what's coming back
        console.log("Available courses data:", data);
        
        if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
          console.error("Courses data is not in expected format:", data);
        }
        
        // Check localStorage for previously selected courses
        const savedCourses = localStorage.getItem("selectedCourses");
        if (savedCourses) {
          try {
            const parsedCourses = JSON.parse(savedCourses);
            // Only use IDs from the selected courses
            setSelectedCourses(parsedCourses.map(course => course.offering_id || course.id));
          } catch (e) {
            console.error("Error parsing saved courses:", e);
          }
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load available courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCourses();
  }, [studentId]);

  // Handle course selection
  const handleCourseSelection = (offeringId, alreadyRegistered) => {
    // Prevent selection of already registered courses
    if (alreadyRegistered) return;
    
    setSelectedCourses((prev) =>
      prev.includes(offeringId)
        ? prev.filter((id) => id !== offeringId)
        : [...prev, offeringId]
    );
  };

  // Register selected courses
  const handleRegistration = async () => {
    if (selectedCourses.length === 0) {
      setRegistrationStatus({
        message: "Please select at least one course.",
        success: false
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get the full course objects for the selected IDs
      const selectedCourseObjects = courses
        .filter(course => selectedCourses.includes(course.offering_id))
        .map(course => ({
          id: course.offering_id,
          course_id: course.id,
          course_name: course.course_name,
          course_code: course.course_code,
          credits: course.credits,
          faculty_name: course.faculty_name,
          status: "Pending" // Set status as Pending initially
        }));
      
      // Save complete course objects to localStorage
      localStorage.setItem("selectedCourses", JSON.stringify(selectedCourseObjects));
      
      // Insert selected courses into course_selections with status 'Pending'
      const promises = selectedCourseObjects.map(course => 
        fetch('http://localhost:5000/api/student/select-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Role': 'student',
            'StudentId': studentId
          },
          body: JSON.stringify({
            offeringId: course.id,
            courseId: course.course_id
          })
        })
      );
      
      // Wait for all course selections to be processed
      await Promise.all(promises);
      
      // Update the message to clarify that courses are only selected, not registered
      setRegistrationStatus({
        message: "Courses selected for registration review. Final registration requires approval.",
        success: true
      });
      
      // Navigate to the registration confirmation page
      setTimeout(() => {
        navigate("/student/finalize_registration");
      }, 1000);
      
    } catch (err) {
      console.error("Error processing course selection:", err);
      setRegistrationStatus({
        message: "Error processing your course selection. Please try again.",
        success: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.jpg" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#49196c]">SELECT YOUR COURSES</h1>
        
        {/* Status message */}
        {registrationStatus.message && (
          <div className={`mt-4 p-3 rounded-lg w-3/4 ${
            registrationStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {registrationStatus.message}
          </div>
        )}

        {/* Loading and error states */}
        {loading && <div className="mt-8 text-gray-600">Loading courses...</div>}
        {error && <div className="mt-8 text-red-600">{error}</div>}
        
        {/* Course selection */}
        <div className="mt-6 w-3/4">
          {!loading && courses && courses.length > 0 ? (
            courses.map((course) => (
              <div 
                key={course.offering_id} 
                className={`bg-white shadow-lg rounded-lg p-4 border-2 flex items-center mb-4 ${
                  course.already_registered ? 'border-green-500' : 
                  selectedCourses.includes(course.offering_id) ? 'border-blue-500' : ''
                }`}
              >
                {/* Only show checkbox if the course is not already registered */}
                {!course.already_registered && (
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.offering_id)}
                    onChange={() => handleCourseSelection(course.offering_id, course.already_registered)}
                    className="w-6 h-6 mr-4"
                    disabled={course.available_seats <= 0}
                  />
                )}

                {/* Course Details */}
                <div className="flex-1 flex items-center">
                  <p className="font-bold text-gray-800 w-24">{course.course_code}</p>
                  <p className="text-gray-700 flex-1">{course.course_name}</p>
                  <p className="text-gray-600 mr-4">{course.credits} Credits</p>
                  
                  {/* Status indicator */}
                  {course.already_registered ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                      Already Registered
                    </div>
                  ) : (
                    <p className={`text-sm w-24 text-right ${
                      course.available_seats > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {course.available_seats} / {course.max_seats} seats
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="text-center p-8 text-gray-600">
              No courses are currently available for registration.
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-[#49196c] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3b1456] transition disabled:bg-gray-400"
            onClick={handleRegistration}
            disabled={loading || selectedCourses.length === 0}
          >
            {loading ? "Processing..." : "Next"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Step2CourseSelection;