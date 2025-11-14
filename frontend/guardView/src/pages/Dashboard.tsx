import { useEffect, useState } from "react";
import Sidebar from "../components/Dashboard/Sidebar";
import Navbar from "../components/Dashboard/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Package, XCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { apiInstance } from "@/lib/apiInstance";
import { Link } from "react-router-dom";

interface Stats {
  totalToday: number;
  approved: number;
  rejected: number;
  pending: number;
  completed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalToday: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    completed: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const toggleSidebar = () => setOpen((prev) => !prev);

  useEffect(() => {
    const getStats = async () => {
      try {
        setIsLoading(true);
        const response = await apiInstance.get("/stats");

        setStats({
          totalToday: response.data.data.totalOutings,
          approved: response.data.data.approvedOutings,
          rejected: response.data.data.rejectedOutings,
          pending: response.data.data.pendingOutings,
          completed: response.data.data.completedOutings,
        });
      } catch (err) {
        toast.error("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    getStats();
  }, []);

  const statCards = [
    {
      title: "Total Today",
      value: stats.totalToday,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="flex">
      <Sidebar isOpen={open} />

      <main className="flex-1 md:ml-64">
        <Navbar toggle={toggleSidebar} />

        <div className="p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Today's activity overview</p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((s) => (
              <Card key={s.title}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">
                    {s.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "…" : s.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-3">

              {/* Scan QR - use Link */}
              <Link
                to="/scan"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-primary/5 hover:border-primary transition"
              >
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Scan QR Code</p>
                  <p className="text-sm text-muted-foreground">
                    Verify student outing
                  </p>
                </div>
              </Link>

              {/* Pending */}
              <Link
                to="/pending"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-yellow-500/5 hover:border-yellow-500"
              >
                <Package className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">View Pending</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.pending} waiting
                  </p>
                </div>
              </Link>

              {/* History */}
              <Link
                to="/history"
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-accent/5 hover:border-accent"
              >
                <CheckCircle className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium">History</p>
                  <p className="text-sm text-muted-foreground">
                    View all records
                  </p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
