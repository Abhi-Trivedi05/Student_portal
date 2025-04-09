import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css"; 
import Login from "./Login"; // Importing Login component
import AdminDashboard from './admin/AdminDashboard'; // Example for Admin Dashboard
import AddStudent from "./admin/AddStudent";
import EditStudent from "./admin/EditStudent";
import RemoveStudent from "./admin/RemoveStudent";
import AddFaculty from "./admin/AddFaculty";
import  EditFaculty  from "./admin/EditFaculty";
import RemoveFaculty from "./admin/RemoveFaculty";
import AddCourse from "./admin/AddCourse";
import EditCourse from "./admin/EditCourse";
import RemoveCourse from "./admin/RemoveCourse";
import Announcements from "./admin/announcement"
import FeeApprovalPage from "./admin/feeapprovalpage";
import FacultyAdvisorDashboard from "./faculty/Dashboard";
import PendingApplications from "./faculty/PendingApplications";
import ApplicationDetails from "./faculty/ApplicationDetails";
import ApprovedApplications from "./faculty/ApprovedApplications";
import RejectedApplications from "./faculty/RejectedApplications";
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/faculty/Dashboard" element={<FacultyAdvisorDashboard />} />
          <Route path="/admin/add-student" element={<AddStudent />} />
        <Route path="/admin/edit-student" element={<EditStudent />} />
        <Route path="/admin/remove-student" element={<RemoveStudent />} />
        <Route path="/admin/add-faculty" element={<AddFaculty />} />
        <Route path="/admin/edit-faculty/:facultyId" element={<EditFaculty />} />
        <Route path="/admin/announcements" element={<Announcements />} />
        <Route path="/admin/edit-faculty" element={<EditFaculty />} />
        <Route path="/admin/remove-faculty" element={<RemoveFaculty />} />
        <Route path="/admin/add-course" element={<AddCourse />} />
        <Route path="/admin/edit-course" element={<EditCourse />} />
        <Route path="/admin/remove-course" element={<RemoveCourse />} />
        <Route path="/admin/approval/approve-fee-details" element={<FeeApprovalPage />} />
        <Route path="/faculty/pending-applications" element={<PendingApplications />} />
        <Route path="/faculty/approved-applications" element={<ApprovedApplications />} />
        <Route path="/faculty/application-details/:id" element={<ApplicationDetails />} />
        <Route path="/faculty/rejected-applications" element={<RejectedApplications />} />
        </Routes>
     

      </div>
   

    </Router>
  );
}

export default App;