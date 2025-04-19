import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, UploadCloud, Download, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AcademicCalendarPage = () => {
  const [calendars, setCalendars] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState("");
  
  // Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [calendarToDelete, setCalendarToDelete] = useState(null);

  // Admin ID (in a real app, this would come from authentication context)
  const adminId = localStorage.getItem("userId") || localStorage.getItem("adminId") || 1;

  // Headers for API requests
  const headers = {
    'Role': 'admin'
  };

  // Fetch academic years and calendars on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years
        const yearsResponse = await fetch('/api/academic-calendar/academic-years', {
          headers
        });
        
        if (!yearsResponse.ok) {
          throw new Error('Failed to fetch academic years');
        }
        
        const yearsData = await yearsResponse.json();
        
        if (yearsData.success) {
          setAcademicYears(yearsData.academicYears);
        } else {
          throw new Error(yearsData.message || 'Failed to load academic years');
        }
        
        // Fetch calendars
        const calendarsResponse = await fetch('/api/academic-calendar/calendars', {
          headers
        });
        
        if (!calendarsResponse.ok) {
          throw new Error('Failed to fetch calendars');
        }
        
        const calendarsData = await calendarsResponse.json();
        
        if (calendarsData.success) {
          setCalendars(calendarsData.calendars);
        } else {
          throw new Error(calendarsData.message || 'Failed to load calendars');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data: ' + (err.message || 'Unknown error'));
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };
    
    fetchData();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setError('Please select a PDF file.');
    }
  };

  // Handle calendar upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!title || !selectedYear || !selectedFile) {
      setError('Please fill all required fields and select a PDF file.');
      return;
    }
    
    try {
      setUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append('title', title);
      formData.append('academicYearId', selectedYear);
      formData.append('adminId', adminId);
      formData.append('pdfFile', selectedFile);
      
      // Send to API
      const response = await fetch('/api/academic-calendar/upload', {
        method: 'POST',
        headers,
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setTitle('');
        setSelectedYear('');
        setSelectedFile(null);
        setShowUploadModal(false);
        
        // Show success message
        setSuccess('Academic calendar uploaded successfully!');
        
        // Refresh calendar list
        const updatedResponse = await fetch('/api/academic-calendar/calendars', {
          headers
        });
        
        const updatedData = await updatedResponse.json();
        
        if (updatedData.success) {
          setCalendars(updatedData.calendars);
        }
      } else {
        setError(result.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to upload calendar. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle calendar download
  const downloadCalendar = async (id, fileName) => {
    try {
      const response = await fetch(`/api/academic-calendar/download/${id}`, {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download failed');
      }
      
      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      
      // Append to body, click and remove
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Failed to download the calendar. Please try again.');
      console.error('Download error:', err);
    }
  };

  // Handle calendar status change
  const toggleCalendarStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'obsolete' : 'active';
      
      const response = await fetch(`/api/academic-calendar/status/${id}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setCalendars(calendars.map(cal => 
          cal.id === id ? { ...cal, status: newStatus } : cal
        ));
        
        setSuccess(`Calendar status updated to ${newStatus}.`);
      } else {
        setError(result.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update calendar status. Please try again.');
      console.error('Status update error:', err);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (calendar) => {
    setCalendarToDelete(calendar);
    setShowDeleteModal(true);
  };

  // Handle calendar deletion
  const deleteCalendar = async () => {
    if (!calendarToDelete) return;
    
    try {
      const response = await fetch(`/api/academic-calendar/delete/${calendarToDelete.id}`, {
        method: 'DELETE',
        headers
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setCalendars(calendars.filter(cal => cal.id !== calendarToDelete.id));
        
        setSuccess('Academic calendar deleted successfully!');
        setShowDeleteModal(false);
        setCalendarToDelete(null);
      } else {
        setError(result.message || 'Failed to delete calendar');
      }
    } catch (err) {
      setError('Failed to delete the calendar. Please try again.');
      console.error('Delete error:', err);
    }
  };

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);
  
  // Navigation items for sidebar
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

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
          <div className="flex items-center">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
          </div>
          <div className="text-right text-sm text-white font-bold">
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#49196c] text-white p-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="mr-2" size={20} />
                Academic Calendar Management
              </h2>
              <button 
                className="px-4 py-2 bg-white text-[#49196c] rounded flex items-center text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => setShowUploadModal(true)}
              >
                <UploadCloud className="mr-2" size={16} />
                Upload New Calendar
              </button>
            </div>
            
            {/* Alert messages */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
                <div className="flex items-center">
                  <XCircle className="mr-2" size={20} />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4">
                <div className="flex items-center">
                  <CheckCircle className="mr-2" size={20} />
                  <span>{success}</span>
                </div>
              </div>
            )}
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#49196c] border-t-transparent"></div>
                  <p className="mt-3 text-gray-600">Loading calendars...</p>
                </div>
              ) : calendars.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="mx-auto text-gray-400" size={48} />
                  <p className="mt-4 text-gray-500">No academic calendars found. Upload a new calendar to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Year
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Upload Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {calendars.map((calendar) => (
                        <tr key={calendar.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{calendar.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{calendar.academic_year}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {calendar.file_name} ({calendar.file_size})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{calendar.upload_date}</div>
                            <div className="text-xs text-gray-400">by {calendar.uploaded_by}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              calendar.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {calendar.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                onClick={() => downloadCalendar(calendar.id, calendar.file_name)}
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                              <button 
                                className={`${
                                  calendar.status === 'active' 
                                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                                    : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                                } p-1 rounded`}
                                onClick={() => toggleCalendarStatus(calendar.id, calendar.status)}
                                title={calendar.status === 'active' ? 'Mark as Obsolete' : 'Mark as Active'}
                              >
                                {calendar.status === 'active' ? 'Mark Obsolete' : 'Mark Active'}
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                onClick={() => confirmDelete(calendar)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Upload Academic Calendar</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Calendar Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Academic Calendar 2024-2025" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#49196c] focus:border-transparent"
                  required
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>{year.year_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF File <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-gray-300 border-dashed rounded hover:bg-gray-50 hover:border-[#49196c] cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <UploadCloud size={36} className="text-gray-400" />
                      <p className="pt-1 text-sm text-gray-600 group-hover:text-gray-600">
                        {selectedFile ? selectedFile.name : "Click to upload a PDF file"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Only PDF files are accepted (max size: 10MB)
                      </p>
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !title || !selectedYear || !selectedFile}
                  className="px-4 py-2 bg-[#49196c] text-white rounded hover:bg-[#5d2a87] transition-colors disabled:bg-[#49196c]/50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 align-middle"></span>
                      Uploading...
                    </>
                  ) : (
                    'Upload Calendar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && calendarToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
              <button 
                onClick={() => {
                  setShowDeleteModal(false);
                  setCalendarToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4">
                Are you sure you want to delete the calendar <span className="font-medium">{calendarToDelete.title}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCalendarToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={deleteCalendar}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCalendarPage;