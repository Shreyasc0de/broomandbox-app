// Business configuration from environment variables
// Centralizes all business contact info to avoid hardcoding

const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_PHONE || '2144332703';
const BUSINESS_EMAIL = import.meta.env.VITE_BUSINESS_EMAIL || 'info@broomandbox.com';

// Format phone number for display: 2144332703 -> (214) 433-2703
export function formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

// Format phone number for display without parentheses: 2144332703 -> 214-433-2703
export function formatPhoneDash(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

export const businessConfig = {
    phone: BUSINESS_PHONE,
    phoneFormatted: formatPhoneDisplay(BUSINESS_PHONE),
    phoneDash: formatPhoneDash(BUSINESS_PHONE),
    phoneTel: `tel:${BUSINESS_PHONE}`,
    email: BUSINESS_EMAIL,
    emailHref: `mailto:${BUSINESS_EMAIL}`,
    address: 'Irving, Texas',
    addressUrl: 'https://maps.google.com/?q=Irving,+TX',
    social: {
        facebook: 'https://facebook.com/broomandbox',
        twitter: 'https://twitter.com/broomandbox',
        instagram: 'https://instagram.com/broomandbox',
        linkedin: 'https://linkedin.com/company/broomandbox',
    }
};

export default businessConfig;
