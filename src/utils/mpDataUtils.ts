
import mpData from '@/data/mps_data_20250307_093055.json';
import { MP } from '@/types';

// Type for the raw MP data from the JSON file
interface RawMPData {
  name: string;
  party_affiliation: string;
  constituency: string;
  portrait_URL: string;
}

// Convert raw MP data to our MP type
export const convertRawMPToMP = (rawMP: RawMPData): MP => {
  return {
    id: `local-${rawMP.name.replace(/\s/g, '-').toLowerCase()}`, // Generate a local ID
    name: rawMP.name,
    party: rawMP.party_affiliation,
    constituency: rawMP.constituency,
    imageUrl: rawMP.portrait_URL
  };
};

// Get all MPs from the local data file
export const getAllMPs = (): MP[] => {
  return (mpData as RawMPData[]).map(convertRawMPToMP);
};

// Search MPs in the local data
export const searchLocalMP = (searchTerm: string): MP[] => {
  if (!searchTerm.trim()) return [];
  
  const term = searchTerm.toLowerCase();
  return getAllMPs().filter(mp => 
    mp.name.toLowerCase().includes(term) ||
    (mp.constituency && mp.constituency.toLowerCase().includes(term)) ||
    (mp.party && mp.party.toLowerCase().includes(term))
  );
};

// Get a single MP by ID
export const getMPById = (id: string): MP | undefined => {
  // Try to find by direct ID match
  const mp = getAllMPs().find(mp => mp.id === id);
  if (mp) return mp;
  
  // If ID doesn't match directly, try to extract the name from the ID format
  // and search by name (for backward compatibility)
  if (id.startsWith('local-')) {
    const nameFromId = id.replace('local-', '').replace(/-/g, ' ');
    return getAllMPs().find(mp => 
      mp.name.toLowerCase() === nameFromId.toLowerCase()
    );
  }
  
  return undefined;
};

// Get an MP by name (exact match)
export const getMPByName = (name: string): MP | undefined => {
  return getAllMPs().find(mp => 
    mp.name.toLowerCase() === name.toLowerCase()
  );
};
