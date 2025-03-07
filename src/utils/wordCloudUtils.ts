import { WordCloudItem } from "@/types";

// Common English stopwords to filter out
const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can't", "cannot", "could",
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's",
  "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm",
  "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
  "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
  "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
  "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves", "mr", "mrs",
  "ms", "hon", "right", "honourable", "house", "member", "members", "parliament", "thank", "minister", "secretary",
  "question", "government", "will", "would", "could", "today", "yesterday", "tomorrow", "think"
]);

// Additional parliamentary stopwords
const PARLIAMENT_STOPWORDS = new Set([
  "bill", "amendment", "chair", "motion", "debate", "order", "gentleman", "gentlemen", "gentlewoman", "gentlewomen",
  "commons", "lords", "uk", "united", "kingdom", "britain", "speaker", "deputy", "asked", "says", "said", "say",
  "madam", "sir", "committee", "colleague", "colleagues", "constituent", "constituents", "agree", "disagrees",
  "point", "order", "intervene", "intervention", "country"
]);

// Combine all stopwords
const ALL_STOPWORDS = new Set([...STOPWORDS, ...PARLIAMENT_STOPWORDS]);

// Party color mappings
const PARTY_COLORS: Record<string, string[]> = {
  "labour": ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"],
  "labour (co-op)": ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"],
  "conservative": ["#0087dc", "#4DA6FF", "#80BFFF", "#B3D9FF", "#CCE6FF"],
  "reform uk": ["#00bed6", "#4DD9ED", "#80E5F3", "#B3F0F9", "#CCF6FB"],
  "reform": ["#00bed6", "#4DD9ED", "#80E5F3", "#B3F0F9", "#CCF6FB"],
  "liberal democrat": ["#FAA61A", "#FFC04D", "#FFD280", "#FFE0B3", "#FFEACC"],
  "liberal democrats": ["#FAA61A", "#FFC04D", "#FFD280", "#FFE0B3", "#FFEACC"],
  "green": ["#4BA562", "#7BC08C", "#A3D5B6", "#CBEADF", "#E2F4E9"],
  "green party": ["#4BA562", "#7BC08C", "#A3D5B6", "#CBEADF", "#E2F4E9"],
  "democratic unionist party": ["#B84148", "#D17A80", "#E0A3A8", "#EFCCCF", "#F7E6E7"],
  "dup": ["#B84148", "#D17A80", "#E0A3A8", "#EFCCCF", "#F7E6E7"],
  "independent": ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"],
  "independents": ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"]
};

// Default color palette for unknown parties
const DEFAULT_COLORS = [
  '#ea384c', '#0EA5E9', '#F97316', '#8B5CF6', '#22c55e',
  '#D946EF', '#fb923c', '#1EAEDB', '#9b87f5', '#7E69AB',
  '#FEC6A1', '#E5DEFF', '#D3E4FD', '#FDE1D3', '#6E59A5'
];

/**
 * Process speeches into word frequency map
 * Can handle both regular speech texts and our special format
 */
export const processSpeeches = (speeches: string[]): Map<string, number> => {
  const wordCounts = new Map<string, number>();
  
  speeches.forEach(speech => {
    if (!speech) return;
    
    // Process regular speech text
    const words = speech.toLowerCase()
      .replace(/[^\w\s]|_/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2 && !ALL_STOPWORDS.has(word));
    
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });
  });
  
  return wordCounts;
};

/**
 * Convert word frequency map to word cloud items
 */
export const getWordCloudItems = (
  wordCountsOrItems: Map<string, number> | WordCloudItem[], 
  maxItems: number = 100,
  party?: string
): WordCloudItem[] => {
  // Get party colors or use default colors
  const colors = party ? PARTY_COLORS[party.toLowerCase()] || DEFAULT_COLORS : DEFAULT_COLORS;
  
  if (wordCountsOrItems instanceof Map) {
    return [...wordCountsOrItems.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxItems)
      .map(([text, value], index) => ({
        text,
        value,
        color: colors[index % colors.length]
      }));
  } 
  
  return wordCountsOrItems
    .slice(0, maxItems)
    .map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
};

/**
 * Check if two rectangles overlap
 */
export const checkOverlap = (
  x1: number, y1: number, width1: number, height1: number,
  x2: number, y2: number, width2: number, height2: number,
  buffer: number = 1
): boolean => {
  return !(
    x1 + width1 + buffer < x2 ||
    x1 > x2 + width2 + buffer ||
    y1 + height1 + buffer < y2 ||
    y1 > y2 + height2 + buffer
  );
};

/**
 * Calculate font size based on word frequency
 */
export const calculateFontSize = (value: number, minValue: number, maxValue: number): number => {
  const minSize = 12;
  const maxSize = 100;
  
  if (minValue === maxValue) return (minSize + maxSize) / 2;
  
  const logMin = Math.log(minValue || 1);
  const logMax = Math.log(maxValue || 2);
  const logValue = Math.log(value || 1);
  
  const normalizedValue = (logValue - logMin) / (logMax - logMin);
  const exponentialValue = Math.pow(normalizedValue, 1.5);
  
  return Math.max(minSize, Math.min(maxSize, Math.round(minSize + exponentialValue * (maxSize - minSize))));
};
