import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import html2pdf from "html2pdf.js";
import dayjs from "dayjs";
import Details from "../../component/Details";
import Preview from "../../component/Preview";
import BillingCanvas from "../../component/BillingCanvas";
import BillingPreview from "../../component/BillingPreview";
import ChallanCanvas from "../../component/ChallanCanvas";
import ChallanPreview from "../../component/ChallanPreview";
import Sidebar from "../../component/Sidebar";
import Header from "../../component/Header";
import RegisterClient from "../../component/RegisterClient";
import Mail from "../../component/Mail";
import Employees from "../../component/Employees";
import Attendance from "../../component/Attendance";
import Financials from "../../component/Financials";
import Home from "../../component/Home";
import ResizableSplitPane from "../../component/ResizableSplitPane";
import { authUtils } from "../../utils/auth";
import { api } from "../../utils/api";
import {
  formatSerialNumber,
  parseSerialNumber,
} from "../../utils/serialNumberFormatter";

const App = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  // Check for email auth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailAuth = params.get("email_auth");
    if (emailAuth === "success") {
      toast.success("Email authentication successful! You can now send emails.");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (emailAuth === "error") {
      const errorMsg = params.get("message");
      toast.error(errorMsg || "Email authentication failed. Please try again.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Keep sidebar open on desktop by default
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      authUtils.clearAuth();
      toast.success("Logged out successfully!");
      navigate("/login");
    }
  };

  const [clientInfo, setClientInfo] = useState({
    name: "",
    firm: "",
    address: "",
    gstin: "",
    state: "",
    pinCode: "",
  });
  const [shippedToInfo, setShippedToInfo] = useState({
    name: "",
    address: "",
  });
  const [recipientEmail, setRecipientEmail] = useState("");
  const [items, setItems] = useState([
    { key: 0, item: "", hsnCode: "", rate: 0, qty: 0 },
  ]);
  const [supplyInfo, setSupplyInfo] = useState({
    dateOfSupply: null,
    placeOfSupply: "",
    transportationMode: "",
    vehicleNumber: "",
    showInPreview: true,
    showDateOfSupply: true,
    showPlaceOfSupply: true,
    showTransportationMode: true,
    showVehicleNumber: true,
  });
  const [quotationDate, setQuotationDate] = useState<dayjs.Dayjs | null>();
  const [quotationSerial, setQuotationSerial] = useState<string>("");
  const [billingSerial, setBillingSerial] = useState<string>("");
  const [challanSerial, setChallanSerial] = useState<string>("");
  const quotationRef = useRef<HTMLDivElement>(null);
  const billingRef = useRef<HTMLDivElement>(null);
  const challanRef = useRef<HTMLDivElement>(null);

  // Load serial numbers from API on component mount
  useEffect(() => {
    const loadSerialNumbers = async () => {
      const up = (s: string | null, type: "quotation" | "billing" | "challan") =>
        (s || formatSerialNumber(0, type)).toUpperCase();

      try {
        const response = await api.get("/api/serial-numbers");
        if (response.ok) {
          const data = await response.json();

          const needsInit = !data.quotation || !data.billing || !data.challan;

          if (needsInit) {
            const initPayload: any = {};
            if (!data.quotation) {
              initPayload.quotation = formatSerialNumber(0, "quotation");
            }
            if (!data.billing) {
              initPayload.billing = formatSerialNumber(0, "billing");
            }
            if (!data.challan) {
              initPayload.challan = formatSerialNumber(0, "challan");
            }

            try {
              const initResponse = await api.post(
                "/api/serial-numbers",
                initPayload
              );
              if (initResponse.ok) {
                const initData = await initResponse.json();
                setQuotationSerial(up(initData.quotation, "quotation"));
                setBillingSerial(up(initData.billing, "billing"));
                setChallanSerial(up(initData.challan, "challan"));
                return;
              }
            } catch (initError) {
              console.error("Error initializing serial numbers:", initError);
            }
          }

          setQuotationSerial(up(data.quotation, "quotation"));
          setBillingSerial(up(data.billing, "billing"));
          setChallanSerial(up(data.challan, "challan"));
        } else {
          console.error("Failed to load serial numbers");
          setQuotationSerial(up(localStorage.getItem("quotationSerial"), "quotation"));
          setBillingSerial(up(localStorage.getItem("billingSerial"), "billing"));
          setChallanSerial(up(localStorage.getItem("challanSerial"), "challan"));
        }
      } catch (error) {
        console.error("Error loading serial numbers:", error);
        setQuotationSerial(up(localStorage.getItem("quotationSerial"), "quotation"));
        setBillingSerial(up(localStorage.getItem("billingSerial"), "billing"));
        setChallanSerial(up(localStorage.getItem("challanSerial"), "challan"));
      }
    };

    loadSerialNumbers();
  }, []);

  // Auto-close sidebar on mobile when tab changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [activeTab]);

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      item: "",
      hsnCode: "",
      rate: 0,
      qty: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteItem = (key: any) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleCellChange = (key: any, field: any, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const downloadQuotationPDF = async () => {
    const currentSerialForPDF =
      quotationSerial || formatSerialNumber(0, "quotation");

    const opt = {
      filename: `Quotation-${currentSerialForPDF}.pdf`,
      image: { type: "jpeg", quality: 0.82 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(quotationRef.current)
      .save()
      .then(async () => {
        try {
          const response = await api.post(
            "/api/serial-numbers/quotation/increment"
          );
          if (response.ok) {
            const data = await response.json();
            setQuotationSerial(data.serialNumber);
            localStorage.setItem("quotationSerial", data.serialNumber);
          } else {
            const parsed = parseSerialNumber(quotationSerial);
            const newSerial = formatSerialNumber(parsed + 1, "quotation");
            setQuotationSerial(newSerial);
            localStorage.setItem("quotationSerial", newSerial);
          }
        } catch (error) {
          console.error("Error incrementing quotation serial:", error);
          const parsed = parseSerialNumber(quotationSerial);
          const newSerial = formatSerialNumber(parsed + 1, "quotation");
          setQuotationSerial(newSerial);
          localStorage.setItem("quotationSerial", newSerial);
        }
        try {
          const total = items.reduce((s: number, i: any) => s + i.rate * i.qty, 0);
          await api.post("/api/document-queue", {
            type: "quotation",
            documentNumber: currentSerialForPDF,
            clientName: clientInfo.name || "—",
            clientFirm: clientInfo.firm || "",
            amount: total,
            documentDate: quotationDate ? quotationDate.toDate() : new Date(),
          });
        } catch (e) {
          console.error("Queue error:", e);
        }
      });
  };

  const downloadBillingPDF = async () => {
    const currentSerialForPDF =
      billingSerial || formatSerialNumber(0, "billing");

    const opt = {
      filename: `Invoice-${currentSerialForPDF}.pdf`,
      image: { type: "jpeg", quality: 0.82 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(billingRef.current)
      .save()
      .then(async () => {
        try {
          const response = await api.post(
            "/api/serial-numbers/billing/increment"
          );
          if (response.ok) {
            const data = await response.json();
            setBillingSerial(data.serialNumber);
            localStorage.setItem("billingSerial", data.serialNumber);
          } else {
            const parsed = parseSerialNumber(billingSerial);
            const newSerial = formatSerialNumber(parsed + 1, "billing");
            setBillingSerial(newSerial);
            localStorage.setItem("billingSerial", newSerial);
          }
        } catch (error) {
          console.error("Error incrementing billing serial:", error);
          const parsed = parseSerialNumber(billingSerial);
          const newSerial = formatSerialNumber(parsed + 1, "billing");
          setBillingSerial(newSerial);
          localStorage.setItem("billingSerial", newSerial);
        }
        try {
          const total = items.reduce((s: number, i: any) => s + i.rate * i.qty, 0);
          const gst = total * 0.18;
          await api.post("/api/document-queue", {
            type: "billing",
            documentNumber: currentSerialForPDF,
            clientName: clientInfo.name || "—",
            clientFirm: clientInfo.firm || "",
            amount: parseFloat((total + gst).toFixed(2)),
            documentDate: quotationDate ? quotationDate.toDate() : new Date(),
          });
        } catch (e) {
          console.error("Queue error:", e);
        }
      });
  };

  const downloadChallanPDF = async () => {
    const currentSerialForPDF =
      challanSerial || formatSerialNumber(0, "challan");

    const opt = {
      filename: `Challan-${currentSerialForPDF}.pdf`,
      image: { type: "jpeg", quality: 0.82 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .set(opt)
      .from(challanRef.current)
      .save()
      .then(async () => {
        try {
          const response = await api.post(
            "/api/serial-numbers/challan/increment"
          );
          if (response.ok) {
            const data = await response.json();
            setChallanSerial(data.serialNumber);
            localStorage.setItem("challanSerial", data.serialNumber);
          } else {
            const parsed = parseSerialNumber(challanSerial);
            const newSerial = formatSerialNumber(parsed + 1, "challan");
            setChallanSerial(newSerial);
            localStorage.setItem("challanSerial", newSerial);
          }
        } catch (error) {
          console.error("Error incrementing challan serial:", error);
          const parsed = parseSerialNumber(challanSerial);
          const newSerial = formatSerialNumber(parsed + 1, "challan");
          setChallanSerial(newSerial);
          localStorage.setItem("challanSerial", newSerial);
        }
        try {
          const total = items.reduce((s: number, i: any) => s + i.rate * i.qty, 0);
          const gst = total * 0.18;
          await api.post("/api/document-queue", {
            type: "challan",
            documentNumber: currentSerialForPDF,
            clientName: clientInfo.name || "—",
            clientFirm: clientInfo.firm || "",
            amount: parseFloat((total + gst).toFixed(2)),
            documentDate: quotationDate ? quotationDate.toDate() : new Date(),
          });
        } catch (e) {
          console.error("Queue error:", e);
        }
      });
  };

  const contentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const getBackgroundColor = () => {
    switch (activeTab) {
      case "quotation":
        return "bg-green-50";
      case "billing":
        return "bg-purple-50";
      case "challan":
        return "bg-blue-50";
      case "register-client":
        return "bg-orange-50";
      case "employees":
        return "bg-rose-50";
      case "financials":
        return "bg-violet-50";
      case "home":
        return "bg-amber-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="flex-1 lg:ml-0 overflow-hidden h-full">
          <AnimatePresence mode="wait">
            {activeTab === "home" && (
              <motion.div
                key="home"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-amber-50"
              >
                <Home />
              </motion.div>
            )}

            {activeTab === "quotation" && (
              <motion.div
                key="quotation"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={`w-full h-full ${getBackgroundColor()}`}
              >
                <ResizableSplitPane
                  defaultLeftWidth={50}
                  left={
                    <Details
                      setClientInfo={setClientInfo}
                      clientInfo={clientInfo}
                      setRecipientEmail={setRecipientEmail}
                      recipientEmail={recipientEmail}
                      setQuotationDate={setQuotationDate}
                      quotationDate={quotationDate}
                      handleAddItem={handleAddItem}
                      downloadPDF={downloadQuotationPDF}
                      handleCellChange={handleCellChange}
                      handleDeleteItem={handleDeleteItem}
                      items={items}
                      quotationSerial={quotationSerial}
                    />
                  }
                  right={
                    <Preview
                      clientInfo={clientInfo}
                      quotationDate={quotationDate}
                      quotationRef={quotationRef}
                      items={items}
                      quotationSerial={quotationSerial}
                    />
                  }
                />
              </motion.div>
            )}

            {activeTab === "billing" && (
              <motion.div
                key="billing"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={`w-full h-full ${getBackgroundColor()}`}
              >
                <ResizableSplitPane
                  defaultLeftWidth={50}
                  left={
                    <BillingCanvas
                      setClientInfo={setClientInfo}
                      clientInfo={clientInfo}
                      setRecipientEmail={setRecipientEmail}
                      recipientEmail={recipientEmail}
                      setQuotationDate={setQuotationDate}
                      quotationDate={quotationDate}
                      handleAddItem={handleAddItem}
                      downloadPDF={downloadBillingPDF}
                      handleCellChange={handleCellChange}
                      handleDeleteItem={handleDeleteItem}
                      items={items}
                      supplyInfo={supplyInfo}
                      setSupplyInfo={setSupplyInfo}
                      billingSerial={billingSerial}
                      shippedToInfo={shippedToInfo}
                      setShippedToInfo={setShippedToInfo}
                    />
                  }
                  right={
                    <BillingPreview
                      clientInfo={clientInfo}
                      quotationDate={quotationDate}
                      quotationRef={billingRef}
                      items={items}
                      supplyInfo={supplyInfo}
                      billingSerial={billingSerial}
                      shippedToInfo={shippedToInfo}
                    />
                  }
                />
              </motion.div>
            )}

            {activeTab === "challan" && (
              <motion.div
                key="challan"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className={`w-full h-full ${getBackgroundColor()}`}
              >
                <ResizableSplitPane
                  defaultLeftWidth={50}
                  left={
                    <ChallanCanvas
                      setClientInfo={setClientInfo}
                      clientInfo={clientInfo}
                      setRecipientEmail={setRecipientEmail}
                      recipientEmail={recipientEmail}
                      setQuotationDate={setQuotationDate}
                      quotationDate={quotationDate}
                      handleAddItem={handleAddItem}
                      downloadPDF={downloadChallanPDF}
                      handleCellChange={handleCellChange}
                      handleDeleteItem={handleDeleteItem}
                      items={items}
                      supplyInfo={supplyInfo}
                      setSupplyInfo={setSupplyInfo}
                      challanSerial={challanSerial}
                      shippedToInfo={shippedToInfo}
                      setShippedToInfo={setShippedToInfo}
                    />
                  }
                  right={
                    <ChallanPreview
                      clientInfo={clientInfo}
                      quotationDate={quotationDate}
                      quotationRef={challanRef}
                      items={items}
                      supplyInfo={supplyInfo}
                      challanSerial={challanSerial}
                      shippedToInfo={shippedToInfo}
                    />
                  }
                />
              </motion.div>
            )}

            {activeTab === "register-client" && (
              <motion.div
                key="register-client"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-orange-50"
              >
                <RegisterClient />
              </motion.div>
            )}

            {activeTab === "mail" && (
              <motion.div
                key="mail"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-indigo-50"
              >
                <Mail />
              </motion.div>
            )}

            {activeTab === "employees" && (
              <motion.div
                key="employees"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-rose-50"
              >
                <Employees />
              </motion.div>
            )}

            {activeTab === "attendance" && (
              <motion.div
                key="attendance"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-teal-50"
              >
                <Attendance />
              </motion.div>
            )}

            {activeTab === "financials" && (
              <motion.div
                key="financials"
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="w-full h-full bg-violet-50"
              >
                <Financials />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
