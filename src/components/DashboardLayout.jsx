import React, { useState, useEffect } from "react";
import { Footer } from "./ui/footer";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import {
  Building,
  LayoutDashboard,
  Users,
  Home,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { Toaster } from "@/components/ui/toaster";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [username, setUsername] = useState("User");
  const [userRole, setUserRole] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { toast } = useToast();
  const { user, token, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      navigate("/login");
      return;
    }

    if (user) {
      if (user.username) {
        setUsername(user.username);
      }
      if (user.role) {
        setUserRole(user.role);
      }
    }

    // Handle responsive sidebar
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsMobileView(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobileView(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, user, isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    // For head office/admin users
    if (userRole === "admin" || userRole === "headoffice") {
      return [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-3" />,
        },
        {
          name: "Subdivision's Manager",
          path: "/subordinates",
          icon: <Home className="h-5 w-3" />,
        },
        {
          name: "Renters Management",
          path: "/tenants",
          icon: <Users className="h-5 w-3" />,
        },
        {
          name: "Property Management",
          path: "/hierarchy",
          icon: <Building className="h-5 w-3" />,
        },
      ];
    }
    // For subordinate users
    else {
      return [
        {
          name: "Dashboard",
          path: "/subordinate-dashboard",
          icon: <LayoutDashboard className="h-5 w-3" />,
        },
        {
          name: "My Properties",
          path: "/subordinate-hierarchy",
          icon: <Building className="h-5 w-3" />,
        },
        {
          name: "My Renters",
          path: "/subordinate-tenants",
          icon: <Users className="h-5 w-3" />,
        },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#1A1D24]">
      {/* Sidebar with updated colors */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 transform bg-[#F5F8FA] dark:bg-[#31363F] shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#E2E8F0] dark:border-[#393E46]">
          <div className="flex items-center">
            <Building className="h-6 w-6 text-[#3B4A6B] dark:text-[#00ADB5] mr-2" />
            <span className="text-lg font-semibold text-[#334155] dark:text-[#EEEEEE]">
              Property Manager
            </span>
          </div>
          {isMobileView && (
            <Button
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="text-[#334155] dark:text-[#EEEEEE] hover:bg-[#E2E6EA] dark:hover:bg-[#3A3F47]"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  pathname === item.path
                    ? "bg-[#DDE4F4] text-[#2F4F9D] font-medium dark:bg-[#00ADB5]/15 dark:text-[#00ADB5]"
                    : "text-[#334155] dark:text-[#EEEEEE] hover:bg-[#E2E6EA] dark:hover:bg-[#3A3F47]"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar with specified colors */}
        <header className="bg-[#3B4A6B] dark:bg-[#222831] text-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                {isMobileView && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white hover:bg-[#4A5B7D] dark:hover:bg-[#3A3F47]"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white dark:text-[#EEEEEE]">
                    {username}
                  </span>
                </div>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center text-white hover:text-gray-300 hover:bg-[#E53E3E]/20 dark:hover:bg-[#00ADB5]/20"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-[#1A1D24] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
