import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditCourse = () => {
  const [courseId, setCourseId] = useState("");
  const [courseData, setCourseData] = useState({
    course_code: "",
    course_name: "",
    credits: "",
    department: "",
    faculty_id: "",
    semester: "",
    batch: ""
  });
  
  const [facultyList, setFacultyList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [found, setFound] = useState(false);
  const navigate = useNavigate();
  
  // Fetch faculty list for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
          headers: { Role: "admin" }
        });
        
        if (response.data && response.data.faculty) {
          setFacultyList(response.data.faculty);
        }
      } catch (error) {
        console.error("Error fetching faculty list:", error);
        setMessage("Failed to fetch faculty list. " + (error.response?.data?.message || error.message));
        setMessageType("error");
      }
    };
    
    fetchFaculties();
  }, []);
  
  // Fetch course list for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-courses", {
          headers: { Role: "admin" }
        });
        
        if (response.data && response.data.courses) {
          setCourseList(response.data.courses);
        }
      } catch (error) {
        console.error("Error fetching course list:", error);
        setMessage("Failed to fetch course list. " + (error.response?.data?.message || error.message));
        setMessageType("error");
      }
    };
    
    fetchCourses();
  }, []);
  
  const handleCourseSelect = async (e) => {
    const selectedId = e.target.value;
    setCourseId(selectedId);
    
    if (!selectedId) {
      setCourseData({
        course_code: "",
        course_name: "",
        credits: "",
        department: "",
        faculty_id: "",
        semester: "",
        batch: ""
      });
      setFound(false);
      return;
    }
    
    setFetchLoading(true);
    setMessage("");
    
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/course/${selectedId}`, {
        headers: { Role: "admin" }
      });
      
      if (response.data) {
        // Map the response data to our form structure
        setCourseData({
          course_code: response.data.course_code || "",
          course_name: response.data.course_name || "",
          credits: response.data.credits || "",
          department: response.data.department || "",
          faculty_id: response.data.faculty_id || "",
          semester: response.data.semester || "",
          batch: response.data.batch || ""
        });
        setFound(true);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      if (error.response?.status === 404) {
        setMessage("Course not found with ID: " + selectedId);
      } else {
        setMessage("Error: " + (error.response?.data?.message || error.message));
      }
      setMessageType("error");
      setFound(false);
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    // Form validation
    if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
      setMessage("Please fill all required fields");
      setMessageType("error");
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/edit-course/${courseId}`, 
        courseData,
        { headers: { Role: "admin" } }
      );
      
      setMessage(response.data.message || "Course updated successfully");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating course:", error);
      setMessage("Failed to update course: " + (error.response?.data?.message || error.message));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      
      {message && (
        <div className={`mb-4 p-2 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}
      
      {/* Course Selection Dropdown */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Course to Edit</label>
          <select 
            value={courseId} 
            onChange={handleCourseSelect} 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          >
            <option value="">-- Select a Course --</option>
            {courseList.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </option>
            ))}
          </select>
        </div>
        {fetchLoading && <p className="mt-2 text-sm text-blue-600">Loading course data...</p>}
      </div>
      
      {/* Course Edit Form - Only shown after a course is selected */}
      {found && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Code</label>
            <input 
              type="text" 
              name="course_code" 
              value={courseData.course_code} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Name</label>
            <input 
              type="text" 
              name="course_name" 
              value={courseData.course_name} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Credits</label>
            <input 
              type="number" 
              name="credits" 
              value={courseData.credits} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input 
              type="text" 
              name="department" 
              value={courseData.department} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Faculty</label>
            <select 
              name="faculty_id" 
              value={courseData.faculty_id} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="">Select Faculty</option>
              {facultyList.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Semester</label>
            <input 
              type="number" 
              name="semester" 
              value={courseData.semester} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Batch</label>
            <input 
              type="text" 
              name="batch" 
              value={courseData.batch} 
              onChange={handleChange} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
          </div>
          
          <div className="flex space-x-4">
            <button 
              type="submit" 
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Course"}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditCourse;