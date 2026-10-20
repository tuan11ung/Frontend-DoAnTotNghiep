export type FacilityType = 'hospital' | 'doctor' | 'all';

export interface SearchFacility {
  id: string;
  name: string;
  type: 'hospital' | 'doctor';
  logoUrl?: string;
  iconFallback?: 'spa' | 'emergency' | 'hospital' | 'stethoscope';
  fallbackTitle?: string;
  isVerified?: boolean;
  tierBadge?: string;
  tierBadgeColor?: 'amber' | 'blue' | 'emerald';
  specialties: string[];
  extraSpecialtiesCount?: number;
  address: string;
  city: 'Hà Nội' | 'TP. Hồ Chí Minh' | 'Toàn quốc';
  district?: string;
  workingHours: string;
  phone: string;
  feeRange: string;
  feeMin: number;
  feeMax: number;
  insuranceBadge: string;
  hasInsurance: boolean;
  statusBadge: {
    availableToday: boolean;
    text: string;
    subText?: string;
  };
  rating: number;
  distanceKm: number;
}

export type SortOption = 'relevance' | 'rating' | 'distance' | 'priceAsc' | 'priceDesc';

export interface SearchFilterState {
  keyword: string;
  facilityType: FacilityType;
  specialty: string;
  city: string;
  nearMe: boolean;
  availableToday: boolean;
  hasInsurance: boolean;
  sortBy: SortOption;
}
