import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css"; // Import the CSS file

const Login = () => {
  const [role, setRole] = useState("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        role,
        id,
        password,
      });

      if (response.data.success) {
        // Store JWT token
        localStorage.setItem("token", response.data.token);
        
        // Store user role
        localStorage.setItem("role", response.data.role);
        
        // Store user ID with role prefix
        const roleKey = `${response.data.role}Id`;
        localStorage.setItem(roleKey, response.data.user.id);
        localStorage.setItem("userName", response.data.user.name || "");
        
        // Store the entire user object as JSON for easy access
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Redirect user based on role
        if (response.data.role === "admin") {
          navigate("/admin/dashboard");
        } else if (response.data.role === "faculty") {
          navigate("/faculty/Dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const getLabelText = () => {
    switch(role) {
      case "student":
        return "Student ID:";
      case "faculty":
        return "Faculty ID:";
      case "admin":
        return "Admin Username:";
      default:
        return "ID:";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="login-container">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        {error && <p className="error-message text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="block text-gray-700">Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-gray-700">{getLabelText()}</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder={role === "admin" ? "Enter username" : "Enter ID"}
              required
            />
          </div>

          <div className="form-group">
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;