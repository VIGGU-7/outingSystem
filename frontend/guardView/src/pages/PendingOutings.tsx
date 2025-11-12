import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

interface Outing {
  id: string;
  studentName: string;
  MIS: string;
  purpose: string;
  place: string;
  outTime: string;
  outingType: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const PendingOutings = () => {
  const [outings, setOutings] = useState<Outing[]>([]);
  const [filteredOutings, setFilteredOutings] = useState<Outing[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOutings = async () => {
      try {
        const response = await fetch('/api/v1/guard/outings', {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch outings');

        const data = await response.json();
        setOutings(data);
        setFilteredOutings(data);
      } catch (error) {
        toast.error('Failed to load outings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutings();
  }, []);

  useEffect(() => {
    let filtered = outings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (o) =>
          o.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.MIS.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOutings(filtered);
  }, [searchTerm, statusFilter, outings]);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'complete') => {
    try {
      const response = await fetch(`/api/v1/guard/outing/${id}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Failed to ${action}`);

      toast.success(`Outing ${action}d successfully!`);
      
      setOutings((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: action === 'complete' ? 'completed' : action === 'approve' ? 'approved' : 'rejected' } : o
        )
      );
    } catch (error) {
      toast.error(`Failed to ${action} outing`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Pending Outings</h1>
        <p className="text-muted-foreground">Manage and process student outings</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or MIS..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading outings...</p>
            </CardContent>
          </Card>
        ) : filteredOutings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No outings found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOutings.map((outing) => (
            <Card key={outing.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{outing.studentName}</CardTitle>
                    <p className="text-sm text-muted-foreground">MIS: {outing.MIS}</p>
                  </div>
                  <StatusBadge status={outing.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-medium">{outing.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{outing.place}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Out Time</p>
                    <p className="font-medium">
                      {new Date(outing.outTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{outing.outingType}</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="bg-approved hover:bg-approved/90"
                    onClick={() => handleAction(outing.id, 'approve')}
                    disabled={outing.status !== 'pending'}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleAction(outing.id, 'reject')}
                    disabled={outing.status !== 'pending'}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-completed hover:bg-completed/90"
                    onClick={() => handleAction(outing.id, 'complete')}
                    disabled={outing.status === 'completed' || outing.status === 'rejected'}
                  >
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingOutings;
