export type UserRole =
  | 'food_delivery'
  | 'parcel_agent'
  | 'ecommerce_employee'
  | 'traveller'
  | 'other';

export interface Profile {
  id: string;
  full_name?: string | null;
  role?: UserRole | null;
  created_at?: string;
  updated_at?: string;
}

export interface Stop {
  id: string;
  route_id?: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  position: number;
  created_at?: string;
}

export interface Route {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  stops?: Stop[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export type ToastType = 'success' | 'error' | 'info';
