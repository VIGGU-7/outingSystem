import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

interface HistoryItem {
  id: string;
  studentName: string;
  MIS: string;
  purpose: string;
  place: string;
  outTime: string;
  inTime?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  updatedAt: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/v1/guard/outings', {
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch history');

        const data = await response.json();
        const sortedData = data.sort(
          (a: HistoryItem, b: HistoryItem) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setHistory(sortedData);
        setFilteredHistory(sortedData);
      } catch (error) {
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = history.filter(
        (item) =>
          item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.MIS.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchTerm, history]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Outing History</h1>
        <p className="text-muted-foreground">Complete record of all processed outings</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or MIS..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading history...</p>
            </CardContent>
          </Card>
        ) : filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No history found</p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.studentName}</CardTitle>
                    <p className="text-sm text-muted-foreground">MIS: {item.MIS}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Purpose</p>
                    <p className="font-medium">{item.purpose}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Destination</p>
                    <p className="font-medium">{item.place}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Out Time</p>
                    <p className="font-medium">
                      {new Date(item.outTime).toLocaleString()}
                    </p>
                  </div>
                  {item.inTime && (
                    <div>
                      <p className="text-sm text-muted-foreground">In Time</p>
                      <p className="font-medium">
                        {new Date(item.inTime).toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(item.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
