import React, { useState, useEffect } from "react";
import axios from "axios";

const AddCourse = () => {
  const [courseData, setCourseData] = useState({
    course_code: "",
    course_name: "",
    credits: "",
    department: "",
    faculty_id: "",
    semester: "",
    batch: "",
  });
  const [facultyList, setFacultyList] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error"); // "error" or "success"
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFaculties = async () => {
      const role = localStorage.getItem("role");

      if (!role || role !== "admin") {
        setMessage("Access denied. Admin role required.");
        setMessageType("error");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-faculty", {
          headers: {
            'Role': role
          }
        });
        setFacultyList(response.data.faculty);
      } catch (error) {
        console.error("Failed to fetch faculty list", error);
        setMessage(error.response?.data?.message || "Failed to fetch faculty list. Please try again.");
        setMessageType("error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const validateForm = () => {
    // Check required fields based on backend validation
    if (!courseData.course_code || !courseData.course_name || !courseData.credits || !courseData.department) {
      setMessage("Please provide all required fields: course code, name, credits, and department.");
      setMessageType("error");
      return false;
    }
    
    // If faculty is selected, ensure semester and batch are provided
    if (courseData.faculty_id && (!courseData.semester || !courseData.batch)) {
      setMessage("When assigning a faculty, please provide both semester and batch information.");
      setMessageType("error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Admin role check
    const role = localStorage.getItem("role");
    if (!role || role !== "admin") {
      setMessage("Access denied. Admin role required.");
      setMessageType("error");
      return;
    }

    // Convert credits to a number if it's a string
    const formattedData = {
      ...courseData,
      credits: Number(courseData.credits)
    };
    
    // If faculty_id is empty string, set it to null
    if (formattedData.faculty_id === "") {
      formattedData.faculty_id = null;
    } else {
      // Make sure faculty_id is a number
      formattedData.faculty_id = Number(formattedData.faculty_id);
    }
    
    // Same for semester
    if (formattedData.semester === "") {
      formattedData.semester = null;
    } else {
      formattedData.semester = Number(formattedData.semester);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/add-course", 
        formattedData,
        {
          headers: {
            'Role': role,
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage(response.data.message);
      setMessageType("success");
      
      // Clear form on success
      setCourseData({
        course_code: "",
        course_name: "",
        credits: "",
        department: "",
        faculty_id: "",
        semester: "",
        batch: "",
      });
    } catch (error) {
      console.error("Error adding course:", error);
      setMessage(
        error.response?.data?.message || 
        "Failed to add course. Server returned: " + error.message
      );
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Course</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="course_code" className="block text-sm font-medium text-gray-700">Course Code*</label>
          <input
            id="course_code"
            type="text"
            name="course_code"
            placeholder="e.g., CS101"
            value={courseData.course_code}
            onChange={handleChange}
            required
            className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="course_name" className="block text-sm font-medium text-gray-700">Course Name*</label>
          <input
            id="course_name"
            type="text"
            name="course_name"
            placeholder="e.g., Introduction to Computer Science"
            value={courseData.course_name}
            onChange={handleChange}
            required
            className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="credits" className="block text-sm font-medium text-gray-700">Credits*</label>
          <input
            id="credits"
            type="number"
            name="credits"
            placeholder="e.g., 3"
            value={courseData.credits}
            onChange={handleChange}
            required
            min="1"
            max="10"
            className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department*</label>
          <input
            id="department"
            type="text"
            name="department"
            placeholder="e.g., Computer Science"
            value={courseData.department}
            onChange={handleChange}
            required
            className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Faculty Assignment (Optional)</h3>
          <p className="text-sm text-gray-500 mb-4">If you assign a faculty to this course, you must provide both semester and batch information.</p>
          
          <div>
            <label htmlFor="faculty_id" className="block text-sm font-medium text-gray-700">Faculty</label>
            <select
              id="faculty_id"
              name="faculty_id"
              value={courseData.faculty_id}
              onChange={handleChange}
              className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Select Faculty (Optional)</option>
              {isLoading ? (
                <option disabled>Loading faculty list...</option>
              ) : (
                facultyList.map((faculty) => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} - {faculty.department}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={courseData.faculty_id ? "" : "opacity-50"}>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mt-4">Semester</label>
            <input
              id="semester"
              type="number"
              name="semester"
              placeholder="e.g., 1"
              value={courseData.semester}
              onChange={handleChange}
              disabled={!courseData.faculty_id}
              required={!!courseData.faculty_id}
              min="1"
              max="12"
              className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className={courseData.faculty_id ? "" : "opacity-50"}>
            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mt-4">Batch</label>
            <input
              id="batch"
              type="text"
              name="batch"
              placeholder="e.g., 2023-2027"
              value={courseData.batch}
              onChange={handleChange}
              disabled={!courseData.faculty_id}
              required={!!courseData.faculty_id}
              className="mt-1 border p-2 w-full rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`mt-6 p-3 w-full rounded transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
            isLoading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {isLoading ? "Adding Course..." : "Add Course"}
        </button>
      </form>
    </div>
  );
};

export default AddCourse;