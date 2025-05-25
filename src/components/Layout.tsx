import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import {
  Calendar,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  User,
  Users,
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, userType } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  React.useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out",
          isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo and mobile close button */}
          <div className="flex items-center justify-between p-4">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="rounded-full bg-blue-500 p-1.5">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Healthnote+
              </span>
            </Link>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <Separator />

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            <Link
              to="/dashboard"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </Link>
            <Link
              to="/appointments"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Calendar className="mr-3 h-5 w-5" />
              Appointments
            </Link>
            <Link
              to="/reminders"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell className="mr-3 h-5 w-5" />
              Reminders
            </Link>
            {userType === "doctor" && (
              <Link
                to="/patients"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Users className="mr-3 h-5 w-5" />
                Patients
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <User className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Link>
          </nav>

          <Separator />

          {/* User info and logout */}
          <div className="p-4">
            <div className="mb-2 flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen && !isMobile ? "ml-64" : "ml-0",
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-6 w-6" />
              </Button>
            )}
            <div className="ml-auto flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {userType === "doctor" ? "Doctor" : "Patient"} Dashboard
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-800 bg-opacity-50 transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
