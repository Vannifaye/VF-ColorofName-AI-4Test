
export interface NamePersona {
  name: string;
  colors: string[]; // Hex codes
  quote: string;
  mood: string;
  timestamp: number;
}

export interface PersonaResponse {
  colors: string[];
  quote: string;
  mood: string;
}
