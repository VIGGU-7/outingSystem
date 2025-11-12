import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScanLine, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';

interface OutingData {
  id: string;
  studentName: string;
  MIS: string;
  roomNumber: string;
  hostel: string;
  mobileNumber: string;
  purpose: string;
  place: string;
  outTime: string;
  outingType: 'General' | 'Special';
  parentContact?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

const ScanQR = () => {
  const [qrData, setQrData] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [outingData, setOutingData] = useState<OutingData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleScan = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    setIsScanning(true);
    try {
      const response = await fetch(`/api/v1/guard/outing/${qrData}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Outing not found');
      }

      const data = await response.json();
      setOutingData(data);
      setIsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch outing details');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'complete') => {
    if (!outingData) return;

    setActionLoading(action);
    try {
      const response = await fetch(`/api/v1/guard/outing/${outingData.id}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error(`Failed to ${action} outing`);

      toast.success(`Outing ${action}d successfully!`);
      setIsDialogOpen(false);
      setQrData('');
      setOutingData(null);
    } catch (error) {
      toast.error(`Failed to ${action} outing`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Scan QR Code</h1>
        <p className="text-muted-foreground">Scan or enter student outing QR code</p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Enter the QR code data or MIS number to view outing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qr-input">QR Code / MIS Number</Label>
            <div className="flex gap-2">
              <Input
                id="qr-input"
                placeholder="Paste QR data or enter MIS number"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              />
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Scan'
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <ScanLine className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Camera scanning feature will be integrated here
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Outing Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Outing Details</DialogTitle>
            <DialogDescription>
              Review the outing information and take action
            </DialogDescription>
          </DialogHeader>

          {outingData && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Student Name</Label>
                  <p className="font-medium">{outingData.studentName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">MIS Number</Label>
                  <p className="font-medium">{outingData.MIS}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Room Number</Label>
                  <p className="font-medium">{outingData.roomNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hostel</Label>
                  <p className="font-medium">{outingData.hostel}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mobile</Label>
                  <p className="font-medium">{outingData.mobileNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Out Time</Label>
                  <p className="font-medium">
                    {new Date(outingData.outTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Purpose</Label>
                  <p className="font-medium">{outingData.purpose}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Destination</Label>
                  <p className="font-medium">{outingData.place}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Outing Type</Label>
                  <p className="font-medium">{outingData.outingType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <StatusBadge status={outingData.status} />
                </div>
                {outingData.parentContact && (
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Parent Contact</Label>
                    <p className="font-medium">{outingData.parentContact}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction('reject')}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'reject' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reject
            </Button>
            <Button
              className="bg-completed hover:bg-completed/90"
              onClick={() => handleAction('complete')}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'complete' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Complete
            </Button>
            <Button
              className="bg-approved hover:bg-approved/90"
              onClick={() => handleAction('approve')}
              disabled={actionLoading !== null}
            >
              {actionLoading === 'approve' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScanQR;
