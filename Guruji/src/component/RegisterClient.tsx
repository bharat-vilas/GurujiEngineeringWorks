import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Trash2, Pencil, X, UserPlus, Users, Building2, MapPin, Mail, Phone, Hash } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import ResizableSplitPane from "./ResizableSplitPane";
import { api } from "../utils/api";

interface Client {
  _id?: string;
  name: string;
  firm: string;
  address: string;
  email?: string;
  phone?: string;
  gstin?: string;
  state?: string;
  pinCode?: string;
}

const emptyForm: Omit<Client, "_id"> = { name: "", firm: "", address: "", email: "", phone: "", gstin: "", state: "", pinCode: "" };

const RegisterClient = () => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const response = await api.get("/api/clients");
      if (response.ok) setClients(await response.json());
      else toast.error("Failed to load clients");
    } catch {
      toast.error("Error loading clients");
    }
  };

  const validate = (): boolean => {
    const errs: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) errs.name = "Client name is required";
    if (!form.firm.trim()) errs.firm = "Firm name is required";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name, firm: form.firm, address: form.address, email: form.email, phone: form.phone, gstin: form.gstin, state: form.state, pinCode: form.pinCode };
      const response = editingId
        ? await api.put(`/api/clients/${editingId}`, payload)
        : await api.post("/api/clients", payload);
      const data = await response.json();
      if (!response.ok) { toast.error(data.message || "Failed to save client"); return; }
      toast.success(editingId ? "Client updated successfully!" : "Client registered successfully!");
      setForm(emptyForm);
      setEditingId(null);
      loadClients();
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setForm({ name: client.name, firm: client.firm, address: client.address, email: client.email || "", phone: client.phone || "", gstin: client.gstin || "", state: client.state || "", pinCode: client.pinCode || "" });
    setEditingId(client._id || null);
    setErrors({});
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/api/clients/${id}`);
      if (response.ok) { toast.success("Client deleted."); loadClients(); }
      else toast.error("Failed to delete client");
    } catch {
      toast.error("Error deleting client");
    }
  };

  const handleCancel = () => { setForm(emptyForm); setEditingId(null); setErrors({}); };

  const field = (key: keyof typeof emptyForm) => ({
    value: form[key] || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <div className="h-full p-4 overflow-hidden">
      <ResizableSplitPane
        defaultLeftWidth={50}
        left={
          <div className="h-full overflow-y-auto custom-scrollbar pr-1">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <UserPlus className="h-4 w-4 text-orange-600" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    {editingId ? "Edit Client" : "Register New Client"}
                  </CardTitle>
                  {editingId && <Badge variant="warning" className="ml-auto text-xs">Editing</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Client Name *</Label>
                      <Input id="name" placeholder="Enter client name" {...field("name")}
                        className={errors.name ? "border-destructive" : ""} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="firm">Firm Name *</Label>
                      <Input id="firm" placeholder="Enter firm name" {...field("firm")}
                        className={errors.firm ? "border-destructive" : ""} />
                      {errors.firm && <p className="text-xs text-destructive">{errors.firm}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea id="address" placeholder="Enter complete address" rows={3}
                      {...field("address")} className={errors.address ? "border-destructive" : ""} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="client@email.com" {...field("email")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+91 98765 43210" {...field("phone")} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" placeholder="Enter GSTIN number" {...field("gstin")} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="e.g. Uttar Pradesh" {...field("state")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pinCode">Pin Code</Label>
                      <Input id="pinCode" placeholder="e.g. 201010" {...field("pinCode")} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" loading={loading} className="flex-1 gap-2">
                      <Save className="h-4 w-4" />
                      {editingId ? "Update Client" : "Register Client"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        }
        right={
          <div className="h-full overflow-y-auto custom-scrollbar pl-1">
            <Card className="shadow-sm h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-base font-bold">Registered Clients</CardTitle>
                  <Badge variant="secondary" className="ml-auto">{clients.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 rounded-full bg-muted mb-3">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No clients registered yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Add your first client using the form on the left</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clients.map(client => (
                      <div key={client._id}
                        className="group relative rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50/40 p-4 hover:shadow-md transition-all duration-200 hover:border-orange-200">
                        {/* Action buttons */}
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="outline"
                            className="h-7 w-7 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => handleEdit(client)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="outline"
                                className="h-7 w-7 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{client.name}</strong> from <strong>{client.firm}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => client._id && handleDelete(client._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <div className="space-y-2 pr-16">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.firm}</p>
                          </div>

                          <div className="space-y-1">
                            {client.address && (
                              <div className="flex items-start gap-1.5">
                                <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{client.address}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">{client.phone}</span>
                              </div>
                            )}
                            {client.gstin && (
                              <div className="flex items-center gap-1.5">
                                <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-xs font-mono text-muted-foreground">{client.gstin}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        }
      />
    </div>
  );
};

export default RegisterClient;
