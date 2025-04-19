import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const FinalizeRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState({ 
    isSubmitting: false, 
    message: "", 
    success: false 
  });

  // Form data for CPI and fee details
  const [formData, setFormData] = useState({
    cpi: "",
    paymentMode: "Online Transfer", // Default value
    bankName: "",
    transactionId: "",
    transactionDate: "",
    amount: ""
  });

  // Get student ID from local storage
  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch student profile data
        const studentResponse = await axios.get(`/api/student/${studentId}`);
        setStudentData(studentResponse.data);
        
        // Pre-populate CPI if available
        if (studentResponse.data.cpi) {
          setFormData(prev => ({...prev, cpi: studentResponse.data.cpi}));
        }
        
        // First try to get courses from localStorage
        const storedCourses = localStorage.getItem("selectedCourses");
        
        if (storedCourses) {
          // Use the courses from localStorage if available
          const parsedCourses = JSON.parse(storedCourses);
          setSelectedCourses(parsedCourses);
          setLoading(false);
        } else {
          // Fallback to fetching from API if localStorage doesn't have the courses
          const coursesResponse = await axios.get(`/api/student/courses/${studentId}`);
          
          // Filter only the courses with "Registered" status
          const registeredCourses = coursesResponse.data.courses.filter(
            course => course.status === "Registered"
          );
          
          setSelectedCourses(registeredCourses);
          
          // Also store these courses in localStorage for consistency
          localStorage.setItem("selectedCourses", JSON.stringify(registeredCourses));
          
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.message || "Failed to load course data. Please try again.");
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [studentId, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Calculate total credits
  const totalCredits = selectedCourses.reduce((total, course) => total + course.credits, 0);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.bankName || !formData.transactionId || !formData.transactionDate || !formData.amount) {
      setSubmissionStatus({
        isSubmitting: false,
        message: "Please fill in all required fee payment details.",
        success: false
      });
      return;
    }

    try {
      setSubmissionStatus({ isSubmitting: true, message: "Processing registration...", success: false });
      
      // Step 1: Get current academic year
      const academicYearResponse = await axios.get('/api/student/academic-year/current');
      console.log("Academic Year Response:", academicYearResponse.data);
      const academicYearId = academicYearResponse.data.id;
      
      if (!academicYearId) {
        throw new Error("Could not determine current academic year");
      }
      
      // Step 2: Submit fee payment details
      const feeResponse = await axios.post('/api/student/submit-fee', 
        {
          student_id: studentId,
          transaction_date: formData.transactionDate,
          bank_name: formData.bankName,
          amount: formData.amount,
          reference_number: formData.transactionId,
          semester: studentData.current_semester,
          academic_year_id: academicYearId,
        }, 
        {
          headers: {
            'Role': 'student',
            'StudentId': studentId
          }
        }
      );
      
      if (!feeResponse.data.success) {
        throw new Error(feeResponse.data.message || "Fee submission failed");
      }
      
      // Step 3: Create semester registration
      const registrationResponse = await axios.post('/api/student/semester-registration',
        {
          student_id: studentId,
          semester: studentData.current_semester,
          academic_year_id: academicYearId,
          cpi: formData.cpi,
          courseIds: selectedCourses.map(course => course.id) // Send the course IDs for registration
        },
        {
          headers: {
            'Role': 'student',
            'StudentId': studentId
          }
        }
      );
      
      if (!registrationResponse.data.success) {
        throw new Error(registrationResponse.data.message || "Registration submission failed");
      }
      
      // If successful, show success message and redirect after a delay
      setSubmissionStatus({
        isSubmitting: false,
        message: "Registration submitted successfully! Your courses will be assigned once fees and registration are approved by both admin and faculty advisor.",
        success: true
      });
      
      // Clear the selected courses from localStorage after submission
      localStorage.removeItem("selectedCourses");
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 3000);
      
    } catch (err) {
      console.error("Registration submission error:", err);
      setSubmissionStatus({
        isSubmitting: false,
        message: err.response?.data?.message || "Failed to submit registration. Please try again.",
        success: false
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading registration data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        {/* Institute Logo & Name */}
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.jpg" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10">
          <ul className="space-y-5">
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/dashboard")}> Home</li>
              <li className="cursor-pointer hover:text-gray-300 font-bold" onClick={() => navigate("/student/step-1-registration")}>Registration</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/mycourses")}>My Courses</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/academic-calendar")}>Academic Calendar</li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student/announcements")}>Announcements</li>
            </ul>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-3 border-t border-gray-500 pt-4">
          <img src="/profile-icon.png" alt="Profile" className="h-10 w-10 rounded-full border border-gray-300" />
          <span className="text-sm font-medium">{studentData?.name || "Student"}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100 w-full">
        <h1 className="text-2xl font-bold mb-6 text-[#49196c]">Finalize Course Registration</h1>
        
        {/* Submission Status Message */}
        {submissionStatus.message && (
          <div className={`mb-6 p-4 rounded-lg ${submissionStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {submissionStatus.message}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selected Courses Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#49196c]">Selected Courses</h2>
              
              {selectedCourses.length === 0 ? (
                <p className="text-gray-600">No courses selected yet. Please go back and select courses.</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {selectedCourses.map((course) => (
                      <div key={course.id} className="border-b pb-3">
                        <h3 className="font-medium">{course.course_name}</h3>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>{course.course_code}</span>
                          <span>{course.credits} Credits</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between font-medium text-lg border-t pt-3">
                    <span>Total Credits:</span>
                    <span>{totalCredits}</span>
                  </div>
                </>
              )}
              
              <button 
                className="mt-6 w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-200 transition"
                onClick={() => navigate("/student/step-2")}
              >
                Edit Course Selection
              </button>
            </div>
          </div>
          
          {/* Registration Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-[#49196c]">Registration Details</h2>
              
              {/* CPI Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Student ID</label>
                    <input 
                      type="text" 
                      value={studentId} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">CPI</label>
                    <input 
                      type="number" 
                      name="cpi"
                      step="0.01" 
                      min="0" 
                      max="10"
                      value={formData.cpi} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Fee Payment Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Fee Payment Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Payment Mode</label>
                    <select 
                      name="paymentMode"
                      value={formData.paymentMode} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    >
                      <option value="Online Transfer">Online Transfer</option>
                      <option value="Bank Deposit">Bank Deposit</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Bank Name</label>
                    <input 
                      type="text" 
                      name="bankName"
                      value={formData.bankName} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Transaction ID/Reference Number</label>
                    <input 
                      type="text" 
                      name="transactionId"
                      value={formData.transactionId} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Transaction Date</label>
                    <input 
                      type="date" 
                      name="transactionDate"
                      value={formData.transactionDate} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      name="amount"
                      value={formData.amount} 
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md" 
                      required
                    />
                  </div>
                  </div>
              </div>
              
              {/* Important Notes */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Course registration will only be finalized after approval from both admin (fee verification) and faculty advisor.</li>
                  <li>Please ensure that fee payment details are accurate to avoid delays in approval.</li>
                  <li>You will be notified once your registration is fully approved.</li>
                </ul>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={submissionStatus.isSubmitting || selectedCourses.length === 0}
                  className={`bg-[#49196c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#3b1456] transition ${
                    (submissionStatus.isSubmitting || selectedCourses.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submissionStatus.isSubmitting ? "Processing..." : "Finalize Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FinalizeRegistration;