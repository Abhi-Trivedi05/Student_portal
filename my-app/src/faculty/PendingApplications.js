import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ChevronDown } from "lucide-react";

const PendingApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState("");
  const [activeSection, setActiveSection] = useState("pending");
  
  const facultyId = localStorage.getItem('facultyId') || 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const applicationsRes = await axios.get(`/api/faculty/${facultyId}/applications`);
        const pendingApps = applicationsRes.data.filter(app => app.status === "In Progress");
        setApplications(pendingApps);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load pending applications. Please try again later.");
        setLoading(false);
      }
    };
    fetchData();
  }, [facultyId]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/faculty/${id}`, { status: 'Completed' });
      setApplications(applications.filter(app => app.id !== id));
    } catch (err) {
      console.error("Error approving application:", err);
      setError("Failed to approve application. Please try again.");
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`/api/faculty/${id}`, { status: 'Failed' });
      setApplications(applications.filter(app => app.id !== id));
    } catch (err) {
      console.error("Error rejecting application:", err);
      setError("Failed to reject application. Please try again.");
    }
  };

  const getFeeStatusColor = (status) => {
    const colors = {
      "Paid": { bg: '#dcfce7', text: '#166534' },
      "Unpaid": { bg: '#fee2e2', text: '#991b1b' },
      "Partial": { bg: '#fef9c3', text: '#854d0e' },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151' };
  };

  const navItems = [
    {
      title: "Applications",
      submenu: [
        { label: "Pending Applications", path: "/faculty/pending-applications", status: "pending" },
        { label: "Approved Applications", path: "/faculty/approved-applications", status: "approved" },
        { label: "Rejected Applications", path: "/faculty/rejected-applications", status: "rejected" },
      ],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen">
        <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
          <SidebarContent 
            navItems={navItems} 
            activeDropdown={activeDropdown} 
            setActiveDropdown={setActiveDropdown}
            navigate={navigate}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen">
        <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
          <SidebarContent 
            navItems={navItems} 
            activeDropdown={activeDropdown} 
            setActiveDropdown={setActiveDropdown}
            navigate={navigate}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-[#49196c] text-white flex flex-col">
        <SidebarContent 
          navItems={navItems} 
          activeDropdown={activeDropdown} 
          setActiveDropdown={setActiveDropdown}
          navigate={navigate}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#efeaf2] overflow-y-auto p-8">
        {/* Title */}
        <div className="max-w-[1200px] mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pending Applications</h1>
        </div>

        {/* Applications Table */}
        <div className="max-w-[1200px] mx-auto mb-8">
          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600">No applications found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Registration ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Course</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fee Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Fee Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const feeStatusColors = getFeeStatusColor(app.feeStatus);
                      return (
                        <tr 
                          key={app.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">{app.name}</td>
                          <td className="py-3 px-4">{app.registrationId}</td>
                          <td className="py-3 px-4">{app.course}</td>
                          <td className="py-3 px-4">
                            <span
                              style={{
                                backgroundColor: feeStatusColors.bg,
                                color: feeStatusColors.text,
                              }}
                              className="px-2 py-1 rounded-full text-sm font-medium"
                            >
                              {app.feeStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">{app.feeAmount}</td>
                          <td className="py-3 px-4">{app.applicationDate}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="max-w-[120px] mx-auto flex justify-end">
          <button 
            onClick={() => navigate('/faculty/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-[#49196c] text-white rounded-lg hover:bg-[#3b1456] transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Content Component
const SidebarContent = ({ 
  navItems, 
  activeDropdown, 
  setActiveDropdown,
  navigate,
  activeSection,
  setActiveSection
}) => {
  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const handleNavigation = (path, status) => {
    setActiveSection(status);
    navigate(path);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#5d2a87]">
        <div className="flex items-center">
          <img src="/logo.jpg" alt="Logo" className="h-8 w-8 mr-2" />
        </div>
        <div className="text-right text-sm font-bold">
          Indian Institute of Information Technology Vadodara <br />
          International Campus Diu
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item, index) => (
          <div key={index} className="mb-1">
            <button
              onClick={() => toggleDropdown(item.title)}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#5d2a87] hover:bg-[#7e57c2] transition-colors"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  activeDropdown === item.title ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeDropdown === item.title && (
              <div className="ml-4 mt-1 space-y-1">
                {item.submenu.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => handleNavigation(subItem.path, subItem.status)}
                    className={`w-full flex items-center p-2 text-sm rounded transition-colors ${
                      activeSection === subItem.status
                        ? "bg-[#7e57c2]"
                        : "bg-[#5d2a87] hover:bg-[#7e57c2]"
                    }`}
                  >
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto p-4 border-t border-[#5d2a87]">
        <div className="text-sm text-gray-300">
          © 2024 IIITV-ICD. All rights reserved.
        </div>
      </div>
    </>
  );
};

export default PendingApplications;