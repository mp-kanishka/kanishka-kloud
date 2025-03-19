import { HansardResponse, MP, SpeakerStats } from "@/types";
import { searchLocalMP, getMPById, getMPByName } from "@/utils/mpDataUtils";

// Base URLs for different API endpoints - kept for potential future use
const BACKUP_URL = "https://members-api.parliament.uk/api/";
const BASE_URL = "https://api.parliament.uk/search/"; 

// Current parliament session start date
const CURRENT_PARLIAMENT_START = new Date("2024-07-17");

/**
 * Search for MPs by name, constituency, or party
 */
export const searchMP = async (searchTerm: string): Promise<MP[]> => {
  return searchLocalMP(searchTerm);
};

/**
 * Get MP speeches from local JSON data
 */
export const getMPSpeeches = async (mpId: string, limit: number = 100): Promise<HansardResponse> => {
  try {
    const mp = getMPById(mpId);
    
    if (!mp || !mp.person_id) {
      throw new Error("Could not find MP person_id");
    }
    
    const speakerStats: SpeakerStats = await fetch('/cleaned_speaker_statistics.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load speaker statistics');
        }
        return response.json();
      })
      .catch((error) => {
        console.error('Error loading speaker statistics:', error);
        return {};
      });

    // Find speaker data by matching person_id
    const speakerData = Object.entries(speakerStats).find(([_, stats]) => 
      (stats as any).person_id === mp.person_id
    );
    
    if (speakerData) {
      const [_, data] = speakerData;
      const wordCounts = data.word_counts || {};
      
      const items = Object.entries(wordCounts)
        .filter(([word]) => word.length > 1)
        .map(([word, count], index) => ({
          _about: `speech_${mpId}_${index}`,
          absoluteEventDate: new Date().toISOString(),
          text: word,
          value: count as number,
          speakerName: mp.name
        }));
      
      return {
        items: items.slice(0, limit),
        totalResults: items.length,
        startIndex: 0,
        pageSize: limit
      };
    }
    
    return {
      items: [{
        _about: `speech_${mpId}_no_data`,
        absoluteEventDate: new Date().toISOString(),
        text: "This MP hasn't spoken in the Commons since the 17th July 2024",
        speakerName: mp.name
      }],
      totalResults: 1,
      startIndex: 0,
      pageSize: 1
    };
  } catch (error) {
    console.error('Error in getMPSpeeches:', error);
    return getMockSpeeches(mpId);
  }
};

/**
 * Helper function to get MP name by ID
 */
const getMPNameById = async (mpId: string): Promise<MP | null> => {
  const mp = getMPById(mpId);
  return mp || null;
};

/**
 * Fallback method to get MP name by ID
 */
const getMPNameByIdFallback = async (mpId: string): Promise<MP | null> => {
  const mp = getMPById(mpId);
  return mp || null;
};

/**
 * Get MP data from local JSON file in public folder
 */
const getLocalMPs = async (searchTerm: string): Promise<MP[]> => {
  return searchLocalMP(searchTerm);
};

/**
 * Provide mock MP data for demonstration when all APIs and local file fail
 */
const getMockMPs = (searchTerm: string): MP[] => {
  // Updated mock data to include only current Commons MPs
  const mockMPs = [
    {
      id: "uk.org.publicwhip/person/4474",
      person_id: "uk.org.publicwhip/person/4474",
      name: "Rishi Sunak",
      party: "Conservative",
      constituency: "Richmond (Yorks) - current",
      imageUrl: "https://members-api.parliament.uk/api/members/4474/Portrait?cropType=ThreeFour"
    },
    {
      id: "uk.org.publicwhip/person/3724",
      person_id: "uk.org.publicwhip/person/3724",
      name: "Keir Starmer",
      party: "Labour",
      constituency: "Holborn and St Pancras - current",
      imageUrl: "https://members-api.parliament.uk/api/members/3724/Portrait?cropType=ThreeFour"
    },
    {
      id: "uk.org.publicwhip/person/4138",
      person_id: "uk.org.publicwhip/person/4138",
      name: "Liz Truss",
      party: "Conservative",
      constituency: "South West Norfolk - current",
      imageUrl: "https://members-api.parliament.uk/api/members/4138/Portrait?cropType=ThreeFour"
    },
    {
      id: "uk.org.publicwhip/person/4651",
      person_id: "uk.org.publicwhip/person/4651",
      name: "Angela Rayner",
      party: "Labour",
      constituency: "Ashton-under-Lyne - current",
      imageUrl: "https://members-api.parliament.uk/api/members/4651/Portrait?cropType=ThreeFour"
    }
  ];
  
  // Filter mock data based on search term - now checking all fields
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    return mockMPs.filter(mp => 
      mp.name.toLowerCase().includes(term) ||
      (mp.constituency && mp.constituency.toLowerCase().includes(term)) ||
      (mp.party && mp.party.toLowerCase().includes(term))
    );
  }
  
  return mockMPs;
};

/**
 * Provide mock speech data for demonstration when APIs fail
 */
const getMockSpeeches = (mpId: string): HansardResponse => {
  const defaultSpeeches = [
    "I rise to speak on behalf of my constituents who have expressed concerns about this matter.",
    "The legislation before us today requires careful scrutiny and amendment.",
    "Investment in our public services must be a priority for any responsible government.",
    "The people of my constituency have made their views very clear on this issue.",
    "We must work across party lines to find solutions to the challenges we face."
  ];
  
  return {
    items: defaultSpeeches.map((text, index) => ({
      _about: `speech_${mpId}_${index}`,
      absoluteEventDate: new Date().toISOString(),
      text: text,
      speakerName: "Member of Parliament"
    })),
    totalResults: defaultSpeeches.length,
    startIndex: 0,
    pageSize: defaultSpeeches.length
  };
};

/**
 * Fallback method to search for MPs using alternative API
 */
const searchMPFallback = async (searchTerm: string): Promise<MP[]> => {
  return searchLocalMP(searchTerm);
};
