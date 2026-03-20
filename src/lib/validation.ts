/**
 * Form validation utilities
 * Provides reusable validation functions for forms across the app
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

/**
 * Validate US phone number format
 * Accepts: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10) {
    return { valid: false, error: 'Phone number must be 10 digits' };
  }
  
  return { valid: true };
}

/**
 * Validate US zip code (5 digits)
 */
export function validateZipCode(zip: string): ValidationResult {
  if (!zip || !zip.trim()) {
    return { valid: false, error: 'Zip code is required' };
  }
  
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zip.trim())) {
    return { valid: false, error: 'Zip code must be 5 digits' };
  }
  
  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
  if (!value || value.trim().length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { valid: true };
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number | string, fieldName: string): ValidationResult {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (num < 0) {
    return { valid: false, error: `${fieldName} must be positive` };
  }
  
  return { valid: true };
}

/**
 * Format phone number for display
 * Input: 1234567890 -> Output: (123) 456-7890
 */
export function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length !== 10) {
    return phone;
  }
  
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
}

/**
 * Sanitize string input (trim and limit length)
 */
export function sanitizeInput(value: string, maxLength: number = 500): string {
  return value?.trim().slice(0, maxLength) || '';
}

/**
 * Run multiple validations and collect errors
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  validators: { [K in keyof T]?: (value: T[K]) => ValidationResult }
): { valid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};
  
  for (const [field, validator] of Object.entries(validators)) {
    if (validator) {
      const result = (validator as (value: unknown) => ValidationResult)(data[field]);
      if (!result.valid && result.error) {
        errors[field] = result.error;
      }
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
