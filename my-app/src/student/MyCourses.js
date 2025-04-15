import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student ID from localStorage (assuming it's stored during login)
  const studentId = localStorage.getItem("studentId") || "";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/courses/${studentId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load your courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchCourses();
    }
  }, [studentId]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
            </span>
          </div>
          <nav className="mt-10">
            <ul className="space-y-5">
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/dashboard")}>
                Home
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/registration")}>
                Registration
              </li>
              <li className="cursor-pointer hover:text-gray-300">Activities</li>
              <li className="cursor-pointer hover:text-gray-300 font-bold">My Courses</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/academic-calendar")}>
                Academic Calendar
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/announcements")}>
                Announcements
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-100 flex flex-col">
        <h1 className="text-3xl font-bold text-[#49196c] mb-8">My Courses</h1>
        
        {/* Status indicators */}
        {loading && <div className="text-gray-600">Loading your courses...</div>}
        {error && <div className="text-red-600 mb-4">{error}</div>}
        
        {/* Course cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{course.course_name}</h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {course.credits} Credits
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  <span className="font-medium">{course.course_code}</span> • {course.department}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Faculty:</span> {course.faculty_name || "Not assigned"}
                    </p>
                    {course.is_elective && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium mt-2 px-2.5 py-0.5 rounded">
                        Elective
                      </span>
                    )}
                  </div>
                  {course.grade && (
                    <span className={`text-xs font-medium px-3 py-1 rounded ${
                      ['A+', 'A', 'B+', 'B'].includes(course.grade) 
                        ? 'bg-green-100 text-green-800' 
                        : ['C+', 'C', 'D'].includes(course.grade)
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      Grade: {course.grade}
                    </span>
                  )}
                </div>
                
                <div className="mt-6">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    course.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : course.status === 'Registered' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {courses.length === 0 && !loading && (
            <div className="col-span-3 text-center py-10 text-gray-500">
              <p>You are not registered for any courses in the current semester.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyCourses;