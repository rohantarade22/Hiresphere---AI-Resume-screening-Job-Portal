import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FiHome, FiSearch, FiBookmark, FiFileText, FiUser, FiBell, FiMenu, FiX, FiLogOut,
  FiBriefcase, FiUsers, FiCalendar, FiBarChart2, FiShield, FiCheckSquare, FiList,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { notificationsApi } from "../../api/client";

const candidateNavItems = [
  { to: "/candidate/dashboard", label: "Dashboard", icon: FiHome, end: true },
  { to: "/candidate/jobs", label: "Find Jobs", icon: FiSearch },
  { to: "/candidate/saved", label: "Saved Jobs", icon: FiBookmark },
  { to: "/candidate/applications", label: "Applications", icon: FiFileText },
  { to: "/candidate/profile", label: "Profile", icon: FiUser },
];

const recruiterNavItems = [
  { to: "/recruiter/dashboard", label: "Dashboard", icon: FiHome, end: true },
  { to: "/recruiter/jobs", label: "My Jobs", icon: FiBriefcase },
  { to: "/recruiter/interviews", label: "Interviews", icon: FiCalendar },
  { to: "/recruiter/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/recruiter/company", label: "Company", icon: FiUsers },
];

const adminNavItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: FiHome, end: true },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/approvals", label: "Approvals", icon: FiCheckSquare },
  { to: "/admin/jobs", label: "Jobs", icon: FiBriefcase },
  { to: "/admin/logs", label: "System Logs", icon: FiList },
];

const navByRole = { candidate: candidateNavItems, recruiter: recruiterNavItems, admin: adminNavItems };

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navItems = navByRole[role] || candidateNavItems;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface/40 shrink-0">
        <SidebarContent user={user} logout={logout} navItems={navItems} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-64 bg-base border-r border-border z-50 md:hidden flex flex-col"
            >
              <SidebarContent user={user} logout={logout} navItems={navItems} onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-base/80 backdrop-blur-md sticky top-0 z-30">
          <button
            className="md:hidden text-ink text-2xl"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
          <div className="hidden md:block" />
          <NotificationBell />
        </header>

        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ user, logout, navItems, onNavigate }) {
  return (
    <>
      <div className="h-16 flex items-center px-6 border-b border-border justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-display font-semibold text-ink">
          <span className="w-7 h-7 rounded-lg bg-signal-gradient flex items-center justify-center text-white text-sm">
            H
          </span>
          HireSphere
        </NavLink>
        {onNavigate && (
          <button onClick={onNavigate} className="text-ink-muted text-xl" aria-label="Close menu">
            <FiX />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-signal/15 text-signal-glow border border-signal/30"
                  : "text-ink-muted hover:text-ink hover:bg-surface-raised"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-signal-gradient flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ink font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-ink-faint truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
        >
          <FiLogOut size={16} /> Log out
        </button>
      </div>
    </>
  );
}

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list().then((r) => r.data.results || r.data),
    refetchInterval: 60_000, // light polling — good enough without a websocket layer
  });

  const unreadCount = (data || []).filter((n) => !n.is_read).length;

  return (
    <Link to="/notifications" className="relative text-ink-muted hover:text-ink transition-colors" aria-label="Notifications">
      <FiBell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-spark text-[10px] font-mono font-semibold text-base flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
