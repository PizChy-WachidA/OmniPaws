import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pet } from '@/types';
import { MOCK_PETS } from '@/constants/mockData';
import { useAuth } from './useAuth';

function dbRowToPet(row: Record<string, unknown>): Pet {
  return {
    id: row.id as string,
    name: row.name as string,
    species: row.species as Pet['species'],
    breed: (row.breed as string) || '',
    age: (row.age as number) || 1,
    weight: Number(row.weight) || 0,
    color: (row.color as string) || '',
    microchip: (row.microchip as string) || '',
    photo: (row.photo as string) || '',
    healthScore: (row.health_score as number) || 85,
    nextAppointment: row.next_appointment as string | undefined,
    insuranceStatus: (row.insurance_status as Pet['insuranceStatus']) || 'none',
    emergencyContact: (row.emergency_contact as string) || '',
    personality: (row.personality as string[]) || [],
    vaccinations: (row.vaccinations as Pet['vaccinations']) || [],
    healthRecords: (row.health_records as Pet['healthRecords']) || [],
  };
}

export const usePets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPets(MOCK_PETS);
      setLoading(false);
      return;
    }
    fetchPets();
  }, [user]);

  const fetchPets = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('pets').select('*').eq('owner_id', user.id).order('created_at');
    if (!error && data) {
      setPets(data.map(dbRowToPet));
    } else {
      setPets(MOCK_PETS);
    }
    setLoading(false);
  };

  const getPetById = (id: string) => pets.find(p => p.id === id);

  const addPet = async (petData: Omit<Pet, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('pets').insert({
      owner_id: user.id,
      name: petData.name,
      species: petData.species,
      breed: petData.breed,
      age: petData.age,
      weight: petData.weight,
      color: petData.color,
      microchip: petData.microchip,
      photo: petData.photo,
      health_score: petData.healthScore,
      next_appointment: petData.nextAppointment,
      insurance_status: petData.insuranceStatus,
      emergency_contact: petData.emergencyContact,
      personality: petData.personality,
      vaccinations: petData.vaccinations,
      health_records: petData.healthRecords,
    }).select().single();
    if (!error && data) {
      setPets(prev => [...prev, dbRowToPet(data as Record<string, unknown>)]);
    }
  };

  return { pets, loading, getPetById, addPet, refetch: fetchPets };
};
