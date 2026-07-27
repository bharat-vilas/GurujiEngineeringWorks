import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  CalendarCheck, ChevronLeft, ChevronRight, Save, X,
  Clock, UserCheck, UserX, Coffee, Umbrella, Info,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { cn } from "../lib/utils";

type Status = "present" | "absent" | "half-day" | "leave";

interface Employee {
  _id: string;
  name: string;
  designation: string;
  status: "active" | "inactive";
}

interface AttendanceRecord {
  _id: string;
  employee: Employee;
  date: string;
  status: Status;
  extraHours: number;
  note: string;
}

// key: `${empId}_${dayNum}`
type RecordMap = Record<string, AttendanceRecord>;

const STATUS_META: Record<Status, { label: string; short: string; bg: string; text: string; border: string; icon: any }> = {
  present:  { label: "Present",  short: "P",  bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", icon: UserCheck },
  absent:   { label: "Absent",   short: "A",  bg: "bg-red-100",     text: "text-red-800",     border: "border-red-300",     icon: UserX    },
  "half-day":{ label: "Half Day", short: "H", bg: "bg-amber-100",   text: "text-amber-800",   border: "border-amber-300",   icon: Coffee   },
  leave:    { label: "Leave",    short: "L",  bg: "bg-blue-100",    text: "text-blue-800",    border: "border-blue-300",    icon: Umbrella },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const today = new Date();

export default function Attendance() {
  const [month, setMonth] = useState(today.getMonth() + 1);   // 1-12
  const [year, setYear]   = useState(today.getFullYear());

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<RecordMap>({});
  const [loadingData, setLoadingData] = useState(false);

  // Floating edit panel
  const [editCell, setEditCell] = useState<{ empId: string; day: number; empName: string } | null>(null);
  const [cellStatus, setCellStatus] = useState<Status>("present");
  const [cellExtra, setCellExtra] = useState<string>("");
  const [cellNote, setCellNote]   = useState<string>("");
  const [saving, setSaving] = useState(false);

  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNumbers  = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Limit navigation: can only go up to current month
  const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear();
  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await api.get("/api/employees");
      if (res.ok) {
        const all: Employee[] = await res.json();
        setEmployees(all.filter(e => e.status === "active"));
      }
    } catch { toast.error("Failed to load employees"); }
  }, []);

  const fetchAttendance = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await api.get(`/api/attendance?month=${month}&year=${year}`);
      if (res.ok) {
        const data: AttendanceRecord[] = await res.json();
        const map: RecordMap = {};
        data.forEach(r => {
          const d = new Date(r.date).getDate();
          map[`${r.employee._id}_${d}`] = r;
        });
        setRecords(map);
      }
    } catch { toast.error("Failed to load attendance"); }
    finally { setLoadingData(false); }
  }, [month, year]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const getRecord = (empId: string, day: number) => records[`${empId}_${day}`];

  const openCell = (empId: string, day: number, empName: string) => {
    const existing = getRecord(empId, day);
    setCellStatus(existing?.status ?? "present");
    setCellExtra(existing?.extraHours ? String(existing.extraHours) : "");
    setCellNote(existing?.note ?? "");
    setEditCell({ empId, day, empName });
  };

  const saveCell = async () => {
    if (!editCell) return;
    setSaving(true);
    try {
      const dateObj = new Date(year, month - 1, editCell.day);
      const dateStr = dateObj.toISOString().split("T")[0];
      const res = await api.post("/api/attendance", {
        employeeId: editCell.empId,
        date: dateStr,
        status: cellStatus,
        extraHours: parseFloat(cellExtra) || 0,
        note: cellNote,
      });
      if (!res.ok) { toast.error("Failed to save"); return; }
      const { record } = await res.json();
      setRecords(prev => ({
        ...prev,
        [`${editCell.empId}_${editCell.day}`]: { ...record, employee: employees.find(e => e._id === editCell.empId)! },
      }));
      setEditCell(null);
      toast.success("Saved");
    } catch { toast.error("Error saving attendance"); }
    finally { setSaving(false); }
  };

  const clearCell = async () => {
    if (!editCell) return;
    const existing = getRecord(editCell.empId, editCell.day);
    if (!existing) { setEditCell(null); return; }
    setSaving(true);
    try {
      const res = await api.delete(`/api/attendance/${existing._id}`);
      if (res.ok) {
        setRecords(prev => {
          const next = { ...prev };
          delete next[`${editCell.empId}_${editCell.day}`];
          return next;
        });
        setEditCell(null);
        toast.success("Cleared");
      }
    } catch { toast.error("Error clearing"); }
    finally { setSaving(false); }
  };

  // Summary per employee
  const empSummary = (empId: string) => {
    let P = 0, A = 0, H = 0, L = 0, OT = 0;
    dayNumbers.forEach(d => {
      const r = getRecord(empId, d);
      if (!r) return;
      if (r.status === "present")   P++;
      if (r.status === "absent")    A++;
      if (r.status === "half-day")  H++;
      if (r.status === "leave")     L++;
      OT += r.extraHours || 0;
    });
    return { P, A, H, L, OT };
  };

  // Overall month summary
  const totalSummary = employees.reduce((acc, e) => {
    const s = empSummary(e._id);
    return { P: acc.P + s.P, A: acc.A + s.A, H: acc.H + s.H, L: acc.L + s.L, OT: acc.OT + s.OT };
  }, { P: 0, A: 0, H: 0, L: 0, OT: 0 });

  const dayLabel = (day: number) => {
    const d = new Date(year, month - 1, day);
    return ["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()];
  };
  const isSunday = (day: number) => new Date(year, month - 1, day).getDay() === 0;
  const isFutureDay = (day: number) => {
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d > t;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 p-4 pb-0 space-y-3">
        <Card className="shadow-sm border-teal-100">
          <CardHeader className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Title + Month Nav */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-teal-100">
                  <CalendarCheck className="h-5 w-5 text-teal-600" />
                </div>
                <CardTitle className="text-base font-bold">Attendance Register</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth}
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[130px] text-center">
                  <span className="font-semibold text-sm">{MONTHS[month - 1]} {year}</span>
                  {isCurrentMonth && (
                    <Badge variant="outline" className="ml-2 text-[10px] text-teal-600 border-teal-300">Current</Badge>
                  )}
                </div>
                <button onClick={nextMonth} disabled={isCurrentMonth}
                  className={cn(
                    "h-8 w-8 flex items-center justify-center rounded-lg border border-border transition-colors",
                    isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:bg-muted"
                  )}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Present Days",   value: totalSummary.P,         color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
            { label: "Absent Days",    value: totalSummary.A,         color: "bg-red-100 text-red-800 border-red-200"             },
            { label: "Half Days",      value: totalSummary.H,         color: "bg-amber-100 text-amber-800 border-amber-200"       },
            { label: "Leave Days",     value: totalSummary.L,         color: "bg-blue-100 text-blue-800 border-blue-200"          },
            { label: "Overtime Hrs",   value: `${totalSummary.OT}h`,  color: "bg-purple-100 text-purple-800 border-purple-200"    },
          ].map(c => (
            <div key={c.label} className={cn("rounded-xl border px-3 py-2 text-center", c.color)}>
              <div className="text-lg font-bold">{c.value}</div>
              <div className="text-[10px] font-medium">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Register Table ── */}
      <div className="flex-1 p-4 overflow-hidden">
        {employees.length === 0 ? (
          <Card className="h-full shadow-sm flex items-center justify-center">
            <CardContent className="text-center py-12">
              <CalendarCheck className="h-10 w-10 text-teal-200 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No active employees found.</p>
              <p className="text-xs text-muted-foreground mt-1">Add employees from the Employees section first.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full shadow-sm overflow-hidden border-teal-100">
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="border-collapse min-w-max w-full text-xs">
                <thead className="sticky top-0 z-20">
                  <tr>
                    {/* Sticky employee name header */}
                    <th className="sticky left-0 z-30 bg-teal-700 text-white px-3 py-2.5 text-left font-semibold min-w-[160px] border-r border-teal-600">
                      Employee
                    </th>
                    {dayNumbers.map(d => (
                      <th key={d}
                        className={cn(
                          "px-0 py-1.5 font-semibold text-center min-w-[34px] border-r border-teal-600",
                          isSunday(d) ? "bg-teal-900 text-teal-200" : "bg-teal-700 text-white",
                          d === today.getDate() && isCurrentMonth && "bg-teal-400 text-white"
                        )}>
                        <div className="text-[9px] leading-none">{dayLabel(d)}</div>
                        <div className="mt-0.5">{d}</div>
                      </th>
                    ))}
                    {/* Summary headers */}
                    {["P","A","H","L","OT"].map(s => (
                      <th key={s}
                        className={cn(
                          "sticky right-0 px-2 py-2.5 font-bold text-center min-w-[36px] bg-teal-800 text-white border-l border-teal-600",
                          s === "OT" && "min-w-[44px]"
                        )}>
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, ri) => {
                    const sum = empSummary(emp._id);
                    return (
                      <tr key={emp._id} className={ri % 2 === 0 ? "bg-white" : "bg-teal-50/40"}>
                        {/* Employee name */}
                        <td className={cn(
                          "sticky left-0 z-10 px-3 py-1.5 border-r border-gray-200 font-medium text-foreground",
                          ri % 2 === 0 ? "bg-white" : "bg-teal-50"
                        )}>
                          <div className="truncate max-w-[150px]">{emp.name}</div>
                          <div className="text-[9px] text-muted-foreground truncate">{emp.designation}</div>
                        </td>
                        {/* Day cells */}
                        {dayNumbers.map(d => {
                          const rec = getRecord(emp._id, d);
                          const meta = rec ? STATUS_META[rec.status] : null;
                          const future = isFutureDay(d);
                          const sunday = isSunday(d);
                          return (
                            <td key={d}
                              onClick={() => !future && openCell(emp._id, d, emp.name)}
                              className={cn(
                                "border border-gray-100 text-center align-middle select-none transition-colors relative",
                                future || sunday
                                  ? "opacity-30 cursor-default"
                                  : "cursor-pointer hover:brightness-95",
                                meta ? `${meta.bg}` : sunday ? "bg-gray-100" : "bg-transparent",
                                d === today.getDate() && isCurrentMonth && !meta && "bg-teal-50"
                              )}>
                              {meta ? (
                                <div className="flex flex-col items-center justify-center py-1 px-0.5 leading-none">
                                  <span className={cn("font-bold text-[11px]", meta.text)}>{meta.short}</span>
                                  {rec!.extraHours > 0 && (
                                    <span className="text-[8px] text-purple-600 font-semibold leading-none mt-0.5">
                                      +{rec!.extraHours}h
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-200 text-[10px]">·</span>
                              )}
                            </td>
                          );
                        })}
                        {/* Summary cells */}
                        {[
                          { v: sum.P,           cls: "text-emerald-700 font-bold" },
                          { v: sum.A,           cls: "text-red-600 font-bold"     },
                          { v: sum.H,           cls: "text-amber-700 font-bold"   },
                          { v: sum.L,           cls: "text-blue-700 font-bold"    },
                          { v: `${sum.OT}h`,    cls: "text-purple-700 font-semibold" },
                        ].map(({ v, cls }, i) => (
                          <td key={i}
                            className={cn(
                              "sticky right-0 border-l border-gray-200 text-center font-medium bg-teal-50 px-1",
                              cls
                            )}>
                            {v}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex-shrink-0 px-4 pb-3">
        <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Info className="h-3 w-3" /> Click any cell to mark attendance.</span>
          {(Object.entries(STATUS_META) as [Status, typeof STATUS_META[Status]][]).map(([, m]) => (
            <span key={m.short} className={cn("px-1.5 py-0.5 rounded font-semibold", m.bg, m.text)}>
              {m.short} = {m.label}
            </span>
          ))}
          <span className="px-1.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-700">+Nh = Overtime hrs</span>
        </div>
      </div>

      {/* ── Floating Edit Panel ── */}
      {editCell && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setEditCell(null)} />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
            <Card className="shadow-2xl border-teal-200 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-teal-600 text-white">
                <div>
                  <span className="font-semibold text-sm">{editCell.empName}</span>
                  <span className="text-teal-200 text-xs ml-2">
                    {editCell.day} {MONTHS[month - 1]} {year}
                  </span>
                </div>
                <button onClick={() => setEditCell(null)} className="hover:text-teal-200 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="p-4 space-y-4">
                {/* Status Buttons */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(STATUS_META) as [Status, typeof STATUS_META[Status]][]).map(([key, m]) => {
                      const Icon = m.icon;
                      return (
                        <button key={key}
                          onClick={() => setCellStatus(key)}
                          className={cn(
                            "flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all text-xs font-semibold",
                            cellStatus === key
                              ? `${m.bg} ${m.text} ${m.border} scale-105 shadow-sm`
                              : "border-border text-muted-foreground hover:bg-muted"
                          )}>
                          <Icon className="h-4 w-4" />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extra Hours — only for present or half-day */}
                {(cellStatus === "present" || cellStatus === "half-day") && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-purple-500" /> Extra / Overtime Hours
                    </Label>
                    <Input
                      type="number" min="0" max="12" step="0.5"
                      placeholder="0  (e.g. 2.5 for 2½ hours)"
                      value={cellExtra}
                      onChange={e => setCellExtra(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                )}

                {/* Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Note (optional)</Label>
                  <Input placeholder="e.g. Medical leave, field visit…"
                    value={cellNote} onChange={e => setCellNote(e.target.value)}
                    className="h-9 text-sm" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={saveCell} loading={saving}
                    className="flex-1 gap-2 bg-teal-600 hover:bg-teal-700 text-white h-9">
                    <Save className="h-4 w-4" /> Save
                  </Button>
                  {getRecord(editCell.empId, editCell.day) && (
                    <Button onClick={clearCell} variant="outline"
                      className="gap-1 text-red-500 border-red-200 hover:bg-red-50 h-9 px-3">
                      <X className="h-4 w-4" /> Clear
                    </Button>
                  )}
                  <Button onClick={() => setEditCell(null)} variant="outline" className="h-9 px-3">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
