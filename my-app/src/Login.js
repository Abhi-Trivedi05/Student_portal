import React, { useState, useEffect } from "react";
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

  // Add slideshow effect from the second code
  useEffect(() => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    const showSlide = (index) => {
      slides.forEach((slide) => slide.classList.remove('active'));
      slides[index].classList.add('active');
    };

    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    };

    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  // Keep original handleLogin function from first code
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
        
        // Store user ID consistently as userId
        localStorage.setItem("userId", response.data.user.id);
        
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
        return "Student ID";
      case "faculty":
        return "Faculty ID";
      case "admin":
        return "Admin Username";
      default:
        return "ID";
    }
  };

  // Use UI structure from second code
  return (
    <div className="login-container">
      <div className="background-slideshow">
        <div className="slide" style={{ backgroundImage: "url('/11.jpg')" }}></div>
        <div className="slide" style={{ backgroundImage: "url('/12.jpg')" }}></div>
        <div className="slide" style={{ backgroundImage: "url('/13.jpg')" }}></div>
      </div>
      
      <div className="login-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to Student Portal</h1>
          <p className="welcome-subtitle">Access your academic information and resources in one place</p>
        </div>

        <div className="login-section ">
          <div className="login-header">
            <h2 className="login-title">Sign In</h2>
            <p className="login-subtitle">Please login to your account</p>
          </div>

          {error && (
            <div className="error-message" style={{ 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: 'rgba(220, 38, 38, 0.1)', 
              color: '#dc2626',
              borderRadius: '8px',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{getLabelText()}</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="form-input"
                placeholder={`Enter your ${getLabelText().toLowerCase()}`}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;