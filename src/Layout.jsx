import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  TreePine,
  LayoutDashboard,
  Upload,
  FileText,
  BarChart3,
  Menu,
  X,
  Leaf,
  Radio,
  Users,
  LogOut,
  User as UserIcon,
  Bell,
} from "lucide-react";
import { hasPermission, getRoleLabel } from "@/components/utils/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentPageName !== "Landing" && currentPageName !== "Auth") {
      base44.auth
        .me()
        .then((user) => setCurrentUser(user))
        .catch(() => {});
    }
  }, [currentPageName]);

  const isLanding = currentPageName === "Landing";
  const isAuth = currentPageName === "Auth";

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    {
      name: "Dashboard",
      page: "Dashboard",
      icon: LayoutDashboard,
      permission: "viewDashboard",
    },
    {
      name: "AI Analysis",
      page: "AIAnalysis",
      icon: Leaf,
      permission: "viewInsights",
    },
    {
      name: "Real-Time",
      page: "RealTimeMonitoring",
      icon: Radio,
      permission: "viewRealTime",
    },
    {
      name: "Insights",
      page: "Insights",
      icon: BarChart3,
      permission: "viewInsights",
    },
    { name: "Upload", page: "Upload", icon: Upload, permission: "uploadData" },
    {
      name: "Reports",
      page: "Reports",
      icon: FileText,
      permission: "viewReports",
    },
    {
      name: "Alerts",
      page: "AlertSettings",
      icon: Bell,
      permission: "viewDashboard",
    },
    {
      name: "Users",
      page: "UserManagement",
      icon: Users,
      permission: "viewUsers",
    },
  ].filter(
    (item) => !item.permission || hasPermission(currentUser, item.permission),
  );

  if (isLanding || isAuth) {
    return (
      <div className="min-h-screen bg-[#0A1F14]">
        <style>{`
          :root {
            --forest-900: #0A1F14;
            --forest-800: #0F2E1D;
            --forest-700: #1A4D30;
            --forest-600: #2D6A4F;
            --forest-500: #40916C;
            --forest-400: #52B788;
            --forest-300: #74C69D;
            --earth-900: #3D2914;
            --earth-700: #6B4423;
            --earth-500: #8B5A2B;
            --neutral-50: #FAFAF9;
            --neutral-100: #F5F5F4;
            --neutral-200: #E7E5E4;
          }
        `}</style>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7F5] via-[#FAFAF9] to-[#F0F4F0]">
      <style>{`
        :root {
          --forest-900: #0A1F14;
          --forest-800: #0F2E1D;
          --forest-700: #1A4D30;
          --forest-600: #2D6A4F;
          --forest-500: #40916C;
          --forest-400: #52B788;
          --forest-300: #74C69D;
          --earth-900: #3D2914;
          --earth-700: #6B4423;
          --earth-500: #8B5A2B;
          --neutral-50: #FAFAF9;
          --neutral-100: #F5F5F4;
          --neutral-200: #E7E5E4;
        }
      `}</style>

      {/* Top Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-[#2D6A4F]/5 border-b border-[#E7E5E4]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              to={createPageUrl("Landing")}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center shadow-lg shadow-[#2D6A4F]/30 group-hover:shadow-[#2D6A4F]/50 transition-all duration-300">
                <TreePine className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#52B788] rounded-full animate-pulse" />
              </div>
              <span className="text-xl font-bold text-[#0F2E1D] tracking-tight">
                Timber<span className="text-[#40916C]">AI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-[#2D6A4F] text-white shadow-lg shadow-[#2D6A4F]/30"
                        : "text-[#0F2E1D]/70 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}

              {/* User Menu */}
              {currentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="ml-2 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2D6A4F]/10 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#40916C] to-[#52B788] flex items-center justify-center text-white text-sm font-semibold">
                        {currentUser.full_name?.charAt(0) || "U"}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {currentUser.full_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentUser.email}
                      </p>
                      {currentUser.user_role && (
                        <Badge className="mt-1 text-xs bg-[#40916C]/10 text-[#2D6A4F] border-[#40916C]/20">
                          {getRoleLabel(currentUser.user_role)}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#2D6A4F]/10 text-[#2D6A4F] hover:bg-[#2D6A4F]/20 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-[#E7E5E4] shadow-xl">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-[#2D6A4F] text-white"
                        : "text-[#0F2E1D]/70 hover:bg-[#2D6A4F]/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-20 lg:pt-24 min-h-screen">{children}</main>
    </div>
  );
}
