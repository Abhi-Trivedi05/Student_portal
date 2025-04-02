import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RemoveStudent = () => {
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Fetch student list on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/get-students", {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        });
        
        if (response.data.students) {
          setStudentList(response.data.students);
        } else {
          setError("Failed to fetch student list.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching student list.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleSelectChange = (e) => {
    setSelectedStudentId(e.target.value);
  };

  const handleRemove = async (e) => {
    e.preventDefault();
    
    if (!selectedStudentId) {
      setError("Please select a student to remove.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(
        `http://localhost:5000/api/admin/remove-student/${selectedStudentId}`,
        {
          headers: {
            Role: "admin" // Required by the verifyAdmin middleware
          }
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setError("");
        
        // Remove the student from the list immediately
        setStudentList(studentList.filter(student => student.student_id !== selectedStudentId));
        
        // Reset selection
        setSelectedStudentId("");
        
        // Navigate after a delay
        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove student.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Remove Student</h2>
      
      {loading && <p className="text-gray-600">Loading...</p>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {!loading && studentList.length === 0 && !error && (
        <p className="text-gray-600">No students found.</p>
      )}

      {studentList.length > 0 && (
        <form onSubmit={handleRemove} className="space-y-4">
          <div>
            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Student
            </label>
            <select
              id="student-select"
              value={selectedStudentId}
              onChange={handleSelectChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">-- Select Student --</option>
              {studentList.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.name} - {student.programme} ({student.student_id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStudentId || loading}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${
                (!selectedStudentId || loading) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Remove Student"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RemoveStudent;