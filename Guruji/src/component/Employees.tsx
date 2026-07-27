import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users, UserPlus, Pencil, Trash2, Save, X, Phone, Mail,
  MapPin, Briefcase, Calendar, IndianRupee, Building2, Search,
  CheckCircle2, XCircle, ChevronDown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { api } from "../utils/api";
import { cn } from "../lib/utils";

interface Employee {
  _id?: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  joiningDate: string;
  salary: string;
  status: "active" | "inactive";
  employeeType: "full-time" | "part-time";
}

const empty: Omit<Employee, "_id"> = {
  name: "", designation: "", department: "", phone: "",
  email: "", address: "", joiningDate: "", salary: "",
  status: "active", employeeType: "full-time",
};

const DEPARTMENTS = [
  "Production",
  "Machining",
  "Fabrication & Welding",
  "CNC Operations",
  "Quality Control",
  "Maintenance & Repair",
  "Store & Inventory",
  "Design & Engineering",
  "Dispatch & Logistics",
  "Administration",
  "Accounts",
  "Other",
];

const avatarColor = (name: string) => {
  const colors = [
    "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-purple-500",
    "bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const initials = (name: string) =>
  name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Partial<typeof empty>>({});
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get("/api/employees");
      if (res.ok) setEmployees(await res.json());
      else toast.error("Failed to load employees");
    } catch { toast.error("Error loading employees"); }
  };

  const set = (k: keyof typeof empty, v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const validate = (): boolean => {
    const errs: Partial<typeof empty> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.designation.trim()) errs.designation = "Designation is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : undefined };
      const res = editingId
        ? await api.put(`/api/employees/${editingId}`, payload)
        : await api.post("/api/employees", payload);
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to save"); return; }
      toast.success(editingId ? "Employee updated!" : "Employee added!");
      setForm(empty); setEditingId(null); setShowForm(false); setErrors({});
      load();
    } catch { toast.error("An error occurred"); }
    finally { setLoading(false); }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      name: emp.name, designation: emp.designation, department: emp.department || "",
      phone: emp.phone || "", email: emp.email || "", address: emp.address || "",
      joiningDate: emp.joiningDate ? emp.joiningDate.split("T")[0] : "",
      salary: emp.salary ? String(emp.salary) : "", status: emp.status,
      employeeType: emp.employeeType || "full-time",
    });
    setEditingId(emp._id!);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.delete(`/api/employees/${id}`);
      if (res.ok) { toast.success("Employee removed"); load(); }
      else toast.error("Failed to delete");
    } catch { toast.error("Error deleting employee"); }
  };

  const cancelForm = () => {
    setForm(empty); setEditingId(null); setShowForm(false); setErrors({});
  };

  const filtered = employees.filter(e => {
    const matchSearch = search === "" ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase()) ||
      (e.department || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const activeCount = employees.filter(e => e.status === "active").length;

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* ── Header ── */}
        <Card className="shadow-sm border-rose-100">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100">
                  <Users className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Employees</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeCount} active · {employees.length} total
                  </p>
                </div>
              </div>
              <Button
                onClick={() => { cancelForm(); setShowForm(true); }}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
                size="sm"
              >
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <Card className="shadow-sm border-rose-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-rose-700">
                  {editingId ? "Edit Employee" : "New Employee"}
                </CardTitle>
                <button onClick={cancelForm} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Full Name <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Ramesh Kumar" value={form.name}
                      onChange={e => set("name", e.target.value)}
                      className={cn("h-9 text-sm", errors.name && "border-destructive")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Designation <span className="text-destructive">*</span></Label>
                    <Input placeholder="e.g. Machinist, Welder, Helper" value={form.designation}
                      onChange={e => set("designation", e.target.value)}
                      className={cn("h-9 text-sm", errors.designation && "border-destructive")} />
                    {errors.designation && <p className="text-xs text-destructive">{errors.designation}</p>}
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Department</Label>
                    <div className="relative">
                      <select
                        value={form.department}
                        onChange={e => set("department", e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      >
                        <option value="">Select department</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <Input placeholder="e.g. 9876543210" value={form.phone}
                      onChange={e => set("phone", e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input type="email" placeholder="emp@example.com" value={form.email}
                      onChange={e => set("email", e.target.value)} className="h-9 text-sm" />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Joining Date</Label>
                    <Input type="date" value={form.joiningDate}
                      onChange={e => set("joiningDate", e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Monthly Salary (₹)</Label>
                    <Input type="number" placeholder="e.g. 15000" value={form.salary}
                      onChange={e => set("salary", e.target.value)} className="h-9 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Employee Type</Label>
                    <div className="relative">
                      <select
                        value={form.employeeType}
                        onChange={e => set("employeeType", e.target.value as "full-time" | "part-time")}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Status</Label>
                    <div className="relative">
                      <select
                        value={form.status}
                        onChange={e => set("status", e.target.value as "active" | "inactive")}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Input placeholder="Residential address" value={form.address}
                    onChange={e => set("address", e.target.value)} className="h-9 text-sm" />
                </div>

                <div className="flex gap-3 pt-1">
                  <Button type="submit" loading={loading} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
                    <Save className="h-4 w-4" /> {editingId ? "Update" : "Save Employee"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, designation or department..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors capitalize",
                  filterStatus === s
                    ? "bg-rose-600 text-white border-rose-600"
                    : "border-input bg-background text-muted-foreground hover:bg-muted"
                )}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Employee Cards ── */}
        {filtered.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 rounded-full bg-rose-50">
                <Users className="h-8 w-8 text-rose-300" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {employees.length === 0 ? "No employees added yet." : "No employees match your search."}
              </p>
              {employees.length === 0 && (
                <Button size="sm" onClick={() => setShowForm(true)} className="gap-2 bg-rose-600 hover:bg-rose-700 text-white">
                  <UserPlus className="h-3.5 w-3.5" /> Add First Employee
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(emp => (
              <Card key={emp._id} className="shadow-sm hover:shadow-md transition-shadow group border-rose-100">
                <CardContent className="p-4">
                  {/* Top row: avatar + name + status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0",
                      avatarColor(emp.name)
                    )}>
                      {initials(emp.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground truncate">{emp.name}</p>
                        <Badge
                          className={cn(
                            "text-[10px] px-1.5 py-0 h-4 flex-shrink-0 gap-1",
                            emp.status === "active"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          )}
                          variant="outline"
                        >
                          {emp.status === "active"
                            ? <CheckCircle2 className="h-2.5 w-2.5" />
                            : <XCircle className="h-2.5 w-2.5" />
                          }
                          {emp.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-rose-600 font-medium truncate">{emp.designation}</p>
                      <Badge
                        variant="outline"
                        className={cn(
                          "mt-0.5 text-[10px] px-1.5 py-0 h-4 w-fit",
                          emp.employeeType === "part-time"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {emp.employeeType === "part-time" ? "Part Time" : "Full Time"}
                      </Badge>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {emp.department && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span className="truncate">{emp.department}</span>
                      </div>
                    )}
                    {emp.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    {emp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                    {emp.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span className="truncate">{emp.address}</span>
                      </div>
                    )}
                    {emp.joiningDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span>Joined {new Date(emp.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    )}
                    {emp.salary && (
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
                        <span>₹{Number(emp.salary).toLocaleString("en-IN")} / month</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-rose-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline"
                      onClick={() => handleEdit(emp)}
                      className="flex-1 h-7 text-xs gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline"
                          className="flex-1 h-7 text-xs gap-1.5 border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3 w-3" /> Remove
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Employee</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove <strong>{emp.name}</strong> from the system? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(emp._id!)}>
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
