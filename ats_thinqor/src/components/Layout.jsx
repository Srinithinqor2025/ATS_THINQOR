import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useSelector((s) => s.auth || {});

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isAuthPage = location.pathname === "/" || location.pathname === "/signup";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col ${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 shadow-lg transition-all duration-300 flex-shrink-0`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={setSidebarCollapsed}
        />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-lg z-40 transform transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          collapsed={false}
          onToggle={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {getPageTitle(location.pathname)}
              </h1>
            </div>

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user.role?.toLowerCase().replace("_", " ")}
                  </div>
                </div>

                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full text-white flex items-center justify-center font-medium text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

const getPageTitle = (pathname) => {
  const titleMap = {
    "/admin-dashboard": "Admin Dashboard",
    "/dm-dashboard": "Delivery Manager Dashboard",
    "/tl-dashboard": "Team Lead Dashboard",
    "/recruiter-dashboard": "Recruiter Dashboard",
    "/users": "User Management",
    "/clients": "Client Management",
    "/requirements": "Job Requisitions",
    "/candidates": "Candidate Management",
    "/interviews": "Interview Management",
    "/reports": "Reports & Analytics",
    "/settings": "System Settings",
    "/create-requirement": "Create New Requirement",
    "/chat": "AI Assistant Chat",
    "/candidate-tracking": "Candidate Tracking",
    "/offers": "Offer Management",
  };

  return titleMap[pathname] || "Dashboard";
};

export default Layout;