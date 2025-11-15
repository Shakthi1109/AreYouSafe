"""
Backend API pour Are You Safe
Système de signalement visuel de harcèlement scolaire
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(title="Are You Safe API", version="1.0.0")

# Configuration CORS pour permettre les requêtes depuis le frontend
import os
import re

# Get CORS origins from environment variable
CORS_ORIGINS_STR = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in CORS_ORIGINS_STR.split(",") if origin.strip()]

# Check if we need to allow Vercel preview URLs
ALLOW_VERCEL_PREVIEW = any("vercel.app" in origin for origin in CORS_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app" if ALLOW_VERCEL_PREVIEW else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèles de données
class SymbolSelection(BaseModel):
    """Sélection de symbole pour le signalement"""
    id: str
    label: str
    category: str  # "physical", "verbal", "social", "cyber"

class BodyMapSelection(BaseModel):
    """Sélection sur la carte corporelle"""
    x: float
    y: float
    bodyPart: str

class EmotionScale(BaseModel):
    """Échelle émotionnelle"""
    level: int  # 1-5
    color: str  # "green", "yellow", "orange", "red", "dark-red"

class Location(BaseModel):
    """Localisation dans l'école"""
    id: str
    name: str
    icon: str

class Frequency(BaseModel):
    """Fréquence du harcèlement"""
    value: str  # "once", "sometimes", "often", "always"

class SafetyThermometer(BaseModel):
    """Thermomètre de sécurité"""
    level: int  # 1-5
    feeling: str  # "very_safe", "safe", "neutral", "unsafe", "very_unsafe"

class Report(BaseModel):
    """Modèle complet d'un signalement"""
    id: Optional[str] = None
    studentId: str
    studentName: str
    timestamp: Optional[datetime] = None
    symbols: List[SymbolSelection]
    bodyMap: Optional[List[BodyMapSelection]] = None
    emotion: EmotionScale
    location: Location
    frequency: Frequency
    safety: SafetyThermometer
    status: str = "pending"  # "pending", "reviewed", "resolved"
    teacherNotes: Optional[str] = None

class ReportCreate(BaseModel):
    """Modèle pour créer un signalement"""
    studentId: str
    studentName: str
    symbols: List[SymbolSelection]
    bodyMap: Optional[List[BodyMapSelection]] = None
    emotion: EmotionScale
    location: Location
    frequency: Frequency
    safety: SafetyThermometer

# Base de données en mémoire (à remplacer par une vraie DB en production)
reports_db: List[Report] = []

# Données de référence pour les symboles
SYMBOLS_DATA = [
    {"id": "push", "label": "Pousser", "category": "physical"},
    {"id": "hit", "label": "Frapper", "category": "physical"},
    {"id": "kick", "label": "Donner un coup de pied", "category": "physical"},
    {"id": "pull", "label": "Tirer", "category": "physical"},
    {"id": "insult", "label": "Insulter", "category": "verbal"},
    {"id": "mock", "label": "Se moquer", "category": "verbal"},
    {"id": "threat", "label": "Menacer", "category": "verbal"},
    {"id": "exclude", "label": "Exclure", "category": "social"},
    {"id": "ignore", "label": "Ignorer", "category": "social"},
    {"id": "rumor", "label": "Rumeurs", "category": "social"},
    {"id": "online", "label": "Harcèlement en ligne", "category": "cyber"},
    {"id": "photo", "label": "Photo partagée", "category": "cyber"},
]

LOCATIONS_DATA = [
    {"id": "classroom", "name": "Salle de classe", "icon": "🏫"},
    {"id": "playground", "name": "Cour de récréation", "icon": "🏃"},
    {"id": "cafeteria", "name": "Cantine", "icon": "🍽️"},
    {"id": "hallway", "name": "Couloir", "icon": "🚪"},
    {"id": "bathroom", "name": "Toilettes", "icon": "🚻"},
    {"id": "bus", "name": "Bus scolaire", "icon": "🚌"},
    {"id": "online", "name": "En ligne", "icon": "💻"},
]

# Endpoints API

@app.get("/")
def root():
    """Endpoint racine"""
    return {"message": "Are You Safe API", "version": "1.0.0"}

@app.get("/api/symbols")
def get_symbols():
    """Récupérer tous les symboles disponibles"""
    return SYMBOLS_DATA

@app.get("/api/locations")
def get_locations():
    """Récupérer tous les lieux disponibles"""
    return LOCATIONS_DATA

@app.post("/api/reports", response_model=Report)
def create_report(report_data: ReportCreate):
    """Créer un nouveau signalement"""
    new_report = Report(
        id=str(uuid.uuid4()),
        studentId=report_data.studentId,
        studentName=report_data.studentName,
        timestamp=datetime.now(),
        symbols=report_data.symbols,
        bodyMap=report_data.bodyMap,
        emotion=report_data.emotion,
        location=report_data.location,
        frequency=report_data.frequency,
        safety=report_data.safety,
        status="pending"
    )
    reports_db.append(new_report)
    return new_report

@app.get("/api/reports", response_model=List[Report])
def get_reports():
    """Récupérer tous les signalements (pour les enseignants)"""
    return sorted(reports_db, key=lambda x: x.timestamp or datetime.min, reverse=True)

@app.get("/api/reports/{report_id}", response_model=Report)
def get_report(report_id: str):
    """Récupérer un signalement spécifique"""
    report = next((r for r in reports_db if r.id == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    return report

@app.put("/api/reports/{report_id}", response_model=Report)
def update_report(report_id: str, status: Optional[str] = None, teacherNotes: Optional[str] = None):
    """Mettre à jour un signalement (changer le statut, ajouter des notes)"""
    report = next((r for r in reports_db if r.id == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Signalement non trouvé")
    
    if status:
        report.status = status
    if teacherNotes is not None:
        report.teacherNotes = teacherNotes
    
    return report

@app.get("/api/reports/student/{student_id}", response_model=List[Report])
def get_student_reports(student_id: str):
    """Récupérer les signalements d'un étudiant spécifique"""
    return [r for r in reports_db if r.studentId == student_id]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

