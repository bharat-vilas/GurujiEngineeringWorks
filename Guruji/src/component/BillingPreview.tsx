import { Card, Table, Typography } from "antd";
import React from "react";
import "./componentCSS.css";
import { COMPANY_CONFIG } from "../config/companyConfig";
import { formatSerialNumber } from "../utils/serialNumberFormatter";

// Function to convert number to words
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  function convertLessThanOneThousand(n: number): string {
    if (n === 0) return "";

    if (n < 10) return ones[n];

    if (n < 20) return teens[n - 10];

    if (n < 100) {
      return (
        tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
      );
    }

    if (n < 1000) {
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " and " + convertLessThanOneThousand(n % 100) : "")
      );
    }

    return "";
  }

  function convert(n: number): string {
    if (n === 0) return "Zero";

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const remainder = n % 1000;

    let result = "";

    if (crore > 0) {
      result += convertLessThanOneThousand(crore) + " Crore ";
    }

    if (lakh > 0) {
      result += convertLessThanOneThousand(lakh) + " Lakh ";
    }

    if (thousand > 0) {
      result += convertLessThanOneThousand(thousand) + " Thousand ";
    }

    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder);
    }

    return result.trim();
  }

  // Handle decimal part
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = convert(integerPart);

  if (decimalPart > 0) {
    result += " and " + convert(decimalPart) + " Paise";
  }

  return result;
}

function BillingPreview({
  clientInfo,
  quotationDate,
  quotationRef,
  items,
  supplyInfo,
  billingSerial,
}: any) {
  const previewColumns = [
    {
      title: "S.No",
      render: (_: any, __: any, idx: number) => idx + 1,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Item Description",
      dataIndex: "item",
      render: (text: string) => <span>{text}</span>,
      width: "20vw",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "HSN Code",
      dataIndex: "hsnCode",
      render: (text: string) => <span>{text || "-"}</span>,
      // width: "8vw",
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Rate (₹)",
      dataIndex: "rate",
      render: (text: string) => <span>₹{text}</span>,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      render: (text: string) => <span>{text}</span>,
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
    {
      title: "Amount (₹)",
      render: (_: any, record: any) => (
        <span>₹{(record.rate * record.qty).toFixed(2)}</span>
      ),
      onHeaderCell: () => ({
        style: {
          backgroundColor: "#f8f0ff",
          color: "black",
          fontWeight: "bold",
          whiteSpace: "nowrap",
        },
      }),
    },
  ];

  const totalAmount = items.reduce(
    (sum: any, item: any) => sum + item.rate * item.qty,
    0
  );

  const gstAmount = (totalAmount * 0.18).toFixed(2); // 18% GST
  const finalAmount = (totalAmount + parseFloat(gstAmount)).toFixed(2);

  return (
    <div className="h-full p-4 overflow-y-auto custom-scrollbar">
      <Card ref={quotationRef} style={{ paddingBottom: "20px" }}>
        <div
          style={{
            textAlign: "center",
            fontSize: "15px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "black",
            borderBottom: "1px solid black",
            paddingBottom: "6px",
          }}
        >
          INVOICE - #{billingSerial || formatSerialNumber(0, "billing")}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              GURUJI
            </div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              ENGINEERING
            </div>
            <div
              style={{ fontWeight: "bold", fontSize: "22px", color: "black" }}
            >
              WORKS
            </div>
          </div>
          <div>
            <img src="/GEWlogo2.png" alt="logo" style={{ height: "120px" }} />
          </div>
        </div>

        {/* Supply Information Card */}
        {supplyInfo?.showInPreview && (
          <div style={{ marginTop: "0px", marginBottom: "6px" }}>
            <Card
              style={{
                background: "#f8f0ff",
                border: "1px solid #d4b5ff",
                padding: "0px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "15px",
                  marginBottom: "3px",
                  color: "#000000",
                }}
              >
                SUPPLY INFORMATION:
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#000000",
                  display: "flex",
                  gap: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  {supplyInfo?.showDateOfSupply && (
                    <div>
                      Date of Supply:{" "}
                      <b>
                        {supplyInfo?.dateOfSupply
                          ? supplyInfo.dateOfSupply.format("DD/MM/YYYY")
                          : ""}
                      </b>
                    </div>
                  )}
                  {supplyInfo?.showPlaceOfSupply && (
                    <div>
                      Place of Supply: {supplyInfo?.placeOfSupply || ""}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  {supplyInfo?.showTransportationMode && (
                    <div>
                      Transportation Mode:{" "}
                      {supplyInfo?.transportationMode || ""}
                    </div>
                  )}
                  {supplyInfo?.showVehicleNumber && (
                    <div>Vehicle Number: {supplyInfo?.vehicleNumber || ""}</div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
          <Card style={{ flex: 1, background: "#E6FFE6", padding: "0px" }}>
            {/* From section */}
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              FROM:
            </div>
            <div style={{ fontSize: "14px" }}>
              <strong>{COMPANY_CONFIG.name}</strong>
            </div>
            <div style={{ fontSize: "14px" }}>{COMPANY_CONFIG.company}</div>
            <div style={{ fontSize: "14px" }}>{COMPANY_CONFIG.address}</div>
          </Card>

          <Card style={{ flex: 1, background: "#E6FFE6", padding: "0px" }}>
            {/* To section */}
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                marginBottom: "4px",
              }}
            >
              BILL TO:
            </div>
            <div style={{ fontSize: "14px" }}>
              <strong>{clientInfo.name}</strong>
            </div>
            <div style={{ fontSize: "14px" }}>{clientInfo.firm}</div>
            <div style={{ fontSize: "14px" }}>{clientInfo.address}</div>
          </Card>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "15px",
            marginBottom: "15px",
            padding: "8px",
            backgroundColor: "#FAFAFA",
            borderRadius: "6px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            Invoice Date:{" "}
            {quotationDate ? quotationDate.format("DD/MM/YYYY") : ""}
          </div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            GSTIN: {COMPANY_CONFIG.gstin}
          </div>
        </div>

        <Table
          dataSource={items}
          columns={previewColumns}
          pagination={false}
          size="small"
          rowClassName={(record: any, index: number) =>
            index % 2 === 1 ? "#F8F9FA" : "white"
          }
          bordered
        />

        {/* Amount Summary Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          {/* Grand Total in Words */}
          <div style={{ flex: 1, paddingRight: "20px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                border: "1px solid #d9d9d9",
                padding: "10px",
                borderRadius: "6px",
                backgroundColor: "#E6FFE6",
              }}
            >
              <div style={{ marginBottom: "5px" }}>Grand Total in Words:</div>
              <div style={{ fontSize: "13px", color: "#333" }}>
                {numberToWords(parseFloat(finalAmount))} Rupees Only
              </div>
            </div>
            {/* FOR GURUJI ENGINEERING WORKS - positioned below grand total in words */}
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                // color: "#1890ff",
                marginTop: "10px",
                marginLeft: "70px",
                textAlign: "left",
              }}
            >
              FOR GURUJI ENGINEERING WORKS
            </div>
          </div>

          {/* Amount Details */}
          <div style={{ flex: 0.5, minWidth: "200px" }}>
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Subtotal:</span>
                <span style={{ fontWeight: "bold" }}>
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  backgroundColor: "#fafafa",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                <span style={{ fontWeight: "bold" }}>GST (18%):</span>
                <span style={{ fontWeight: "bold" }}>₹{gstAmount}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  backgroundColor: "#E6FFE6",
                  borderTop: "2px solid #52c41a",
                }}
              >
                <span style={{ fontWeight: "bold", fontSize: "16px" }}>
                  GRAND TOTAL:
                </span>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "16px",
                    // color: "#1890ff",
                  }}
                >
                  ₹{finalAmount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "50px",
            marginBottom: "0px",
          }}
        >
          {/* Company Signature - Left Side */}
          <div style={{ flex: 1, paddingRight: "10px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#666",
                  fontStyle: "italic",
                }}
              >
                Authorized Signatory
              </div>
            </div>
          </div>

          {/* Receiver's Signature - Right Side */}
          <div style={{ flex: 1, paddingLeft: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#666",
                  marginBottom: "20px",
                }}
              >
                Receiver's Signature
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: "12px", color: "#666" }}>
          For any inquiries regarding this invoice, please contact us at:{" "}
          <b>{COMPANY_CONFIG.email}</b> or{" "}
          <b>{COMPANY_CONFIG.contact.split(",")[0]}</b>
        </div>
      </Card>
    </div>
  );
}

export default BillingPreview;
