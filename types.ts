
export type View = 'dashboard' | 'profiles' | 'texter' | 'planner' | 'gifts' | 'advice' | 'interpreter' | 'settings';

export interface UserAccount {
  username: string;
  displayName: string;
  avatarUrl: string;
  zipCode: string;
}

export interface PersonProfile {
  id: string;
  name: string;
  avatarUrl: string;
  description: string;
  likes: string;
  dislikes: string;
  hobbies: string;
  occupation: string;
  notes: string;
  zipCode?: string;
}

export interface PlannedDate {
  id: string;
  title: string;
  personId: string;
  date: string;
  location: string;
  notes: string;
}

export interface Message {
  id: number;
  sender: 'them' | 'me';
  text: string;
}

export interface DatingAdviceResponse {
  keyVibe: string;
  dos: string[];
  donts: string[];
  outfitSuggestion: {
    description: string;
    reasoning: string;
  };
  conversationStarters: string[];
  icebreakerJoke: string;
  questionAnswer: string;
}

export interface DateOption {
  title: string;
  location: string;
  description: string;
  reasoning: string;
}
