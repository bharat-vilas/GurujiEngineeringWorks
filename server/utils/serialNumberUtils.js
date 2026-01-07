// Utility functions for serial number formatting
// Format: YEAR/TYPE/SERIAL (e.g., 2025/q/0001)

const TYPE_CODES = {
  quotation: "q",
  billing: "b",
  challan: "c",
};

const TYPE_FROM_CODE = {
  q: "quotation",
  b: "billing",
  c: "challan",
};

// Format a number into serial number string
export const formatSerialNumber = (number, type) => {
  const currentYear = new Date().getFullYear();
  const typeCode = TYPE_CODES[type];
  const formattedSerial = number.toString().padStart(4, "0");
  return `${currentYear}/${typeCode}/${formattedSerial}`;
};

// Parse a serial number string to extract the number
export const parseSerialNumber = (serialString) => {
  if (!serialString || typeof serialString !== "string") {
    return { number: 0, year: null, type: null, typeCode: null };
  }

  // Format: YEAR/TYPE/SERIAL (e.g., 2025/q/0001)
  const parts = serialString.split("/");
  if (parts.length !== 3) {
    return { number: 0, year: null, type: null, typeCode: null };
  }

  const year = parseInt(parts[0]);
  const typeCode = parts[1];
  const number = parseInt(parts[2]);
  const type = TYPE_FROM_CODE[typeCode] || null;

  return { number, year, type, typeCode };
};

// Increment a serial number string
export const incrementSerialNumber = (serialString, type) => {
  const parsed = parseSerialNumber(serialString);
  const newNumber = parsed.number + 1;
  return formatSerialNumber(newNumber, type);
};

// Get default serial number for a type
export const getDefaultSerialNumber = (type) => {
  return formatSerialNumber(0, type);
};

