export type PartyColor = {
  base: string;
  gradient: string[];
};

export const PARTY_COLORS: Record<string, PartyColor> = {
  "labour": {
    base: "#E4003B",
    gradient: ["#E4003B", "#FF1F1F", "#FF4040", "#FF6060"]
  },
  "labour (co-op)": {
    base: "#E4003B",
    gradient: ["#E4003B", "#FF1F1F", "#FF4040", "#FF6060"]
  },
  "conservative": {
    base: "#0087dc",
    gradient: ["#0087dc", "#0066CC", "#0080FF", "#3399FF"]
  },
  "reform uk": {
    base: "#00bed6",
    gradient: ["#00bed6", "#00A3B8", "#00C4D6", "#00D6E6"]
  },
  "reform": {
    base: "#00bed6",
    gradient: ["#00bed6", "#00A3B8", "#00C4D6", "#00D6E6"]
  },
  "liberal democrat": {
    base: "#FAA61A",
    gradient: ["#FAA61A", "#FF8C00", "#FFA500", "#FFB732"]
  },
  "liberal democrats": {
    base: "#FAA61A",
    gradient: ["#FAA61A", "#FF8C00", "#FFA500", "#FFB732"]
  },
  "green": {
    base: "#4BA562",
    gradient: ["#4BA562", "#3D8B50", "#45A85C", "#55B96C"]
  },
  "green party": {
    base: "#4BA562",
    gradient: ["#4BA562", "#3D8B50", "#45A85C", "#55B96C"]
  },
  "democratic unionist party": {
    base: "#B84148",
    gradient: ["#B84148", "#A63940", "#CC4751", "#D65A64"]
  },
  "dup": {
    base: "#B84148",
    gradient: ["#B84148", "#A63940", "#CC4751", "#D65A64"]
  },
  "scottish national party": {
    base: "#D7C919",
    gradient: ["#D7C919", "#CCB800", "#E6D000", "#F5DE00"]
  },
  "snp": {
    base: "#D7C919",
    gradient: ["#D7C919", "#CCB800", "#E6D000", "#F5DE00"]
  },
  "plaid cymru": {
    base: "#003831",
    gradient: ["#003831", "#004C42", "#006054", "#007466"]
  },
  "traditional unionist voice": {
    base: "#0C3A6A",
    gradient: ["#0C3A6A", "#0D2B4D", "#0E4C8A", "#0F5CA6"]
  },
  "tuv": {
    base: "#0C3A6A",
    gradient: ["#0C3A6A", "#0D2B4D", "#0E4C8A", "#0F5CA6"]
  },
  "ulster unionist party": {
    base: "#47A5EE",
    gradient: ["#47A5EE", "#2B8CD6", "#1F99FF", "#3AA9FF"]
  },
  "uup": {
    base: "#47A5EE",
    gradient: ["#47A5EE", "#2B8CD6", "#1F99FF", "#3AA9FF"]
  },
  "alliance party": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#E6B800", "#FFD700", "#FFCC00"]
  },
  "alliance": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#E6B800", "#FFD700", "#FFCC00"]
  },
  "alliance party of northern ireland": {
    base: "#F6CB2E",
    gradient: ["#F6CB2E", "#E6B800", "#FFD700", "#FFCC00"]
  },
  "social democratic & labour party": {
    base: "#29A82B",
    gradient: ["#29A82B", "#1F8C21", "#2DBF30", "#33CC36"]
  },
  "sdlp": {
    base: "#29A82B",
    gradient: ["#29A82B", "#1F8C21", "#2DBF30", "#33CC36"]
  },
  "independent": {
    base: "#8E9196",
    gradient: ["#8E9196", "#6F7276", "#9EA1A6", "#AAACB0"]
  },
  "independents": {
    base: "#8E9196",
    gradient: ["#8E9196", "#6F7276", "#9EA1A6", "#AAACB0"]
  },
  "speaker": {
    base: "#1F1F1F",
    gradient: ["#1F1F1F", "#2F2F2F", "#3F3F3F", "#4F4F4F"]
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