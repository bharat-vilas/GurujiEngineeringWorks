import React from "react";
import { COMPANY_CONFIG } from "../config/companyConfig";
import { formatSerialNumber } from "../utils/serialNumberFormatter";

function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  function lt1k(n: number): string {
    if (n === 0) return "";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + lt1k(n % 100) : "");
  }
  function convert(n: number): string {
    if (n === 0) return "Zero";
    const cr = Math.floor(n / 10000000);
    const lk = Math.floor((n % 10000000) / 100000);
    const th = Math.floor((n % 100000) / 1000);
    const rm = n % 1000;
    let r = "";
    if (cr) r += lt1k(cr) + " Crore ";
    if (lk) r += lt1k(lk) + " Lakh ";
    if (th) r += lt1k(th) + " Thousand ";
    if (rm) r += lt1k(rm);
    return r.trim();
  }
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = convert(intPart);
  if (decPart > 0) result += " and " + convert(decPart) + " Paise";
  return result;
}

// Emerald — used only as accent (borders + text). Backgrounds stay white / barely-there tint.
const accent      = "#059669";   // emerald-600
const accentLight = "#f0fdf4";   // emerald-50 — prints as white in B&W
const borderColor = "#6ee7b7";   // emerald-300
const divider     = "#e5e7eb";   // gray-200

const thS = (
  align: "center" | "left" | "right",
  width?: string,
): React.CSSProperties => ({
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

const tdS = (
  align: "center" | "left" | "right",
  extra?: React.CSSProperties,
): React.CSSProperties => ({
  border: `1px solid ${divider}`,
  padding: "7px 9px",
  textAlign: align,
  fontSize: "12px",
  color: "#222",
  verticalAlign: "top",
  ...extra,
});

function AddressBox({
  label, lines,
}: { label: string; lines: string[] }) {
  return (
    <div style={{ flex: 1, border: `1px solid ${borderColor}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{
        backgroundColor: accentLight,
        borderBottom: `1px solid ${borderColor}`,
        padding: "4px 10px",
        fontSize: 10,
        fontWeight: "bold",
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
      }}>
        {label}
      </div>
      <div style={{ padding: "8px 10px" }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            fontSize: i === 0 ? 13 : 12,
            fontWeight: i === 0 ? "bold" : "normal",
            color: "#111",
            lineHeight: 1.6,
          }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function Preview({
  clientInfo,
  quotationDate,
  quotationRef,
  items,
  quotationSerial,
}: any) {
  const totalAmount = items.reduce(
    (sum: number, item: any) => sum + item.rate * item.qty,
    0,
  );

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      {/* ── Printable document ── */}
      <div
        ref={quotationRef}
        style={{
          background: "#fff",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          color: "#222",
          border: `1px solid ${divider}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        }}
      >
        {/* Accent stripe */}
        <div style={{ height: 5, background: accent }} />

        {/* ── Header ── */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "16px 20px 14px",
          borderBottom: `1px solid ${divider}`,
        }}>
          {/* Left — logo + company info */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img
              src="/GEWlogo2.png"
              alt="logo"
              style={{ height: 58, width: "auto", objectFit: "contain" }}
            />
            <div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: "#111", lineHeight: 1.2 }}>
                {COMPANY_CONFIG.company}
              </div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.65 }}>
                {COMPANY_CONFIG.address}
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65 }}>
                Ph: {COMPANY_CONFIG.contact}
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65 }}>
                {COMPANY_CONFIG.email}
              </div>
              <div style={{ fontSize: 11, color: "#555", lineHeight: 1.65 }}>
                GSTIN: {COMPANY_CONFIG.gstin}
              </div>
            </div>
          </div>

          {/* Right — badge + serial */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{
              display: "inline-block",
              border: `2px solid ${accent}`,
              borderRadius: 6,
              padding: "4px 16px",
              fontSize: 13,
              fontWeight: "bold",
              color: accent,
              letterSpacing: "0.1em",
              marginBottom: 10,
            }}>
              QUOTATION
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              <span style={{ fontWeight: "bold", color: "#111" }}>No.:</span>{" "}
              {quotationSerial || formatSerialNumber(0, "quotation")}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>
              <span style={{ fontWeight: "bold", color: "#111" }}>Date:</span>{" "}
              {quotationDate ? quotationDate.format("DD/MM/YYYY") : "—"}
            </div>
          </div>
        </div>

        {/* ── From / To ── */}
        <div style={{
          display: "flex",
          gap: 12,
          padding: "12px 20px",
          borderBottom: `1px solid ${divider}`,
        }}>
          <AddressBox
            label="From — Seller"
            lines={[
              COMPANY_CONFIG.company,
              COMPANY_CONFIG.address,
              `Ph: ${COMPANY_CONFIG.contact}`,
              `GSTIN: ${COMPANY_CONFIG.gstin}`,
            ]}
          />
          <AddressBox
            label="To — Buyer"
            lines={[
              clientInfo.name || "—",
              clientInfo.firm,
              clientInfo.address,
              [clientInfo.state, clientInfo.pinCode].filter(Boolean).join(" — "),
            ].filter(Boolean)}
          />
        </div>

        {/* ── Items Table ── */}
        <div style={{ padding: "12px 20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thS("center", "34px")}>#</th>
                <th style={thS("left")}>Item Description</th>
                <th style={thS("right", "80px")}>Rate (₹)</th>
                <th style={thS("center", "48px")}>Qty</th>
                <th style={thS("right", "96px")}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => (
                <tr
                  key={item.key}
                  style={{ backgroundColor: idx % 2 === 1 ? accentLight : "#fff" }}
                >
                  <td style={tdS("center")}>{idx + 1}</td>
                  <td style={tdS("left")}>{item.item || "—"}</td>
                  <td style={tdS("right")}>
                    {item.rate ? Number(item.rate).toLocaleString("en-IN") : "0"}
                  </td>
                  <td style={tdS("center")}>{item.qty || "0"}</td>
                  <td style={tdS("right")}>
                    {(item.rate * item.qty).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr>
                <td
                  colSpan={4}
                  style={{
                    ...tdS("right"),
                    fontWeight: "bold",
                    fontSize: 11,
                    borderTop: `2px solid ${accent}`,
                    color: accent,
                    backgroundColor: accentLight,
                  }}
                >
                  TOTAL AMOUNT
                </td>
                <td
                  style={{
                    ...tdS("right"),
                    fontWeight: "bold",
                    fontSize: 13,
                    borderTop: `2px solid ${accent}`,
                    color: accent,
                    backgroundColor: accentLight,
                  }}
                >
                  ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div style={{
            marginTop: 8,
            padding: "5px 10px",
            background: accentLight,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            fontSize: 10,
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: "bold", color: accent }}>Amount in Words: </span>
            <span style={{ color: "#444" }}>
              Rupees {numberToWords(Math.round(totalAmount))} Only
            </span>
          </div>
        </div>

        {/* ── Footer — Terms + Signatory ── */}
        <div style={{
          display: "flex",
          borderTop: `1px solid ${divider}`,
        }}>
          {/* Terms */}
          <div style={{
            flex: 1,
            padding: "12px 20px",
            borderRight: `1px solid ${divider}`,
          }}>
            <div style={{
              fontSize: 9,
              fontWeight: "bold",
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}>
              Terms &amp; Conditions
            </div>
            {[
              ["GST", "GST will be charged extra as applicable."],
              ["Acceptance", "Please send written confirmation to proceed."],
              ["Validity", "This quotation is valid for 30 days from date of issue."],
              ["Payment", "As mutually agreed upon order confirmation."],
            ].map(([k, v]) => (
              <div key={k} style={{ fontSize: 10, color: "#444", marginBottom: 3, lineHeight: 1.5 }}>
                <span style={{ fontWeight: "bold", color: "#333" }}>{k}:</span> {v}
              </div>
            ))}

            <div style={{ marginTop: 10, fontSize: 9, fontWeight: "bold", color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Additional Services
            </div>
            {[
              "All types of sheet fabrication work",
              "Machinery parts manufacturing",
              "Gear cutting and manufacturing",
              "Machine maintenance and repair",
            ].map(s => (
              <div key={s} style={{ fontSize: 10, color: "#555", lineHeight: 1.6 }}>
                · {s}
              </div>
            ))}
          </div>

          {/* Authorised Signatory */}
          <div style={{
            width: 190,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}>
            <div style={{ fontSize: 9, color: "#777" }}>For</div>
            <div style={{ fontSize: 11, fontWeight: "bold", color: "#111", textAlign: "center", lineHeight: 1.3 }}>
              {COMPANY_CONFIG.company}
            </div>
            <div style={{ flex: 1, minHeight: 40 }} />
            <div style={{ width: "100%", borderTop: `1px solid ${divider}`, paddingTop: 5, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#777" }}>Authorised Signatory</div>
            </div>
          </div>
        </div>

        {/* ── Thank you ── */}
        <div style={{
          padding: "8px 20px",
          borderTop: `1px solid ${divider}`,
          backgroundColor: accentLight,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, fontWeight: "bold", color: accent }}>
            Thank you for your business!
          </div>
          <div style={{ fontSize: 9.5, color: "#777", marginTop: 2 }}>
            For inquiries:{" "}
            <strong style={{ color: "#444" }}>{COMPANY_CONFIG.email}</strong>
            {" · "}
            <strong style={{ color: "#444" }}>
              {COMPANY_CONFIG.contact.split(",")[0]}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Preview;
