import mpData from '@/data/mps_data_20250307_093055.json';
import mpPhotoData from '@/data/mp_photo_data.json';
import { MP } from '@/types';
import { getMPImage } from '@/utils/imageImports';

// Type for the raw MP data from the JSON file
interface RawMPData {
  name: string;
  person_id: string;
  party_affiliation: string;
  constituency: string;
  portrait_URL: string;
  twitter_handle: string | null;
}

// Convert raw MP data to our MP type
export const convertRawMPToMP = (rawMP: RawMPData): MP => {
  // Find the MP's photo data
  const mpPhoto = mpPhotoData.find(photo => photo.name === rawMP.name);
  
  // Try to get local image first
  let imageUrl = null;
  if (mpPhoto?.portrait_link) {
    const localImageUrl = getMPImage(rawMP.name);
    // Only use local image if it's not the fallback image
    if (!localImageUrl.includes('data:image/svg+xml')) {
      imageUrl = localImageUrl;
    }
  }
  
  // If no local image, use the online portrait URL
  if (!imageUrl && rawMP.portrait_URL) {
    // Update the URL format to use the new Parliament API format
    const memberId = rawMP.portrait_URL.match(/\/members\/(\d+)\//)?.[1];
    if (memberId) {
      imageUrl = `https://members-api.parliament.uk/api/members/${memberId}/Portrait?cropType=OneOne&width=300&height=300`;
    }
  }

  return {
    id: rawMP.person_id,
    person_id: rawMP.person_id,
    name: rawMP.name,
    party: rawMP.party_affiliation,
    constituency: rawMP.constituency,
    imageUrl: imageUrl,
    twitter_handle: rawMP.twitter_handle
  };
};

// Get all MPs from the local data file
export const getAllMPs = (): MP[] => {
  return (mpData as RawMPData[]).map(convertRawMPToMP);
};

// Simple Levenshtein distance calculation for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

// Normalize text for searching
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Only remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

// Cache for normalized MP data - separate fields for better matching
interface NormalizedMPData {
  name: string;
  constituency: string;
  party: string;
}

let normalizedMPCache: { [key: string]: NormalizedMPData } = {};

// Initialize the cache
const initializeCache = () => {
  if (Object.keys(normalizedMPCache).length === 0) {
    getAllMPs().forEach(mp => {
      normalizedMPCache[mp.id] = {
        name: normalizeText(mp.name),
        constituency: normalizeText(mp.constituency || ''),
        party: normalizeText(mp.party || '')
      };
    });
  }
};

// Search MPs with simple inclusion matching
export const searchLocalMP = (searchTerm: string): MP[] => {
  if (!searchTerm.trim()) return [];
  
  const normalizedTerm = normalizeText(searchTerm);
  
  return getAllMPs().filter(mp => {
    const normalizedName = normalizeText(mp.name);
    const normalizedConstituency = normalizeText(mp.constituency || '');
    const normalizedParty = normalizeText(mp.party || '');
    
    // Show results if the search term appears in any field
    return normalizedName.includes(normalizedTerm) ||
           normalizedConstituency.includes(normalizedTerm) ||
           normalizedParty.includes(normalizedTerm);
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

// Get an MP by name with simple inclusion matching
export const getMPByName = (name: string): MP | undefined => {
  const normalizedName = normalizeText(name);
  return getAllMPs().find(mp => 
    normalizeText(mp.name).includes(normalizedName)
  );
};
