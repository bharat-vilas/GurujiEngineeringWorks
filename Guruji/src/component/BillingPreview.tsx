import React from "react";
import "./componentCSS.css";
import { COMPANY_CONFIG } from "../config/companyConfig";
import { formatSerialNumber } from "../utils/serialNumberFormatter";

function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "");
  }
  function convert(n: number): string {
    if (n === 0) return "Zero";
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;
    let result = "";
    if (crore > 0) result += convertLessThanOneThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanOneThousand(lakh) + " Lakh ";
    if (thousand > 0) result += convertLessThanOneThousand(thousand) + " Thousand ";
    if (remainder > 0) result += convertLessThanOneThousand(remainder);
    return result.trim();
  }
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  let result = convert(integerPart);
  if (decimalPart > 0) result += " and " + convert(decimalPart) + " Paise";
  return result;
}

// Purple — used only as accent (borders + text). Backgrounds stay white/very-light-gray.
const accent = "#6d28d9";
const accentLight = "#f5f3ff";   // barely-there tint — prints as white in B&W
const borderColor = "#c4b5fd";
const divider = "#e5e7eb";

const thS = (align: "center" | "left" | "right", width?: string): React.CSSProperties => ({
  border: `1px solid ${divider}`,
  borderBottom: `2px solid ${accent}`,
  padding: "7px 9px",
  textAlign: align,
  fontWeight: "bold",
  fontSize: "12px",
  backgroundColor: "#f9fafb",
  color: "#111",
  whiteSpace: "nowrap",
  ...(width ? { width } : {}),
});

const tdS = (align: "center" | "left" | "right", extra?: React.CSSProperties): React.CSSProperties => ({
  border: `1px solid ${divider}`,
  padding: "7px 9px",
  textAlign: align,
  fontSize: "12px",
  verticalAlign: "top",
  color: "#111",
  ...extra,
});

const fieldLabel: React.CSSProperties = { color: accent, fontWeight: "bold" };

const addressBox = (name: string, firm: string, address: string, state?: string, pinCode?: string, gstin?: string): React.ReactNode => (
  <div style={{ padding: "10px 14px 18px", minHeight: "90px", fontSize: "12px", color: "#111" }}>
    <div><span style={fieldLabel}>Name :</span> {name}</div>
    {firm && <div style={{ marginTop: "4px" }}><span style={fieldLabel}>Firm :</span> {firm}</div>}
    <div style={{ marginTop: "4px" }}><span style={fieldLabel}>Address :</span> {address}</div>
    <div style={{ marginTop: "6px" }}>
      <span style={fieldLabel}>State :</span>{" "}{state || <span style={{ borderBottom: "1px solid #bbb", display: "inline-block", minWidth: "80px" }}>&nbsp;</span>}
      &nbsp;&nbsp;
      <span style={fieldLabel}>Pin :</span>{" "}{pinCode || <span style={{ borderBottom: "1px solid #bbb", display: "inline-block", minWidth: "50px" }}>&nbsp;</span>}
    </div>
    <div style={{ marginTop: "6px" }}>
      <span style={fieldLabel}>GSTIN :</span>{" "}
      {gstin || <span style={{ borderBottom: "1px solid #bbb", display: "inline-block", minWidth: "180px" }}>&nbsp;</span>}
    </div>
  </div>
);

function BillingPreview({ clientInfo, quotationDate, quotationRef, items, supplyInfo, billingSerial, shippedToInfo }: any) {
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.rate * item.qty, 0);
  const gstAmount = (totalAmount * 0.18).toFixed(2);
  const finalAmount = (totalAmount + parseFloat(gstAmount)).toFixed(2);
  const invoiceNumber = billingSerial || formatSerialNumber(0, "billing");
  const hasShippedTo = shippedToInfo?.name?.trim();

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <div ref={quotationRef} style={{ fontFamily: "Arial, sans-serif", fontSize: "11px", color: "#111", background: "#fff", padding: "16px" }}>
        <div style={{ border: `1px solid ${borderColor}`, borderRadius: "4px", overflow: "hidden" }}>

          {/* Colored top accent stripe */}
          <div style={{ height: "5px", background: accent }} />

          {/* ── HEADER ── white background, color in text + border only */}
          <div style={{ display: "flex", alignItems: "stretch", borderBottom: `1px solid ${divider}`, background: "#fff" }}>
            {/* Logo */}
            <div style={{
              padding: "12px 14px", borderRight: `1px solid ${divider}`,
              display: "flex", alignItems: "center", justifyContent: "center", minWidth: "85px",
              background: accentLight,
            }}>
              <img src="/GEWlogo2.png" alt="GEW" style={{ height: "65px", width: "auto" }} />
            </div>
            {/* Company Info */}
            <div style={{ flex: 1, padding: "10px 16px", textAlign: "center", borderRight: `1px solid ${divider}` }}>
              <div style={{ fontWeight: "bold", fontSize: "19px", color: accent, letterSpacing: "0.5px" }}>
                GURUJI ENGINEERING WORKS
              </div>
              <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>
                REPAIRING OF : ALL PARTS REPAIR & JOB WORKS
              </div>
              <div style={{ fontSize: "10px", color: "#444", marginTop: "4px" }}>{COMPANY_CONFIG.address}</div>
              <div style={{ fontSize: "10px", color: "#444", marginTop: "2px" }}>
                Mobile : {COMPANY_CONFIG.contact} &nbsp;|&nbsp; Email : {COMPANY_CONFIG.email}
              </div>
            </div>
            {/* Document Type */}
            <div style={{ padding: "10px 14px", textAlign: "center", minWidth: "130px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                border: `2px solid ${accent}`, borderRadius: "4px",
                padding: "4px 12px", marginBottom: "6px", background: accentLight,
              }}>
                <div style={{ fontWeight: "bold", fontSize: "13px", color: accent, letterSpacing: "1px" }}>TAX INVOICE</div>
              </div>
              <div style={{ fontSize: "9px", color: "#666" }}>GSTIN</div>
              <div style={{ fontWeight: "bold", fontSize: "10px", color: "#111" }}>{COMPANY_CONFIG.gstin}</div>
              <div style={{ fontSize: "9px", color: "#555", marginTop: "4px" }}>Uttar Pradesh | Code: 09</div>
            </div>
          </div>

          {/* ── INVOICE DETAILS ── */}
          <div style={{ display: "flex", borderBottom: `1px solid ${divider}`, background: "#fafafa" }}>
            <div style={{ flex: 1, padding: "7px 12px", borderRight: `1px solid ${divider}`, borderLeft: `3px solid ${accent}` }}>
              <div style={{ marginBottom: "3px" }}>
                <span style={fieldLabel}>Invoice No. :</span> {invoiceNumber}
              </div>
              <div>
                <span style={fieldLabel}>Invoice Date :</span>{" "}
                {quotationDate ? quotationDate.format("DD/MM/YYYY") : "___________"}
              </div>
              <div style={{ marginTop: "3px", fontSize: "10px", color: "#666" }}>
                State — Uttar Pradesh &nbsp;|&nbsp; State Code : 09
              </div>
            </div>
            <div style={{ flex: 1, padding: "7px 12px" }}>
              {supplyInfo?.showInPreview ? (
                <div style={{ display: "flex", gap: "20px" }}>
                  <div>
                    {supplyInfo?.showTransportationMode && (
                      <div><span style={fieldLabel}>Transport Mode :</span> {supplyInfo.transportationMode || "—"}</div>
                    )}
                    {supplyInfo?.showDateOfSupply && (
                      <div style={{ marginTop: "3px" }}>
                        <span style={fieldLabel}>Date of Supply :</span>{" "}
                        {supplyInfo.dateOfSupply?.format("DD/MM/YYYY") || "—"}
                      </div>
                    )}
                  </div>
                  <div>
                    {supplyInfo?.showVehicleNumber && (
                      <div><span style={fieldLabel}>Veh. No. :</span> {supplyInfo.vehicleNumber || "—"}</div>
                    )}
                    {supplyInfo?.showPlaceOfSupply && (
                      <div style={{ marginTop: "3px" }}>
                        <span style={fieldLabel}>Place of Supply :</span> {supplyInfo.placeOfSupply || "—"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ color: "#aaa", fontSize: "10px", fontStyle: "italic", paddingTop: "4px" }}>Supply info hidden</div>
              )}
            </div>
          </div>

          {/* ── BILLED TO | SHIPPED TO ── */}
          <div style={{ display: "flex", borderBottom: `1px solid ${divider}` }}>
            <div style={{ flex: 1, borderRight: `1px solid ${divider}` }}>
              <div style={{
                background: accentLight, padding: "8px 14px", fontWeight: "bold",
                fontSize: "11px", color: accent, borderBottom: `1px solid ${borderColor}`,
                borderLeft: `3px solid ${accent}`,
              }}>
                Details of Receiver / Billed To
              </div>
              {addressBox(clientInfo.name, clientInfo.firm, clientInfo.address, clientInfo.state, clientInfo.pinCode, clientInfo.gstin)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                background: accentLight, padding: "8px 14px", fontWeight: "bold",
                fontSize: "11px", color: accent, borderBottom: `1px solid ${borderColor}`,
                borderLeft: `3px solid ${accent}`,
              }}>
                Details of Consignee / Shipped To
              </div>
              {hasShippedTo
                ? addressBox(shippedToInfo.name, "", shippedToInfo.address)
                : addressBox(clientInfo.name, clientInfo.firm, clientInfo.address, clientInfo.state, clientInfo.pinCode, clientInfo.gstin)
              }
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thS("center", "40px")}>S. No.</th>
                <th style={thS("left")}>Description of Goods / Services</th>
                <th style={thS("center", "80px")}>HSN / SAC Code</th>
                <th style={thS("center", "65px")}>QTY / UNIT</th>
                <th style={thS("right", "90px")}>Rate (₹)</th>
                <th style={thS("right", "110px")}>Estimated Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr key={item.key} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={tdS("center")}>{idx + 1}</td>
                  <td style={tdS("left")}>{item.item}</td>
                  <td style={tdS("center")}>{item.hsnCode || "—"}</td>
                  <td style={tdS("center")}>{item.qty}</td>
                  <td style={tdS("right")}>₹{Number(item.rate).toFixed(2)}</td>
                  <td style={tdS("right", { fontWeight: "bold" })}>₹{(item.rate * item.qty).toFixed(2)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 5 - items.length) }).map((_, i) => (
                <tr key={`pad-${i}`} style={{ backgroundColor: (items.length + i) % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={tdS("center", { height: "24px" })}>&nbsp;</td>
                  <td style={tdS("left")}>&nbsp;</td>
                  <td style={tdS("center")}>&nbsp;</td>
                  <td style={tdS("center")}>&nbsp;</td>
                  <td style={tdS("right")}>&nbsp;</td>
                  <td style={tdS("right")}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ── FOOTER ── */}
          <div style={{ display: "flex", borderTop: `2px solid ${accent}` }}>
            {/* Amount in words + Authorised Signatory */}
            <div style={{ flex: 1, padding: "12px 14px", borderRight: `1px solid ${divider}` }}>
              <div style={{ fontSize: "10px", color: accent, fontWeight: "bold", marginBottom: "4px" }}>
                Total Amount in Words (Rs.) :
              </div>
              <div style={{ fontSize: "11px", fontStyle: "italic", color: "#333" }}>
                {numberToWords(parseFloat(finalAmount))} Rupees Only
              </div>
              <div style={{ marginTop: "44px" }}>
                <div style={{ fontWeight: "bold", fontSize: "11px", color: "#111" }}>
                  FOR GURUJI ENGINEERING WORKS
                </div>
                <div style={{
                  marginTop: "40px", borderTop: `1px solid ${accent}`, paddingTop: "4px",
                  fontSize: "10px", textAlign: "center", width: "165px", color: "#444"
                }}>
                  Authorised Signatory
                </div>
              </div>
            </div>
            {/* Amounts */}
            <div style={{ minWidth: "220px" }}>
              {[
                { label: "Freight / Other Charges", value: "—", bold: false },
                { label: "TOTAL VALUE", value: `₹${totalAmount.toFixed(2)}`, bold: true },
                { label: "Add GST @ 18%", value: `₹${gstAmount}`, bold: false },
              ].map(({ label, value, bold }, i) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", padding: "6px 12px",
                  borderBottom: `1px solid ${divider}`, fontSize: "11px",
                  backgroundColor: bold ? accentLight : i % 2 === 0 ? "#fff" : "#fafafa",
                }}>
                  <span style={bold ? { fontWeight: "bold", color: accent } : {}}>{label}</span>
                  <span style={bold ? { fontWeight: "bold", color: accent } : {}}>{value}</span>
                </div>
              ))}
              {/* Grand Total — light accent background, dark bold text */}
              <div style={{
                display: "flex", justifyContent: "space-between", padding: "8px 12px",
                background: accentLight,
                borderTop: `2px solid ${accent}`,
                borderBottom: `1px solid ${borderColor}`,
              }}>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: "#111" }}>GRAND TOTAL</span>
                <span style={{ fontWeight: "bold", fontSize: "13px", color: accent }}>₹{finalAmount}</span>
              </div>
              {/* Receiver's Signature */}
              <div style={{ padding: "10px 12px", textAlign: "center", paddingTop: "48px" }}>
                <div style={{
                  borderTop: `1px solid ${accent}`, paddingTop: "4px", fontSize: "10px",
                  display: "inline-block", minWidth: "130px", color: "#444"
                }}>
                  Receiver's Signature
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BillingPreview;
