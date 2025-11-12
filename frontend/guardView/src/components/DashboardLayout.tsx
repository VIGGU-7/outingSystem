import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  ScanLine, 
  Clock, 
  History, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { guard, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/scan', icon: ScanLine, label: 'Scan QR' },
    { to: '/dashboard/pending', icon: Clock, label: 'Pending Outings' },
    { to: '/dashboard/history', icon: History, label: 'History' },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar">
        <div className="flex h-full flex-col">
          {/* Logo/Header */}
          <div className="flex items-center gap-3 border-b border-sidebar-border p-6">
            <ShieldCheck className="h-8 w-8 text-sidebar-primary" />
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">Guard Portal</h1>
              <p className="text-xs text-sidebar-foreground/60">Outing System</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
              <p className="text-sm font-medium text-sidebar-foreground">{guard?.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{guard?.guardId}</p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
