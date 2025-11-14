
import { useEffect, useState } from "react";
import PageShell from "../components/Dashboard/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiInstance } from "@/lib/apiInstance";

interface Outing {
    _id: string;
  studentName: string;
  rollNo: string;
  purpose: string;
  status: string;
  createdAt: string;
  fromTime?: string;
  toTime?: string;
}

export default function PendingPage() {
  const [outings, setOutings] = useState<Outing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const res = await apiInstance.get("getoutings?status=Pending");
        const data = res.data.data;
      setOutings(data);
      console.log(data)
    } catch {
      toast.error("Failed to load pending outings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const updateStatus = async (_id: string, status: "approved" | "rejected") => {
    try {
    
      setActionId(_id);
      console.log(_id)
      if(status==="approved"){
      const res = await apiInstance.post('/approve',{
        data:{_id}
      })
    }if(status==="rejected"){
        const res = await apiInstance.post('/reject',{
        data:{_id}
        })
        }
      toast.success(`Marked as ${status}`);
      setOutings((prev) => prev.filter((o) => o._id !== _id));
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionId(null);
    }
  };

  return (
    <PageShell
      title="Pending Outings"
      subtitle="Review and take action on pending outing requests"
    >
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-32 rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
                <div className="h-3 w-28 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && outings.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No pending outings</p>
              <p className="text-xs text-muted-foreground">
                All outing requests have been reviewed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && outings.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outings.map((outing) => (
            <Card key={outing._id} className="border-l-4 border-l-yellow-400">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {outing.studentName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {outing.rollNo}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-[11px] font-medium text-yellow-600">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Purpose:</span>{" "}
                  {outing.purpose}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requested: {new Date(outing.createdAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => updateStatus(outing._id, "approved")}
                    disabled={actionId === outing._id}
                    className="rounded-md bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {actionId === outing._id && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(outing._id, "rejected")}
                    disabled={actionId === outing._id}
                    className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {actionId === outing._id && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    Reject
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
