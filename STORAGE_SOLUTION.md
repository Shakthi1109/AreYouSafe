# Solution de Persistance des Données

## Vue d'ensemble

Cette solution implémente un système de stockage hybride qui garantit la persistance des données même si l'API backend n'est pas disponible.

## Architecture

### 1. **localStorage comme stockage principal**
- Tous les rapports sont **toujours** sauvegardés dans `localStorage` en premier
- Cela garantit que les données ne sont jamais perdues, même en cas de problème réseau

### 2. **API backend comme synchronisation**
- Si l'API est disponible, les données sont également envoyées au serveur
- Les rapports locaux sont marqués comme "synchronisés" une fois envoyés avec succès

### 3. **Fallback automatique**
- Si l'API n'est pas disponible, l'application continue de fonctionner avec les données locales
- Les symboles et lieux sont mis en cache dans localStorage pour un accès hors ligne

## Fichiers créés/modifiés

### Nouveau fichier: `src/lib/storage.ts`
Service de stockage local avec les fonctions suivantes:
- `saveReportToLocal()` - Sauvegarder un rapport
- `getReportsFromLocal()` - Récupérer tous les rapports
- `markReportAsSynced()` - Marquer un rapport comme synchronisé
- `saveSymbolsToLocal()` / `getSymbolsFromLocal()` - Cache des symboles
- `saveLocationsToLocal()` / `getLocationsFromLocal()` - Cache des lieux
- `exportReports()` / `importReports()` - Export/Import pour sauvegarde
- `clearAllReports()` - Vider tous les rapports

### Modifié: `src/lib/api.ts`
- `createReport()` - Sauvegarde toujours dans localStorage d'abord, puis essaie l'API
- `getSymbols()` - Utilise le cache localStorage si l'API échoue
- `getLocations()` - Utilise le cache localStorage si l'API échoue
- `getReports()` - Retourne les rapports locaux si l'API échoue

## Avantages

1. **Persistance garantie**: Les données sont toujours sauvegardées, même sans connexion
2. **Transparent**: Aucun changement nécessaire dans les composants existants
3. **Résilient**: L'application fonctionne même si le backend est indisponible
4. **Synchronisation**: Les données peuvent être synchronisées avec le serveur quand il est disponible

## Utilisation

Aucun changement nécessaire dans votre code existant! Les fonctions `createReport()`, `getSymbols()`, etc. fonctionnent exactement comme avant, mais avec la persistance automatique.

### Accéder aux rapports stockés localement

```typescript
import { getReportsFromLocal, exportReports } from '@/lib/storage';

// Récupérer tous les rapports
const reports = getReportsFromLocal();

// Exporter pour sauvegarde
const jsonData = exportReports();
console.log(jsonData);
```

### Vérifier les rapports non synchronisés

```typescript
import { getReportsFromLocal } from '@/lib/storage';

const reports = getReportsFromLocal();
const unsynced = reports.filter(r => !r.synced);
console.log(`${unsynced.length} rapports non synchronisés`);
```

## Limitations

- **localStorage limite**: ~5-10MB selon le navigateur
- **Pas de synchronisation automatique**: Les rapports locaux ne sont pas automatiquement synchronisés quand l'API redevient disponible (à implémenter si nécessaire)
- **Par navigateur**: Les données sont stockées par navigateur/domaine

## Prochaines étapes possibles

1. **Synchronisation automatique**: Créer un service qui synchronise périodiquement les rapports non synchronisés
2. **IndexedDB**: Pour des volumes de données plus importants
3. **Service Worker**: Pour la synchronisation en arrière-plan
4. **Interface admin**: Pour visualiser et gérer les rapports stockés localement

