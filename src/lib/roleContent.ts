import { UserRole } from '@/types';

/**
 * Route name placeholder — time-aware for food_delivery, role-specific for others.
 */
export function getRouteNamePlaceholder(role: UserRole | null | undefined): string {
  if (role === 'food_delivery') {
    const h = new Date().getHours();
    if (h >= 6 && h < 11)  return 'e.g. Morning Run — Koramangala';
    if (h >= 11 && h < 16) return 'e.g. Lunch Run — MG Road';
    if (h >= 16 && h < 22) return 'e.g. Dinner Run — Indiranagar';
    return 'e.g. Night Shift Run';
  }
  switch (role) {
    case 'parcel_agent':       return 'e.g. North Kolkata Parcel Route';
    case 'ecommerce_employee': return 'e.g. Zone 7 — 12 packages';
    case 'traveller':          return 'e.g. Puja Pandal Tour 2025';
    default:                   return 'e.g. Morning Delivery Run';
  }
}

/**
 * Stop label placeholder — varies by role.
 */
export function getStopLabelPlaceholder(role: UserRole | null | undefined): string {
  switch (role) {
    case 'food_delivery':      return 'e.g. Flat 3B / Ring the bell';
    case 'parcel_agent':       return 'e.g. Customer: Sharma Ji';
    case 'ecommerce_employee': return 'e.g. Order #FKT2291';
    case 'traveller':          return 'e.g. Stop 1: Kumartuli Para';
    default:                   return 'e.g. Customer: Sharma Ji';
  }
}

/**
 * Home page empty-state subtitle — varies by role.
 */
export function getEmptyStateSubtitle(role: UserRole | null | undefined): string {
  switch (role) {
    case 'food_delivery':      return 'Save your delivery zones. Launch in one tap.';
    case 'parcel_agent':       return 'Build your parcel route once. Reuse every morning.';
    case 'ecommerce_employee': return 'Manage your delivery zones efficiently.';
    case 'traveller':          return 'Plan your trip stops. Launch when you\'re ready.';
    default:                   return 'Create your first delivery route and launch it directly in Google Maps.';
  }
}

/** Display label for a role value */
export function getRoleLabel(role: UserRole | null | undefined): string {
  switch (role) {
    case 'food_delivery':      return 'Food Delivery Worker';
    case 'parcel_agent':       return 'Parcel / Courier Agent';
    case 'ecommerce_employee': return 'E-commerce Employee';
    case 'traveller':          return 'Traveller / Tour Planner';
    case 'other':              return 'Other';
    default:                   return 'Not set';
  }
}
