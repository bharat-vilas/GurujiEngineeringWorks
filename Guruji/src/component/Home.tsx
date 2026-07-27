import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { FileText, Receipt, Truck, Check, Trash2, ClipboardList, RefreshCw } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { api } from "../utils/api";
import { cn } from "../lib/utils";

interface QueueItem {
  _id: string;
  type: "quotation" | "billing" | "challan";
  documentNumber: string;
  clientName: string;
  clientFirm: string;
  amount: number;
  documentDate: string | null;
  status: "pending" | "checked";
  checkedAt: string | null;
  createdAt: string;
}

const TYPE_META = {
  quotation: { label: "Quotation", icon: FileText, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  billing:   { label: "Invoice",   icon: Receipt,  color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200",  badge: "bg-purple-100 text-purple-700 border-purple-300" },
  challan:   { label: "Challan",   icon: Truck,    color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700 border-blue-300" },
};

type FilterTab = "all" | "pending" | "checked";

export default function Home() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("pending");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/document-queue");
      if (res.ok) setItems(await res.json());
      else toast.error("Failed to load queue");
    } catch {
      toast.error("Error loading queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCheck = async (item: QueueItem) => {
    const endpoint = item.status === "pending" ? "check" : "uncheck";
    try {
      const res = await api.patch(`/api/document-queue/${item._id}/${endpoint}`);
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
        toast.success(item.status === "pending" ? "Marked as done" : "Moved back to pending");
      }
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/api/document-queue/${id}`);
      if (res.ok) {
        setItems(prev => prev.filter(i => i._id !== id));
        toast.success("Removed from queue");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = useMemo(() =>
    filter === "all" ? items : items.filter(i => i.status === filter),
    [items, filter]
  );

  const pendingCount = useMemo(() => items.filter(i => i.status === "pending").length, [items]);
  const pendingByType = useMemo(() => ({
    quotation: items.filter(i => i.status === "pending" && i.type === "quotation").length,
    billing:   items.filter(i => i.status === "pending" && i.type === "billing").length,
    challan:   items.filter(i => i.status === "pending" && i.type === "challan").length,
  }), [items]);

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "checked", label: "Done (last 30 days)" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Pending" value={pendingCount} color="amber" />
        <StatCard label="Quotations" value={pendingByType.quotation} color="emerald" />
        <StatCard label="Invoices" value={pendingByType.billing} color="purple" />
        <StatCard label="Challans" value={pendingByType.challan} color="blue" />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber-600" />
          Document Queue
        </h2>
        <Button size="sm" variant="outline" onClick={load} className="h-8 gap-1.5 text-xs">
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              filter === t.id
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {t.id === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {filter === "pending" ? "No pending documents" : filter === "checked" ? "No completed documents in last 30 days" : "Queue is empty"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">Documents appear here when you download a PDF</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const meta = TYPE_META[item.type];
            const Icon = meta.icon;
            const done = item.status === "checked";
            return (
              <div
                key={item._id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-all",
                  done
                    ? "bg-gray-50 border-gray-200 opacity-70"
                    : `${meta.bg} ${meta.border}`
                )}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleCheck(item)}
                  className={cn(
                    "flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    done
                      ? "bg-green-500 border-green-500 text-white"
                      : `border-gray-300 hover:border-green-400 bg-white`
                  )}
                  title={done ? "Mark as pending" : "Mark as done"}
                >
                  {done && <Check className="h-3.5 w-3.5" />}
                </button>

                {/* Type icon */}
                <div className={cn("flex-shrink-0 p-1.5 rounded-lg", done ? "bg-gray-100" : `${meta.bg} border ${meta.border}`)}>
                  <Icon className={cn("h-4 w-4", done ? "text-gray-400" : meta.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", meta.badge)}>
                      {meta.label}
                    </span>
                    <span className={cn("text-sm font-semibold", done ? "line-through text-muted-foreground" : "text-foreground")}>
                      {item.documentNumber}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">{item.clientName}</span>
                    {item.clientFirm && (
                      <span className="text-xs text-muted-foreground/60">— {item.clientFirm}</span>
                    )}
                  </div>
                </div>

                {/* Amount + date */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className={cn("text-sm font-semibold", done ? "text-muted-foreground" : meta.color)}>
                    {fmt(item.amount)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{fmtDate(item.documentDate)}</div>
                </div>

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove from Queue</AlertDialogTitle>
                      <AlertDialogDescription>
                        Remove <strong>{item.documentNumber}</strong> for <strong>{item.clientName}</strong> from the queue?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(item._id)}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    amber:   "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    purple:  "border-purple-200 bg-purple-50 text-purple-700",
    blue:    "border-blue-200 bg-blue-50 text-blue-700",
  };
  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-1", colorMap[color])}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}
