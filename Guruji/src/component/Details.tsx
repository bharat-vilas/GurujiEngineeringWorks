import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Download, Plus, Trash2, User, Building2, MapPin, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";
import { Badge } from "../components/ui/badge";
import { api } from "../utils/api";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { sendEmail } from "../utils/email";

interface ClientOption {
  label: string;
  value: string;
  firm: string;
  address: string;
  email: string;
  state: string;
  pinCode: string;
}

export default function Details({
  setClientInfo, clientInfo, setRecipientEmail, recipientEmail,
  setQuotationDate, quotationDate, handleAddItem, downloadPDF,
  handleCellChange, handleDeleteItem, items,
}: any) {
  const [clientOptions, setClientOptions] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const { isAuthenticated, authenticate } = useEmailAuth();

  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const response = await api.get("/api/clients");
        if (response.ok) {
          const clients = await response.json();
          setClientOptions(clients.map((c: any) => ({
            label: `${c.name} — ${c.firm}`,
            value: c.name,
            firm: c.firm,
            address: c.address,
            email: c.email || "",
            state: c.state || "",
            pinCode: c.pinCode || "",
          })));
        } else {
          toast.error("Failed to load clients");
        }
      } catch {
        toast.error("Error loading clients");
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const totalAmount = items.reduce((sum: number, item: any) => sum + item.rate * item.qty, 0);

  const handleSendEmail = async () => {
    if (!recipientEmail) { toast.error("Please enter recipient email address"); return; }
    if (!isAuthenticated) {
      toast.warning("Please authenticate with Google to send emails");
      await authenticate();
      return;
    }
    try {
      const tid = toast.loading("Sending email...");
      await sendEmail({
        to: recipientEmail,
        subject: "Quotation - Guruji Engineering Works",
        textBody: `Dear ${clientInfo.name || "Client"},\n\nPlease find attached your quotation from Guruji Engineering Works.\n\nThank you for your business.`,
      });
      toast.dismiss(tid);
      toast.success("Email sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send email.");
    }
  };

  const handleClientSelect = (value: string) => {
    if (!value) {
      setClientInfo({ name: "", firm: "", address: "" });
      setRecipientEmail("");
      return;
    }
    const client = clientOptions.find(c => c.value === value);
    if (client) {
      setClientInfo({ name: client.value, firm: client.firm, address: client.address, state: client.state, pinCode: client.pinCode });
      setRecipientEmail(client.email);
    }
  };

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Quotation Form</CardTitle>
            <Badge variant="secondary" className="text-xs font-mono">QUOTATION</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Client Selection */}
          <div className="space-y-1.5">
            <Label>Select Existing Client</Label>
            <Select onValueChange={handleClientSelect} disabled={loadingClients}>
              <SelectTrigger>
                <SelectValue placeholder={loadingClients ? "Loading clients..." : "Choose a client..."} />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Info */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-blue-800">Client Information</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Client Name</Label>
                <Input placeholder="Enter client name" value={clientInfo.name}
                  onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Company / Firm</Label>
                <Input placeholder="Enter company name" value={clientInfo.firm}
                  onChange={e => setClientInfo({ ...clientInfo, firm: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <Input type="email" placeholder="client@email.com" value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Quotation Date</Label>
                <DatePicker value={quotationDate} onChange={setQuotationDate} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Address</Label>
              <Input placeholder="Enter complete address" value={clientInfo.address}
                onChange={e => setClientInfo({ ...clientInfo, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">State</Label>
                <Input placeholder="e.g. Uttar Pradesh" value={clientInfo.state}
                  onChange={e => setClientInfo({ ...clientInfo, state: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pin Code</Label>
                <Input placeholder="e.g. 201010" value={clientInfo.pinCode}
                  onChange={e => setClientInfo({ ...clientInfo, pinCode: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-emerald-800">Quotation Items</h4>
                <Badge variant="success" className="text-xs">
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddItem} className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[1.5rem_3fr_1fr_1fr_80px_32px] gap-2 px-2 mb-1.5">
              {["#", "Description", "Rate (₹)", "Qty", "Amount", ""].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</span>
              ))}
            </div>

            <div className="space-y-2">
              {items.map((item: any, index: number) => (
                <div key={item.key} className="grid grid-cols-[1.5rem_3fr_1fr_1fr_80px_32px] gap-2 items-center bg-white rounded-lg px-2 py-2 border border-emerald-100 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground text-center">{index + 1}</span>
                  <Input placeholder="Item description" value={item.item}
                    onChange={e => handleCellChange(item.key, "item", e.target.value)}
                    className="h-8 text-sm" />
                  <Input placeholder="0.00" value={item.rate || ""}
                    onChange={e => handleCellChange(item.key, "rate", e.target.value)}
                    className="h-8 text-sm" />
                  <Input placeholder="0" type="number" value={item.qty || ""}
                    onChange={e => handleCellChange(item.key, "qty", e.target.value)}
                    className="h-8 text-sm" />
                  <span className="text-sm font-semibold text-primary text-right">
                    ₹{(item.rate * item.qty).toFixed(2)}
                  </span>
                  <button onClick={() => handleDeleteItem(item.key)}
                    className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No items added yet. Click "Add Item" to begin.</p>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-3 flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold">
                  Total: ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Button variant="success" onClick={handleSendEmail} className="flex-1 sm:flex-none gap-2">
              <Mail className="h-4 w-4" /> Send Email
            </Button>
            <Button variant="purple" onClick={downloadPDF} className="flex-1 sm:flex-none gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
