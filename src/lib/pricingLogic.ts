// Pricing logic - uses database rules from admin Settings > Pricing

export interface PricingRule {
    name: string;
    base_price: number;
    per_sqft: number;
}

// Default pricing (used if no rules in database)
export const defaultPricingRules: PricingRule[] = [
    { name: 'Standard Cleaning', base_price: 100, per_sqft: 0.15 },
    { name: 'Deep Cleaning', base_price: 150, per_sqft: 0.20 },
    { name: 'Office Cleaning', base_price: 120, per_sqft: 0.12 },
    { name: 'Move In/Out Cleaning', base_price: 175, per_sqft: 0.25 }
];

export const calculateEstimate = (
    serviceType: string,
    sqFt: number,
    frequency: string,
    pricingRules: PricingRule[] = defaultPricingRules
): number => {
    // Find pricing rule for this service
    const rule = pricingRules.find(r => r.name === serviceType) || 
                 defaultPricingRules.find(r => r.name === serviceType) ||
                 { base_price: 100, per_sqft: 0.15 };

    // Calculate: base price + (sqft * per_sqft rate)
    let subtotal = rule.base_price + (sqFt * rule.per_sqft);

    // Enforce a minimum subtotal
    const MIN_PRICE = 150;
    if (subtotal < MIN_PRICE) {
        subtotal = MIN_PRICE;
    }

    // Apply frequency multiplier/discount
    let multiplier = 1;
    switch (frequency) {
        case 'Weekly':
            multiplier = 0.8; // 20% off
            break;
        case 'Bi-weekly':
            multiplier = 0.85; // 15% off
            break;
        case 'Monthly':
            multiplier = 0.9; // 10% off
            break;
        case 'One-time':
        default:
            multiplier = 1;
            break;
    }

    return Math.round(subtotal * multiplier);
};
