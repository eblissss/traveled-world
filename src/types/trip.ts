export interface Trip {
  id: string;
  name: string;
  cityIds: string[];
  dates?: string[]; // Optional dates array
  color: string; // hex color
  createdAt: string;
  dateCreated?: string; // Alternative name for createdAt
}

