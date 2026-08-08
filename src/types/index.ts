export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  memberSince: string;
  verified: boolean;
  petsCount: number;
}

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
  priceFrom: number;
  priceUnit: string;
  photo: string;
  verified: boolean;
  aiMatchScore?: number;
  available: boolean;
  tags: string[];
  description: string;
  responseTime: string;
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
  status: 'upcoming' | 'completed' | 'cancelled';
  total: number;
  notes?: string;
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
