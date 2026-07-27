import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  TrendingUp, ChevronLeft, ChevronRight, Plus, Pencil, Trash2,
  Save, X, ArrowUpCircle, ArrowDownCircle, Wallet, Calendar,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { api } from "../utils/api";
import { cn } from "../lib/utils";

type TxType = "income" | "expense";

interface Transaction {
  _id: string;
  type: TxType;
  category: string;
  amount: number;
  date: string;
  description: string;
  reference: string;
  paymentMode: string;
}

const INCOME_CATS  = ["Project Payment", "Invoice", "Advance Received", "Contract", "Other Income"];
const EXPENSE_CATS = ["Raw Materials", "Labour", "Electricity", "Rent", "Machinery", "Transport", "Salaries", "Maintenance", "Office Supplies", "Other Expense"];
const PAYMENT_MODES = ["Cash", "Bank Transfer", "Cheque", "UPI", "Other"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const todayDate = new Date();
const todayStr  = todayDate.toISOString().split("T")[0];

const defaultForm = {
  type: "income" as TxType,
  category: "",
  amount: "",
  date: todayStr,
  description: "",
  reference: "",
  paymentMode: "Cash",
};

export default function Financials() {
  const [year, setYear]             = useState(todayDate.getFullYear());
  const [monthFilter, setMonthFilter] = useState(0); // 0 = all months
  const [typeFilter, setTypeFilter]   = useState<"all" | TxType>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]         = useState(false);

  const [showPanel, setShowPanel]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState(defaultForm);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);

  const isCurrentYear = year === todayDate.getFullYear();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/transactions?year=${year}`);
      if (res.ok) setTransactions(await res.json());
      else toast.error("Failed to load transactions");
    } catch { toast.error("Failed to load transactions"); }
    finally { setLoading(false); }
  }, [year]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter(t => {
        const m = new Date(t.date).getMonth() + 1;
        return (monthFilter === 0 || m === monthFilter) &&
               (typeFilter === "all" || t.type === typeFilter);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, monthFilter, typeFilter]);

  const totals = useMemo(() =>
    filtered.reduce(
      (acc, t) => { acc[t.type === "income" ? "income" : "expense"] += t.amount; return acc; },
      { income: 0, expense: 0 }
    ), [filtered]);

  const setF = (k: keyof typeof defaultForm, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const openAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setShowPanel(true);
  };

  const openEdit = (t: Transaction) => {
    setEditingId(t._id);
    setForm({
      type: t.type,
      category: t.category,
      amount: String(t.amount),
      date: t.date.split("T")[0],
      description: t.description,
      reference: t.reference,
      paymentMode: t.paymentMode,
    });
    setShowPanel(true);
  };

  const save = async () => {
    if (!form.category || !form.amount || !form.date) {
      toast.error("Category, amount and date are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      const res = editingId
        ? await api.put(`/api/transactions/${editingId}`, payload)
        : await api.post("/api/transactions", payload);
      if (!res.ok) { toast.error("Failed to save"); return; }
      const data = await res.json();
      if (editingId) {
        setTransactions(prev => prev.map(t => t._id === editingId ? data.transaction : t));
        toast.success("Transaction updated");
      } else {
        setTransactions(prev => [data.transaction, ...prev]);
        toast.success("Transaction added");
      }
      setShowPanel(false);
    } catch { toast.error("Error saving"); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      const res = await api.delete(`/api/transactions/${deleteId}`);
      if (res.ok) {
        setTransactions(prev => prev.filter(t => t._id !== deleteId));
        toast.success("Deleted");
      }
    } catch { toast.error("Error deleting"); }
    finally { setDeleteId(null); }
  };

  const cats = form.type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const net  = totals.income - totals.expense;
  const periodLabel = monthFilter ? `${MONTHS[monthFilter - 1]} ${year}` : `${year}`;

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 p-4 pb-0 space-y-3">
        <Card className="shadow-sm border-violet-100">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-100">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
                <CardTitle className="text-base font-bold">Turnover &amp; Expenses</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Year navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setYear(y => y - 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-sm min-w-[48px] text-center">{year}</span>
                  <button
                    onClick={() => setYear(y => y + 1)}
                    disabled={isCurrentYear}
                    className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg border border-border transition-colors",
                      isCurrentYear ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
                    )}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Month filter */}
                <select
                  value={monthFilter}
                  onChange={e => setMonthFilter(Number(e.target.value))}
                  className="h-8 text-sm border border-border rounded-lg px-2 bg-background focus:outline-none focus:ring-2 focus:ring-violet-200">
                  <option value={0}>All Months</option>
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>

                <Button
                  onClick={openAdd}
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white h-8 px-3 text-sm">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              label: `Income · ${periodLabel}`,
              value: fmt(totals.income),
              icon: ArrowUpCircle,
              color: "bg-emerald-100 text-emerald-800 border-emerald-200",
              iconCls: "text-emerald-600",
            },
            {
              label: `Expenses · ${periodLabel}`,
              value: fmt(totals.expense),
              icon: ArrowDownCircle,
              color: "bg-red-100 text-red-800 border-red-200",
              iconCls: "text-red-500",
            },
            {
              label: "Net Balance",
              value: `${net >= 0 ? "+" : ""}${fmt(net)}`,
              icon: Wallet,
              color: net >= 0
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200",
              iconCls: net >= 0 ? "text-emerald-600" : "text-red-500",
            },
            {
              label: "Transactions",
              value: filtered.length,
              icon: TrendingUp,
              color: "bg-violet-100 text-violet-800 border-violet-200",
              iconCls: "text-violet-600",
            },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} className={cn("rounded-xl border px-3 py-2.5 flex items-center gap-3", c.color)}>
                <Icon className={cn("h-5 w-5 flex-shrink-0", c.iconCls)} />
                <div className="min-w-0">
                  <div className="text-base font-bold leading-tight truncate">{c.value}</div>
                  <div className="text-[10px] font-medium leading-tight truncate">{c.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Type filter tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {(["all", "income", "expense"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                typeFilter === t
                  ? t === "income"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : t === "expense"
                    ? "bg-red-500 text-white shadow-sm"
                    : "bg-white shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              {t === "all" ? "All" : t === "income" ? "Income" : "Expenses"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction Table ── */}
      <div className="flex-1 p-4 pt-3 overflow-hidden">
        {loading ? (
          <Card className="h-full shadow-sm flex items-center justify-center border-violet-100">
            <p className="text-sm text-muted-foreground">Loading…</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="h-full shadow-sm flex items-center justify-center border-violet-100">
            <CardContent className="text-center py-12">
              <TrendingUp className="h-10 w-10 text-violet-200 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No transactions found.</p>
              <p className="text-xs text-muted-foreground mt-1">{periodLabel} has no records yet.</p>
              <Button onClick={openAdd} size="sm"
                className="mt-4 gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                <Plus className="h-4 w-4" /> Add First Transaction
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full shadow-sm overflow-hidden border-violet-100">
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-violet-700 text-white text-xs">
                    <th className="px-3 py-2.5 text-left font-semibold">Date</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Type</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Category</th>
                    <th className="px-3 py-2.5 text-left font-semibold">Description</th>
                    <th className="px-3 py-2.5 text-left font-semibold hidden md:table-cell">Reference</th>
                    <th className="px-3 py-2.5 text-left font-semibold hidden lg:table-cell">Mode</th>
                    <th className="px-3 py-2.5 text-right font-semibold">Amount</th>
                    <th className="px-3 py-2.5 text-center font-semibold w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, ri) => (
                    <tr key={t._id}
                      className={cn(
                        "border-b border-gray-100 hover:bg-violet-50/40 transition-colors",
                        ri % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      )}>
                      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(t.date)}
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-1.5 py-0 font-semibold",
                          t.type === "income"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        )}>
                          {t.type === "income" ? "Income" : "Expense"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium">{t.category}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground max-w-[180px] truncate">
                        {t.description || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">
                        {t.reference || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground hidden lg:table-cell">
                        {t.paymentMode}
                      </td>
                      <td className={cn(
                        "px-3 py-2 text-right text-sm font-bold whitespace-nowrap",
                        t.type === "income" ? "text-emerald-700" : "text-red-600"
                      )}>
                        {t.type === "income" ? "+" : "−"}{fmt(t.amount)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(t)}
                            className="h-6 w-6 flex items-center justify-center rounded hover:bg-violet-100 text-muted-foreground hover:text-violet-700 transition-colors">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(t._id)}
                            className="h-6 w-6 flex items-center justify-center rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Footer totals row */}
                <tfoot className="sticky bottom-0 z-10">
                  <tr className="bg-violet-50 border-t-2 border-violet-200">
                    <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-violet-700 hidden lg:table-cell">
                      Total ({filtered.length} records)
                    </td>
                    <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-violet-700 lg:hidden">
                      Total ({filtered.length})
                    </td>
                    <td className={cn(
                      "px-3 py-2 text-right text-sm font-bold whitespace-nowrap",
                      net >= 0 ? "text-emerald-700" : "text-red-600"
                    )}>
                      {net >= 0 ? "+" : "−"}{fmt(Math.abs(net))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ── Add / Edit Panel ── */}
      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <Card className="shadow-2xl border-violet-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-violet-600 text-white">
                <span className="font-semibold text-sm">
                  {editingId ? "Edit Transaction" : "Add Transaction"}
                </span>
                <button onClick={() => setShowPanel(false)} className="hover:text-violet-200 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="p-4 space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar">

                {/* Type toggle */}
                <div className="grid grid-cols-2 gap-2">
                  {(["income", "expense"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => { setF("type", t); setF("category", ""); }}
                      className={cn(
                        "py-2 rounded-lg border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2",
                        form.type === t
                          ? t === "income"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-400"
                            : "bg-red-100 text-red-800 border-red-400"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}>
                      {t === "income"
                        ? <><ArrowUpCircle className="h-4 w-4" /> Income</>
                        : <><ArrowDownCircle className="h-4 w-4" /> Expense</>}
                    </button>
                  ))}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Category *</Label>
                  <select
                    value={form.category}
                    onChange={e => setF("category", e.target.value)}
                    className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:outline-none focus:ring-2 focus:ring-violet-200">
                    <option value="">Select category…</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Amount + Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Amount (₹) *</Label>
                    <Input
                      type="number" min="0" step="0.01"
                      placeholder="0.00"
                      value={form.amount}
                      onChange={e => setF("amount", e.target.value)}
                      className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date *
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={e => setF("date", e.target.value)}
                      className="h-9 text-sm" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input
                    placeholder="Brief note…"
                    value={form.description}
                    onChange={e => setF("description", e.target.value)}
                    className="h-9 text-sm" />
                </div>

                {/* Reference + Payment Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Reference No.</Label>
                    <Input
                      placeholder="Invoice / Challan no."
                      value={form.reference}
                      onChange={e => setF("reference", e.target.value)}
                      className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                    <select
                      value={form.paymentMode}
                      onChange={e => setF("paymentMode", e.target.value)}
                      className="w-full h-9 text-sm border border-input rounded-md px-2 bg-background focus:outline-none focus:ring-2 focus:ring-violet-200">
                      {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 gap-2 bg-violet-600 hover:bg-violet-700 text-white h-9">
                    <Save className="h-4 w-4" /> {saving ? "Saving…" : editingId ? "Update" : "Save"}
                  </Button>
                  <Button onClick={() => setShowPanel(false)} variant="outline" className="h-9 px-4">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
