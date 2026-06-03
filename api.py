"""
api.py - FastAPI Backend
Connecte le dashboard React avec l'agent RAG
Lance avec : uvicorn api:app --reload --port 8000
"""

import os
import shutil
import json
from pathlib import Path
from typing import List
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="DevSecOps RAG Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCUMENTS_DIR = Path("./documents")
VECTOR_STORE_DIR = Path("./vector_store")

# ─── Models ───────────────────────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    question: str

class AuditStats(BaseModel):
    total_files: int
    total_chunks: int
    critical: int
    high: int
    medium: int
    low: int

# ─── Global agent (lazy loaded) ───────────────────────────────────────────────

_agent = None

def get_agent():
    global _agent
    if _agent is None:
        from agent import creer_agent
        _agent = creer_agent()
    return _agent

def reset_agent():
    global _agent
    _agent = None

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "DevSecOps RAG Agent API is running 🚀"}


@app.get("/api/stats")
def get_stats():
    """Retourne les statistiques du projet."""
    files = []
    for ext in ["*.pdf", "*.yaml", "*.yml", "*.txt", "*.html"]:
        files.extend(list(DOCUMENTS_DIR.rglob(ext)))

    yaml_files = list(DOCUMENTS_DIR.rglob("*.yaml")) + list(DOCUMENTS_DIR.rglob("*.yml"))
    pdf_files = list(DOCUMENTS_DIR.rglob("*.pdf"))
    
    indexed = VECTOR_STORE_DIR.exists() and any(VECTOR_STORE_DIR.iterdir())

    return {
        "total_files": len(files),
        "yaml_files": len(yaml_files),
        "pdf_files": len(pdf_files),
        "indexed": indexed,
        "files": [f.name for f in files],
    }


@app.post("/api/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload des fichiers YAML, PDF, TXT, HTML."""
    uploaded = []
    errors = []

    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext in [".yaml", ".yml"]:
            dest = DOCUMENTS_DIR / "yaml" / file.filename
        elif ext in [".pdf", ".txt", ".html"]:
            dest = DOCUMENTS_DIR / "securite" / file.filename
        else:
            errors.append(f"{file.filename}: format non supporté")
            continue

        dest.parent.mkdir(parents=True, exist_ok=True)
        with open(dest, "wb") as f:
            shutil.copyfileobj(file.file, f)
        uploaded.append(file.filename)

    return {"uploaded": uploaded, "errors": errors}


@app.post("/api/index")
def run_indexer():
    """Lance l'indexation des documents."""
    try:
        import subprocess
        import sys
        result = subprocess.run(
          [sys.executable, "indexer.py"],
            capture_output=True,
            text=True,
            cwd=str(Path(".").absolute())
        )
        reset_agent()  # Reset agent pour recharger la nouvelle base
        
        if result.returncode == 0:
            return {"success": True, "output": result.stdout}
        else:
            return {"success": False, "error": result.stderr}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ask")
def ask_question(body: QuestionRequest):
    """Pose une question à l'agent RAG."""
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question vide")

    if not VECTOR_STORE_DIR.exists():
        raise HTTPException(
            status_code=400,
            detail="Base vectorielle introuvable. Lance l'indexation d'abord."
        )

    try:
        agent = get_agent()
        from agent import poser_question as pq
        import io, sys

        # Capture stdout
        old_stdout = sys.stdout
        sys.stdout = buffer = io.StringIO()

        resultat = agent.invoke({"query": body.question})

        sys.stdout = old_stdout

        reponse = resultat["result"]
        sources = list(set(
            doc.metadata.get("source", "inconnu")
            for doc in resultat["source_documents"]
        ))

        # Compter les niveaux de sévérité dans la réponse
        severity = {
            "critical": reponse.upper().count("CRITICAL"),
            "high": reponse.upper().count("HIGH"),
            "medium": reponse.upper().count("MEDIUM"),
            "low": reponse.upper().count("LOW"),
        }

        return {
            "answer": reponse,
            "sources": sources,
            "severity": severity,
            "question": body.question,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/files/{filename}")
def delete_file(filename: str):
    """Supprime un fichier."""
    for ext_dir in [DOCUMENTS_DIR / "yaml", DOCUMENTS_DIR / "securite"]:
        target = ext_dir / filename
        if target.exists():
            target.unlink()
            return {"success": True, "deleted": filename}
    raise HTTPException(status_code=404, detail="Fichier introuvable")