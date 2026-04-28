/** Input validation helpers. */

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_SEARCH_LENGTH = 256;

export interface ValidationResult {
  isValid: boolean;
  message: string | null;
}

function valid(): ValidationResult {
  return { isValid: true, message: null };
}

function invalid(message: string): ValidationResult {
  return { isValid: false, message };
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return invalid("Email is required");
  }
  if (!EMAIL_PATTERN.test(email)) {
    return invalid("Please enter a valid email address");
  }
  return valid();
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return invalid("Password is required");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return invalid(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return invalid(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
  }
  return valid();
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return invalid(`${fieldName} is required`);
  }
  return valid();
}

export function validateUUID(value: string): ValidationResult {
  if (!UUID_PATTERN.test(value)) {
    return invalid("Invalid identifier format");
  }
  return valid();
}

export function validateDateRange(start: Date, end: Date): ValidationResult {
  if (start > end) {
    return invalid("Start date must be before end date");
  }
  return valid();
}

export function validateSearchQuery(query: string): ValidationResult {
  if (query.length > MAX_SEARCH_LENGTH) {
    return invalid(`Search query must be at most ${MAX_SEARCH_LENGTH} characters`);
  }
  return valid();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isValidUUID(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function sanitizeSearchInput(input: string): string {
  return input.replace(/[<>]/g, "").trim();
}
