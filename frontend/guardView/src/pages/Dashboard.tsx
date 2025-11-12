import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalToday: number;
  approved: number;
  rejected: number;
  pending: number;
  completed: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalToday: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    completed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/guard/outings', {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch statistics');

        const outings = await response.json();
        const today = new Date().toDateString();

        const todayOutings = outings.filter(
          (o: any) => new Date(o.createdAt).toDateString() === today
        );

        setStats({
          totalToday: todayOutings.length,
          approved: todayOutings.filter((o: any) => o.status === 'approved').length,
          rejected: todayOutings.filter((o: any) => o.status === 'rejected').length,
          pending: todayOutings.filter((o: any) => o.status === 'pending').length,
          completed: todayOutings.filter((o: any) => o.status === 'completed').length,
        });
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Today',
      value: stats.totalToday,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-pending',
      bgColor: 'bg-pending/10',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-approved',
      bgColor: 'bg-approved/10',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-rejected',
      bgColor: 'bg-rejected/10',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of today's outing activities</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {isLoading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <a
                href="/dashboard/scan"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Scan QR Code</p>
                  <p className="text-sm text-muted-foreground">Verify student outing</p>
                </div>
              </a>
              <a
                href="/dashboard/pending"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-warning hover:bg-warning/5"
              >
                <div className="rounded-lg bg-warning/10 p-2">
                  <Package className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">View Pending</p>
                  <p className="text-sm text-muted-foreground">{stats.pending} waiting</p>
                </div>
              </a>
              <a
                href="/dashboard/history"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-accent hover:bg-accent/5"
              >
                <div className="rounded-lg bg-accent/10 p-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">History</p>
                  <p className="text-sm text-muted-foreground">View all records</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
