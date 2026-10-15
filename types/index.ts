export type ListingCategory =
  | 'Učebnice a skripta'
  | 'Elektronika'
  | 'Nábytek a kolej'
  | 'Oblečení a doplňky'
  | 'Ostatní';

export const LISTING_CATEGORIES: ListingCategory[] = [
  'Učebnice a skripta',
  'Elektronika',
  'Nábytek a kolej',
  'Oblečení a doplňky',
  'Ostatní',
];

export type ListingStatus = 'active' | 'sold' | 'archived';

export type UserRoleType = 'user' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  image_url: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
}

export interface CurrentUserSession {
  id: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
}

