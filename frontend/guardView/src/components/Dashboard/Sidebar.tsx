import { NavLink } from "react-router-dom";
import { Home, Clock, Package, History, ScanLine, LogOut } from "lucide-react";
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
  const handleLogout = async() => {
    try{
      const response=await apiInstance.get('/logout')
      toast.success("Logged out successfully")
      window.location.href="/login"
    }catch(err){
      toast.error("Logout failed")
  }
  };
  return (
    <aside
      className={`fixed left-0 top-0 z-50 h-full w-64 border-r bg-card px-6 py-6 shadow-lg transition-transform duration-200
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      <h2 className="mb-6 text-2xl font-bold text-primary">Guard Panel</h2>

      <nav className="space-y-2">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition 
              ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
          <LogOut className="h-5 w-5"/>
          Logout
        </button>
      </div>
    </aside>
  );
}
