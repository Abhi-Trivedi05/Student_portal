import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";

const Step1Registration = () => {
  const navigate = useNavigate();
  
  // Dummy student data (Replace with backend fetch later)
  const [studentData, setStudentData] = useState({
    name: "Rushika",
    studentId: "IIITVICD2024CS001",
    programme: "B.Tech",
    department: "Computer Science",
    spi: "8.5",
    cpi: "8.3",
    academicYear: "2024-25",
    semester: "4",
  });
  let name = studentData.name.toUpperCase()
  const handleEdit = (key, value) => {
    setStudentData({ ...studentData, [key]: value });
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
            </span>
          </div>
          <nav className="mt-10">
            <ul className="space-y-5">
            <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-homepage")}>
                Home
              </li>
              <li className="cursor-pointer hover:text-gray-300 font-bold">Registration</li>
              <li className="cursor-pointer hover:text-gray-300">Activities</li>
              <li className="cursor-pointer hover:text-gray-300">My Courses</li>
              <li className="cursor-pointer hover:text-gray-300">Academic Calendar</li>
              <li className="cursor-pointer hover:text-gray-300">Announcements</li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Section */}
      <main className="flex-1 p-10 bg-gray-100 flex flex-col items-center justify-center">
        {/* Out of Box Welcome Message */}
        
        <h1 className="text-4xl font-bold text-[#49196c] mb-6 self-start">WELCOME BACK, {name}!!!</h1>
        
        <div className="bg-white shadow-lg rounded-lg p-10 w-3/4 border-2 border-purple-600">
          <p className="text-lg font-semibold text-gray-700 text-center mb-6">VERIFY THE DETAILS BELOW</p>
          
          {/* Student Details Box */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md grid grid-cols-2 gap-4">
            {Object.entries(studentData).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-gray-800 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
                  <input 
                    type="text" 
                    value={value} 
                    onChange={(e) => handleEdit(key, e.target.value)} 
                    className="w-full bg-transparent outline-none"
                  />
                  <FaEdit className="text-[#49196c] cursor-pointer ml-2" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Continue Button */}
          <div className="flex justify-center mt-8">
            <button
              className="bg-[#49196c] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#3b1456] transition"
              onClick={() => navigate("/step-2")}
            >
              CONTINUE
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Step1Registration;