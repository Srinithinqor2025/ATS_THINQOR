import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  UserCheck,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import thinqhireLogo from "../assets/thinqhirelogo.png";

const Sidebar = ({ collapsed, onToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth || {});

  const role = (() => {
    if (!user) return "PUBLIC";
    switch (user?.role?.toUpperCase()) {
      case "ADMIN":
        return "ADMIN";
      case "DM":
      case "DELIVERY_MANAGER":
        return "DM";
      case "TL":
      case "TEAM_LEAD":
        return "TL";
      case "RECRUITER":
        return "RECRUITER";
      default:
        return "PUBLIC";
    }
  })();

  const menuItems = {
    ADMIN: [
      { key: "dashboard", to: "/admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "users", to: "/users", label: "Users", icon: Users },
      { key: "clients", to: "/clients", label: "Clients", icon: Building2 },
      { key: "requirements", to: "/requirements", label: "Requisitions", icon: FileText },
      { key: "candidates", to: "/candidates", label: "Candidates", icon: UserCheck },
      { key: "interviews", to: "/interviews", label: "Interviews", icon: Calendar },
      { key: "reports", to: "/reports", label: "Reports", icon: BarChart3 },
      { key: "chat", to: "/chat", label: "AI Chat", icon: MessageSquare },
      { key: "settings", to: "/settings", label: "Settings", icon: Settings },
      { key: "create-requirement", to: "/create-requirement", label: "Create Req", icon: Plus },
    ],
    DM: [
      { key: "dashboard", to: "/dm-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "clients", to: "/clients", label: "Clients", icon: Building2 },
      { key: "requirements", to: "/requirements", label: "Requisitions", icon: FileText },
      { key: "create-requirement", to: "/create-requirement", label: "Create Req", icon: Plus },
      { key: "candidates", to: "/candidates", label: "Candidates", icon: UserCheck },
      { key: "interviews", to: "/interviews", label: "Interviews", icon: Calendar },
      { key: "reports", to: "/reports", label: "Reports", icon: BarChart3 },
    ],
    TL: [
      { key: "dashboard", to: "/tl-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "clients", to: "/clients", label: "Clients", icon: Building2 },
      { key: "requirements", to: "/requirements", label: "Requisitions", icon: FileText },
      { key: "candidates", to: "/candidates", label: "Candidates", icon: UserCheck },
      { key: "interviews", to: "/interviews", label: "Interviews", icon: Calendar },
      { key: "reports", to: "/reports", label: "Reports", icon: BarChart3 },
    ],
    RECRUITER: [
      { key: "dashboard", to: "/recruiter-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "candidates", to: "/candidates", label: "Candidates", icon: UserCheck },
      { key: "interviews", to: "/interviews", label: "Interviews", icon: Calendar },
    ],
  };

  const items = menuItems[role] || [];

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => navigate("/"));
  };

  const handleLogoClick = () => {
    if (!user) return;

    navigate(
      role === "RECRUITER"
        ? "/recruiter-dashboard"
        : role === "DM"
        ? "/dm-dashboard"
        : role === "TL"
        ? "/tl-dashboard"
        : "/admin-dashboard"
    );
  };

  return (
    <div className="h-screen bg-white border-r border-gray-200 shadow-lg flex flex-col">
      {/* Header */}
      <div className="relative flex items-center justify-center p-4 border-b border-gray-200 flex-shrink-0 min-h-[88px]">
        {!collapsed ? (
          <img
            src={thinqhireLogo}
            alt="ThinqHire Logo"
            className="w-[110px] h-auto object-contain cursor-pointer"
            onClick={handleLogoClick}
          />
        ) : (
          <img
            src={thinqhireLogo}
            alt="ThinqHire Logo"
            className="w-10 h-10 object-contain cursor-pointer"
            onClick={handleLogoClick}
          />
        )}

        <button
          onClick={() => onToggle(!collapsed)}
          className="absolute right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600"
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {user && !collapsed && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg mb-3">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-500 capitalize">{role.toLowerCase()}</div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} w-full px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;