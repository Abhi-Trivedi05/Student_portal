import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import axios from "axios";

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const FeeApproval = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  // Admin ID - In a real app, this would come from authentication
  const adminId = "1"; // Replace with actual admin ID retrieval logic

  // Fetch academic years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await api.get('/api/approval/academic-years');
        setAcademicYears(response.data);
        
        // Set default to current academic year if available
        const currentYear = response.data.find(year => year.is_current === 1);
        if (currentYear) {
          setSelectedYear(currentYear.id);
        }
      } catch (error) {
        console.error('Error fetching academic years:', error);
        handleApiError(error, 'Failed to fetch academic years');
      }
    };
    
    fetchAcademicYears();
  }, []);

  // Fetch fee transactions with filters
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let url = '/api/approval/fee-transactions?';
        
        if (statusFilter && statusFilter !== 'All') {
          url += `status=${statusFilter}&`;
        }
        
        if (selectedYear) {
          url += `academicYearId=${selectedYear}&`;
        }
        
        if (semesterFilter) {
          url += `semester=${semesterFilter}`;
        }
        
        const response = await api.get(url);
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        handleApiError(error, 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [statusFilter, selectedYear, semesterFilter]);

  // Error handling helper function
  const handleApiError = (error, defaultMessage) => {
    console.error('Error details:', error);
    
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      alert(`Server error: ${error.response.data.message || error.response.status}`);
    } else if (error.request) {
      // The request was made but no response was received
      alert('No response from server. Please check your connection.');
    } else {
      // Something else caused the error
      alert(`Error: ${error.message || defaultMessage}`);
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
        { label: "Add Faculty", path: "/admin/add-faculty"},
        { label: "Edit Faculty Details", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Manage Courses",
      submenu: [
        { label: "Add Course", path :"/admin/add-course"},
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
  ];

  const toggleDropdown = (title) => {
    setActiveDropdown(activeDropdown === title ? "" : title);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "paid":
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/approval/fee-transactions/${id}/approve`, {
        admin_id: adminId
      });
      
      // Refresh the transaction list after approval
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === id 
          ? { ...transaction, status: 'Paid' } 
          : transaction
      );
      setTransactions(updatedTransactions);
    } catch (error) {
      console.error('Error approving transaction:', error);
      handleApiError(error, 'Failed to approve the transaction');
    }
  };

  const openRejectModal = (transaction) => {
    setSelectedTransaction(transaction);
    setRejectReason('');
    setShowRejectModal(true);
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

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
  
    try {
      await api.put(`/api/approval/fee-transactions/${selectedTransaction.id}/reject`, {
        admin_id: adminId,
        reason: rejectReason  // Add this line to send the rejection reason
      });
      
      // Update the local state
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === selectedTransaction.id 
          ? { ...transaction, status: 'Rejected' } 
          : transaction
      );
      
      setTransactions(updatedTransactions);
      setShowRejectModal(false);
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      handleApiError(error, 'Failed to reject the transaction');
    }
  };

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
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Fee Approval Requests</h3>
              <div className="flex gap-4">
                <select 
                  className="p-2 border border-gray-300 rounded"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                
                <select 
                  className="p-2 border border-gray-300 rounded"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Academic Years</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year_name} {year.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                
                <select 
                  className="p-2 border border-gray-300 rounded"
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                  <option value="5">5th Semester</option>
                  <option value="6">6th Semester</option>
                  <option value="7">7th Semester</option>
                  <option value="8">8th Semester</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No fee transactions found with the selected filters
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <h4 className="text-lg font-semibold">{transaction.student_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-[#49196c]">₹{transaction.amount}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-gray-600">Student ID</p>
                        <p className="font-medium">{transaction.student_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Semester</p>
                        <p className="font-medium">{transaction.semester}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Academic Year</p>
                        <p className="font-medium">{transaction.academic_year}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Date</p>
                        <p className="font-medium">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Bank</p>
                        <p className="font-medium">{transaction.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Reference Number</p>
                        <p className="font-medium">{transaction.reference_number}</p>
                      </div>
                    </div>

                    {transaction.status.toLowerCase() === "pending" && (
                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                        <button 
                          onClick={() => openRejectModal(transaction)}
                          className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApprove(transaction.id)}
                          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reject Fee Payment</h3>
            <p className="mb-2">Student: {selectedTransaction?.student_name}</p>
            <p className="mb-4">Amount: ₹{selectedTransaction?.amount}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a reason for rejection"
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeApproval;