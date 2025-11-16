# Je te crois || Are You Safe

Système de signalement visuel de harcèlement scolaire - Hackathon Project

## Description

Are You Safe est une plateforme web accessible permettant aux étudiants de signaler des incidents de harcèlement de manière visuelle, sans barrières linguistiques ou de communication. Le système est spécialement conçu pour les étudiants autistes, dyslexiques et primo-arrivants.

## Fonctionnalités

### Dashboard Étudiant
- **Signalement visuel** : Utilisation de symboles pour décrire les incidents
- **Carte corporelle** : Indication précise des zones touchées lors de harcèlement physique
- **Échelle émotionnelle** : Expression des sentiments de manière visuelle
- **Thermomètre de sécurité** : Indication du niveau de sécurité ressenti
- **Sélection de lieu** : Choix du lieu où l'incident s'est produit
- **Fréquence** : Indication de la fréquence des incidents

### Dashboard Enseignant
- **Visualisation des signalements** : Consultation de tous les signalements
- **Filtres par statut** : Filtrage par statut (en attente, consulté, résolu)
- **Détails complets** : Affichage détaillé de chaque signalement
- **Gestion des statuts** : Mise à jour du statut des signalements
- **Notes** : Ajout de notes pour chaque signalement

## Technologies

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- React Router
- Vite

### Backend
- Python 3.8+
- FastAPI
- Pydantic

## Installation

### Prérequis
- Node.js 18+
- Python 3.8+
- npm ou pnpm

### Backend

1. Naviguez vers le dossier backend :
```bash
cd backend
```

2. Créez un environnement virtuel (recommandé) :
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. Installez les dépendances :
```bash
pip install -r requirements.txt
```

4. Lancez le serveur :
```bash
python main.py
```

Le serveur backend sera accessible sur `http://localhost:8000`

### Frontend

1. Dans le dossier racine du projet, installez les dépendances :
```bash
npm install
# ou
pnpm install
```

2. Lancez le serveur de développement :
```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur `http://localhost:5173`

## Structure du projet

```
HelloReact/
├── backend/
│   ├── main.py              # API FastAPI
│   └── requirements.txt     # Dépendances Python
├── src/
│   ├── components/
│   │   ├── reporting/       # Composants de signalement
│   │   │   ├── BodyMap.tsx
│   │   │   ├── SymbolSelector.tsx
│   │   │   ├── EmotionScale.tsx
│   │   │   └── SafetyThermometer.tsx
│   │   └── ui/              # Composants UI réutilisables
│   ├── pages/
│   │   ├── Home/            # Page d'accueil
│   │   ├── StudentDashboard/ # Dashboard étudiant
│   │   └── TeacherDashboard/ # Dashboard enseignant
│   ├── lib/
│   │   └── api.ts           # Service API
│   └── router/
│       └── index.tsx        # Configuration des routes
└── README.md
```

## Utilisation

1. **Accéder à l'application** : Ouvrez `http://localhost:5173` dans votre navigateur

2. **Dashboard Étudiant** :
   - Cliquez sur "Accéder au dashboard étudiant"
   - Suivez les étapes pour créer un signalement
   - Sélectionnez les symboles, indiquez vos émotions, le lieu, etc.
   - Soumettez le signalement

3. **Dashboard Enseignant** :
   - Cliquez sur "Accéder au dashboard enseignant"
   - Consultez tous les signalements
   - Filtrez par statut si nécessaire
   - Cliquez sur un signalement pour voir les détails
   - Mettez à jour le statut et ajoutez des notes

## API Endpoints

- `GET /api/symbols` - Récupérer tous les symboles disponibles
- `GET /api/locations` - Récupérer tous les lieux disponibles
- `POST /api/reports` - Créer un nouveau signalement
- `GET /api/reports` - Récupérer tous les signalements
- `GET /api/reports/{report_id}` - Récupérer un signalement spécifique
- `PUT /api/reports/{report_id}` - Mettre à jour un signalement
- `GET /api/reports/student/{student_id}` - Récupérer les signalements d'un étudiant

## Notes de développement

- Le système d'authentification n'est pas encore implémenté (à ajouter plus tard)
- Les données sont stockées en mémoire (à remplacer par une base de données en production)
- Le backend doit être lancé avant le frontend pour que l'API fonctionne

## Contribution

Ce projet a été développé dans le cadre d'un hackathon pour résoudre le problème du harcèlement scolaire chez les populations vulnérables.
