import { NavLink } from "react-router-dom";
import { Home, Clock, History, ScanLine, LogOut } from "lucide-react";
import { toast } from "sonner";
import { apiInstance } from "@/lib/apiInstance";

interface SidebarProps {
  isOpen: boolean;
}

const links = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/scan", label: "Scan QR", icon: ScanLine },
  { to: "/pending", label: "Pending", icon: Clock },
  { to: "/history", label: "History", icon: History },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const handleLogout = async () => {
    try {
      await apiInstance.get("/logout"); // no need to store response
      toast.success("Logged out successfully");

      // Use navigation instead of force reload
      window.location.replace("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r bg-card px-6 py-6 shadow-lg transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
    >
      <h2 className="mb-6 text-2xl font-bold text-primary">Guard Panel</h2>

      {/* NAV LINKS */}
      <nav className="space-y-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition font-medium text-sm
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 transition hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
