/**
 * Service API pour communiquer avec le backend
 */
import {
  saveReportToLocal,
  getReportsFromLocal,
  markReportAsSynced,
  saveSymbolsToLocal,
  getSymbolsFromLocal,
  saveLocationsToLocal,
  getLocationsFromLocal,
} from './storage';

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
  try {
    const response = await fetch(`${API_BASE_URL}/api/symbols`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des symboles');
    const symbols = await response.json();
    // Sauvegarder dans localStorage comme cache
    saveSymbolsToLocal(symbols);
    return symbols;
  } catch (error) {
    console.warn('API non disponible, utilisation du cache localStorage:', error);
    // Fallback vers localStorage
    const cached = getSymbolsFromLocal();
    if (cached) return cached;
    throw new Error('Impossible de récupérer les symboles (API et cache indisponibles)');
  }
}

// Récupérer les lieux disponibles
export async function getLocations(): Promise<Location[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/locations`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des lieux');
    const locations = await response.json();
    // Sauvegarder dans localStorage comme cache
    saveLocationsToLocal(locations);
    return locations;
  } catch (error) {
    console.warn('API non disponible, utilisation du cache localStorage:', error);
    // Fallback vers localStorage
    const cached = getLocationsFromLocal();
    if (cached) return cached;
    throw new Error('Impossible de récupérer les lieux (API et cache indisponibles)');
  }
}

// Créer un signalement
export async function createReport(report: ReportCreate): Promise<Report> {
  // Toujours sauvegarder dans localStorage d'abord (pour garantir la persistance)
  const localReport = saveReportToLocal(report);
  
  try {
    // Essayer d'envoyer au serveur
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });
    
    if (response.ok) {
      const serverReport = await response.json();
      // Marquer comme synchronisé
      markReportAsSynced(localReport.localId!, serverReport);
      return serverReport;
    } else {
      throw new Error('Erreur lors de la création du signalement');
    }
  } catch (error) {
    console.warn('API non disponible, rapport sauvegardé localement:', error);
    // Retourner le rapport local (déjà sauvegardé)
    return localReport;
  }
}

// Récupérer tous les signalements (pour enseignants)
export async function getReports(): Promise<Report[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des signalements');
    return response.json();
  } catch (error) {
    console.warn('API non disponible, utilisation des rapports locaux:', error);
    // Fallback vers localStorage
    return getReportsFromLocal();
  }
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

