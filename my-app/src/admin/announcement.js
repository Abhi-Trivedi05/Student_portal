import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Announcements = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    formLink: "",
    expiryDate: "",
    visibility: "All",
    importance: "Normal"
  });
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch existing announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Use the API base URL - adjust this based on your environment
  // In development, we'll use a proxy, in production it might be different
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api'; // Adjust the port as needed

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      console.log(`Starting fetch request to ${API_BASE_URL}/announcements`);
      const response = await axios.get(`${API_BASE_URL}/announcements`);
      console.log("Response received:", response);
      
      if (response.status !== 200) {
        // const errorText = await response.data;
        throw new Error(`API error: ${response.status} - ${"Error fetching announcements"}`);
      }
      
      const data = await response.data;
      console.log("Successfully parsed as JSON:", data);
      setAnnouncements(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`Fetch error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          form_link: formData.formLink,
          expiry_date: formData.expiryDate,
          visibility: formData.visibility,
          importance: formData.importance,
          // In a real app, you would get this from authentication context
          admin_id: 1 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Reset form and show success message
      setFormData({
        title: "",
        description: "",
        formLink: "",
        expiryDate: "",
        visibility: "All",
        importance: "Normal"
      });
      setSuccessMessage("Announcement created successfully!");
      fetchAnnouncements(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      setSuccessMessage("Announcement deleted successfully!");
      fetchAnnouncements(); // Refresh the list
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Manage Announcements</h1>
          <button 
            onClick={() => navigate("/admin")} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Create Announcement Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="formLink">
                Form Link (Optional)
              </label>
              <input
                type="url"
                id="formLink"
                name="formLink"
                value={formData.formLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/form"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="expiryDate">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="visibility">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Faculty">Faculty Only</option>
                  <option value="Students">Students Only</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="importance">
                  Importance
                </label>
                <select
                  id="importance"
                  name="importance"
                  value={formData.importance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Announcement"}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Announcements</h2>
          
          {isLoading && <p className="text-gray-500">Loading announcements...</p>}
          
          {!isLoading && announcements.length === 0 && (
            <p className="text-gray-500">No announcements found.</p>
          )}
          
          {announcements.map((announcement) => (
            <div 
              key={announcement.id} 
              className={`border-l-4 p-4 mb-4 rounded shadow-sm ${
                announcement.importance === 'Urgent' 
                  ? 'border-red-500 bg-red-50' 
                  : announcement.importance === 'Important' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex justify-between">
                <h3 className="font-bold text-lg">{announcement.title}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.visibility === 'All' 
                      ? 'bg-green-100 text-green-800' 
                      : announcement.visibility === 'Faculty' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.visibility}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.importance === 'Urgent' 
                      ? 'bg-red-100 text-red-800' 
                      : announcement.importance === 'Important' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.importance}
                  </span>
                </div>
              </div>
              
              <p className="my-2">{announcement.description}</p>
              
              {announcement.form_link && (
                <a 
                  href={announcement.form_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block mb-2"
                >
                  Open Form Link
                </a>
              )}
              
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <div>
                  <span>Published: {new Date(announcement.publication_date).toLocaleString()}</span>
                  {announcement.expiry_date && (
                    <span className="ml-3">
                      Expires: {new Date(announcement.expiry_date).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <button 
                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;