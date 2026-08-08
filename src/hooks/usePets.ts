import { useState } from 'react';
import { Pet } from '@/types';
import { MOCK_PETS } from '@/constants/mockData';

export const usePets = () => {
  const [pets] = useState<Pet[]>(() => {
    const stored = localStorage.getItem('omnipaws_pets');
    if (stored) return JSON.parse(stored) as Pet[];
    localStorage.setItem('omnipaws_pets', JSON.stringify(MOCK_PETS));
    return MOCK_PETS;
  });

  const getPetById = (id: string): Pet | undefined => pets.find(p => p.id === id);

  return { pets, getPetById };
};
