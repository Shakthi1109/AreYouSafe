/**
 * Service API pour communiquer avec le backend
 */
// Always log in production to debug
console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('Using API_BASE_URL:', API_BASE_URL);

export interface Symbol {
  id: string;
  label: string;
  category: string;
}

export interface Location {
  id: string;
  name: string;
  icon: string;
}

export interface SymbolSelection {
  id: string;
  label: string;
  category: string;
}

export interface BodyMapSelection {
  x: number;
  y: number;
  bodyPart: string;
}

export interface EmotionScale {
  level: number;
  color: string;
}

export interface Frequency {
  value: string;
}

export interface SafetyThermometer {
  level: number;
  feeling: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  symbols: SymbolSelection[];
  bodyMap?: BodyMapSelection[];
  emotion: EmotionScale;
  location: Location;
  frequency: Frequency;
  safety: SafetyThermometer;
  status: string;
  teacherNotes?: string;
}

export interface ReportCreate {
  studentId: string;
  studentName: string;
  symbols: SymbolSelection[];
  bodyMap?: BodyMapSelection[];
  emotion: EmotionScale;
  location: Location;
  frequency: Frequency;
  safety: SafetyThermometer;
}

// Récupérer les symboles disponibles
export async function getSymbols(): Promise<Symbol[]> {
  const response = await fetch(`${API_BASE_URL}/api/symbols`);
  if (!response.ok) throw new Error('Erreur lors de la récupération des symboles');
  return response.json();
}

// Récupérer les lieux disponibles
export async function getLocations(): Promise<Location[]> {
  const response = await fetch(`${API_BASE_URL}/api/locations`);
  if (!response.ok) throw new Error('Erreur lors de la récupération des lieux');
  return response.json();
}

// Créer un signalement
export async function createReport(report: ReportCreate): Promise<Report> {
  const response = await fetch(`${API_BASE_URL}/api/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error('Erreur lors de la création du signalement');
  return response.json();
}

// Récupérer tous les signalements (pour enseignants)
export async function getReports(): Promise<Report[]> {
  const response = await fetch(`${API_BASE_URL}/api/reports`);
  if (!response.ok) throw new Error('Erreur lors de la récupération des signalements');
  return response.json();
}

// Mettre à jour un signalement
export async function updateReport(
  reportId: string,
  status?: string,
  teacherNotes?: string
): Promise<Report> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (teacherNotes !== undefined) params.append('teacherNotes', teacherNotes);

  const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}?${params.toString()}`, {
    method: 'PUT',
  });
  if (!response.ok) throw new Error('Erreur lors de la mise à jour du signalement');
  return response.json();
}

