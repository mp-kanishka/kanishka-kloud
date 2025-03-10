import mpData from '@/data/mps_data_20250307_093055.json';
import { MP } from '@/types';

// Type for the raw MP data from the JSON file
interface RawMPData {
  name: string;
  person_id: string;
  party_affiliation: string;
  constituency: string;
  portrait_URL: string;
}

// Convert raw MP data to our MP type
export const convertRawMPToMP = (rawMP: RawMPData): MP => {
  return {
    id: rawMP.person_id,
    person_id: rawMP.person_id,
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

// Normalize text for searching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

// Search MPs in the local data
export const searchLocalMP = (searchTerm: string): MP[] => {
  if (!searchTerm.trim()) return [];
  
  const normalizedTerm = normalizeText(searchTerm);
  const terms = normalizedTerm.split(' ').filter(term => term.length > 0);
  
  return getAllMPs().filter(mp => {
    const normalizedName = normalizeText(mp.name);
    const normalizedConstituency = mp.constituency ? normalizeText(mp.constituency) : '';
    const normalizedParty = mp.party ? normalizeText(mp.party) : '';
    
    // Check if all search terms are found in any of the fields
    return terms.every(term => 
      normalizedName.includes(term) ||
      normalizedConstituency.includes(term) ||
      normalizedParty.includes(term)
    );
  });
};

// Get a single MP by ID
export const getMPById = (id: string): MP | undefined => {
  // Handle the full person_id format
  const normalizedId = id.includes('uk.org.publicwhip/person/') 
    ? id 
    : `uk.org.publicwhip/person/${id}`;
  
  // Try to find by direct ID match or normalized ID
  const mp = getAllMPs().find(mp => 
    mp.id === id || mp.id === normalizedId
  );
  
  if (mp) return mp;
  
  // If ID doesn't match directly, try to extract the name from the ID format
  // and search by name (for backward compatibility)
  if (id.startsWith('local-')) {
    const nameFromId = id.replace('local-', '').replace(/-/g, ' ');
    return getAllMPs().find(mp => 
      normalizeText(mp.name) === normalizeText(nameFromId)
    );
  }
  
  return undefined;
};

// Get an MP by name (fuzzy match)
export const getMPByName = (name: string): MP | undefined => {
  const normalizedName = normalizeText(name);
  return getAllMPs().find(mp => 
    normalizeText(mp.name).includes(normalizedName)
  );
};
