import { useEffect, useRef, useState } from "react";
import PageShell from "../components/Dashboard/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { Loader2, ScanLine, Search } from "lucide-react";
import { apiInstance } from "@/lib/apiInstance";

interface Outing {
  _id: string;
  studentName: string;
  MIS: string;
  purpose: string;
  status: string;
  createdAt: string;
}

export default function ScanPage() {
  const [manualCode, setManualCode] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [outing, setOuting] = useState<Outing | null>(null);

  const scanningRef = useRef(false);
  const qrRef = useRef<Html5Qrcode | null>(null);

  // START SCANNER
  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });

        if (!isMounted) return;

        const scanner = new Html5Qrcode("qr-reader");
        qrRef.current = scanner;

        scanner
          .start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            async (decodedText) => {
              if (!scanningRef.current) {
                scanningRef.current = true;

                await lookupOutingById(decodedText.trim());

                setTimeout(() => {
                  scanningRef.current = false;
                }, 2000);
              }
            },
            (errorMessage) => {
              // ignore frequent decode errors
              // console.log("Scan error:", errorMessage);
            }
          )
          .catch((err) => {
            console.error("Scanner start failed:", err);
            toast.error("Unable to start camera scanner.");
          });
      } catch (err) {
        console.error("Camera permission error:", err);
        toast.error("Please allow camera access.");
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // MANUAL LOOKUP BY MIS
  const lookupByMIS = async (mis: string) => {
    if (!/^\d{9}$/.test(mis)) {
      return toast.error("MIS must be exactly 9 digits");
    }

    try {
      setIsLookingUp(true);
      setOuting(null);

      const res = await apiInstance.get(`/getoutings/${mis}`);
      setOuting(res.data.data);

      toast.success("Outing loaded");
    } catch {
      toast.error("Outing not found");
    } finally {
      setIsLookingUp(false);
    }
  };

  // LOOKUP BY OUTING ID (FROM QR)
  const lookupOutingById = async (id: string) => {
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return toast.error("Invalid QR code");
    }

    try {
      setIsLookingUp(true);
      setOuting(null);

      const res = await apiInstance.get(`/getoutings/id/${id}`);
      setOuting(res.data.data);

      toast.success("QR matched");
    } catch {
      toast.error("Outing not found");
    } finally {
      setIsLookingUp(false);
    }
  };

  // UPDATE OUTING STATUS
  const updateStatus = async (
    status: "Approved" | "Rejected" | "Completed"
  ) => {
    if (!outing) return;

    const endpoint =
      status === "Approved"
        ? "/approve"
        : status === "Rejected"
        ? "/reject"
        : "/complete";

    try {
      await apiInstance.post(endpoint, { data: { _id: outing._id } });
      setOuting({ ...outing, status });

      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <PageShell title="Scan QR" subtitle="Scan QR (ID) or enter MIS manually">
      <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
        
        {/* CAMERA SCANNER */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5 text-primary" />
              Camera Scan (QR = Outing ID)
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div
              id="qr-reader"
              className="overflow-hidden rounded-xl border aspect-square max-w-md mx-auto bg-black"
            />
            <p className="text-xs text-muted-foreground text-center">
              Scan the QR code from student's pass.
            </p>
          </CardContent>
        </Card>

        {/* RIGHT PANEL */}
        <div className="space-y-4">

          {/* MANUAL MIS LOOKUP */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Manual MIS Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={manualCode}
                  maxLength={9}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter 9-digit MIS"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                />

                <button
                  onClick={() => lookupByMIS(manualCode)}
                  disabled={!/^\d{9}$/.test(manualCode) || isLookingUp}
                  className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isLookingUp && <Loader2 className="h-4 w-4 animate-spin" />}
                  Lookup
                </button>
              </div>
            </CardContent>
          </Card>

          {/* OUTING DETAILS */}
          <Card>
            <CardHeader>
              <CardTitle>Outing Details</CardTitle>
            </CardHeader>

            <CardContent>
              {!outing && !isLookingUp && (
                <p className="text-sm text-muted-foreground">
                  Scan a QR or enter MIS to view outing details.
                </p>
              )}

              {isLookingUp && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading outing…
                </div>
              )}

              {outing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{outing.studentName}</span>
                    <span className="text-muted-foreground">{outing.MIS}</span>
                  </div>

                  <p className="text-sm">
                    <span className="font-medium">Purpose:</span>{" "}
                    {outing.purpose}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(outing.createdAt).toLocaleString()}
                  </p>

                  <p className="text-xs">
                    <span className="font-semibold">Status:</span>{" "}
                    {outing.status}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {outing.status === "Pending" && (
                      <>
                        <button
                          onClick={() => updateStatus("Approved")}
                          className="bg-green-600/10 text-green-700 px-3 py-1.5 rounded-md text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => updateStatus("Rejected")}
                          className="bg-red-600/10 text-red-700 px-3 py-1.5 rounded-md text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {outing.status === "Approved" && (
                      <button
                        onClick={() => updateStatus("Completed")}
                        className="bg-blue-600/10 text-blue-700 px-3 py-1.5 rounded-md text-xs"
                      >
                        Completed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
