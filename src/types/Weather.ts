export interface GeocodeCandidate {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export interface DailyEntry {
  date: string;
  max: number;
  min: number;
}
