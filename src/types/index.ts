export interface MP {
  id: string;
  person_id: string;
  name: string;
  party?: string;
  constituency?: string;
  imageUrl?: string;
  twitter_handle?: string;
}

export interface HansardResponse {
  items: HansardItem[];
  totalResults: number;
  startIndex: number;
  pageSize: number;
}

export interface HansardItem {
  _about: string;
  absoluteEventDate: string;
  contentId?: string;
  memberId?: string;
  text?: string;
  speakerId?: string;
  speakerName?: string;
}

export interface WordCloudItem {
  text: string;
  value: number;
  color?: string;
}

// Add types for the speaker statistics
export interface SpeakerStats {
  [speakerName: string]: {
    word_counts: {
      [word: string]: number;
    };
    total_words?: number;
    total_speeches?: number;
  };
}
