import { HansardResponse, MP, SpeakerStats } from "@/types";
import { searchLocalMP, getMPById, getMPByName } from "@/utils/mpDataUtils";

// Base URLs for different API endpoints - kept for potential future use
const BACKUP_URL = "https://members-api.parliament.uk/api/";
const BASE_URL = "https://api.parliament.uk/search/"; 

// Current parliament session start date
const CURRENT_PARLIAMENT_START = new Date("2025-07-17");

/**
 * Search for MPs by name, constituency, or party - now using local data
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
    
    if (!mp || !mp.name) {
      throw new Error("Could not find MP name");
    }
    
    const speakerStats: SpeakerStats = await fetch('/cleaned_speaker_statistics.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load speaker statistics');
        }
        return response.json();
      })
      .catch(() => ({}));
    
    const speakerEntries = Object.entries(speakerStats);
    
    const normalizeName = (name: string): string => {
      return name.toLowerCase()
        .replace(/^(mr|mrs|ms|dr|sir|dame)\s+/, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
    };

    let speakerData = speakerEntries.find(([speakerName]) => {
      const nameParts = speakerName.split(',').map(part => part.trim());
      if (nameParts.length === 2) {
        const [lastName, firstName] = nameParts;
        const fullName = `${firstName} ${lastName}`;
        return normalizeName(fullName) === normalizeName(mp.name);
      }
      return false;
    });
    
    if (!speakerData) {
      const mpLastName = normalizeName(mp.name).split(' ').pop();
      speakerData = speakerEntries.find(([speakerName]) => {
        const speakerLastName = normalizeName(speakerName.split(',')[0].trim());
        return speakerLastName === mpLastName;
      });
    }

    if (!speakerData) {
      const normalizedMPName = normalizeName(mp.name);
      speakerData = speakerEntries.find(([speakerName]) => {
        const normalizedSpeakerName = normalizeName(speakerName);
        return normalizedSpeakerName.includes(normalizedMPName) || 
               normalizedMPName.includes(normalizedSpeakerName);
      });
    }
    
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
        text: "This MP hasn't spoken in the Commons since the 17th July 2025",
        speakerName: mp.name
      }],
      totalResults: 1,
      startIndex: 0,
      pageSize: 1
    };
  } catch (error) {
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
      id: "4474",
      name: "Rishi Sunak",
      party: "Conservative",
      constituency: "Richmond (Yorks) - current",
      imageUrl: "https://members-api.parliament.uk/api/members/4474/Portrait?cropType=ThreeFour"
    },
    {
      id: "3724",
      name: "Keir Starmer",
      party: "Labour",
      constituency: "Holborn and St Pancras - current",
      imageUrl: "https://members-api.parliament.uk/api/members/3724/Portrait?cropType=ThreeFour"
    },
    {
      id: "4138",
      name: "Liz Truss",
      party: "Conservative",
      constituency: "South West Norfolk - current",
      imageUrl: "https://members-api.parliament.uk/api/members/4138/Portrait?cropType=ThreeFour"
    },
    {
      id: "4651",
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
  // Sample speeches with varying content for different MPs
  const speeches: Record<string, string[]> = {
    "1423": [ // Boris Johnson
      "We will get Brexit done and unleash Britain's potential.",
      "We are leveling up across the United Kingdom, investing in infrastructure, education and technology.",
      "The vaccination program has been a tremendous success, thanks to our brilliant NHS staff.",
      "Global Britain is open for business and ready to forge new partnerships around the world.",
      "We need to build back better, greener, and more resilient after the pandemic."
    ],
    "4474": [ // Rishi Sunak
      "Economic stability is the foundation of our plan for growth.",
      "We must be fiscally responsible while investing in the future of our country.",
      "The cost of living is the most pressing challenge facing families today.",
      "Innovation and technology will drive productivity growth in our economy.",
      "We are supporting businesses with tax incentives to boost investment and job creation."
    ],
    "3724": [ // Keir Starmer
      "The government has broken its promises to the British people time and again.",
      "We need a proper plan to tackle the NHS crisis and reduce waiting lists.",
      "Workers' rights and protections must be strengthened, not weakened.",
      "Public services require sustainable funding after years of cuts and underinvestment.",
      "A green industrial revolution will create jobs and tackle climate change."
    ],
    "default": [
      "I rise to speak on behalf of my constituents who have expressed concerns about this matter.",
      "The legislation before us today requires careful scrutiny and amendment.",
      "Investment in our public services must be a priority for any responsible government.",
      "The people of my constituency have made their views very clear on this issue.",
      "We must work across party lines to find solutions to the challenges we face."
    ]
  };
  
  // Get speeches for the specific MP or use default
  const mpSpeeches = speeches[mpId] || speeches.default;
  
  // Create mock response
  return {
    items: mpSpeeches.map((text, index) => ({
      _about: `speech_${mpId}_${index}`,
      absoluteEventDate: new Date().toISOString(),
      text: text,
      speakerName: "Member of Parliament"
    })),
    totalResults: mpSpeeches.length,
    startIndex: 0,
    pageSize: mpSpeeches.length
  };
};

/**
 * Fallback method to search for MPs using alternative API
 */
const searchMPFallback = async (searchTerm: string): Promise<MP[]> => {
  return searchLocalMP(searchTerm);
};
