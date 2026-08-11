export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  memberSince: string;
  verified: boolean;
  role: 'owner' | 'provider' | 'admin';
}

// Keep legacy alias
export type User = AuthUser;

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'reptile';

export interface Vaccination {
  name: string;
  date: string;
  nextDue: string;
  clinic: string;
  status: 'current' | 'due_soon' | 'overdue';
}

export interface HealthRecord {
  date: string;
  type: string;
  description: string;
  vet: string;
  clinic: string;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
  color: string;
  microchip: string;
  photo: string;
  vaccinations: Vaccination[];
  healthRecords: HealthRecord[];
  healthScore: number;
  nextAppointment?: string;
  insuranceStatus: 'active' | 'expired' | 'none';
  emergencyContact: string;
  personality: string[];
}

export type ServiceType = 'vet' | 'sitter' | 'groomer' | 'trainer' | 'boarding';

export interface ServiceProvider {
  id: string;
  name: string;
  businessName: string;
  type: ServiceType;
  rating: number;
  reviewCount: number;
  location: string;
  suburb: string;
  distance: number;
  lat?: number;
  lng?: number;
  priceFrom: number;
  priceUnit: string;
  photo: string;
  verified: boolean;
  aiMatchScore?: number;
  available: boolean;
  tags: string[];
  description: string;
  responseTime: string;
  isEmergency?: boolean;
  openNow?: boolean;
  phone?: string;
}

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ServiceType;
  petId: string;
  petName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
  total: number;
  notes?: string;
  ownerId?: string;
}

export interface HealthAlert {
  id: string;
  petId: string;
  petName: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'appointment';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  dueDate: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  readBy: string[];
  createdAt: string;
}

export interface InsurancePlan {
  id: string;
  tier: 'basic' | 'standard' | 'premium';
  name: string;
  monthlyPrice: number;
  features: string[];
  coverageLimit: number;
  excess: number;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  date: string;
  slots: string[];
  blocked: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  ownerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
