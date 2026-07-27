import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Download, Plus, Trash2, User, Truck, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { DatePicker } from "../components/ui/date-picker";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { cn } from "../lib/utils";
import { api } from "../utils/api";
import { useEmailAuth } from "../hooks/useEmailAuth";
import { sendEmail } from "../utils/email";

interface ClientOption {
  label: string;
  value: string;
  firm: string;
  address: string;
  email: string;
  gstin: string;
  state: string;
  pinCode: string;
}

export default function BillingCanvas({
  setClientInfo, clientInfo, setRecipientEmail, recipientEmail,
  setQuotationDate, quotationDate, handleAddItem, downloadPDF,
  handleCellChange, handleDeleteItem, items, supplyInfo, setSupplyInfo,
  shippedToInfo, setShippedToInfo,
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
            gstin: c.gstin || "",
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
        subject: "Invoice - Guruji Engineering Works",
        textBody: `Dear ${clientInfo.name || "Client"},\n\nPlease find attached your invoice from Guruji Engineering Works.\n\nThank you for your business.`,
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
      setClientInfo({ name: client.value, firm: client.firm, address: client.address, gstin: client.gstin, state: client.state, pinCode: client.pinCode });
      setRecipientEmail(client.email);
    }
  };

  const setSupply = (key: string, val: any) =>
    setSupplyInfo((prev: any) => ({ ...prev, [key]: val }));

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Billing Invoice</CardTitle>
            <Badge className="text-xs font-mono bg-purple-100 text-purple-700 border-purple-200">INVOICE</Badge>
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

          {/* Supply Information */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" />
                <h4 className="text-sm font-semibold text-amber-800">Supply Information</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show in preview</span>
                <Switch
                  checked={supplyInfo?.showInPreview}
                  onCheckedChange={v => setSupply("showInPreview", v)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SupplyField
                label="Date of Supply"
                show={supplyInfo?.showDateOfSupply}
                onToggle={() => setSupply("showDateOfSupply", !supplyInfo?.showDateOfSupply)}
              >
                <DatePicker
                  value={supplyInfo?.dateOfSupply}
                  onChange={d => setSupply("dateOfSupply", d)}
                />
              </SupplyField>
              <SupplyField
                label="Place of Supply"
                show={supplyInfo?.showPlaceOfSupply}
                onToggle={() => setSupply("showPlaceOfSupply", !supplyInfo?.showPlaceOfSupply)}
              >
                <Input placeholder="e.g. Maharashtra" value={supplyInfo?.placeOfSupply || ""}
                  onChange={e => setSupply("placeOfSupply", e.target.value)} className="h-9 text-sm" />
              </SupplyField>
              <SupplyField
                label="Transportation Mode"
                show={supplyInfo?.showTransportationMode}
                onToggle={() => setSupply("showTransportationMode", !supplyInfo?.showTransportationMode)}
              >
                <Input placeholder="e.g. Road, Rail" value={supplyInfo?.transportationMode || ""}
                  onChange={e => setSupply("transportationMode", e.target.value)} className="h-9 text-sm" />
              </SupplyField>
              <SupplyField
                label="Vehicle Number"
                show={supplyInfo?.showVehicleNumber}
                onToggle={() => setSupply("showVehicleNumber", !supplyInfo?.showVehicleNumber)}
              >
                <Input placeholder="e.g. MH 01 AB 1234" value={supplyInfo?.vehicleNumber || ""}
                  onChange={e => setSupply("vehicleNumber", e.target.value)} className="h-9 text-sm" />
              </SupplyField>
            </div>
          </div>

          {/* Receiver Details */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-blue-800">Details of Receiver</h4>
              <Badge variant="outline" className="text-[10px] text-blue-500 border-blue-200">Auto-filled</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Receiver Name</Label>
                <Input value={clientInfo.name} readOnly className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Receiver Company</Label>
                <Input value={clientInfo.firm} readOnly className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Receiver Address</Label>
              <Input value={clientInfo.address} readOnly className="h-9 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">State</Label>
                <Input value={clientInfo.state} readOnly className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pin Code</Label>
                <Input value={clientInfo.pinCode} readOnly className="h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Shipped To */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="h-4 w-4 text-orange-600" />
              <h4 className="text-sm font-semibold text-orange-800">Shipped To / Consignee</h4>
              <span className="text-[10px] text-muted-foreground">(leave blank if same as Billed To)</span>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name / Firm</Label>
              <Input placeholder="Consignee name or firm" value={shippedToInfo?.name || ""}
                onChange={e => setShippedToInfo((prev: any) => ({ ...prev, name: e.target.value }))} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Shipping Address</Label>
              <Input placeholder="Delivery / shipping address" value={shippedToInfo?.address || ""}
                onChange={e => setShippedToInfo((prev: any) => ({ ...prev, address: e.target.value }))} className="h-9 text-sm" />
            </div>
          </div>

          {/* Email & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email Address</Label>
              <Input type="email" placeholder="client@email.com" value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Invoice Date</Label>
              <DatePicker value={quotationDate} onChange={setQuotationDate} />
            </div>
          </div>

          {/* Items Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-emerald-800">Invoice Items</h4>
                <Badge variant="success" className="text-xs">
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </Badge>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddItem}
                className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                <Plus className="h-3.5 w-3.5" /> Add Item
              </Button>
            </div>

            <div className="hidden sm:grid grid-cols-[1.5rem_3fr_1fr_1fr_1fr_80px_32px] gap-2 px-2 mb-1.5">
              {["#", "Description", "HSN", "Rate (₹)", "Qty", "Amount", ""].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</span>
              ))}
            </div>

            <div className="space-y-2">
              {items.map((item: any, index: number) => (
                <div key={item.key} className="grid grid-cols-[1.5rem_3fr_1fr_1fr_1fr_80px_32px] gap-2 items-center bg-white rounded-lg px-2 py-2 border border-emerald-100 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground text-center">{index + 1}</span>
                  <Input placeholder="Item description" value={item.item}
                    onChange={e => handleCellChange(item.key, "item", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="HSN" value={item.hsnCode || ""}
                    onChange={e => handleCellChange(item.key, "hsnCode", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="0.00" value={item.rate || ""}
                    onChange={e => handleCellChange(item.key, "rate", e.target.value)} className="h-8 text-sm" />
                  <Input placeholder="0" type="number" value={item.qty || ""}
                    onChange={e => handleCellChange(item.key, "qty", e.target.value)} className="h-8 text-sm" />
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
                <p className="text-center text-sm text-muted-foreground py-4">No items added yet.</p>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-3 flex justify-end">
                <div className="bg-purple-600 text-white rounded-lg px-4 py-2 text-sm font-semibold">
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

function SupplyField({ label, show, onToggle, children }: {
  label: string; show: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <button onClick={onToggle} className={cn(
          "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors",
          show ? "text-emerald-600 hover:bg-emerald-50" : "text-muted-foreground hover:bg-muted"
        )}>
          {show ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
          {show ? "visible" : "hidden"}
        </button>
      </div>
      {children}
    </div>
  );
}
