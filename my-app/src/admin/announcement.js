import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

const Announcements = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    form_link: "",
    importance: "Normal",
    visibility: "All",
    expiry_date: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterImportance, setFilterImportance] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const navigate = useNavigate();

  // Fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Function to fetch announcements from the backend
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError("Failed to load announcements");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage/sessionStorage data
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentProfile");
    localStorage.removeItem("academic_year_id");
    sessionStorage.removeItem("academic_year_id");
    
    // Navigate to login page
    navigate("/");
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get admin ID from localStorage
      const adminId = localStorage.getItem("userId") || localStorage.getItem("adminId");
      
      if (!adminId) {
        setError("Admin ID not found. Please log in again.");
        return;
      }
      
      // Include the admin_id in the request
      await axios.post('/api/announcements', {
        ...formData,
        admin_id: adminId
      });
      
      // Clear form
      setFormData({
        title: "",
        description: "",
        form_link: "",
        importance: "Normal",
        visibility: "All",
        expiry_date: ""
      });
      // Refresh announcements
      fetchAnnouncements();
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError("Failed to create announcement");
    }
  };

  // Handle delete announcement
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/announcements/${id}`);
      // Refresh announcements
      fetchAnnouncements();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      setError("Failed to delete announcement");
    }
  };

  const navItems = [
    {
      title: "Manage Students",
      submenu: [
        { label: "Add Student", path: "/admin/add-student" },
        { label: "Edit Student Details", path: "/admin/edit-student" },
        { label: "Remove Student", path: "/admin/remove-student" },
      ],
    },
    {
      title: "Manage Faculty",
      submenu: [
        { label: "Add Faculty", path: "/admin/add-faculty" },
        { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Manage Courses",
      submenu: [
        { label: "Add Course", path: "/admin/add-course" },
        { label: "Edit Course Details", path: "/admin/edit-course" },
        { label: "Remove Course", path: "/admin/remove-course" },
      ],
    },
    {
      title: "Announcements",
      submenu: [{ label: "Make Announcement", path: "/admin/announcements" }],
    },
    {
      title: "Fee Approvals",
      submenu: [{ label: "Approve Fee", path: "/admin/approval/approve-fee-details" }],
    },
    {
      title: "Academic Calendar",
      submenu: [{ label: "Upload Calendar", path: "/admin/academic-calendar" }],
    },
  ];

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const getImportanceColor = (importance) => {
    switch (importance.toLowerCase()) {
      case "urgent":
        return "text-red-600 bg-red-50 border-red-200";
      case "important":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "normal":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter announcements based on selected filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const importanceMatch = filterImportance === 'all' || announcement.importance.toLowerCase() === filterImportance.toLowerCase();
    const visibilityMatch = filterVisibility === 'all' || announcement.visibility.toLowerCase() === filterVisibility.toLowerCase();
    return importanceMatch && visibilityMatch;
  });

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
          </div>
          <div className="text-right text-l text-white font-bold">
            Indian Institute of Information Technology Vadodara <br />
            International Campus Diu
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {navItems.map((item, index) => (
            <div key={index} className="mb-1">
              <button
                onClick={() => toggleDropdown(item.title)}
                className={`w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors ${
                  activeDropdown === item.title ? "bg-[#5d2a87]" : ""
                }`}
              >
                <div className="flex items-center">
                  <span>{item.title}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    activeDropdown === item.title ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeDropdown === item.title && (
                <div className="ml-4 mt-1 space-y-1 py-1">
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => navigate(subItem.path)}
                      className="w-full flex items-center p-2 text-sm rounded bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-[#5d2a87] relative group">
          <div className="text-gray-300 cursor-pointer">👤 Admin User</div>
          <div className="absolute left-4 bottom-12 bg-white text-black shadow rounded w-40 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-10">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#efeaf2] p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Create Announcement Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-6">Create New Announcement</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter announcement description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Form Link (Optional)
                </label>
                <input
                  type="url"
                  name="form_link"
                  value={formData.form_link}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/form"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importance
                  </label>
                  <select
                    name="importance"
                    value={formData.importance}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="All">All</option>
                    <option value="Students">Students</option>
                    <option value="Faculty">Faculty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="expiry_date"
                    value={formData.expiry_date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#49196c] text-white rounded-lg hover:bg-[#5d2a87] transition-colors"
                >
                  Post Announcement
                </button>
              </div>
            </form>
          </div>

          {/* Existing Announcements Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Existing Announcements</h3>
              <div className="flex gap-4">
                <select 
                  className="p-2 border border-gray-300 rounded"
                  value={filterImportance}
                  onChange={(e) => setFilterImportance(e.target.value)}
                >
                  <option value="all">All Importance</option>
                  <option value="urgent">Urgent</option>
                  <option value="important">Important</option>
                  <option value="normal">Normal</option>
                </select>
                <select 
                  className="p-2 border border-gray-300 rounded"
                  value={filterVisibility}
                  onChange={(e) => setFilterVisibility(e.target.value)}
                >
                  <option value="all">All Visibility</option>
                  <option value="students">Students</option>
                  <option value="faculty">Faculty</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6">Loading announcements...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No announcements found</div>
            ) : (
              <div className="space-y-4">
                {filteredAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold">{announcement.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-sm border ${getImportanceColor(announcement.importance)}`}>
                            {announcement.importance}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4">{announcement.description}</p>
                        {announcement.form_link && (
                          <a 
                            href={announcement.form_link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline mb-4 block"
                          >
                            Related Form →
                          </a>
                        )}
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Visibility: {announcement.visibility}</span>
                          <span>Posted: {formatDate(announcement.publication_date)}</span>
                          {announcement.expiry_date && (
                            <span>Expires: {formatDate(announcement.expiry_date)}</span>
                          )}
                          {announcement.created_by && (
                            <span>By: {announcement.created_by}</span>
                          )}
                        </div>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-600 transition-colors"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;