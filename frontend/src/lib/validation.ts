/**
 * Client-side password validation utility.
 * Must mirror backend `validate_password_strength()` rules exactly.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong';
}

const COMMON_WEAK_PASSWORDS = new Set([
  'password1!',
  'passw0rd!',
  'admin123!',
  'letmein1!',
  'welcome1!',
  'qwerty1!',
  'abc12345!',
  'monkey12!',
  'password1',
  '12345678',
]);

/**
 * Validate password strength client-side.
 * Rules: min 8 chars, uppercase, lowercase, digit, special char, not common.
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('One digit');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('One special character');
  }
  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Too common — choose a more unique password');
  }

  // Calculate strength
  let strength: 'weak' | 'fair' | 'strong' = 'weak';
  if (errors.length === 0) {
    strength = 'strong';
  } else if (errors.length <= 2 && password.length >= 6) {
    strength = 'fair';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Get a human-readable summary of password requirements.
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters',
    'One uppercase letter (A-Z)',
    'One lowercase letter (a-z)',
    'One digit (0-9)',
    'One special character (!@#$%^&*...)',
  ];
}
