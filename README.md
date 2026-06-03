# Agent IA DevOps — RAG + LangChain + Groq

Agent intelligent qui audite des configurations Kubernetes et Docker en utilisant RAG (Retrieval-Augmented Generation) avec LangChain et le LLM gratuit Groq.

---

## Description

Cet agent analyse tes fichiers YAML Kubernetes et Dockerfile, les compare avec les standards de sécurité officiels (NSA, NIST, OWASP), et génère des recommandations de sécurité automatiques.

---

## Stack technique

| Outil | Rôle | Gratuit ? |
|-------|------|-----------|
| Python 3.10+ | Langage principal | Oui |
| LangChain | Framework RAG + Agent | Oui |
| Groq API | LLM (Llama 3 / Mixtral) | Oui |
| HuggingFace Embeddings | Transformer les docs en vecteurs | Oui |
| FAISS | Base vectorielle locale | Oui |

---

## Structure du projet

```
agent-devops-rag/
│
├── documents/
│   ├── securite/
│   │   ├── CTR_KUBERNETES_HARDENING.pdf
│   │   ├── NIST.SP.800-190.pdf
│   │   ├── Docker_Security_OWASP.txt
│   │   └── Security_Kubernetes.html
│   └── yaml/
│       ├── deployment.yaml
│       └── service.yaml
│
├── vector_store/         
│
├── .env                  
├── requirements.txt       
├── indexer.py            
├── agent.py            
├── main.py            
└── README.md          
```

---

## Installation

### 1. Cloner ou créer le projet

```bash
mkdir agent-devops-rag
cd agent-devops-rag
```

### 2. Installer les bibliothèques

```bash
pip install -r requirements.txt
```

### 3. Configurer la clé Groq

Crée un fichier `.env` à la racine :

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
```

Obtenir une clé gratuite sur : https://console.groq.com

### 4. Mettre tes documents

Place tes fichiers dans `documents/securite/` et `documents/yaml/`

### 5. Indexer les documents (une seule fois)

```bash
python indexer.py
```

### 6. Lancer l'agent

```bash
python main.py
```

---

## Utilisation

Une fois lancé, tu peux poser des questions comme :

```
> Ce deployment.yaml a-t-il des problèmes de sécurité ?
> Quelles sont les bonnes pratiques Docker selon OWASP ?
> Mon pod tourne en root, est-ce dangereux ?
```

---

## Documents de référence utilisés

- **NSA Kubernetes Hardening Guide** — Guide officiel de sécurité Kubernetes
- **NIST SP 800-190** — Sécurité des applications en conteneurs
- **OWASP Docker Security Cheat Sheet** — Bonnes pratiques Docker
- **Kubernetes Security Docs** — Documentation officielle Kubernetes

---

## Modèles Groq disponibles

```python
# Dans agent.py, tu peux changer le modèle :
model_name = "llama3-70b-8192"   # meilleur
model_name = "mixtral-8x7b-32768" # plus rapide
model_name = "llama3-8b-8192"     # le plus léger
```

---
Vidéo 1 — Comprendre RAG (théorie simple, 10 min)
youtube.com/watch?v=sVcwVQRHIc8
"Learn RAG From Scratch" — par ingénieur LangChain officiel
→ regarde ça EN PREMIER, pas de code, juste la logique

Vidéo 2 — Projet concret : Chat avec PDF (exactement ton cas)
youtube.com/watch?v=SQCtfJohQcE
"LangChain RAG Tutorial for Beginners" — Janvier 2025
→ il construit un projet avec PDF + FAISS + LLM, ligne par ligne

Vidéo 3 — RAG complet avec explication de chaque ligne
youtube.com/watch?v=YLPNA1j7kmQ
"RAG with LangChain Complete Tutorial" — Février 2025
→ explique chunk, embedding, vectorstore, retriever

Projet GitHub à lire aussi — identique au tien
github.com/rk-vashista/pdfChat
→ utilise exactement Groq + HuggingFace + FAISS + LangChain
→ c'est le même stack que ton projet, lis le code après les vidéos

Ordre à suivre :

Vidéo 1 → comprendre
Vidéo 2 → voir un projet
Vidéo 3 → approfondir
GitHub → lire le code du projet similaire au tien

## Auteur

Projet personnel — Apprentissage RAG + LangChain + DevSecOps  
Avril 2026 — En cours
