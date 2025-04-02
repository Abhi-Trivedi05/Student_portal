import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RemoveCourse = () => {
  const [courseId, setCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  
  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("http://localhost:5000/api/admin/get-courses", {
          headers: { Role: "admin" }
        });
        setCourses(response.data.courses || []);
      } catch (error) {
        setMessage("Failed to fetch courses. Please try again.");
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  const handleCourseChange = (e) => {
    const id = e.target.value;
    setCourseId(id);
    setSelectedCourse(courses.find(course => course.id.toString() === id));
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    if (!courseId) {
      setMessage("Please select a course to remove.");
      return;
    }
    setShowConfirm(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-course/${courseId}`,
        { headers: { Role: "admin" } }
      );
      
      setMessage(response.data.message);
      setShowConfirm(false);
      
      // Clear the form and redirect after success
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to remove course.";
      setMessage(errorMsg);
      setShowConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Remove Course</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes("successfully") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {message}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <form onSubmit={handleDeleteClick} className="space-y-4">
          <div>
            <label htmlFor="course-select" className="block mb-2 text-sm font-medium text-gray-700">
              Select Course
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={handleCourseChange}
              className="border p-2 w-full rounded"
              required
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedCourse && (
            <div className="bg-gray-100 p-3 rounded">
              <h3 className="font-bold">{selectedCourse.course_name}</h3>
              <p>Course Code: {selectedCourse.course_code}</p>
              <p>Department: {selectedCourse.department}</p>
              <p>Credits: {selectedCourse.credits}</p>
            </div>
          )}
          
          <button
            type="submit"
            className="bg-red-500 text-white p-2 w-full rounded hover:bg-red-600 disabled:bg-red-300"
            disabled={!courseId}
          >
            Remove Course
          </button>
        </form>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to remove the course "{selectedCourse?.course_name}" ({selectedCourse?.course_code})? 
              This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {isLoading ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemoveCourse;