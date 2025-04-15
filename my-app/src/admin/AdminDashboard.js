import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, BookOpen, Users, Bell, FileText } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Effect for window resize - properly initialized
  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sections = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student records efficiently.",
      icon: <Users size={20} />,
      image: "/college-image.jpg",
      id: "student-management",
      actions: [
        { label: "Add Student", path: "/admin/add-student" },
        { label: "Edit Student", path: "/admin/edit-student" },
        { label: "Remove Student", path: "/admin/remove-student" },
      ],
    },
    {
      title: "Faculty Management",
      description: "Manage faculty information and assignments.",
      icon: <User size={20} />,
      image: "/campus-building.jpg",
      id: "faculty-management",
      actions: [
        { label: "Add Faculty", path: "/admin/add-faculty" },
        { label: "Edit Faculty", path: "/admin/edit-faculty" },
        { label: "Remove Faculty", path: "/admin/remove-faculty" },
      ],
    },
    {
      title: "Course Management",
      description: "Create and manage course offerings and schedules.",
      icon: <BookOpen size={20} />,
      image: "/beach.jpg",
      id: "course-management",
      actions: [
        { label: "Add Course", path: "/admin/add-course" },
        { label: "Edit Course", path: "/admin/edit-course" },
        { label: "Remove Course", path: "/admin/remove-course" },
      ],
    },
    {
      title: "Announcements",
      description: "Create and publish important announcements for students and faculty.",
      icon: <Bell size={20} />,
      image: "/image2.jpg",
      id: "announcements",
      actions: [
        { label: "Make Announcement", path: "/admin/announcements" },
      ],
    },
    {
      title: "Fee Approvals",
      description: "Review and approve student fee details and payment records.",
      icon: <FileText size={20} />,
      image: "/image3.jpg",
      id: "fee-approvals",
      actions: [
        { label: "Approve Fee", path: "/admin/approval/approve-fee-details" },
      ],
    },
    {
      title: "Academic Calendar",
      description: "Upload and manage the academic calendar for the institution.",
      icon: <FileText size={20} />,
      image: "/image3.jpg",
      id: "academic-calendar",
       actions: [
        { label: "Upload Calendar", path: "/admin/academic-calendar" },
      ],
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  // Helper to determine if we're on mobile
  const isMobile = windowWidth < 768;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      position: 'relative',
      paddingTop: '60px', // Reduced navbar height
    }}>
      {/* Fixed Navbar - Height reduced */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px', // Reduced from 80px
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px' // Reduced padding
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            height: '28px', // Reduced size
            width: '28px',
            backgroundColor: '#49196c',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px' // Added font size
          }}>
            ICD
          </div>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151' }}>IIITV-ICD</span>
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '4px',
          paddingLeft: '8px',
          paddingRight: '8px',
          flex: '1',
          justifyContent: 'center',
          maxWidth: 'calc(100% - 200px)'
        }}>
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => {
                const element = document.getElementById(section.id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#374151',
                fontSize: '13px', // Reduced font size
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px 6px', // Reduced padding
                whiteSpace: 'nowrap'
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>

        {/* Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
              background: 'none',
              border: '1px solid #e5e7eb',
              borderRadius: '50%',
              padding: '2px'
            }}
          >
            <img
              src="/profile-icon.png"
              alt="Profile"
              style={{
                height: '24px', // Reduced size
                width: '24px',
                borderRadius: '50%'
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='5'/><path d='M20 21v-2a7 7 0 0 0-14 0v2'/></svg>";
              }}
            />
          </button>
          {showLogout && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '8px',
              width: '150px', // Reduced width
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              padding: '4px',
              zIndex: 1001 // Ensure it's above other elements
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px', // Reduced padding
                  fontSize: '13px', // Reduced font size
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Image - Reduced height */}
      <div style={{ 
        width: '100%', 
        marginBottom: '20px', // Reduced margin
        marginTop: '0'
      }}>
        <img
          src="/campus-building.jpg"
          alt="Banner"
          style={{
            width: '100%',
            height: '100px', // Reduced from 120px
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/1920x200?text=Campus+Banner";
          }}
        />
      </div>

      {/* Main Content */}
      <main style={{   
        padding: '16px 12px', // Reduced padding
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {sections.map((section, index) => (
          <div
            key={index}
            id={section.id}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : (index % 2 === 0 ? 'row' : 'row-reverse'),
              alignItems: isMobile ? 'flex-start' : 'center',
              backgroundColor: '#efeaf2',
              borderRadius: '8px',
              padding: '16px', // Reduced padding
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '16px' // Reduced margin
            }}
          >
            {/* Section Image */}
            <div style={{
              flexShrink: 0,
              width: isMobile ? '100%' : '180px', // Reduced size on desktop, full width on mobile
              marginBottom: isMobile ? '16px' : '0' // Add bottom margin on mobile
            }}>
              <img
                src={section.image}
                alt={section.title}
                style={{
                  width: '100%',
                  height: isMobile ? '140px' : '120px', // Adjusted height
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://via.placeholder.com/400x300?text=${section.title.replace(' ', '+')}`;
                }}
              />
            </div>

            {/* Section Content */}
            <div style={{ 
              marginLeft: isMobile ? '0' : (index % 2 === 0 ? '16px' : '0'),
              marginRight: isMobile ? '0' : (index % 2 === 0 ? '0' : '16px'),
              flex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{
                  padding: '6px', // Reduced padding
                  borderRadius: '6px',
                  backgroundColor: '#49196c',
                  color: 'white',
                  marginRight: '10px' // Reduced margin
                }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  {section.title}
                </h2>
              </div>
              <p style={{ 
                color: '#4b5563', 
                marginTop: '6px', 
                marginBottom: '12px', 
                fontSize: '14px' // Reduced font size
              }}>
                {section.description}
              </p>
              <div>
                {section.actions.length === 3 ? (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {section.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => navigate(action.path)}
                        style={{
                          backgroundColor: '#49196c',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {section.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => navigate(action.path)}
                        style={{
                          backgroundColor: '#49196c',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminDashboard;