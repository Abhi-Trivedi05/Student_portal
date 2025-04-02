import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        <button
          onClick={() => navigate("/admin/add-student")}
          className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-green-600"
        >
          Add Student
        </button>
        <button
          onClick={() => navigate("/admin/edit-student")}
          className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600"
        >
          Edit Student Details
        </button>
        <button
          onClick={() => navigate("/admin/remove-student")}
          className="bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600"
        >
          Remove Student
        </button>
        <button
          onClick={() => navigate("/admin/add-faculty")}
          className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-green-600"
        >
          Add Faculty
        </button>
        <button
          onClick={() => navigate("/admin/edit-faculty")}
          className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600"
        >
          Edit Faculty Details
        </button>
        <button
          onClick={() => navigate("/admin/remove-faculty")}
          className="bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600"
        >
          Remove Faculty
        </button>
        <button
          onClick={() => navigate("/admin/add-course")}
          className="bg-green-500 text-white p-4 rounded-lg shadow-md hover:bg-green-600"
        >
          Add Course
        </button>
        <button
          onClick={() => navigate("/admin/edit-course")}
          className="bg-blue-500 text-white p-4 rounded-lg shadow-md hover:bg-blue-600"
        >
          Edit Course Details
        </button>
        <button
          onClick={() => navigate("/admin/remove-course")}
          className="bg-red-500 text-white p-4 rounded-lg shadow-md hover:bg-red-600"
        >
          Remove Course
        </button>
        <button
          onClick={() => navigate("/admin/announcements")}
          className="bg-purple-500 text-white p-4 rounded-lg shadow-md hover:bg-purple-600"
        >
          Manage Announcements
        </button>
        <button
          onClick={() => navigate("/admin/approval/approve-fee-details")}
          className="bg-amber-500 text-white p-4 rounded-lg shadow-md hover:bg-amber-600"
        >
          Approve Fee Details
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;