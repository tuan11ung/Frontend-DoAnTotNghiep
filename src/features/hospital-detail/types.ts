export interface ClinicalServiceItem {
  id: string;
  title: string;
  location: string;
  description: string;
  price: string;
  priceNote?: string;
  iconType: 'child' | 'vaccine' | 'nutrition' | 'vip' | 'psychology' | 'surgery' | 'default';
  accentColor?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple';
}

export interface WorkingHourItem {
  dayLabel: string;
  timeRange: string;
  subNote?: string;
  isEmergency?: boolean;
  iconType?: 'sun' | 'twilight' | 'weekend' | 'emergency';
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  subtitle?: string;
  alt: string;
  isMain?: boolean;
}

export interface HospitalDetail {
  id: string;
  name: string;
  tierBadge: string;
  slogan: string;
  bedsCount: string;
  badgeRank?: string;
  address: string;
  mainGate: string;
  emergencyGate?: string;
  districtCity: string;
  mapImageUrl: string;
  googleMapQuery?: string;
  feeRange: string;
  introP1: string;
  introP2: string;
  expandableIntro: string[];
  specialties: string[];
  featuredServices: string[];
  workingHours: WorkingHourItem[];
  bookingNotice: string;
  cancellationPolicy: string;
  hospitalHotline: string;
  medconnectHotline: string;
  insurancePolicy: {
    description: string;
    acceptedBadges: string[];
  };
  gallery: GalleryImage[];
  servicesList: ClinicalServiceItem[];
}
