// import React, { useState, useEffect, useCallback } from "react";
// import axios from "axios";

// const FeeApprovalPage = () => {
//   const [feeTransactions, setFeeTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("Pending");
//   const [academicYears, setAcademicYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState("");
//   const [selectedSemester, setSelectedSemester] = useState("");
//   const [notification, setNotification] = useState({ message: "", type: "" });
//   const [viewMode, setViewMode] = useState("table");
//   const [detailedTransaction, setDetailedTransaction] = useState(null);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedTransactionId, setSelectedTransactionId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sort, setSort] = useState({ field: "transaction_date", direction: "desc" });
//   const [stats, setStats] = useState({
//     total: 0,
//     pending: 0,
//     paid: 0,
//     rejected: 0
//   });

//   // API base URL
//   const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/approval";

//   // Show notification helper
//   const showNotification = (message, type) => {
//     setNotification({ message, type });
//     // Clear notification after 3 seconds
//     setTimeout(() => {
//       setNotification({ message: "", type: "" });
//     }, 3000);
//   };

//   // Calculate stats from fee transactions
//   const calculateStats = (transactions) => {
//     const stats = {
//       total: transactions.length,
//       pending: transactions.filter(t => t.status === 'Pending').length,
//       paid: transactions.filter(t => t.status === 'Paid').length,
//       rejected: transactions.filter(t => t.status === 'Rejected').length
//     };
//     setStats(stats);
//   };

//   // Fetch fee transactions that need approval
//   const fetchFeeTransactions = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/fee-transactions`, {
//         params: {
//           status: filter,
//           academicYearId: selectedYear || undefined,
//           semester: selectedSemester || undefined
//         }
//       });
//       setFeeTransactions(response.data);
//       calculateStats(response.data);
//     } catch (error) {
//       console.error("Error fetching fee transactions:", error);
//       showNotification("Failed to load fee transactions", "error");
//     } finally {
//       setLoading(false);
//     }
//   }, [filter, selectedYear, selectedSemester, API_BASE_URL]);

//   useEffect(() => {
//     fetchFeeTransactions();
//   }, [fetchFeeTransactions]);

//   // Fetch academic years for filter
//   useEffect(() => {
//     const fetchAcademicYears = async () => {
//       try {
//         const response = await axios.get(`${API_BASE_URL}/academic-years`);
//         setAcademicYears(response.data);
//         // Set current academic year as default if available
//         const currentYear = response.data.find(year => year.is_current);
//         if (currentYear) {
//           setSelectedYear(currentYear.id);
//         }
//       } catch (error) {
//         console.error("Error fetching academic years:", error);
//         showNotification("Failed to load academic years", "error");
//       }
//     };

//     fetchAcademicYears();
//   }, [API_BASE_URL]);

//   const handleApprove = async (transactionId) => {
//     try {
//       setLoading(true);
//       await axios.put(`${API_BASE_URL}/fee-transactions/${transactionId}/approve`);
      
//       // Update both the list view and detailed view if applicable
//       await fetchFeeTransactions();
      
//       // If in detail view, refresh the detail data
//       if (viewMode === "detail" && detailedTransaction?.id === transactionId) {
//         await refreshDetailedView(transactionId);
//       }
      
//       showNotification("Fee payment approved successfully", "success");
//     } catch (error) {
//       console.error("Error approving fee payment:", error);
//       showNotification("Failed to approve fee payment", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openRejectModal = (transactionId) => {
//     setSelectedTransactionId(transactionId);
//     setRejectionReason("");
//     setShowRejectModal(true);
//   };

//   const handleReject = async () => {
//     if (!selectedTransactionId) return;
    
//     try {
//       setLoading(true);
//       await axios.put(`${API_BASE_URL}/fee-transactions/${selectedTransactionId}/reject`, {
//         rejection_reason: rejectionReason
//       });
//       setShowRejectModal(false);
      
//       // Update both the list view and detailed view if applicable
//       await fetchFeeTransactions();
      
//       // If in detail view, refresh the detail data
//       if (viewMode === "detail" && detailedTransaction?.id === selectedTransactionId) {
//         await refreshDetailedView(selectedTransactionId);
//       }
      
//       showNotification("Fee payment rejected", "success");
//     } catch (error) {
//       console.error("Error rejecting fee payment:", error);
//       showNotification("Failed to reject fee payment", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const refreshDetailedView = async (transactionId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/fee-transactions/${transactionId}`);
//       setDetailedTransaction(response.data);
//     } catch (error) {
//       console.error("Error refreshing transaction details:", error);
//       showNotification("Failed to refresh transaction details", "error");
//     }
//   };

//   const viewTransactionDetails = async (transactionId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_BASE_URL}/fee-transactions/${transactionId}`);
//       setDetailedTransaction(response.data);
//       setViewMode("detail");
//     } catch (error) {
//       console.error("Error fetching transaction details:", error);
//       showNotification("Failed to load transaction details", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSort = (field) => {
//     setSort(prev => ({
//       field,
//       direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
//     }));
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   const formatCurrency = (amount) => {
//     if (!amount) return "₹0.00";
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amount);
//   };

//   // Apply sorting and filtering to transactions
//   const filteredTransactions = feeTransactions
//     .filter(transaction => {
//       if (!searchTerm) return true;
//       const searchLower = searchTerm.toLowerCase();
//       return (
//         (transaction.student_id?.toString().includes(searchTerm)) ||
//         (transaction.student_name?.toLowerCase().includes(searchLower)) ||
//         (transaction.reference_number?.toLowerCase().includes(searchLower)) ||
//         (transaction.bank_name?.toLowerCase().includes(searchLower))
//       );
//     })
//     .sort((a, b) => {
//       const fieldA = a[sort.field];
//       const fieldB = b[sort.field];
      
//       if (typeof fieldA === 'string' && typeof fieldB === 'string') {
//         return sort.direction === 'asc' 
//           ? fieldA.localeCompare(fieldB) 
//           : fieldB.localeCompare(fieldA);
//       }
      
//       return sort.direction === 'asc' 
//         ? fieldA - fieldB 
//         : fieldB - fieldA;
//     });

//   const resetFilters = () => {
//     setFilter("Pending");
//     setSelectedYear("");
//     setSelectedSemester("");
//     setSearchTerm("");
//   };

//   const exportToCSV = () => {
//     if (filteredTransactions.length === 0) {
//       showNotification("No data to export", "error");
//       return;
//     }

//     // Create CSV header
//     const headers = [
//       "Student ID", 
//       "Student Name", 
//       "Transaction Date", 
//       "Bank Name", 
//       "Amount", 
//       "Reference Number", 
//       "Semester", 
//       "Academic Year", 
//       "Status"
//     ];

//     // Create CSV rows
//     const rows = filteredTransactions.map(t => [
//       t.student_id,
//       t.student_name,
//       formatDate(t.transaction_date),
//       t.bank_name || 'N/A',
//       t.amount,
//       t.reference_number,
//       t.semester,
//       t.academic_year,
//       t.status
//     ]);

//     // Combine header and rows
//     const csvContent = 
//       "data:text/csv;charset=utf-8," + 
//       [headers].concat(rows).map(row => row.join(",")).join("\n");

//     // Create download link
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `fee_transactions_${new Date().toISOString().split('T')[0]}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Fee Payment Approval</h1>
      
//       {/* Notification */}
//       {notification.message && (
//         <div 
//           className={`p-4 mb-4 rounded ${
//             notification.type === "success" 
//               ? "bg-green-100 text-green-800 border border-green-200" 
//               : "bg-red-100 text-red-800 border border-red-200"
//           }`}
//         >
//           {notification.message}
//         </div>
//       )}

//       {viewMode === "table" ? (
//         <>
//           {/* Filter Section */}
//           <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
//             <div className="flex flex-wrap justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Filters</h2>
//               <div className="flex gap-2">
//                 <button 
//                   onClick={resetFilters}
//                   className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
//                 >
//                   Reset Filters
//                 </button>
//                 <button 
//                   onClick={exportToCSV}
//                   className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
//                 >
//                   Export CSV
//                 </button>
//               </div>
//             </div>
            
//             <div className="flex flex-wrap gap-4">
//               <div className="flex items-center">
//                 <label htmlFor="statusFilter" className="mr-2">Status:</label>
//                 <select
//                   id="statusFilter"
//                   value={filter}
//                   onChange={(e) => setFilter(e.target.value)}
//                   className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Paid">Approved</option>
//                   <option value="Rejected">Rejected</option>
//                   <option value="All">All</option>
//                 </select>
//               </div>
              
//               <div className="flex items-center">
//                 <label htmlFor="academicYearFilter" className="mr-2">Academic Year:</label>
//                 <select
//                   id="academicYearFilter"
//                   value={selectedYear}
//                   onChange={(e) => setSelectedYear(e.target.value)}
//                   className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Years</option>
//                   {academicYears.map(year => (
//                     <option key={year.id} value={year.id}>
//                       {year.year_name} {year.is_current ? "(Current)" : ""}
//                     </option>
//                   ))}
//                 </select>
//               </div>
              
//               <div className="flex items-center">
//                 <label htmlFor="semesterFilter" className="mr-2">Semester:</label>
//                 <select
//                   id="semesterFilter"
//                   value={selectedSemester}
//                   onChange={(e) => setSelectedSemester(e.target.value)}
//                   className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Semesters</option>
//                   {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
//                     <option key={sem} value={sem}>
//                       Semester {sem}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
            
//             <div className="mt-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search by student name, ID, or reference number..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full border rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <div className="absolute left-3 top-2.5 text-gray-400">
//                   🔍
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Transactions Summary */}
//           <div className="flex flex-wrap gap-4 mb-6">
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex-1">
//               <div className="text-blue-700 font-semibold">Total Transactions</div>
//               <div className="text-2xl font-bold">{stats.total}</div>
//             </div>
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex-1">
//               <div className="text-yellow-700 font-semibold">Pending</div>
//               <div className="text-2xl font-bold">{stats.pending}</div>
//             </div>
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex-1">
//               <div className="text-green-700 font-semibold">Approved</div>
//               <div className="text-2xl font-bold">{stats.paid}</div>
//             </div>
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex-1">
//               <div className="text-red-700 font-semibold">Rejected</div>
//               <div className="text-2xl font-bold">{stats.rejected}</div>
//             </div>
//           </div>

//           {loading ? (
//             <div className="flex justify-center items-center h-64">
//               <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//             </div>
//           ) : filteredTransactions.length === 0 ? (
//             <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-6 rounded-lg text-center">
//               <div className="text-3xl mb-2">🔍</div>
//               <h3 className="text-lg font-semibold mb-1">No transactions found</h3>
//               <p>Try changing your filters or search criteria</p>
//             </div>
//           ) : (
//             <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="py-3 px-4 text-left border-b cursor-pointer hover:bg-gray-200" 
//                           onClick={() => handleSort('student_id')}>
//                         Student ID
//                         {sort.field === 'student_id' && (
//                           <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
//                         )}
//                       </th>
//                       <th className="py-3 px-4 text-left border-b">Student Name</th>
//                       <th className="py-3 px-4 text-left border-b cursor-pointer hover:bg-gray-200"
//                           onClick={() => handleSort('transaction_date')}>
//                         Transaction Date
//                         {sort.field === 'transaction_date' && (
//                           <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
//                         )}
//                       </th>
//                       <th className="py-3 px-4 text-left border-b">Bank Name</th>
//                       <th className="py-3 px-4 text-left border-b cursor-pointer hover:bg-gray-200"
//                           onClick={() => handleSort('amount')}>
//                         Amount
//                         {sort.field === 'amount' && (
//                           <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
//                         )}
//                       </th>
//                       <th className="py-3 px-4 text-left border-b">Reference</th>
//                       <th className="py-3 px-4 text-left border-b cursor-pointer hover:bg-gray-200"
//                           onClick={() => handleSort('semester')}>
//                         Semester
//                         {sort.field === 'semester' && (
//                           <span className="ml-1">{sort.direction === 'asc' ? '↑' : '↓'}</span>
//                         )}
//                       </th>
//                       <th className="py-3 px-4 text-left border-b">Status</th>
//                       <th className="py-3 px-4 text-center border-b">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredTransactions.map((transaction) => (
//                       <tr key={transaction.id} className="hover:bg-gray-50">
//                         <td className="py-3 px-4 border-b">{transaction.student_id}</td>
//                         <td className="py-3 px-4 border-b">{transaction.student_name}</td>
//                         <td className="py-3 px-4 border-b">{formatDate(transaction.transaction_date)}</td>
//                         <td className="py-3 px-4 border-b">{transaction.bank_name || "N/A"}</td>
//                         <td className="py-3 px-4 border-b font-medium">{formatCurrency(transaction.amount)}</td>
//                         <td className="py-3 px-4 border-b">
//                           <span className="text-sm text-gray-600">{transaction.reference_number}</span>
//                         </td>
//                         <td className="py-3 px-4 border-b">Semester {transaction.semester}</td>
//                         <td className="py-3 px-4 border-b">
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             transaction.status === 'Paid' 
//                               ? 'bg-green-100 text-green-800' 
//                               : transaction.status === 'Rejected'
//                                 ? 'bg-red-100 text-red-800'
//                                 : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {transaction.status}
//                           </span>
//                         </td>
//                         <td className="py-3 px-4 border-b text-center">
//                           <div className="flex justify-center space-x-2">
//                             <button
//                               onClick={() => viewTransactionDetails(transaction.id)}
//                               className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
//                               title="View Details"
//                             >
//                               View
//                             </button>
                            
//                             {transaction.status === 'Pending' && (
//                               <>
//                                 <button
//                                   onClick={() => handleApprove(transaction.id)}
//                                   className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
//                                   title="Approve Payment"
//                                 >
//                                   Approve
//                                 </button>
//                                 <button
//                                   onClick={() => openRejectModal(transaction.id)}
//                                   className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
//                                   title="Reject Payment"
//                                 >
//                                   Reject
//                                 </button>
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </>
//       ) : (
//         // Detailed view of a single transaction
//         detailedTransaction && (
//           <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold">Transaction Details</h2>
//               <button 
//                 onClick={() => setViewMode("table")}
//                 className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
//               >
//                 Back to List
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm text-gray-600">Transaction ID</h3>
//                   <p className="font-medium">{detailedTransaction.id}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm text-gray-600">Student Details</h3>
//                   <p className="font-medium">{detailedTransaction.student_name}</p>
//                   <p className="text-gray-600">ID: {detailedTransaction.student_id}</p>
//                   <p className="text-gray-600">Programme: {detailedTransaction.programme}</p>
//                   <p className="text-gray-600">Department: {detailedTransaction.department}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm text-gray-600">Academic Information</h3>
//                   <p className="font-medium">{detailedTransaction.academic_year}</p>
//                   <p className="text-gray-600">Semester {detailedTransaction.semester}</p>
//                   <p className="text-gray-600">Current Semester: {detailedTransaction.current_semester}</p>
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <div>
//                   <h3 className="text-sm text-gray-600">Payment Details</h3>
//                   <p className="font-bold text-lg">{formatCurrency(detailedTransaction.amount)}</p>
//                   <p className="text-gray-600">Date: {formatDate(detailedTransaction.transaction_date)}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm text-gray-600">Payment Method</h3>
//                   <p className="font-medium">{detailedTransaction.bank_name || "N/A"}</p>
//                   <p className="text-gray-600">Ref: {detailedTransaction.reference_number}</p>
//                 </div>
//                 <div>
//                   <h3 className="text-sm text-gray-600">Status</h3>
//                   <div className="flex items-center mt-1">
//                     <span className={`px-3 py-1 rounded text-sm inline-block ${
//                       detailedTransaction.status === 'Paid' 
//                         ? 'bg-green-100 text-green-800' 
//                         : detailedTransaction.status === 'Rejected'
//                           ? 'bg-red-100 text-red-800'
//                           : 'bg-yellow-100 text-yellow-800'
//                     }`}>
//                       {detailedTransaction.status}
//                     </span>
//                   </div>
//                   {detailedTransaction.rejection_reason && (
//                     <div className="mt-2">
//                       <h3 className="text-sm text-gray-600">Rejection Reason</h3>
//                       <p className="text-red-600 mt-1">{detailedTransaction.rejection_reason}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {detailedTransaction.status === 'Pending' && (
//               <div className="mt-8 border-t pt-6">
//                 <h3 className="text-lg font-medium mb-4">Actions</h3>
//                 <div className="flex space-x-4">
//                   <button
//                     onClick={() => handleApprove(detailedTransaction.id)}
//                     className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
//                   >
//                     Approve Payment
//                   </button>
//                   <button
//                     onClick={() => openRejectModal(detailedTransaction.id)}
//                     className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
//                   >
//                     Reject Payment
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         )
//       )}

//       {/* Rejection Modal */}
//       {showRejectModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//             <h2 className="text-xl font-semibold mb-4">Reject Payment</h2>
//             <p className="text-gray-600 mb-4">Please provide a reason for rejecting this payment.</p>
            
//             <textarea
//               value={rejectionReason}
//               onChange={(e) => setRejectionReason(e.target.value)}
//               placeholder="Enter rejection reason..."
//               className="w-full border rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
//             ></textarea>
            
//             <div className="flex justify-end space-x-3 mt-4">
//               <button
//                 onClick={() => setShowRejectModal(false)}
//                 className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleReject}
//                 disabled={!rejectionReason.trim()}
//                 className={`px-4 py-2 rounded text-white ${
//                   rejectionReason.trim() 
//                     ? 'bg-red-500 hover:bg-red-600' 
//                     : 'bg-red-300 cursor-not-allowed'
//                 }`}
//               >
//                 Reject
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FeeApprovalPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const FeeApproval = () => {
  const [activeDropdown, setActiveDropdown] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // Sample data for UI design
  const sampleRequests = [
    {
      id: 1,
      student_id: "202101",
      student_name: "John Doe",
      amount: "50000",
      payment_date: "2024-03-15",
      status: "Pending",
      payment_mode: "Online Transfer",
      transaction_id: "TXN123456",
      semester: "4th"
    },
    {
      id: 2,
      student_id: "202102",
      student_name: "Jane Smith",
      amount: "45000",
      payment_date: "2024-03-14",
      status: "Approved",
      payment_mode: "Net Banking",
      transaction_id: "TXN789012",
      semester: "2nd"
    }
  ];

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
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
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
              onClick={() => navigate("/")}
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
                <select className="p-2 border border-gray-300 rounded">
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select className="p-2 border border-gray-300 rounded">
                  <option value="all">All Semesters</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                  <option value="3">3rd Semester</option>
                  <option value="4">4th Semester</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {sampleRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <h4 className="text-lg font-semibold">{request.student_name}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#49196c]">₹{request.amount}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600">Student ID</p>
                      <p className="font-medium">{request.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Semester</p>
                      <p className="font-medium">{request.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Date</p>
                      <p className="font-medium">
                        {new Date(request.payment_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-medium">{request.payment_mode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium">{request.transaction_id}</p>
                    </div>
                  </div>

                  {request.status === "Pending" && (
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                      <button className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        Reject
                      </button>
                      <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeApproval;