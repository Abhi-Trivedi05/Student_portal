import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentHomePage = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student ID from local storage or context
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile data
        const studentResponse = await axios.get(`/api/student/${studentId}`);
        setStudentData(studentResponse.data);
        
        // Fetch student's courses
        const coursesResponse = await axios.get(`/api/student/courses/${studentId}`);
        setCourses(coursesResponse.data.courses || []);  // Set empty array as fallback
        
        // Fetch announcements
        const announcementsResponse = await axios.get('/api/announcements');
        setAnnouncements(announcementsResponse.data.announcements || []);  // Set empty array as fallback
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [studentId, navigate]);

  const sections = [
    {
      title: "Registration",
      description: "View available courses and register for your desired courses effortlessly.",
      image: "/images/registration.jpg",
      id: "registration",
      path: "/student/step-1-registration",
    },
    {
      title: "My Courses",
      description: "View and manage the courses you are currently enrolled in.",
      image: "/images/courses.jpg",
      id: "my-courses",
      path: "/student/mycourses",
    },
    {
      title: "Academic Calendar",
      description: "Keep track of important academic dates and events.",
      image: "/images/calendar.jpg",
      id: "academic-calendar",
      path: "/student/academic-calendar",
    },
    {
      title: "Fee Payment",
      description: "Pay your fees online securely and conveniently.",
      image: "/images/payment.jpg",
      id: "fee-payment",
      href: "https://payments.billdesk.com/bdcollect/pay?p1=6037&p2=15",
    },
    {
      title: "Announcements",
      description: "Stay updated with the latest announcements and news.",
      image: "/images/announcements.jpg",
      id: "announcements",
      path: "/student/announcements",
    },
  ];

  // Function to handle scrolling to element
  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center w-full">
        <div className="text-lg font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center w-full">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Navbar */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <div className="flex items-center justify-between py-4 px-6 w-full">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-10" />
            <span className="text-lg font-bold text-gray-700">IIITV-ICD</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            {sections.map((section, index) => (
              <button
                key={index}
                className="text-gray-700 hover:text-[#49196c] focus:outline-none"
                onClick={() => {
                  if (section.path) {
                    navigate(section.path);
                  } else if (section.href) {
                    window.open(section.href, '_blank');
                  } else {
                    scrollToElement(section.id);
                  }
                }}
              >
                {section.title}
              </button>
            ))}
          </nav>

          {/* Profile Info */}
          <div className="flex items-center space-x-3">
            {studentData && (
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {studentData.name}
              </span>
            )}
            <button onClick={() => navigate('/student-profile')} className="focus:outline-none">
              <img src="/images/profile-icon.png" alt="Profile" className="h-8 w-8 rounded-full border border-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Banner with Student Info */}
      <div className="bg-[#49196c] text-white pt-24 pb-8 px-6 w-full">
        <div className="w-full mx-auto px-4">
          {studentData && (
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-2">Welcome, {studentData.name}</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">Roll Number:</span> {studentData.student_id}</p>
                  <p><span className="font-semibold">Programme:</span> {studentData.programme}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Department:</span> {studentData.department}</p>
                  <p><span className="font-semibold">Semester:</span> {studentData.current_semester}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Batch:</span> {studentData.batch}</p>
                  <p><span className="font-semibold">CPI:</span> {studentData.cpi || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full mx-auto py-8 px-4">
        {/* Latest Announcements Section */}
        <section className="mb-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Latest Announcements</h2>
            <button 
              onClick={() => navigate('/announcements')}
              className="text-sm text-[#49196c] hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 w-full">
            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-[#49196c] pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.publication_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{announcement.description}</p>
                    {announcement.form_link && (
                      <a 
                        href={announcement.form_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#49196c] hover:underline mt-2 inline-block"
                      >
                        View Form
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No announcements available</p>
            )}
          </div>
        </section>

        {/* Current Courses Section */}
        <section className="mb-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Current Courses</h2>
            <button 
              onClick={() => navigate('/student-courses')}
              className="text-sm text-[#49196c] hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 w-full">
            {courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-800">{course.course_name}</h3>
                    <p className="text-sm text-gray-500">{course.course_code}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs bg-[#efeaf2] text-[#49196c] py-1 px-2 rounded">
                        {course.credits} Credits
                      </span>
                      <button 
                        onClick={() => navigate(`/course-details/${course.id}`)}
                        className="text-xs text-[#49196c] hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No courses registered</p>
            )}
          </div>
        </section>

        {/* Main Navigation Sections */}
        {sections.map((section, index) => (
          <div
            key={index}
            id={section.id}
            className={`flex flex-col md:flex-row items-center bg-white shadow-lg rounded-lg p-6 mb-6 w-full ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Section Image */}
            <div className="w-full md:w-1/3 mb-4 md:mb-0">
              <img src={section.image} alt={section.title} className="w-full h-48 rounded-lg object-cover" />
            </div>

            {/* Section Content */}
            <div className="w-full md:w-2/3 md:px-6">
              <h2 className="text-xl font-bold text-gray-800">{section.title}</h2>
              <p className="text-gray-600 mt-2">{section.description}</p>
              <button
                className="mt-4 bg-[#49196c] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#3b1456] transition"
                onClick={() => {
                  if (section.path) {
                    navigate(section.path);
                  } else if (section.href) {
                    window.open(section.href, '_blank');
                  }
                }}
              >
                Go to {section.title}
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-[#49196c] text-white py-6 px-4 w-full">
        <div className="w-full mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <img src="/images/logo.png" alt="Logo" className="h-10 w-10" />
                <span className="text-lg font-bold">IIITV-ICD</span>
              </div>
              <p className="text-sm mt-2">Indian Institute of Information Technology Vadodara - International Campus Diu</p>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>© 2025 IIITV-ICD. All rights reserved.</p>
              <p className="mt-1">Education Department, UT of Daman & Diu</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentHomePage;