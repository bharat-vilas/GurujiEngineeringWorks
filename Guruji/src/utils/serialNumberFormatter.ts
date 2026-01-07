// Utility function to format serial numbers
// Format: YEAR/TYPE/SERIAL (e.g., 2025/q/0001)

// Parse serial number string to extract the number
export const parseSerialNumber = (serialString: string): number => {
  if (!serialString || typeof serialString !== "string") {
    return 0;
  }
  // Format: YEAR/TYPE/SERIAL (e.g., 2025/q/0001)
  const parts = serialString.split("/");
  if (parts.length !== 3) {
    return 0;
  }
  return parseInt(parts[2]) || 0;
};

// Format a number into serial number string
export const formatSerialNumber = (
  serialNumber: number | string,
  type: "quotation" | "billing" | "challan"
): string => {
  // If it's already a formatted string, return it
  if (typeof serialNumber === "string" && serialNumber.includes("/")) {
    return serialNumber;
  }
  
  // Otherwise, format the number
  const num = typeof serialNumber === "string" ? parseInt(serialNumber) || 0 : serialNumber;
  const currentYear = new Date().getFullYear();
  const typeCode = {
    quotation: "q",
    billing: "b",
    challan: "c",
  }[type];

  const formattedSerial = num.toString().padStart(4, "0");
  return `${currentYear}/${typeCode}/${formattedSerial}`;
};

