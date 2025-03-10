export type PartyColor = {
  base: string;
  gradient: string[];
};

export const PARTY_COLORS: Record<string, PartyColor> = {
  "labour": {
    base: "#E4003B",
    gradient: ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"]
  },
  "labour (co-op)": {
    base: "#E4003B",
    gradient: ["#E4003B", "#FF6B6B", "#FF8585", "#FFA0A0", "#FFBABA"]
  },
  "conservative": {
    base: "#0087dc",
    gradient: ["#0087dc", "#4DA6FF", "#80BFFF", "#B3D9FF", "#CCE6FF"]
  },
  "reform uk": {
    base: "#00bed6",
    gradient: ["#00bed6", "#4DD9ED", "#80E5F3", "#B3F0F9", "#CCF6FB"]
  },
  "reform": {
    base: "#00bed6",
    gradient: ["#00bed6", "#4DD9ED", "#80E5F3", "#B3F0F9", "#CCF6FB"]
  },
  "liberal democrat": {
    base: "#FAA61A",
    gradient: ["#FAA61A", "#FFC04D", "#FFD280", "#FFE0B3", "#FFEACC"]
  },
  "liberal democrats": {
    base: "#FAA61A",
    gradient: ["#FAA61A", "#FFC04D", "#FFD280", "#FFE0B3", "#FFEACC"]
  },
  "green": {
    base: "#4BA562",
    gradient: ["#4BA562", "#7BC08C", "#A3D5B6", "#CBEADF", "#E2F4E9"]
  },
  "green party": {
    base: "#4BA562",
    gradient: ["#4BA562", "#7BC08C", "#A3D5B6", "#CBEADF", "#E2F4E9"]
  },
  "democratic unionist party": {
    base: "#B84148",
    gradient: ["#B84148", "#D17A80", "#E0A3A8", "#EFCCCF", "#F7E6E7"]
  },
  "dup": {
    base: "#B84148",
    gradient: ["#B84148", "#D17A80", "#E0A3A8", "#EFCCCF", "#F7E6E7"]
  },
  "scottish national party": {
    base: "#D7C919",
    gradient: ["#F5E884", "#E6D94F", "#D7CA1A", "#C8BB00", "#B9AC00"]
  },
  "snp": {
    base: "#D7C919",
    gradient: ["#F5E884", "#E6D94F", "#D7CA1A", "#C8BB00", "#B9AC00"]
  },
  "plaid cymru": {
    base: "#003831",
    gradient: ["#003831", "#004C42", "#006054", "#007466", "#008878"]
  },
  "traditional unionist voice": {
    base: "#0C3A6A",
    gradient: ["#0C3A6A", "#1E4C7C", "#305E8E", "#4270A0", "#5482B2"]
  },
  "tuv": {
    base: "#0C3A6A",
    gradient: ["#0C3A6A", "#1E4C7C", "#305E8E", "#4270A0", "#5482B2"]
  },
  "ulster unionist party": {
    base: "#47A5EE",
    gradient: ["#47A5EE", "#69B4F1", "#8BC3F4", "#ADD2F7", "#CFE1FA"]
  },
  "uup": {
    base: "#47A5EE",
    gradient: ["#47A5EE", "#69B4F1", "#8BC3F4", "#ADD2F7", "#CFE1FA"]
  },
  "alliance party": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#F7D353", "#F8DB78", "#F9E39D", "#FAEBC2"]
  },
  "alliance": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#F7D353", "#F8DB78", "#F9E39D", "#FAEBC2"]
  },
  "alliance party of northern ireland": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#F7D353", "#F8DB78", "#F9E39D", "#FAEBC2"]
  },
  "social democratic & labour party": {
    base: "#29A82B",
    gradient: ["#29A82B", "#4EB650", "#73C475", "#98D29A", "#BDE1BF"]
  },
  "sdlp": {
    base: "#29A82B",
    gradient: ["#29A82B", "#4EB650", "#73C475", "#98D29A", "#BDE1BF"]
  },
  "independent": {
    base: "#8E9196",
    gradient: ["#8E9196", "#A1A3A7", "#B4B5B8", "#C7C8CA", "#DADBDC"]
  },
  "independents": {
    base: "#8E9196",
    gradient: ["#8E9196", "#A1A3A7", "#B4B5B8", "#C7C8CA", "#DADBDC"]
  },
  "speaker": {
    base: "#1F1F1F",
    gradient: ["#1F1F1F", "#2F2F2F", "#3F3F3F", "#4F4F4F", "#5F5F5F"]
  }
};

export const getPartyColor = (party?: string): string => {
  if (!party) return "#1F1F1F";
  const partyData = PARTY_COLORS[party.toLowerCase()];
  return partyData?.base || "#1F1F1F";
};

export const getPartyGradient = (party?: string): string[] => {
  if (!party) return DEFAULT_COLORS;
  const partyData = PARTY_COLORS[party.toLowerCase()];
  return partyData?.gradient || DEFAULT_COLORS;
};

// Default color palette for unknown parties
export const DEFAULT_COLORS = [
  '#ea384c', '#0EA5E9', '#F97316', '#8B5CF6', '#22c55e',
  '#D946EF', '#fb923c', '#1EAEDB', '#9b87f5', '#7E69AB',
  '#FEC6A1', '#E5DEFF', '#D3E4FD', '#FDE1D3', '#6E59A5'
]; 