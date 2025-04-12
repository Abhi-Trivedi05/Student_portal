import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AnnouncementsPage = () => {
  const navigate = useNavigate(); // Initialize navigation function

  const announcements = [
    { title: "Semester Registration Open", date: "March 30, 2025", content: "Students can now register for the upcoming semester. Deadline: April 10, 2025." },
    { title: "Hackathon Event", date: "March 25, 2025", content: "Join our 48-hour hackathon. Registrations open until April 5, 2025." },
    { title: "Exam Schedule Released", date: "March 20, 2025", content: "The final exam schedule is now available. Check the academic calendar for details." },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-[#49196c] text-white p-6 flex flex-col justify-between min-h-screen">
        {/* Institute Logo & Name */}
        <div>
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="IIITV-ICD Logo" className="h-12 w-12" />
            <span className="text-sm font-bold mt-2">
              Indian Institute of Information Technology Vadodara <br /> International Campus Diu
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10"> {/* Moved down slightly */}
            <ul className="space-y-5"> {/* Increased spacing */}
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-homepage")}>
                Home
              </li>
              <li className="cursor-pointer hover:text-gray-300" onClick={() => navigate("/student-registration")}>
                Registration
              </li>
              <li className="cursor-pointer hover:text-gray-300">Activities</li>
              <li className="cursor-pointer hover:text-gray-300">My Courses</li>
              <li className="cursor-pointer hover:text-gray-300">Academic Calendar</li>
              <li className="cursor-pointer font-bold">Announcements</li>
            </ul>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-3 border-t border-gray-500 pt-4">
          <img src="/profile-icon.png" alt="Profile" className="h-10 w-10 rounded-full border border-gray-300" />
          <span className="text-sm font-medium">John Doe</span>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-[#49196c] mb-6">Announcements</h1>

        <div className="space-y-6">
          {announcements.map((announcement, index) => (
            <div key={index} className="bg-white p-6 shadow-md rounded-lg border-l-4 border-[#49196c]">
              <h2 className="text-xl font-semibold">{announcement.title}</h2>
              <p className="text-gray-500 text-sm">{announcement.date}</p>
              <p className="text-gray-700 mt-2">{announcement.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
