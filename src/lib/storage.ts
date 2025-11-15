/**
 * Service de stockage local pour la persistance des données
 * Utilise localStorage comme fallback si l'API n'est pas disponible
 */
import type { Report, ReportCreate } from './api';

const STORAGE_KEY_REPORTS = 'are_you_safe_reports';
const STORAGE_KEY_SYMBOLS = 'are_you_safe_symbols';
const STORAGE_KEY_LOCATIONS = 'are_you_safe_locations';

// Interface pour le stockage local des rapports
interface StoredReport extends Report {
  localId?: string; // ID local si créé hors ligne
  synced?: boolean; // Si synchronisé avec le serveur
}

/**
 * Sauvegarder un rapport dans localStorage
 */
export function saveReportToLocal(report: ReportCreate): StoredReport {
  const storedReport: StoredReport = {
    id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studentId: report.studentId,
    studentName: report.studentName,
    timestamp: new Date().toISOString(),
    symbols: report.symbols,
    bodyMap: report.bodyMap,
    emotion: report.emotion,
    location: report.location,
    frequency: report.frequency,
    safety: report.safety,
    status: 'pending',
    localId: `local_${Date.now()}`,
    synced: false,
  };

  const reports = getReportsFromLocal();
  reports.push(storedReport);
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));

  return storedReport;
}

/**
 * Récupérer tous les rapports depuis localStorage
 */
export function getReportsFromLocal(): StoredReport[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!data) return [];
    return JSON.parse(data) as StoredReport[];
  } catch (error) {
    console.error('Erreur lors de la lecture des rapports depuis localStorage:', error);
    return [];
  }
}

/**
 * Marquer un rapport comme synchronisé
 */
export function markReportAsSynced(localId: string, serverReport: Report): void {
  const reports = getReportsFromLocal();
  const index = reports.findIndex((r) => r.localId === localId);
  if (index !== -1) {
    reports[index] = { ...serverReport, synced: true };
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  }
}

/**
 * Supprimer un rapport du stockage local
 */
export function removeReportFromLocal(reportId: string): void {
  const reports = getReportsFromLocal();
  const filtered = reports.filter((r) => r.id !== reportId && r.localId !== reportId);
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(filtered));
}

/**
 * Sauvegarder les symboles dans localStorage (cache)
 */
export function saveSymbolsToLocal(symbols: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYMBOLS, JSON.stringify(symbols));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des symboles:', error);
  }
}

/**
 * Récupérer les symboles depuis localStorage (cache)
 */
export function getSymbolsFromLocal(): any[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SYMBOLS);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des symboles:', error);
    return null;
  }
}

/**
 * Sauvegarder les lieux dans localStorage (cache)
 */
export function saveLocationsToLocal(locations: any[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCATIONS, JSON.stringify(locations));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des lieux:', error);
  }
}

/**
 * Récupérer les lieux depuis localStorage (cache)
 */
export function getLocationsFromLocal(): any[] | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LOCATIONS);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la lecture des lieux:', error);
    return null;
  }
}

/**
 * Exporter tous les rapports (pour sauvegarde/backup)
 */
export function exportReports(): string {
  const reports = getReportsFromLocal();
  return JSON.stringify(reports, null, 2);
}

/**
 * Importer des rapports (pour restauration)
 */
export function importReports(jsonData: string): boolean {
  try {
    const reports = JSON.parse(jsonData) as StoredReport[];
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'importation des rapports:', error);
    return false;
  }
}

/**
 * Vider tous les rapports (utiliser avec précaution)
 */
export function clearAllReports(): void {
  localStorage.removeItem(STORAGE_KEY_REPORTS);
}

