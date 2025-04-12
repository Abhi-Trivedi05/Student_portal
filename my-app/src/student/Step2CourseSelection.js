import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Step2CourseSelection = () => {
  const navigate = useNavigate();

  // Courses List
  const courses = [
    { code: "CS101", name: "Data Structures & Algorithms", credits: 4 },
    { code: "CS202", name: "Operating Systems", credits: 3 },
    { code: "CS303", name: "Database Management Systems", credits: 4 },
    { code: "CS404", name: "Computer Networks", credits: 3 },
    { code: "AI505", name: "Machine Learning", credits: 4 },
    { code: "WD606", name: "Web Development", credits: 3 },
  ];

  const [selectedCourses, setSelectedCourses] = useState([]);

  // Handle course selection
  const handleCourseSelection = (courseCode) => {
    setSelectedCourses((prev) =>
      prev.includes(courseCode)
        ? prev.filter((code) => code !== courseCode)
        : [...prev, courseCode]
    );
  };

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
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-homepage")}>
                Home
              </li>
              <li className="cursor-pointer hover:text-gray-300 font-bold">Registration</li>
              <li className="cursor-pointer hover:text-gray-300">Activities</li>
              <li className="cursor-pointer hover:text-gray-300">My Courses</li>
              <li className="cursor-pointer hover:text-gray-300">Academic Calendar</li>
              <li className="cursor-pointer hover:text-gray-300">Announcements</li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-100 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#49196c]">SELECT YOUR COURSES</h1>

        <div className="mt-6 w-3/4">
          {courses.map((course) => (
            <div key={course.code} className="bg-white shadow-lg rounded-lg p-4 border-2 flex items-center mb-4">
              {/* Checkbox on Left */}
              <input
                type="checkbox"
                checked={selectedCourses.includes(course.code)}
                onChange={() => handleCourseSelection(course.code)}
                className="w-6 h-6 mr-4"
              />

              {/* Course Details */}
              <div className="flex-1 flex items-center">
                <p className="font-bold text-gray-800 w-24">{course.code}</p>
                <p className="text-gray-700 flex-1">{course.name}</p>
                <p className="text-gray-600 w-16 text-right">{course.credits} Credits</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            className="bg-[#49196c] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3b1456] transition"
            onClick={() => console.log("Selected Courses: ", selectedCourses)}
          >
            SUBMIT
          </button>
        </div>
      </main>
    </div>
  );
};

export default Step2CourseSelection;
