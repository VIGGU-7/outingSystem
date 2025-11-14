import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/Dashboard/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiInstance } from "@/lib/apiInstance";

interface Outing {
  _id: string;
  studentName: string;
  MIS: string;
  Hostel: string;
  roomNo: string;
  mobileNumber: string;
  outingType: string;
  purpose: string;
  place: string;

  approvedBy?: string | null;
  rejectedBy?: string | null;
  completedBy?: string | null;

  status: "Pending" | "Approved" | "Rejected" | "Completed";

  createdAt: string;
  outTime?: string | null;
  inTime?: string | null;
}

const statusColors: Record<Outing["status"], string> = {
  Pending: "bg-yellow-500/10 text-yellow-700",
  Approved: "bg-green-500/10 text-green-700",
  Rejected: "bg-red-500/10 text-red-700",
  Completed: "bg-blue-500/10 text-blue-700",
};

export default function HistoryPage() {
  const [outings, setOutings] = useState<Outing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<
    "all" | Outing["status"]
  >("all");

  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await apiInstance("/getoutings");
      setOutings(res.data.data);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = useMemo(() => {
    return outings.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;

      if (search) {
        const term = search.toLowerCase();
        if (
          !(
            o.studentName.toLowerCase().includes(term) ||
            o.MIS.toLowerCase().includes(term) ||
            o.purpose.toLowerCase().includes(term) ||
            o.mobileNumber?.toLowerCase().includes(term) ||
            o.approvedBy?.toLowerCase().includes(term) ||
            o.rejectedBy?.toLowerCase().includes(term) ||
            o.completedBy?.toLowerCase().includes(term)
          )
        )
          return false;
      }

      if (fromDate && new Date(o.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(o.createdAt) > new Date(toDate)) return false;

      return true;
    });
  }, [outings, statusFilter, search, fromDate, toDate]);

  const downloadCsv = () => {
    if (filtered.length === 0) {
      toast.error("No records to download");
      return;
    }

    const headers = [
      "Student Name",
      "MIS",
      "Hostel/Room",
      "Phone",
      "Outing Type",
      "Purpose",
      "Place",
      "Action By",
      "Status",
      "Requested At",
      "Out Time",
      "In Time",
    ];

    const rows = filtered.map((o) => [
      o.studentName,
      o.MIS,
      `${o.Hostel} / ${o.roomNo}`,
      o.mobileNumber,
      o.outingType,
      o.purpose,
      o.place,

      o.status === "Approved"
        ? o.approvedBy || "-"
        : o.status === "Rejected"
        ? o.rejectedBy || "-"
        : o.status === "Completed"
        ? o.completedBy || "-"
        : "-",

      o.status,

      new Date(o.createdAt).toLocaleString(),
      o.outTime ? new Date(o.outTime).toLocaleString() : "",
      o.inTime ? new Date(o.inTime).toLocaleString() : "",
    ]);

    const csv =
      [headers, ...rows]
        .map((row) =>
          row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "outings-history.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageShell title="History" subtitle="View all records & export CSV">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything…"
            className="rounded-lg border px-3 py-2 text-sm md:col-span-2"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as any)
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-1/2 rounded-lg border px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-1/2 rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={downloadCsv}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground md:justify-self-end"
          >
            <ArrowDownToLine className="h-4 w-4" />
            Download CSV
          </button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex justify-between">
          <CardTitle>Records</CardTitle>
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {outings.length}
          </p>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading history…
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No records found.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">MIS</th>
                  <th className="px-3 py-2">Hostel/Room</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Outing Type</th>
                  <th className="px-3 py-2">Purpose</th>
                  <th className="px-3 py-2">Place</th>

                  <th className="px-3 py-2">Action By</th>

                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Requested</th>
                  <th className="px-3 py-2">Out Time</th>
                  <th className="px-3 py-2">In Time</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id} className="border-b last:border-0">
                    <td className="px-3 py-2">{o.studentName}</td>
                    <td className="px-3 py-2">{o.MIS}</td>
                    <td className="px-3 py-2">{o.Hostel} / {o.roomNo}</td>
                    <td className="px-3 py-2">{o.mobileNumber}</td>
                    <td className="px-3 py-2">{o.outingType}</td>
                    <td className="px-3 py-2">{o.purpose}</td>
                    <td className="px-3 py-2">{o.place}</td>

                    {/* Action By */}
                    <td className="px-3 py-2">
                      {o.status === "Approved"
                        ? o.approvedBy || "-"
                        : o.status === "Rejected"
                        ? o.rejectedBy || "-"
                        : o.status === "Completed"
                        ? o.completedBy || "-"
                        : "-"}
                    </td>

                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusColors[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-xs">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>

                    <td className="px-3 py-2 text-xs">
                      {o.outTime ? new Date(o.outTime).toLocaleString() : "-"}
                    </td>

                    <td className="px-3 py-2 text-xs">
                      {o.inTime ? new Date(o.inTime).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
