/**
 * Formats a phone number input to (XXX) XXX-XXXX format
 * @param value - The raw phone number input
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Don't format if empty
  if (!phoneNumber) return "";

  // Don't format if it's too long
  if (phoneNumber.length > 10) {
    return value.slice(0, 14); // Max length for formatted phone
  }

  // Format based on length
  if (phoneNumber.length <= 3) {
    return phoneNumber;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  }
}

/**
 * Validates if a phone number is in the correct format
 * @param phone - The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
  return phoneRegex.test(phone);
}
